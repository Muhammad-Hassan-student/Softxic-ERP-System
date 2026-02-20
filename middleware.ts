// src/middleware.ts
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

// ==================== CONFIGURATION ====================

// 1. PUBLIC ROUTES (No auth required)
const PUBLIC_ROUTES = [
  "/login",
  "/module-login",           // ✅ Added module login page
  "/",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/check",
  "/api/auth/debug",
  "/api/auth/logout",
];

// 2. API ROUTES THAT DON'T NEED AUTH (or have their own auth)
const PUBLIC_API_ROUTES = [
  "/api/financial-tracker/module-login",  // ✅ Module login API
  "/api/module-login",                     // Fallback
];

// 3. DASHBOARD PATHS for each role
const DASHBOARD_PATHS: Record<string, string> = {
  admin: "/admin/dashboard",
  hr: "/hr/dashboard",
  employee: "/employee/dashboard",
  accounts: "/accounts/dashboard",
  support: "/support/dashboard",
  marketing: "/marketing/dashboard",
  "module-user": "/user-system",           // ✅ Module users go to entity selector
};

// ==================== HELPER FUNCTIONS ====================

// Check if route is accessible for user role
function canAccessRoute(userRole: string, pathname: string): boolean {
  // Admin can access everything
  if (userRole === "admin") return true;

  // Module users can only access user-system routes
  if (userRole === "module-user") {
    if (pathname.startsWith("/user-system")) return true;
    if (pathname === "/profile") return true;
    return false;
  }

  // HR can access HR routes and employee dashboard
  if (userRole === "hr") {
    if (pathname.startsWith("/hr")) return true;
    if (pathname === "/employee/dashboard") return true;
    if (pathname === "/profile") return true;
    if (pathname === "/dashboard") return true;
  }

  // Employee can access only employee routes
  if (userRole === "employee") {
    if (pathname.startsWith("/employee")) return true;
    if (pathname === "/profile") return true;
    if (pathname === "/dashboard") return true;
  }

  // Accounts can access accounts routes
  if (userRole === "accounts") {
    if (pathname.startsWith("/accounts")) return true;
    if (pathname.startsWith("/finance")) return true;
    if (pathname === "/profile") return true;
    if (pathname === "/dashboard") return true;
  }

  // Support can access support routes
  if (userRole === "support") {
    if (pathname.startsWith("/support")) return true;
    if (pathname === "/profile") return true;
    if (pathname === "/dashboard") return true;
  }

  // Marketing can access marketing routes
  if (userRole === "marketing") {
    if (pathname.startsWith("/marketing")) return true;
    if (pathname === "/profile") return true;
    if (pathname === "/dashboard") return true;
  }

  return false;
}

// ==================== MAIN MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and assets COMPLETELY
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/public/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  console.log(`\n🔐 Middleware checking: ${pathname}`);

  // Check if it's a public API route
  const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
  
  // Check if it's a public page
  const isPublicPage = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  // PUBLIC PATHS: No auth required
  if (isPublicApi || isPublicPage) {
    console.log(`🌐 Public path: ${pathname}`);

    // If already logged in and trying to access login, redirect to dashboard
    const token = request.cookies.get("token")?.value;
    const userType = request.cookies.get("userType")?.value;
    
    if (token && (pathname === "/login" || pathname === "/module-login" || pathname === "/")) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          // Determine role - use cookie if available, otherwise from token
          const role = userType === "module" ? "module-user" : decoded.role;
          
          const dashboardPath = DASHBOARD_PATHS[role] || "/dashboard";
          console.log(`↪️ Already logged in as ${role}, redirecting to: ${dashboardPath}`);

          const response = NextResponse.redirect(new URL(dashboardPath, request.url));

          // Preserve cookies
          request.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value || "", {
              httpOnly: cookie.name === "token",
              path: "/",
            });
          });

          return response;
        }
      } catch (error) {
        console.log("⚠️ Invalid token on public path");
      }
    }
    return NextResponse.next();
  }

  // PROTECTED PATHS: Require authentication
  const token = request.cookies.get("token")?.value;
  const userType = request.cookies.get("userType")?.value;
  
  console.log(`🔑 Token exists: ${!!token}, User type: ${userType || 'erp'}`);

  if (!token) {
    console.log("❌ No token, redirecting to login");
    
    // Determine which login page to redirect to
    const loginPath = pathname.startsWith("/user-system") ? "/module-login" : "/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("❌ Invalid token");
      const loginPath = pathname.startsWith("/user-system") ? "/module-login" : "/login";
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      response.cookies.delete("token");
      response.cookies.delete("userRole");
      response.cookies.delete("userType");
      response.cookies.delete("module");
      return response;
    }

    // Determine role (module-user or erp role)
    const role = userType === "module" ? "module-user" : decoded.role;
    
    console.log(`✅ User authenticated: ${role} (ID: ${decoded.userId})`);

    // Check if user can access this route
    if (!canAccessRoute(role, pathname)) {
      console.log(`⛔ Access denied for ${role} to ${pathname}`);

      // Redirect to user's dashboard
      const dashboardPath = DASHBOARD_PATHS[role] || "/dashboard";
      console.log(`↪️ Redirecting to: ${dashboardPath}`);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    console.log(`✅ Access granted to ${pathname}`);

    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-role", role);
    if (userType === "module") {
      requestHeaders.set("x-user-type", "module");
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Middleware error:", error.message);

    // Clear cookies and redirect to appropriate login
    const loginPath = pathname.startsWith("/user-system") ? "/module-login" : "/login";
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete("token");
    response.cookies.delete("userRole");
    response.cookies.delete("userType");
    response.cookies.delete("module");
    return response;
  }
}

// ==================== MIDDLEWARE CONFIG ====================
export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)",
  ],
};