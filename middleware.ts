import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// ==================== CONFIGURATION ====================
// Yahan se aap easily routes add/remove kar sakte hain

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
];

// 2. ROLE-SPECIFIC ROUTES
// Aap yahan easily koi bhi route add kar sakte hain
const ROLE_ROUTES: Record<string, string[]> = {
  // ADMIN - Can access everything (wildcard '*')
  admin: ['*'], // * means ALL routes
  
  // HR - Can access HR and Employee routes
  hr: [
    '/hr',
    '/hr/dashboard',
    '/hr/employee-management',
    '/hr/payroll',
    '/hr/attendance',
    '/hr/leaves',
    '/hr/reports',
    '/employee',
    '/employee/dashboard',
    '/employee/profile',
    '/employee/attendance',
    '/employee/leaves',
    '/dashboard',
    '/profile',
  ],
  
  // EMPLOYEE - Can access only employee routes
  employee: [
    '/employee',
    '/employee/dashboard',
    '/employee/profile',
    '/employee/attendance',
    '/employee/leaves',
    '/employee/payslip',
    '/employee/tasks',
    '/dashboard',
    '/profile',
  ],
  
  // ACCOUNTS - Can access accounts and finance
  accounts: [
    '/accounts',
    '/accounts/dashboard',
    '/accounts/payments',
    '/accounts/invoices',
    '/accounts/reports',
    '/finance',
    '/finance/dashboard',
    '/finance/transactions',
    '/finance/budget',
    '/dashboard',
    '/profile',
  ],
  
  // SUPPORT - Can access support routes
  support: [
    '/support',
    '/support/dashboard',
    '/support/tickets',
    '/support/chat',
    '/support/knowledge-base',
    '/dashboard',
    '/profile',
  ],
  
  // MARKETING - Can access marketing routes
  marketing: [
    '/marketing',
    '/marketing/dashboard',
    '/marketing/campaigns',
    '/marketing/analytics',
    '/marketing/social',
    '/dashboard',
    '/profile',
  ],
};

// 3. SHARED ROUTES (All authenticated users can access)
const SHARED_ROUTES = [
  '/profile',
  '/profile/edit',
  '/profile/settings',
  '/notifications',
  '/help',
  '/contact',
];

// 4. DASHBOARD REDIRECT PATHS
const DASHBOARD_PATHS: Record<string, string> = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  employee: '/employee/dashboard',
  accounts: '/accounts/dashboard',
  support: '/support/dashboard',
  marketing: '/marketing/dashboard',
};

// ==================== HELPER FUNCTIONS ====================

// Check if route matches any pattern
function matchesRoute(pathname: string, routePatterns: string[]): boolean {
  for (const pattern of routePatterns) {
    // If pattern is '*', allow all
    if (pattern === '*') return true;
    
    // Exact match
    if (pathname === pattern) return true;
    
    // Prefix match (e.g., '/admin' matches '/admin/anything')
    if (pattern.endsWith('/') && pathname.startsWith(pattern)) return true;
    
    // Wildcard match (e.g., '/admin/*' matches '/admin/anything')
    if (pattern.endsWith('/*') && pathname.startsWith(pattern.slice(0, -2))) return true;
    
    // Simple prefix match
    if (pathname.startsWith(pattern)) return true;
  }
  return false;
}

// Check if path is public
function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );
}

// Check if path is shared (all authenticated users)
function isSharedPath(pathname: string): boolean {
  return SHARED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );
}

// Get user's allowed routes
function getAllowedRoutes(userRole: string): string[] {
  return [...(ROLE_ROUTES[userRole] || []), ...SHARED_ROUTES];
}

// Check if user has access to path
function hasAccess(userRole: string, pathname: string): boolean {
  const allowedRoutes = getAllowedRoutes(userRole);
  return matchesRoute(pathname, allowedRoutes);
}

// ==================== MAIN MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🛡️ Middleware checking:', pathname);
  
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
  if (isPublicPath(pathname)) {
    // If already logged in and trying to access login, redirect to dashboard
    const token = request.cookies.get('token')?.value;
    if (token && (pathname === '/login' || pathname === '/')) {
      try {
        const decoded = verifyToken(token);
        if (decoded && decoded.role) {
          const dashboardPath = DASHBOARD_PATHS[decoded.role] || '/dashboard';
          console.log('↪️ Redirecting logged-in user to:', dashboardPath);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch (error) {
        console.log('Invalid token, allowing access');
      }
    }
    return NextResponse.next();
  }

  // Get token
  const token = request.cookies.get('token')?.value;
  
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
      return response;
    }

    const userRole = decoded.role;
    console.log('✅ User authenticated:', { role: userRole, userId: decoded.userId });

    // Check access
    if (!hasAccess(userRole, pathname)) {
      console.log(`⛔ Access denied for ${userRole} to ${pathname}`);
      
      // Show what they CAN access
      console.log(`Allowed routes for ${userRole}:`, getAllowedRoutes(userRole));
      
      // Redirect to their dashboard
      const dashboardPath = DASHBOARD_PATHS[userRole] || '/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    console.log('✅ Access granted to:', pathname);
    
    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Middleware error:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api/auth/|_next/static|_next/image|favicon.ico|public).*)',
  ],
};