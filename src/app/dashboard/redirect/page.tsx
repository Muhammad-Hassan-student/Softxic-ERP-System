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
        router.push('/login');
      } else {
        // Redirect based on role
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'hr':
            router.push('/hr/dashboard');
            break;
          case 'employee':
            router.push('/employee/dashboard');
            break;
        //   case 'accounts':
        //     router.push('/accounts/dashboard');
        //     break;
        //   case 'support':
        //     router.push('/support/dashboard');
        //     break;
        //   case 'marketing':
        //     router.push('/marketing/dashboard');
        //     break;
          default:
            router.push('/login');
        }
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="smin-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}