"use client";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: any;
}

interface ApiRequestOptions extends RequestInit {
  body?: any;
  headers?: Record<string, string>;
  // New: Add auth option
  requireAuth?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  try {
    const { requireAuth = true, ...fetchOptions } = options;

    // Default headers
    const headers: Record<string, string> = {
      ...(fetchOptions.headers || {}),
    };

    // Set content type if not multipart/form-data
    if (!(fetchOptions.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // IMPORTANT FIX: Don't add Authorization header for auth endpoints
    // Let cookies handle authentication for auth APIs
    if (requireAuth && !endpoint.includes("/api/auth/")) {
      // Try to get token from cookies
      const token = getTokenFromCookies();

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        // If no token and auth required, check if we should redirect
        console.warn("No token found for authenticated request");

        // Don't automatically redirect, let the component handle it
        return {
          success: false,
          message: "Authentication required",
          error: "NO_TOKEN",
        };
      }
    }

    // Prepare body
    let body = fetchOptions.body;
    if (body && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }

    console.log(`🔍 API Request: ${endpoint}`);
    console.log(`📋 Headers:`, headers);

    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers,
      body,
      credentials: "include", // IMPORTANT: Include cookies
    });

    console.log(`📊 Response Status: ${response.status} for ${endpoint}`);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        console.log("🔴 401 Unauthorized - Clearing auth data");
        clearAuthData();

        // Don't redirect automatically, return error
        return {
          success: false,
          message: "Session expired. Please login again.",
          error: "UNAUTHORIZED",
          status: 401,
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          message: "Access denied. You do not have permission.",
          error: "FORBIDDEN",
          status: 403,
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          message: "Resource not found",
          error: "NOT_FOUND",
          status: 404,
        };
      }

      // Try to get error message from response
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Ignore JSON parsing errors
      }

      return {
        success: false,
        message: errorMessage,
        error: `HTTP_${response.status}`,
        status: response.status,
      };
    }

    // Parse successful response
    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`);

    return {
      success: true,
      ...data,
    };
  } catch (error: any) {
    console.error("❌ API Request Error:", error);

    // Return structured error response
    return {
      success: false,
      message:
        error.message ||
        "Network error occurred. Please check your connection.",
      error: "NETWORK_ERROR",
    };
  }
}

// FIXED: Get token from cookies properly
function getTokenFromCookies(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.trim().split("=");
      const value = valueParts.join("="); // Handle = in value

      if (name === "token") {
        // Decode URI component
        const decodedValue = decodeURIComponent(value);

        // Validate it's a JWT token (starts with header)
        if (decodedValue && decodedValue.split(".").length === 3) {
          console.log("✅ Token found in cookies");
          return decodedValue;
        }
      }
    }

    console.log("⚠️ No valid token found in cookies");
    return null;
  } catch (error) {
    console.error("Error reading cookies:", error);
    return null;
  }
}

// FIXED: Clear auth data
function clearAuthData(): void {
  if (typeof window === "undefined") return;

  try {
    // Clear cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("lastAuthCheck");

    console.log("🧹 Auth data cleared");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
}

// Helper function to check auth status
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success === true && data.isAuthenticated === true;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

// Helper for auth endpoints (no Authorization header needed)
export async function authRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    requireAuth: false, // Auth APIs don't need Authorization header
  });
}

// Helper for GET requests
export async function apiGet<T = any>(
  endpoint: string,
  options: Omit<ApiRequestOptions, "method" | "body"> = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "GET",
  });
}

// Helper for POST requests
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  options: Omit<ApiRequestOptions, "method" | "body"> = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: data,
  });
}

// Helper for PUT requests
export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
  options: Omit<ApiRequestOptions, "method" | "body"> = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data,
  });
}

// Helper for DELETE requests
export async function apiDelete<T = any>(
  endpoint: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}

// Debug function to check cookies
export function debugCookies(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(";");

  cookieArray.forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    const value = valueParts.join("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  console.log("🍪 Current cookies:", cookies);
  return cookies;
}
