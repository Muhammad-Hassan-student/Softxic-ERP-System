import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

/* ============================================================
   CONFIGURATION
============================================================ */

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  "/login",
  "/",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/check",
  "/api/auth/debug",
  "/api/auth/logout",
];

// Financial module routes (ISOLATED FROM ERP)
const FINANCIAL_ROUTES = [
  "/module-login",
  "/user-system",
  "/financial",
];

// Role dashboards
const DASHBOARD_PATHS: Record<string, string> = {
  admin: "/admin/dashboard",
  hr: "/hr/dashboard",
  employee: "/employee/dashboard",
  accounts: "/accounts/dashboard",
  support: "/support/dashboard",
  marketing: "/marketing/dashboard",
};

/* ============================================================
   HELPERS
============================================================ */

function isStatic(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/public/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );
}

function isFinancial(pathname: string) {
  return FINANCIAL_ROUTES.some((r) => pathname.startsWith(r));
}

function canAccessERP(role: string, pathname: string) {
  if (role === "admin") return true;

  const map: Record<string, string[]> = {
    hr: ["/hr", "/employee/dashboard", "/profile", "/dashboard"],
    employee: ["/employee", "/profile", "/dashboard"],
    accounts: ["/accounts", "/finance", "/profile", "/dashboard"],
    support: ["/support", "/profile", "/dashboard"],
    marketing: ["/marketing", "/profile", "/dashboard"],
  };

  const allowed = map[role] || [];
  return allowed.some((r) => pathname.startsWith(r));
}

/* ============================================================
   MAIN MIDDLEWARE
============================================================ */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1️⃣ Ignore static
  if (isStatic(pathname)) return NextResponse.next();

  console.log("🔐 Checking:", pathname);

  // 2️⃣ Public routes
  if (isPublic(pathname)) {
    const token = request.cookies.get("token")?.value;

    // Already logged in → redirect dashboard
    if (token && (pathname === "/login" || pathname === "/")) {
      try {
        const decoded: any = verifyToken(token);
        const dash = DASHBOARD_PATHS[decoded.role] || "/dashboard";
        return NextResponse.redirect(new URL(dash, request.url));
      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // 3️⃣ FINANCIAL MODULE (ISOLATED)
  if (isFinancial(pathname)) {
    const token = request.cookies.get("token")?.value;

    // Financial user must login via module-login
    if (!token && pathname !== "/module-login") {
      return NextResponse.redirect(
        new URL("/module-login", request.url)
      );
    }

    try {
      if (token) {
        const decoded: any = verifyToken(token);

        const headers = new Headers(request.headers);
        headers.set("x-user-id", decoded.userId);
        headers.set("x-user-role", decoded.role);

        return NextResponse.next({
          request: { headers },
        });
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(
        new URL("/module-login", request.url)
      );
    }
  }

  // 4️⃣ ERP PROTECTED ROUTES
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded: any = verifyToken(token);

    if (!canAccessERP(decoded.role, pathname)) {
      const dash = DASHBOARD_PATHS[decoded.role] || "/dashboard";
      return NextResponse.redirect(new URL(dash, request.url));
    }

    const headers = new Headers(request.headers);
    headers.set("x-user-id", decoded.userId);
    headers.set("x-user-role", decoded.role);

    return NextResponse.next({
      request: { headers },
    });
  } catch {
    const res = NextResponse.redirect(
      new URL("/login", request.url)
    );
    res.cookies.delete("token");
    return res;
  }
}

/* ============================================================
   MATCHER
============================================================ */

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)",
  ],
};