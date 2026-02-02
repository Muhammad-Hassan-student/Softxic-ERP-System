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

    // Prepare body
    let body = fetchOptions.body;
    if (body && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }

    console.log(`🔍 API Request: ${endpoint}`);
    console.log(`📋 Method: ${fetchOptions.method || 'GET'}`);

    // IMPORTANT: For authenticated requests, just include cookies
    // Don't add Authorization header if backend expects cookies
    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers,
      body,
      credentials: "include", // This is KEY - sends cookies automatically
    });

    console.log(`📊 Response Status: ${response.status} for ${endpoint}`);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        console.log("🔴 401 Unauthorized");
        
        // Try to get error message
        let errorMessage = "Session expired. Please login again.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore JSON parsing errors
        }

        return {
          success: false,
          message: errorMessage,
          error: "UNAUTHORIZED",
          status: 401,
        };
      }

      if (response.status === 403) {
        let errorMessage = "Access denied. You do not have permission.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore JSON parsing errors
        }

        return {
          success: false,
          message: errorMessage,
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
    console.log(`✅ API Success: ${endpoint}`, data);

    return {
      success: true,
      ...data,
    };
  } catch (error: any) {
    console.error("❌ API Request Error:", error);

    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        message: "Network error. Please check your internet connection.",
        error: "NETWORK_ERROR",
      };
    }

    // Return structured error response
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
      error: "REQUEST_ERROR",
    };
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

// Helper for auth endpoints
export async function authRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    requireAuth: false,
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

// Set auth cookies (for login/signup)
export function setAuthCookies(token: string, userData: any): void {
  if (typeof window === "undefined") return;

  try {
    // Set secure cookies with proper attributes
    const cookieOptions = [
      `path=/`,
      `max-age=${7 * 24 * 60 * 60}`, // 7 days
      `SameSite=Strict`,
      `Secure=${window.location.protocol === 'https:'}`
    ].join('; ');

    document.cookie = `token=${encodeURIComponent(token)}; ${cookieOptions}`;
    document.cookie = `userData=${encodeURIComponent(JSON.stringify(userData))}; ${cookieOptions}`;
    document.cookie = `userId=${encodeURIComponent(userData.id || '')}; ${cookieOptions}`;
    document.cookie = `userRole=${encodeURIComponent(userData.role || '')}; ${cookieOptions}`;
    
    console.log("✅ Auth cookies set");
  } catch (error) {
    console.error("Error setting cookies:", error);
  }
}

// Clear auth cookies (for logout)
export function clearAuthCookies(): void {
  if (typeof window === "undefined") return;

  try {
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
    const path = 'path=/';
    
    document.cookie = `token=; expires=${pastDate}; ${path}`;
    document.cookie = `userData=; expires=${pastDate}; ${path}`;
    document.cookie = `userId=; expires=${pastDate}; ${path}`;
    document.cookie = `userRole=; expires=${pastDate}; ${path}`;
    
    // Clear localStorage too
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    
    console.log("🧹 Auth cookies cleared");
  } catch (error) {
    console.error("Error clearing cookies:", error);
  }
}