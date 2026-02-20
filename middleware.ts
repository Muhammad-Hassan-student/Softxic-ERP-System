// src/middleware.ts - DISABLED VERSION
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

// ✅ EMPTY MIDDLEWARE - Sab kuch allow karo
export async function middleware(request: NextRequest) {
  // Sab requests ko allow karo bina kisi check ke
  return NextResponse.next();
}

// ✅ Keep config for performance (optional)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};


// import { NextResponse } from "next/server";
// import { type NextRequest } from "next/server";
// import { verifyToken } from "@/lib/auth/jwt";

// // ==================== CONFIGURATION ====================
// // Sab kuch isi file mein - easily modify kar sakte hain

// // 1. PUBLIC ROUTES (No auth required)
// const PUBLIC_ROUTES = [
//   "/login",
//   "/",
//   "/forgot-password",
//   "/reset-password",
//   "/api/auth/login",
//   "/api/auth/me",
//   "/api/auth/check",
//   "/api/auth/debug",
//   "/api/auth/logout",
// ];

// // 2. DASHBOARD PATHS for each role
// const DASHBOARD_PATHS: Record<string, string> = {
//   admin: "/admin/dashboard",
//   hr: "/hr/dashboard",
//   employee: "/employee/dashboard",
//   accounts: "/accounts/dashboard",
//   support: "/support/dashboard",
//   marketing: "/marketing/dashboard",
// };

// // ==================== HELPER FUNCTIONS ====================

// // SUPER SIMPLE Route check for admin
// function canAccessRoute(userRole: string, pathname: string): boolean {
//   // Admin can access everything
//   if (userRole === "admin") return true;

//   // HR can access HR routes and employee dashboard
//   if (userRole === "hr") {
//     if (pathname.startsWith("/hr")) return true;
//     if (pathname === "/employee/dashboard") return true;
//     if (pathname === "/profile") return true;
//     if (pathname === "/dashboard") return true;
//   }

//   // Employee can access only employee routes
//   if (userRole === "employee") {
//     if (pathname.startsWith("/employee")) return true;
//     if (pathname === "/profile") return true;
//     if (pathname === "/dashboard") return true;
//   }

//   // Accounts can access accounts routes
//   if (userRole === "accounts") {
//     if (pathname.startsWith("/accounts")) return true;
//     if (pathname.startsWith("/finance")) return true;
//     if (pathname === "/profile") return true;
//     if (pathname === "/dashboard") return true;
//   }

//   // Support can access support routes
//   if (userRole === "support") {
//     if (pathname.startsWith("/support")) return true;
//     if (pathname === "/profile") return true;
//     if (pathname === "/dashboard") return true;
//   }

//   // Marketing can access marketing routes
//   if (userRole === "marketing") {
//     if (pathname.startsWith("/marketing")) return true;
//     if (pathname === "/profile") return true;
//     if (pathname === "/dashboard") return true;
//   }

//   return false;
// }

// // ==================== MAIN MIDDLEWARE ====================

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Skip static files and assets COMPLETELY
//   if (
//     pathname.startsWith("/_next/") ||
//     pathname.startsWith("/public/") ||
//     pathname.includes(".") ||
//     pathname === "/favicon.ico" ||
//     pathname === "/robots.txt" ||
//     pathname === "/sitemap.xml"
//   ) {
//     return NextResponse.next();
//   }

//   console.log(`\n🔐 Middleware checking: ${pathname}`);
//   console.log(`📊 Request URL: ${request.url}`);

//   // Check if it's a public API auth route
//   const isAuthApi = pathname.startsWith("/api/auth/");
//   const isPublicPage = PUBLIC_ROUTES.some(
//     (route) => pathname === route || pathname.startsWith(route),
//   );

//   // PUBLIC PATHS: No auth required
//   if (isAuthApi || isPublicPage) {
//     console.log(`🌐 Public path: ${pathname}`);

//     // If already logged in and trying to access login, redirect to dashboard
//     const token = request.cookies.get("token")?.value;
//     if (token && (pathname === "/login" || pathname === "/")) {
//       try {
//         const decoded = verifyToken(token);
//         if (decoded && decoded.role) {
//           const dashboardPath = DASHBOARD_PATHS[decoded.role] || "/dashboard";
//           console.log(
//             `↪️ Already logged in as ${decoded.role}, redirecting to: ${dashboardPath}`,
//           );

//           // IMPORTANT: Create new response
//           const response = NextResponse.redirect(
//             new URL(dashboardPath, request.url),
//           );

//           // Ensure cookies are preserved in redirect
//           request.cookies.getAll().forEach((cookie) => {
//             response.cookies.set(cookie.name, cookie.value || "", {
//               httpOnly: true,
//               path: "/",
//             });
//           });

//           return response;
//         }
//       } catch (error) {
//         console.log("⚠️ Invalid token on public path");
//       }
//     }
//     return NextResponse.next();
//   }

//   // PROTECTED PATHS: Require authentication
//   const token = request.cookies.get("token")?.value;
//   console.log(`🔑 Token exists: ${!!token}`);

//   if (!token) {
//     console.log("❌ No token, redirecting to login");
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Verify token
//   try {
//     const decoded = verifyToken(token);

//     if (!decoded || !decoded.role) {
//       console.log("❌ Invalid token");
//       const response = NextResponse.redirect(new URL("/login", request.url));
//       response.cookies.delete("token");
//       response.cookies.delete("userRole");
//       return response;
//     }

//     console.log(
//       `✅ User authenticated: ${decoded.role} (ID: ${decoded.userId})`,
//     );

//     // Check if user can access this route
//     if (!canAccessRoute(decoded.role, pathname)) {
//       console.log(`⛔ Access denied for ${decoded.role} to ${pathname}`);

//       // Redirect to user's dashboard
//       const dashboardPath = DASHBOARD_PATHS[decoded.role] || "/dashboard";
//       console.log(`↪️ Redirecting to: ${dashboardPath}`);
//       return NextResponse.redirect(new URL(dashboardPath, request.url));
//     }

//     console.log(`✅ Access granted to ${pathname}`);

//     // Add user info to headers
//     const requestHeaders = new Headers(request.headers);
//     requestHeaders.set("x-user-id", decoded.userId);
//     requestHeaders.set("x-user-role", decoded.role);

//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
//   } catch (error: any) {
//     console.error("❌ Middleware error:", error.message);

//     // Clear cookies and redirect to login
//     const response = NextResponse.redirect(new URL("/login", request.url));
//     response.cookies.delete("token");
//     response.cookies.delete("userRole");
//     return response;
//   }
// }

// // ==================== MIDDLEWARE CONFIG ====================
// export const config = {
//   matcher: [
//     // Match all routes except static files
//     "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)",
//   ],
// };
