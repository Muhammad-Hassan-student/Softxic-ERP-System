'use client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
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
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    
    const headers: Record<string, string> = {
      ...(options.headers || {}),
    };

    // Set content type if not multipart/form-data
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare body
    let body = options.body;
    if (body && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
      body,
      credentials: 'include',
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        clearAuthData();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      if (response.status === 403) {
        throw new Error('Access denied');
      }

      if (response.status === 404) {
        throw new Error('Resource not found');
      }

      // Try to get error message from response
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
    const data = await response.json();
    return data;

  } catch (error: any) {
    console.error('API Request Error:', error);
    
    // Return structured error response
    return {
      success: false,
      message: error.message || 'Network error occurred',
      error: error.message,
    };
  }
}

// Helper function to get token from cookies
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get token from cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return decodeURIComponent(value);
    }
  }
  
  // Try localStorage as fallback
  return localStorage.getItem('token');
}

// Helper function to clear auth data
function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  // Clear cookies
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
}