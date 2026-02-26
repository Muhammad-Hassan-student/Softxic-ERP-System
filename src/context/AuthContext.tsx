'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  email?: string;
  role: string;
  department?: string;
  profilePhoto?: string;
  rollNo?: string;
  cnic?: string;
  jobTitle?: string;
  mobile?: string;
  status?: string;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Checking authentication...');
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ User authenticated:', data.data.fullName);
        setUser(data.data);
        setIsAuthenticated(true);
        
        // Store in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('lastAuthCheck', Date.now().toString());
        
        return true;
      } else {
        console.log('❌ Auth check failed:', data.message);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('lastAuthCheck');
        
        // If we're on a protected page, redirect to login
        if (!pathname?.includes('/login') && pathname !== '/') {
          console.log('Redirecting to login from:', pathname);
          router.push('/AuthContext/check-auth/login');
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      return false;
    }
  }, [router, pathname]);

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // First try to get from localStorage for instant UI
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('user');
          }
        }

        // Then verify with server
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up periodic auth check (every 5 minutes)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuth();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuth, isAuthenticated]);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastAuthCheck', Date.now().toString());
    
    // If token provided, store it (though cookies should handle this)
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear client state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
      
      // Clear cookies client-side
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name === 'token' || name === 'userRole' || name === 'userId') {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });

      // Redirect to login
      router.push('/login');
      router.refresh();
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Loading component
export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading authentication...</p>
      </div>
    </div>
  );
}