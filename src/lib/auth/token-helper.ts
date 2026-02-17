import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Get token from request - Works in both API routes and Server Components
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const token = request.cookies.get('token')?.value;
  return token || null;
}

/**
 * Get token from server component
 */
export async function getTokenFromServer(): Promise<string | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;
  return token || null;
}

/**
 * Get token from client
 */
export function getTokenFromClient(): string | null {
  if (typeof document === 'undefined') return null;
  
  // Check cookie
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Create headers with auth token
 */
export function createAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const authToken = token || getTokenFromClient();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
}