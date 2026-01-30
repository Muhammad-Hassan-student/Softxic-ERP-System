'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'hr' | 'employee' | 'accounts' | 'support' | 'marketing')[];
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'hr', 'employee', 'accounts', 'support', 'marketing'] 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip if still loading initial auth state
    if (isLoading) return;

    const verifyAccess = async () => {
      setIsChecking(true);
      
      try {
        // Check if user exists
        if (!user) {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if user role is allowed
        if (!allowedRoles.includes(user.role)) {
          console.log(`User role ${user.role} not allowed, redirecting...`);
          
          // Redirect based on role
          let redirectPath = '/login';
          switch (user.role) {
            case 'admin':
              redirectPath = '/admin/dashboard';
              break;
            case 'hr':
              redirectPath = '/hr/dashboard';
              break;
            case 'employee':
              redirectPath = '/employee/dashboard';
              break;
            case 'accounts':
              redirectPath = '/accounts/dashboard';
              break;
            case 'support':
              redirectPath = '/support/dashboard';
              break;
            case 'marketing':
              redirectPath = '/marketing/dashboard';
              break;
          }
          
          router.push(redirectPath);
          return;
        }
        
        // All checks passed
        setIsChecking(false);
        
      } catch (error) {
        console.error('ProtectedRoute error:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAccess();
  }, [user, isLoading, allowedRoles, router]);

  // Show loading while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, show nothing (will redirect)
  if (!user) {
    return null;
  }

  // If user role not allowed (should have redirected already)
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}