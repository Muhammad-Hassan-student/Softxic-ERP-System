// middleware.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Public paths that don't require auth
const PUBLIC_PATHS = [
  '/login',
  '/',
  '/forgot-password',
  '/reset-password',
];

// Dashboard paths for each role
const DASHBOARD_PATHS: Record<string, string> = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard/employee-management',
  employee: '/employee/dashboard',
  accounts: '/accounts/dashboard',
  support: '/support/dashboard',
  marketing: '/marketing/dashboard',
};

// Role-based access configuration (SIMPLE VERSION)
const ROLE_ACCESS: Record<string, string[]> = {
  admin: [
    '/admin',           // All admin pages
    '/hr',              // All HR pages
    '/employee',        // All employee pages
    '/accounts',        // All accounts pages
    '/support',         // All support pages
    '/marketing',       // All marketing pages
    '/finance',         // All finance pages
    '/api',             // All API routes
    '/profile',         // Profile pages
  ],
  hr: [
    '/hr',              // All HR pages
    '/employee',        // Employee pages (view only)
    '/api/auth',        // Auth APIs
    '/api/hr',          // HR APIs
    '/api/employee',    // Employee APIs
    '/profile',         // Profile pages
  ],
  employee: [
    '/employee',        // Only employee pages
    '/api/auth',        // Auth APIs
    '/api/employee',    // Employee APIs
    '/profile',         // Profile pages
  ],
  accounts: [
    '/accounts',        // Only accounts pages
    '/finance',         // Finance pages
    '/api/auth',        // Auth APIs
    '/api/accounts',    // Accounts APIs
    '/api/finance',     // Finance APIs
    '/profile',         // Profile pages
  ],
  support: [
    '/support',         // Only support pages
    '/api/auth',        // Auth APIs
    '/api/support',     // Support APIs
    '/profile',         // Profile pages
  ],
  marketing: [
    '/marketing',       // Only marketing pages
    '/api/auth',        // Auth APIs
    '/api/marketing',   // Marketing APIs
    '/profile',         // Profile pages
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware checking:', pathname);
  
  // Skip static files and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') || // All files with extensions
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path);
  const isAuthApi = pathname.startsWith('/api/auth/');
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  console.log('📋 Middleware Status:', {
    pathname,
    hasToken: !!token,
    isPublicPath,
    isAuthApi,
  });
  
  // Handle public paths
  if (isPublicPath || isAuthApi) {
    // If user is already logged in and tries to access login page, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/')) {
      try {
        const decoded = verifyToken(token);
        if (decoded && decoded.role) {
          const dashboardPath = DASHBOARD_PATHS[decoded.role] || '/dashboard';
          console.log('↪️ Redirecting logged-in user to:', dashboardPath);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch (error) {
        console.log('Invalid token on public path, allowing access');
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }
  
  // Protected paths - require authentication
  if (!token) {
    console.log('❌ No token found for protected path:', pathname);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
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
      
      return response;
    }
    
    const userRole = decoded.role;
    console.log('✅ User authenticated:', { role: userRole, userId: decoded.userId });
    
    // Check if user has access to the requested path (SIMPLE CHECK)
    let hasAccess = false;
    const userAllowedPaths = ROLE_ACCESS[userRole] || [];
    
    // Allow access if:
    // 1. Admin has access to everything
    if (userRole === 'admin') {
      hasAccess = true;
    }
    // 2. Path starts with allowed prefix
    else if (userAllowedPaths.some(allowedPath => pathname.startsWith(allowedPath))) {
      hasAccess = true;
    }
    // 3. Profile page access (always allowed for authenticated users)
    else if (pathname.startsWith('/profile')) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      console.log(`⛔ Access denied for ${userRole} to ${pathname}`);
      
      // Redirect to user's dashboard
      const dashboardPath = DASHBOARD_PATHS[userRole] || '/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    
    console.log('✅ Access granted for:', {
      role: decoded.role,
      path: pathname,
      userId: decoded.userId,
    });
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
  } catch (error) {
    console.error('❌ Middleware error:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Clear cookies on error
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    
    return response;
  }
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