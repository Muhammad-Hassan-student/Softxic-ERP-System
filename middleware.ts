import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// ==================== CONFIGURATION ====================
const PUBLIC_ROUTES = [
  '/login',
  '/',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/me',
  '/api/auth/check',
  '/api/auth/debug',
  '/api/auth/logout',
];

const SHARED_ROUTES = [
  '/profile',
  '/profile/edit',
  '/profile/settings',
  '/profile/change-password',
  '/dashboard',
  '/notifications',
  '/help',
  '/contact',
  '/settings',
  '/api/profile',
  '/api/notifications',
];

const DASHBOARD_PATHS: Record<string, string> = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  employee: '/employee/dashboard',
  accounts: '/accounts/dashboard',
  support: '/support/dashboard',
  marketing: '/marketing/dashboard',
};

const ROLE_ROUTES_CONFIG: Record<string, {
  name: string;
  dashboard: string;
  routes: string[];
}> = {
  admin: {
    name: 'Administrator',
    dashboard: '/admin/dashboard',
    routes: ['*'], // Admin can access EVERYTHING
  },
  
  hr: {
    name: 'Human Resources',
    dashboard: '/hr/dashboard',
    routes: [
      '/hr',
      '/hr/*',
      '/employee',
      '/employee/dashboard',
      '/employee/profile',
      '/employee/attendance',
      '/employee/leaves',
      ...SHARED_ROUTES,
      '/api/hr',
      '/api/hr/*',
      '/api/employee',
      '/api/employee/*',
      '/api/auth',
    ],
  },
  
  employee: {
    name: 'Employee',
    dashboard: '/employee/dashboard',
    routes: [
      '/employee',
      '/employee/*',
      ...SHARED_ROUTES,
      '/api/employee',
      '/api/employee/*',
      '/api/auth',
    ],
  },
  
  accounts: {
    name: 'Accounts',
    dashboard: '/accounts/dashboard',
    routes: [
      '/accounts',
      '/accounts/*',
      '/finance',
      '/finance/*',
      ...SHARED_ROUTES,
      '/api/accounts',
      '/api/accounts/*',
      '/api/finance',
      '/api/finance/*',
      '/api/auth',
    ],
  },
  
  support: {
    name: 'Support',
    dashboard: '/support/dashboard',
    routes: [
      '/support',
      '/support/*',
      ...SHARED_ROUTES,
      '/api/support',
      '/api/support/*',
      '/api/auth',
    ],
  },
  
  marketing: {
    name: 'Marketing',
    dashboard: '/marketing/dashboard',
    routes: [
      '/marketing',
      '/marketing/*',
      ...SHARED_ROUTES,
      '/api/marketing',
      '/api/marketing/*',
      '/api/auth',
    ],
  },
};

// ==================== FIXED HELPER FUNCTIONS ====================

// FIXED: Correct route matching function
function matchesRoute(pathname: string, routePatterns: string[]): boolean {
  // Remove trailing slash for consistency
  const cleanPathname = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;
  
  for (const pattern of routePatterns) {
    // 1. Wildcard '*' matches everything (for admin)
    if (pattern === '*') {
      return true;
    }
    
    // 2. Exact match
    if (cleanPathname === pattern) {
      return true;
    }
    
    // 3. FIXED: Wildcard pattern match (e.g., '/hr/*' matches '/hr/employee-management')
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2); // Remove '/*'
      
      // Check if path starts with base + '/' OR is exactly the base
      if (cleanPathname === base || cleanPathname.startsWith(base + '/')) {
        return true;
      }
    }
    
    // 4. Simple prefix match (e.g., '/hr' matches '/hr/dashboard')
    if (cleanPathname.startsWith(pattern + '/')) {
      return true;
    }
    
    // 5. API route match
    if (pattern.startsWith('/api/')) {
      if (cleanPathname.startsWith(pattern)) {
        return true;
      }
    }
  }
  
  return false;
}

// Check if path is public
function isPublicPath(pathname: string): boolean {
  // Skip static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return true;
  }
  
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Get user's allowed routes
function getAllowedRoutes(userRole: string): string[] {
  const config = ROLE_ROUTES_CONFIG[userRole];
  if (!config) return SHARED_ROUTES;
  
  return config.routes;
}

// Check if user has access to path
function hasAccess(userRole: string, pathname: string): boolean {
  const allowedRoutes = getAllowedRoutes(userRole);
  return matchesRoute(pathname, allowedRoutes);
}

// Get user's dashboard path
function getDashboardPath(userRole: string): string {
  return ROLE_ROUTES_CONFIG[userRole]?.dashboard || '/dashboard';
}

// Check if path is API route
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

// ==================== SIMPLIFIED MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Check if public path
  if (isPublicPath(pathname)) {
    // If already logged in and trying to access login, redirect to dashboard
    const token = request.cookies.get('token')?.value;
    if (token && (pathname === '/login' || pathname === '/')) {
      try {
        const decoded = verifyToken(token);
        if (decoded?.role) {
          const dashboardPath = getDashboardPath(decoded.role);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch {
        // Continue to login page
      }
    }
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Require authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const decoded = verifyToken(token);
    
    if (!decoded?.role) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('userRole');
      return response;
    }

    const userRole = decoded.role;
    
    // Check access permission
    if (!hasAccess(userRole, pathname)) {
      // For API routes, return JSON error
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      
      // For web routes, redirect to dashboard
      const dashboardPath = getDashboardPath(userRole);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // For API routes, return JSON error
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // For web routes, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)',
  ],
};