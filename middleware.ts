import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Role-based access configuration
const ROLE_ACCESS_CONFIG = {
  admin: {
    allowedPaths: [
      /^\/admin\/.*/,           // All admin pages
      /^\/hr\/.*/,              // All HR pages
      /^\/finance\/.*/,         // All finance pages
      /^\/support\/.*/,         // All support pages
      /^\/marketing\/.*/,       // All marketing pages
      /^\/employee\/.*/,        // All employee pages
      /^\/accounts\/.*/,        // All accounts pages
    ],
    dashboard: '/admin/dashboard',
  },
  hr: {
    allowedPaths: [
      /^\/hr\/.*/,              // All HR pages
      /^\/employee\/.*/,        // Employee pages for viewing
      /^\/api\/.*/,             // API routes
    ],
    dashboard: '/hr/dashboard/employee-management',
  },
  employee: {
    allowedPaths: [
      /^\/employee\/.*/,        // Only employee pages
      /^\/api\/auth\/.*/,       // Auth APIs
    ],
    dashboard: '/employee/dashboard',
  },
  accounts: {
    allowedPaths: [
      /^\/accounts\/.*/,        // Only accounts pages
      /^\/finance\/.*/,         // Finance pages
      /^\/api\/.*/,             // API routes
    ],
    dashboard: '/accounts/dashboard',
  },
  support: {
    allowedPaths: [
      /^\/support\/.*/,         // Only support pages
      /^\/api\/.*/,             // API routes
    ],
    dashboard: '/support/dashboard',
  },
  marketing: {
    allowedPaths: [
      /^\/marketing\/.*/,       // Only marketing pages
      /^\/api\/.*/,             // API routes
    ],
    dashboard: '/marketing/dashboard',
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.css') ||
    pathname.includes('.js') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next();
  }
  
  // Public paths that don't require auth
  const isPublicPath = 
    pathname === '/login' || 
    pathname === '/' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/api/auth/');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Handle public paths
  if (isPublicPath) {
    // If user is already logged in and tries to access login page, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/')) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          return redirectToRoleDashboard(decoded.role, request);
        }
      } catch (error) {
        // Invalid token, let them access login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }
  
  // Protected paths - require authentication
  if (!token) {
    console.log('No token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('Invalid token, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      
      // Clear invalid cookies
      response.cookies.delete('token');
      response.cookies.delete('userRole');
      response.cookies.delete('userData');
      
      return response;
    }
    
    // Check role-based access
    const userRole = decoded.role;
    const roleConfig = ROLE_ACCESS_CONFIG[userRole as keyof typeof ROLE_ACCESS_CONFIG];
    
    if (!roleConfig) {
      console.log(`Invalid role: ${userRole}, redirecting to login`);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user has access to the requested path
    const hasAccess = roleConfig.allowedPaths.some(pattern => pattern.test(pathname));
    
    if (!hasAccess) {
      console.log(`Access denied for ${userRole} to ${pathname}`);
      
      // Redirect to dashboard if trying to access unauthorized area
      if (pathname.startsWith('/admin/') && userRole !== 'admin') {
        console.log(`Non-admin trying to access admin area: ${userRole}`);
        return NextResponse.redirect(new URL(roleConfig.dashboard, request.url));
      }
      
      if (pathname.startsWith('/hr/') && !['admin', 'hr'].includes(userRole)) {
        console.log(`Non-HR trying to access HR area: ${userRole}`);
        return NextResponse.redirect(new URL(roleConfig.dashboard, request.url));
      }
      
      // For all other unauthorized accesses
      return NextResponse.redirect(new URL(roleConfig.dashboard, request.url));
    }
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    
    // Add role to response headers for debugging
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Add debug headers in development
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('x-user-role', decoded.role);
      response.headers.set('x-user-id', decoded.userId);
    }
    
    return response;
    
  } catch (error) {
    console.error('Middleware token verification error:', error);
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear cookies on error
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    response.cookies.delete('userData');
    
    return response;
  }
}

// Redirect to role-specific dashboard
function redirectToRoleDashboard(role: string, request: NextRequest) {
  const roleConfig = ROLE_ACCESS_CONFIG[role as keyof typeof ROLE_ACCESS_CONFIG];
  
  if (roleConfig) {
    return NextResponse.redirect(new URL(roleConfig.dashboard, request.url));
  }
  
  // Fallback dashboard paths
  const dashboardPaths: Record<string, string> = {
    admin: '/admin/dashboard',
    hr: '/hr/dashboard/employee-management',
    employee: '/employee/dashboard',
    accounts: '/accounts/dashboard',
    support: '/support/dashboard',
    marketing: '/marketing/dashboard',
  };
  
  const redirectPath = dashboardPaths[role] || '/dashboard';
  return NextResponse.redirect(new URL(redirectPath, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (public auth APIs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder
     * - favicon.ico
     */
    '/((?!api/auth|_next/static|_next/image|public|favicon.ico).*)',
  ],
};