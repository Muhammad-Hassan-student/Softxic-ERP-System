// src/middleware.ts
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

// ==================== CONFIGURATION ====================

// 1. PUBLIC ROUTES (No auth required)
const PUBLIC_ROUTES = [
  "/public-path/login",
  "/module-login",
  "/",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/check",
  "/api/auth/debug",
  "/api/auth/logout",
  "/api/module-login",
];

// 2. DASHBOARD PATHS for each role
const DASHBOARD_PATHS: Record<string, string> = {
  admin: "/admin/dashboard",
  hr: "/hr/dashboard",
  employee: "/employee/dashboard",
  accounts: "/accounts/dashboard",
  support: "/support/dashboard",
  marketing: "/marketing/dashboard",
  "module-user": "/user-system",
};

// ==================== HELPER FUNCTIONS ====================

// Route check based on role
function canAccessRoute(userRole: string, pathname: string): boolean {
  // Admin can access everything
  if (userRole === "admin") return true;

  // MODULE USER - can only access user-system
  if (userRole === "module-user") {
    return pathname.startsWith("/user-system") || pathname === "/profile";
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

// Get user role from token and cookies
function getUserRole(request: NextRequest, decoded: any): string {
  // Check if this is a module user
  const userType = request.cookies.get("userType")?.value;
  if (userType === "module") {
    return "module-user";
  }
  
  // Regular ERP user
  return decoded?.role || request.cookies.get("userRole")?.value || "";
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

  // ✅ CHECK IF IT'S A PUBLIC ROUTE
  const isPublicPage = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  // PUBLIC PATHS: No auth required
  if (isPublicPage) {
    console.log(`🌐 Public path: ${pathname}`);
    return NextResponse.next();
  }

  // PROTECTED PATHS: Require authentication
  const token = request.cookies.get("token")?.value;
  const userType = request.cookies.get("userType")?.value;
  
  console.log(`🔑 Token exists: ${!!token}, User type: ${userType || 'erp'}`);

  if (!token) {
    console.log("❌ No token, redirecting to login");
    
    // ✅ SMART REDIRECT - user-system routes go to module-login, others to login
    const loginPath = pathname.startsWith("/user-system") ? "/module-login" : "/smart-redirect/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("❌ Invalid token");
      const loginPath = pathname.startsWith("/user-system") ? "/module-login" : "/verify-token/login";
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      response.cookies.delete("token");
      response.cookies.delete("userRole");
      response.cookies.delete("userType");
      response.cookies.delete("module");
      return response;
    }

    // ✅ Get correct user role
    const role = getUserRole(request, decoded);
    
    console.log(`✅ User authenticated: ${role} (ID: ${decoded.userId})`);

    // Check if user can access this route
    if (!canAccessRoute(role, pathname)) {
      console.log(`⛔ Access denied for ${role} to ${pathname}`);

      // ✅ Redirect to appropriate login
      const loginPath = role === "module-user" ? "/module-login" : "/login";
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "access-denied");
      
      return NextResponse.redirect(loginUrl);
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

    const loginPath = pathname.startsWith("/user-system") ? "/module-login" : "/login-path/login";
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