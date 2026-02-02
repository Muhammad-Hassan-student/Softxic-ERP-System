import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// ==================== CONFIGURATION ====================
// Sab kuch isi file mein - easily modify kar sakte hain

// 1. PUBLIC ROUTES (No auth required)
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

// 2. SHARED ROUTES (All authenticated users)
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

// 3. DASHBOARD PATHS for each role
const DASHBOARD_PATHS: Record<string, string> = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  employee: '/employee/dashboard',
  accounts: '/accounts/dashboard',
  support: '/support/dashboard',
  marketing: '/marketing/dashboard',
};

// 4. ROLE-SPECIFIC ROUTES CONFIGURATION
const ROLE_ROUTES_CONFIG: Record<string, {
  name: string;
  dashboard: string;
  routes: string[];
  description?: string;
}> = {
  admin: {
    name: 'Administrator',
    dashboard: '/admin/dashboard',
    routes: [
      '*', // Wildcard - can access everything
    ],
    description: 'Full system access'
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
    ],
    description: 'HR management and employee oversight'
  },
  
  employee: {
    name: 'Employee',
    dashboard: '/employee/dashboard',
    routes: [
      '/employee',
      '/employee/*',
      ...SHARED_ROUTES,
    ],
    description: 'Employee self-service portal'
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
    ],
    description: 'Financial management and accounting'
  },
  
  support: {
    name: 'Support',
    dashboard: '/support/dashboard',
    routes: [
      '/support',
      '/support/*',
      ...SHARED_ROUTES,
    ],
    description: 'Customer and technical support'
  },
  
  marketing: {
    name: 'Marketing',
    dashboard: '/marketing/dashboard',
    routes: [
      '/marketing',
      '/marketing/*',
      ...SHARED_ROUTES,
    ],
    description: 'Marketing campaigns and analytics'
  },
};

// ==================== FIXED HELPER FUNCTIONS ====================

// FIXED: Improved route matching function
function matchesRoute(pathname: string, routePatterns: string[]): boolean {
  // Clean pathname - remove trailing slash
  const cleanPathname = pathname.replace(/\/$/, '');
  
  for (const pattern of routePatterns) {
    // 1. Wildcard '*' matches everything (for admin)
    if (pattern === '*') {
      return true;
    }
    
    // 2. Exact match
    if (cleanPathname === pattern) {
      return true;
    }
    
    // 3. FIXED: Wildcard pattern match (e.g., '/admin/*' matches '/admin/anything')
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2); // Remove '/*'
      
      // Check if path starts with base/ OR is exactly base
      if (cleanPathname === base || cleanPathname.startsWith(base + '/')) {
        return true;
      }
    }
    
    // 4. Simple prefix match (e.g., '/admin' matches '/admin/dashboard')
    if (cleanPathname.startsWith(pattern + '/')) {
      return true;
    }
    
    // 5. API route match (e.g., '/api/hr' matches '/api/hr/anything')
    if (pattern.startsWith('/api/')) {
      if (cleanPathname.startsWith(pattern)) {
        return true;
      }
    }
  }
  
  return false;
}

// FIXED: Check if path is public
function isPublicPath(pathname: string): boolean {
  // Skip Next.js internal and static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    (pathname.includes('.') && !pathname.startsWith('/api/')) ||
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

// Get user's allowed routes from config
function getAllowedRoutes(userRole: string): string[] {
  return ROLE_ROUTES_CONFIG[userRole]?.routes || SHARED_ROUTES;
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

// Get role name for logging
function getRoleName(userRole: string): string {
  return ROLE_ROUTES_CONFIG[userRole]?.name || userRole;
}

// ==================== MAIN MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🛡️ Middleware checking: ${pathname}`);
  
  // Skip static files and assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    (pathname.includes('.') && !pathname.startsWith('/api/')) ||
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
        if (decoded && decoded.role) {
          const dashboardPath = getDashboardPath(decoded.role);
          console.log(`↪️ Redirecting ${getRoleName(decoded.role)} to: ${dashboardPath}`);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch (error) {
        console.log('⚠️ Invalid token, allowing access to login');
      }
    }
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // PROTECTED PATHS: Require authentication
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
      response.cookies.delete('token');
      response.cookies.delete('userRole');
      response.cookies.delete('userId');
      return response;
    }

    const userRole = decoded.role;
    const roleName = getRoleName(userRole);
    
    console.log(`✅ ${roleName} authenticated: ${decoded.userId}`);

    // Check access permission
    if (!hasAccess(userRole, pathname)) {
      console.log(`⛔ Access denied for ${roleName} to ${pathname}`);
      
      // For API routes, return JSON error instead of redirect
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Forbidden', 
            message: `You don't have permission to access this resource` 
          },
          { status: 403 }
        );
      }
      
      // For web routes, redirect to dashboard
      const dashboardPath = getDashboardPath(userRole);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    console.log(`✅ Access granted to ${pathname}`);
    
    // Add user info to headers for backend use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-name', roleName);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Middleware error:', error.message || error);
    
    // For API routes, return JSON error
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication failed' 
        },
        { status: 401 }
      );
    }
    
    // For web routes, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    response.cookies.delete('userId');
    return response;
  }
}

// ==================== MIDDLEWARE CONFIG ====================
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)',
  ],
};