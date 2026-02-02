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
// ADMIN - Can access ALL dashboards and ALL pages
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
      '*', // Wildcard - can access EVERYTHING
      
      // Explicitly define all dashboard prefixes for clarity
      '/admin',
      '/admin/*',
      '/hr',
      '/hr/*',
      '/employee',
      '/employee/*',
      '/accounts',
      '/accounts/*',
      '/support',
      '/support/*',
      '/marketing',
      '/marketing/*',
      '/finance',
      '/finance/*',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // API routes
      '/api',
      '/api/*',
    ],
    description: 'Full system access - Can access all dashboards and pages'
  },
  
  hr: {
    name: 'Human Resources',
    dashboard: '/hr/dashboard',
    routes: [
      // HR Dashboard and all HR pages
      '/hr',
      '/hr/*', // All HR pages (dashboard, employee-management, etc.)
      
      // Employee pages (view only)
      '/employee',
      '/employee/dashboard',
      '/employee/profile',
      '/employee/profile/*',
      '/employee/attendance',
      '/employee/leaves',
      '/employee/payslip',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // HR specific API routes
      '/api/hr',
      '/api/hr/*',
      '/api/employee',
      '/api/employee/*',
      '/api/auth',
    ],
    description: 'HR management and employee oversight'
  },
  
  employee: {
    name: 'Employee',
    dashboard: '/employee/dashboard',
    routes: [
      // Employee dashboard and all employee pages
      '/employee',
      '/employee/*', // All employee pages
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // Employee specific API routes
      '/api/employee',
      '/api/employee/*',
      '/api/auth',
    ],
    description: 'Employee self-service portal'
  },
  
  accounts: {
    name: 'Accounts',
    dashboard: '/accounts/dashboard',
    routes: [
      // Accounts dashboard and all accounts pages
      '/accounts',
      '/accounts/*', // All accounts pages
      
      // Finance pages
      '/finance',
      '/finance/*',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // Accounts specific API routes
      '/api/accounts',
      '/api/accounts/*',
      '/api/finance',
      '/api/finance/*',
      '/api/auth',
    ],
    description: 'Financial management and accounting'
  },
  
  support: {
    name: 'Support',
    dashboard: '/support/dashboard',
    routes: [
      // Support dashboard and all support pages
      '/support',
      '/support/*', // All support pages
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // Support specific API routes
      '/api/support',
      '/api/support/*',
      '/api/auth',
    ],
    description: 'Customer and technical support'
  },
  
  marketing: {
    name: 'Marketing',
    dashboard: '/marketing/dashboard',
    routes: [
      // Marketing dashboard and all marketing pages
      '/marketing',
      '/marketing/*', // All marketing pages
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // Marketing specific API routes
      '/api/marketing',
      '/api/marketing/*',
      '/api/auth',
    ],
    description: 'Marketing campaigns and analytics'
  },
};

// ==================== HELPER FUNCTIONS ====================

// Enhanced route matching function
function matchesRoute(pathname: string, routePatterns: string[]): boolean {
  // Clean pathname
  const cleanPathname = pathname.replace(/\/$/, ''); // Remove trailing slash
  
  for (const pattern of routePatterns) {
    // 1. Wildcard '*' matches everything (for admin)
    if (pattern === '*') {
      return true;
    }
    
    // 2. Exact match
    if (cleanPathname === pattern) {
      return true;
    }
    
    // 3. Wildcard pattern match (e.g., '/admin/*' or '/hr/*')
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2);
      
      // Check if path starts with base + '/' OR is exactly the base
      if (cleanPathname.startsWith(base + '/') || cleanPathname === base) {
        return true;
      }
    }
    
    // 4. Prefix match for dashboard paths
    // e.g., '/admin' should match '/admin/dashboard' and '/admin/employee-management'
    if (cleanPathname.startsWith(pattern + '/')) {
      return true;
    }
    
    // 5. Special case: root dashboard paths
    // e.g., '/admin' should match '/admin' exactly
    if (cleanPathname === pattern) {
      return true;
    }
    
    // 6. API route match
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
  // Skip Next.js internal and static files
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

// Get user's allowed routes from config
function getAllowedRoutes(userRole: string): string[] {
  const config = ROLE_ROUTES_CONFIG[userRole];
  if (!config) {
    console.log(`⚠️ No route config found for role: ${userRole}`);
    return SHARED_ROUTES;
  }
  
  return config.routes;
}

// Check if user has access to path
function hasAccess(userRole: string, pathname: string): boolean {
  const allowedRoutes = getAllowedRoutes(userRole);
  const hasAccess = matchesRoute(pathname, allowedRoutes);
  
  if (hasAccess) {
    console.log(`✅ ${userRole} CAN access ${pathname}`);
  } else {
    console.log(`❌ ${userRole} CANNOT access ${pathname}`);
    console.log(`📋 Allowed routes:`, allowedRoutes);
  }
  
  return hasAccess;
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

// Check if user is admin
function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

// ==================== MAIN MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  console.log(`\n🔐 Middleware checking: ${pathname}`);
  console.log(`📊 Full URL: ${request.url}`);
  
  // Skip static files and assets
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
    console.log(`🌐 Public path: ${pathname}`);
    
    // If already logged in and trying to access login, redirect to dashboard
    const token = request.cookies.get('token')?.value;
    if (token && (pathname === '/login' || pathname === '/')) {
      try {
        const decoded = verifyToken(token);
        if (decoded && decoded.role) {
          const dashboardPath = getDashboardPath(decoded.role);
          console.log(`↪️ Redirecting ${getRoleName(decoded.role)} to dashboard: ${dashboardPath}`);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch (error) {
        console.log('⚠️ Token invalid, allowing access to login');
      }
    }
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  const userRoleCookie = request.cookies.get('userRole')?.value;
  
  console.log(`🔑 Token exists: ${!!token}, Role from cookie: ${userRoleCookie}`);
  
  // PROTECTED PATHS: Require authentication
  if (!token) {
    console.log('❌ No token, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.role) {
      console.log('❌ Invalid token');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('userRole');
      response.cookies.delete('userId');
      return response;
    }

    const userRole = decoded.role;
    const roleName = getRoleName(userRole);
    
    console.log(`✅ ${roleName} authenticated: ${decoded.userId}`);
    console.log(`📋 Checking access to: ${pathname}`);

    // Special case: If user is admin, grant access to everything immediately
    if (isAdmin(userRole)) {
      console.log(`👑 ADMIN ACCESS: Granting full access to ${pathname}`);
      
      // Add user info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-role', decoded.role);
      requestHeaders.set('x-user-name', roleName);
      requestHeaders.set('x-is-admin', 'true');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Check access permission for non-admin users
    const hasAccessToPath = hasAccess(userRole, pathname);
    
    if (!hasAccessToPath) {
      console.log(`⛔ Access denied for ${roleName} to ${pathname}`);
      
      // For API routes, return JSON error
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Forbidden', 
            message: `Access denied for ${roleName}`,
            role: userRole,
            requestedPath: pathname,
          },
          { status: 403 }
        );
      }
      
      // For web routes, redirect to dashboard
      const dashboardPath = getDashboardPath(userRole);
      console.log(`↪️ Redirecting ${roleName} to their dashboard: ${dashboardPath}`);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    console.log(`✅ Access granted to ${pathname}`);
    
    // Add user info to headers
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
    console.error('❌ Middleware error:', error.message);
    
    // For API routes, return JSON error
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized', 
          message: 'Authentication failed',
          details: error.message,
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
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)',
  ],
};