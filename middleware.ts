import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Public paths that don't require auth
const PUBLIC_PATHS = [
  '/login',
  '/',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/me',
  '/api/auth/check',
];

// Role-based access configuration
const ROLE_ACCESS: Record<string, string[]> = {
  admin: [
    '/admin',
    '/hr',
    '/employee',
    '/accounts',
    '/support',
    '/marketing',
    '/finance',
    '/api',
    '/dashboard',
    '/profile',
  ],
  hr: [
    '/hr',
    '/employee',
    '/dashboard',
    '/profile',
    '/api/hr',
    '/api/employee',
    '/api/auth',
  ],
  employee: [
    '/employee',
    '/dashboard',
    '/profile',
    '/api/employee',
    '/api/auth',
  ],
  accounts: [
    '/accounts',
    '/finance',
    '/dashboard',
    '/profile',
    '/api/accounts',
    '/api/finance',
    '/api/auth',
  ],
  support: [
    '/support',
    '/dashboard',
    '/profile',
    '/api/support',
    '/api/auth',
  ],
  marketing: [
    '/marketing',
    '/dashboard',
    '/profile',
    '/api/marketing',
    '/api/auth',
  ],
};

// Dashboard paths for each role
const DASHBOARD_PATHS: Record<string, string> = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  employee: '/employee/dashboard',
  accounts: '/accounts/dashboard',
  support: '/support/dashboard',
  marketing: '/marketing/dashboard',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware checking:', {
    path: pathname,
    method: request.method,
    cookies: request.cookies.getAll().map(c => c.name)
  });

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if public path
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path)
  );

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  console.log('📋 Auth status:', {
    hasToken: !!token,
    userRole,
    isPublicPath,
    pathname
  });

  // Handle public paths
  if (isPublicPath) {
    // If already logged in and trying to access login, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/')) {
      try {
        const decoded = verifyToken(token);
        if (decoded && decoded.role) {
          const dashboardPath = DASHBOARD_PATHS[decoded.role] || '/dashboard';
          console.log('↪️ Redirecting logged-in user to:', dashboardPath);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch (error) {
        console.log('Invalid token, allowing access to login');
      }
    }
    return NextResponse.next();
  }

  // Protected paths - require authentication
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session_expired');
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.role) {
      console.log('❌ Invalid or expired token');
      const response = NextResponse.redirect(new URL('/login', request.url));
      
      // Clear invalid cookies
      response.cookies.delete('token');
      response.cookies.delete('userRole');
      response.cookies.delete('userId');
      
      return response;
    }

    console.log('✅ User authenticated:', {
      role: decoded.role,
      userId: decoded.userId,
      path: pathname
    });

    // Check role-based access
    const userAllowedPaths = ROLE_ACCESS[decoded.role] || [];
    let hasAccess = false;

    // Admin has access to everything
    if (decoded.role === 'admin') {
      hasAccess = true;
    }
    // Check if path starts with allowed prefix
    else if (userAllowedPaths.some(allowedPath => pathname.startsWith(allowedPath))) {
      hasAccess = true;
    }
    // Allow access to profile pages
    else if (pathname.startsWith('/profile')) {
      hasAccess = true;
    }
    // Allow access to dashboard
    else if (pathname === '/dashboard') {
      hasAccess = true;
    }

    if (!hasAccess) {
      console.log(`⛔ Access denied for ${decoded.role} to ${pathname}`);
      
      // Redirect to user's dashboard
      const dashboardPath = DASHBOARD_PATHS[decoded.role] || '/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Add user info to headers for backend use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-token', token);

    console.log('✅ Access granted');
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Middleware error:', error.message);
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Clear cookies on error
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    response.cookies.delete('userId');
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth/* (public auth APIs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     */
    '/((?!api/auth/|_next/static|_next/image|favicon.ico|public).*)',
  ],
};