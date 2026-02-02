// Simple direct fetch utility without complex wrappers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get token from cookies
function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // Try to get from localStorage first
  const token = localStorage.getItem("token");
  if (token) return token;

  // Fallback to cookies
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token") {
      return decodeURIComponent(value);
    }
  }

  return null;
}

// Simple fetch wrapper
export async function simpleFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add token if exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        throw new Error("Authentication required");
      }

      if (response.status === 403) {
        throw new Error("Access denied");
      }

      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Ignore JSON parsing errors
      }

      throw new Error(errorMessage);
    }

    // Parse successful response
    return await response.json();
  } catch (error: any) {
    console.error("Fetch error:", error);

    return {
      success: false,
      message: error.message || "Network error occurred",
      error: error.message,
    };
  }
}

// GET request
export async function fetchGet<T = any>(
  endpoint: string,
): Promise<ApiResponse<T>> {
  return simpleFetch<T>(endpoint, { method: "GET" });
}

// POST request
export async function fetchPost<T = any>(
  endpoint: string,
  data: any,
): Promise<ApiResponse<T>> {
  return simpleFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT request
export async function fetchPut<T = any>(
  endpoint: string,
  data: any,
): Promise<ApiResponse<T>> {
  return simpleFetch<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE request
export async function fetchDelete<T = any>(
  endpoint: string,
): Promise<ApiResponse<T>> {
  return simpleFetch<T>(endpoint, { method: "DELETE" });
}
