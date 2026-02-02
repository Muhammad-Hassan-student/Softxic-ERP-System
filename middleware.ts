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
  '/_next',
  '/favicon.ico',
  '/public',
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
// Aap yahan easily koi bhi route add/remove kar sakte hain
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
      '/api',
      '/api/*',
      '/dashboard',
      '/profile',
      '/profile/*',
      '/settings',
      '/notifications',
    ],
    description: 'Full system access'
  },
  
  hr: {
    name: 'Human Resources',
    dashboard: '/hr/dashboard',
    routes: [
      // HR specific pages
      '/hr',
      '/hr/dashboard',
      '/hr/employee-management',
      '/hr/employee-management/*', // All sub-routes
      '/hr/attendance',
      '/hr/attendance/*',
      '/hr/leaves',
      '/hr/leaves/*',
      '/hr/payroll',
      '/hr/payroll/*',
      '/hr/recruitment',
      '/hr/recruitment/*',
      '/hr/reports',
      '/hr/reports/*',
      '/hr/settings',
      
      // Employee pages (view only)
      '/employee',
      '/employee/dashboard',
      '/employee/profile',
      '/employee/profile/*',
      '/employee/attendance',
      '/employee/leaves',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // API routes
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
      // Employee specific pages
      '/employee',
      '/employee/dashboard',
      '/employee/profile',
      '/employee/profile/edit',
      '/employee/profile/settings',
      '/employee/attendance',
      '/employee/attendance/mark',
      '/employee/attendance/history',
      '/employee/leaves',
      '/employee/leaves/apply',
      '/employee/leaves/history',
      '/employee/payslip',
      '/employee/payslip/*',
      '/employee/tasks',
      '/employee/tasks/*',
      '/employee/documents',
      '/employee/documents/*',
      '/employee/settings',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // API routes
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
      // Accounts specific pages
      '/accounts',
      '/accounts/dashboard',
      '/accounts/payments',
      '/accounts/payments/*',
      '/accounts/invoices',
      '/accounts/invoices/*',
      '/accounts/expenses',
      '/accounts/expenses/*',
      '/accounts/reports',
      '/accounts/reports/*',
      '/accounts/settings',
      
      // Finance pages
      '/finance',
      '/finance/dashboard',
      '/finance/transactions',
      '/finance/transactions/*',
      '/finance/budget',
      '/finance/budget/*',
      '/finance/forecast',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // API routes
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
      // Support specific pages
      '/support',
      '/support/dashboard',
      '/support/tickets',
      '/support/tickets/*',
      '/support/chat',
      '/support/chat/*',
      '/support/knowledge-base',
      '/support/knowledge-base/*',
      '/support/faq',
      '/support/settings',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // API routes
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
      // Marketing specific pages
      '/marketing',
      '/marketing/dashboard',
      '/marketing/campaigns',
      '/marketing/campaigns/*',
      '/marketing/analytics',
      '/marketing/analytics/*',
      '/marketing/social',
      '/marketing/social/*',
      '/marketing/email',
      '/marketing/email/*',
      '/marketing/seo',
      '/marketing/seo/*',
      '/marketing/settings',
      
      // Shared routes
      ...SHARED_ROUTES,
      
      // API routes
      '/api/marketing',
      '/api/marketing/*',
      '/api/auth',
    ],
    description: 'Marketing campaigns and analytics'
  },
};

// ==================== HELPER FUNCTIONS ====================

// Improved route matching function
function matchesRoute(pathname: string, routePatterns: string[]): boolean {
  // Clean pathname (remove trailing slash)
  const cleanPathname = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;
  
  for (const pattern of routePatterns) {
    // If pattern is '*', allow all
    if (pattern === '*') {
      console.log(`✅ Wildcard match: ${pattern} for ${cleanPathname}`);
      return true;
    }
    
    // Exact match
    if (cleanPathname === pattern) {
      console.log(`✅ Exact match: ${pattern} for ${cleanPathname}`);
      return true;
    }
    
    // Remove trailing slash from pattern for comparison
    const cleanPattern = pattern.endsWith('/') && pattern.length > 1 
      ? pattern.slice(0, -1) 
      : pattern;
    
    // Wildcard match (e.g., '/admin/*' matches '/admin/anything')
    if (cleanPattern.endsWith('/*')) {
      const base = cleanPattern.slice(0, -2);
      if (cleanPathname.startsWith(base + '/')) {
        console.log(`✅ Wildcard pattern match: ${pattern} for ${cleanPathname}`);
        return true;
      }
    }
    
    // Prefix match (e.g., '/admin' matches '/admin/employee-management')
    if (cleanPathname.startsWith(cleanPattern + '/')) {
      console.log(`✅ Prefix match: ${pattern} for ${cleanPathname}`);
      return true;
    }
    
    // API route match (e.g., '/api/hr' matches '/api/hr/anything')
    if (cleanPattern.startsWith('/api/') && cleanPathname.startsWith(cleanPattern)) {
      console.log(`✅ API match: ${pattern} for ${cleanPathname}`);
      return true;
    }
  }
  
  console.log(`❌ No match found for ${cleanPathname}`);
  return false;
}

// Check if path is public
function isPublicPath(pathname: string): boolean {
  // Skip Next.js internal paths
  if (pathname.startsWith('/_next/') || pathname.includes('_next')) {
    return true;
  }
  
  // Skip static files
  if (pathname.includes('.') && !pathname.includes('/api/')) {
    return true;
  }
  
  return PUBLIC_ROUTES.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

// Get user's allowed routes from config
function getAllowedRoutes(userRole: string): string[] {
  const config = ROLE_ROUTES_CONFIG[userRole];
  if (!config) {
    console.log(`⚠️ No route config found for role: ${userRole}`);
    return SHARED_ROUTES;
  }
  
  // Combine role routes with shared routes
  const allRoutes = [...new Set([...config.routes, ...SHARED_ROUTES])];
  console.log(`📋 Allowed routes for ${userRole}:`, allRoutes);
  return allRoutes;
}

// Check if user has access to path
function hasAccess(userRole: string, pathname: string): boolean {
  const allowedRoutes = getAllowedRoutes(userRole);
  const hasAccess = matchesRoute(pathname, allowedRoutes);
  
  console.log(`🔐 Access check for ${userRole} to ${pathname}: ${hasAccess ? '✅ GRANTED' : '❌ DENIED'}`);
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

// ==================== MAIN MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;
  
  console.log(`\n🛡️ [${method}] Middleware checking: ${pathname}`);
  console.log(`🔍 Query params:`, Object.fromEntries(searchParams));
  
  // Skip static files and assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    (pathname.includes('.') && !pathname.includes('/api/')) ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    console.log(`⏭️ Skipping static file: ${pathname}`);
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
          console.log(`↪️ Redirecting ${getRoleName(decoded.role)} from ${pathname} to: ${dashboardPath}`);
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
  const userRoleCookie = request.cookies.get('userRole')?.value;
  
  console.log(`🔐 Token exists: ${!!token}, Role cookie: ${userRoleCookie}`);
  
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
            message: `You don't have permission to access this resource`,
            role: userRole,
            path: pathname
          },
          { status: 403 }
        );
      }
      
      // For web routes, redirect to dashboard
      const dashboardPath = getDashboardPath(userRole);
      console.log(`↪️ Redirecting ${roleName} to dashboard: ${dashboardPath}`);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    console.log(`✅ Access granted to ${pathname}`);
    
    // Add user info to headers for backend use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-name', roleName);

    // For API routes, also set content-type if not present
    if (isApiRoute(pathname) && !requestHeaders.has('content-type')) {
      requestHeaders.set('content-type', 'application/json');
    }

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
          message: 'Authentication failed',
          details: error.message
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)',
  ],
};