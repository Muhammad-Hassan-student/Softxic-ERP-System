'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthLoading } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push(redirectTo);
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // Redirect to appropriate dashboard based on role
          const dashboardPaths: Record<string, string> = {
            admin: '/admin/dashboard',
            hr: '/hr/dashboard',
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
  }, [user, isLoading, isAuthenticated, allowedRoles, router, redirectTo]);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}