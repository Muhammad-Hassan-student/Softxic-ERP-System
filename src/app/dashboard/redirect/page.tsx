'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/redirect-login');
      } else {
        // Redirect based on role
        const role = user.role;
        let redirectPath = '/dashboard';
        
        if (role === 'admin') redirectPath = '/admin/dashboard';
        else if (role === 'hr') redirectPath = '/hr/dashboard';
        else if (role === 'employee') redirectPath = '/employee/dashboard';
        else if (role === 'accounts') redirectPath = '/accounts/dashboard';
        else if (role === 'support') redirectPath = '/support/dashboard';
        else if (role === 'marketing') redirectPath = '/marketing/dashboard';
        
        router.push(redirectPath);
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}