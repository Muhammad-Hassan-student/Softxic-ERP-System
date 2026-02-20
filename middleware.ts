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
  "/access-denied",
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/check",
  "/api/auth/debug",
  "/api/auth/logout",
  "/api/financial-tracker/module-login",
];

// 2. STATIC ASSETS (Always skip)
const STATIC_PATHS = [
  "/_next",
  "/public",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".css", ".js",
];

// 3. DASHBOARD PATHS for each role
const DASHBOARD_PATHS: Record<string, string> = {
  admin: "/admin/dashboard",
  hr: "/hr/dashboard",
  employee: "/employee/dashboard",
  accounts: "/accounts/dashboard",
  support: "/support/dashboard",
  marketing: "/marketing/dashboard",
  "module-user": "/user-system",           // ✅ Module users
};

// 4. ROLE-BASED ACCESS RULES
const ROLE_ACCESS: Record<string, string[]> = {
  admin: ["/admin", "/hr", "/employee", "/accounts", "/support", "/marketing", "/user-system", "/profile", "/dashboard"],
  "module-user": ["/user-system", "/profile"],
  hr: ["/hr", "/employee", "/profile", "/dashboard"],
  employee: ["/employee", "/profile", "/dashboard"],
  accounts: ["/accounts", "/finance", "/profile", "/dashboard"],
  support: ["/support", "/profile", "/dashboard"],
  marketing: ["/marketing", "/profile", "/dashboard"],
};

// ==================== HELPER FUNCTIONS ====================

function isStaticAsset(pathname: string): boolean {
  return STATIC_PATHS.some(path => 
    pathname.startsWith(path) || pathname.endsWith(path)
  );
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

function canAccessRoute(userRole: string, pathname: string): boolean {
  // Admin can access everything
  if (userRole === "admin") return true;

  // Get allowed paths for this role
  const allowedPaths = ROLE_ACCESS[userRole] || [];
  
  // Check if current path starts with any allowed path
  return allowedPaths.some(path => pathname.startsWith(path));
}

function getUserRole(request: NextRequest, decoded: any): string {
  // ✅ FIXED: Check userType cookie first (for module users)
  const userType = request.cookies.get("userType")?.value;
  if (userType === "module") {
    return "module-user";
  }
  
  // Otherwise use role from token or userRole cookie
  return decoded?.role || request.cookies.get("userRole")?.value || "";
}

function getLoginPath(pathname: string, role?: string): string {
  // Module users trying to access ERP routes → module login
  if (role === "module-user" && !pathname.startsWith("/user-system")) {
    return "/module-login";
  }
  
  // User-system routes → module login
  if (pathname.startsWith("/user-system")) {
    return "/module-login";
  }
  
  // Default → ERP login
  return "/login";
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete("token");
  response.cookies.delete("userRole");
  response.cookies.delete("userType");
  response.cookies.delete("module");
}

// ==================== MAIN MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1️⃣ SKIP STATIC ASSETS
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  console.log(`\n🔐 Middleware checking: ${pathname}`);

  // 2️⃣ CHECK PUBLIC ROUTES
  if (isPublicRoute(pathname)) {
    console.log(`🌐 Public path: ${pathname}`);

    // If already logged in and trying to access login, redirect to dashboard
    const token = request.cookies.get("token")?.value;
    const userType = request.cookies.get("userType")?.value;
    
    if (token && (pathname === "/login" || pathname === "/module-login" || pathname === "/")) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          // ✅ FIXED: Use userType to determine role
          const role = userType === "module" ? "module-user" : decoded.role;
          const dashboardPath = DASHBOARD_PATHS[role] || "/dashboard";
          
          console.log(`↪️ Already logged in as ${role}, redirecting to: ${dashboardPath}`);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch (error) {
        console.log("⚠️ Invalid token on public path");
      }
    }
    return NextResponse.next();
  }

  // 3️⃣ PROTECTED PATHS - CHECK AUTHENTICATION
  const token = request.cookies.get("token")?.value;
  const userType = request.cookies.get("userType")?.value;
  
  console.log(`🔑 Token exists: ${!!token}, User type: ${userType || 'erp'}`);

  if (!token) {
    console.log("❌ No token, redirecting to login");
    
    // ✅ FIXED: Determine correct login page
    const loginPath = getLoginPath(pathname);
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // 4️⃣ VERIFY TOKEN
  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("❌ Invalid token");
      const loginPath = getLoginPath(pathname);
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      clearAuthCookies(response);
      return response;
    }

    // ✅ FIXED: Get user role with userType consideration
    const role = getUserRole(request, decoded);
    
    console.log(`✅ User authenticated: ${role} (ID: ${decoded.userId})`);

    // 5️⃣ CHECK AUTHORIZATION
    if (!canAccessRoute(role, pathname)) {
      console.log(`⛔ Access denied for ${role} to ${pathname}`);

      // ✅ FIXED: Redirect to correct login page
      const loginPath = getLoginPath(pathname, role);
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "access-denied");
      loginUrl.searchParams.set("role", role);
      
      return NextResponse.redirect(loginUrl);
    }

    console.log(`✅ Access granted to ${pathname}`);

    // 6️⃣ ADD USER INFO TO HEADERS
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-role", role);
    
    if (userType === "module") {
      requestHeaders.set("x-user-type", "module");
      requestHeaders.set("x-module", request.cookies.get("module")?.value || "");
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Middleware error:", error.message);

    const loginPath = getLoginPath(pathname);
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    clearAuthCookies(response);
    return response;
  }
}

// ==================== MIDDLEWARE CONFIG ====================
export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};