import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.css') ||
    pathname.includes('.js')
  ) {
    return NextResponse.next();
  }
  
  // Public paths that don't require auth
  const isPublicPath = 
    pathname === '/login' || 
    pathname === '/' ||
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
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
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
     */
    '/((?!api/auth|_next/static|_next/image|public).*)',
  ],
};