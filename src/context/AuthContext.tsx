'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  email?: string;
  role: 'admin' | 'hr' | 'employee' | 'accounts' | 'support' | 'marketing';
  department?: string;
  profilePhoto?: string;
  rollNo?: string;
  cnic?: string;
  jobTitle?: string;
  status?: 'active' | 'inactive' | 'terminated';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication from server
  const checkAuth = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuth();
    }
  };

  // Clear all auth data
  const clearAuth = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    
    // Clear all auth cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name === 'token' || name === 'userRole' || name === 'userData') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  // Initialize auth on component mount
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        // First try to load from localStorage for fast UI
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (e) {
            localStorage.removeItem('user');
          }
        }

        // Then verify with server
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Optional: Check auth on window focus
    const handleFocus = (): void => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Login function - just update local state
  const login = (userData: User): void => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear client-side state
      clearAuth();
      
      // Redirect to login page
      router.push('/login');
      
      // Force a hard refresh to clear any cached state
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for protected components
export function useProtectedRoute(allowedRoles?: string[]): {
  user: User;
  isAuthorized: boolean;
} {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect if not authenticated
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Redirect if role not allowed
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // Redirect to appropriate dashboard based on role
          const dashboardPaths: Record<string, string> = {
            admin: '/admin/dashboard',
            hr: '/hr/dashboard/employee-management',
            employee: '/employee/dashboard',
            accounts: '/accounts/dashboard',
            support: '/support/dashboard',
            marketing: '/marketing/dashboard',
          };
          
          const redirectPath = dashboardPaths[user.role] || '/dashboard';
          router.push(redirectPath);
        }
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router]);

  return {
    user: user!,
    isAuthorized: allowedRoles ? allowedRoles.includes(user?.role || '') : true,
  };
}

// Loading component for auth states
export function AuthLoading(): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}

// Higher-order component for role-based protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
): React.FC<P> {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated || !user) {
          router.push('/login');
          return;
        }

        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(user.role)) {
            const dashboardPaths: Record<string, string> = {
              admin: '/admin/dashboard',
              hr: '/hr/dashboard/employee-management',
              employee: '/employee/dashboard',
              accounts: '/accounts/dashboard',
              support: '/support/dashboard',
              marketing: '/marketing/dashboard',
            };
            
            const redirectPath = dashboardPaths[user.role] || '/dashboard';
            router.push(redirectPath);
          }
        }
      }
    }, [user, isLoading, isAuthenticated, router]);

    if (isLoading) {
      return <AuthLoading />;
    }

    if (!isAuthenticated || !user) {
      return null;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return null;
    }

    return <Component {...props} />;
  };

  // Set display name for debugging
  WithAuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WithAuthComponent;
}

// Utility function to check permissions
export function hasPermission(
  user: User | null,
  requiredPermissions: string[]
): boolean {
  if (!user) return false;

  // Admin has all permissions
  if (user.role === 'admin') {
    return true;
  }

  // Map roles to permissions
  const rolePermissions: Record<string, string[]> = {
    hr: ['view_employees', 'manage_employees', 'view_attendance', 'manage_attendance'],
    employee: ['view_profile', 'edit_profile', 'view_attendance', 'request_leave'],
    accounts: ['view_finance', 'manage_payments', 'generate_reports'],
    support: ['view_tickets', 'manage_tickets', 'respond_tickets'],
    marketing: ['view_campaigns', 'manage_campaigns', 'view_analytics'],
  };

  const userPermissions = rolePermissions[user.role] || [];
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}