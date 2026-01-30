'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { StatsCard } from '@/components/ui/dashboard/StatsCard';
import { RecentActivity } from '@/components/ui/dashboard/RecentActivity';
import { QuickActions } from '@/components/ui/dashboard/QuickActions';
import { 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  
  const adminStats = [
    {
      title: 'Total Employees',
      value: '1,248',
      change: '+12.5%',
      icon: 'users',
      color: 'blue' as const,
    },
    {
      title: 'Total Revenue',
      value: '$124,580',
      change: '+18.7%',
      icon: 'dollar',
      color: 'green' as const,
    },
    {
      title: 'Pending Tasks',
      value: '42',
      change: '-3.1%',
      icon: 'alertCircle',
      color: 'orange' as const,
    },
    {
      title: 'Inventory Items',
      value: '4,872',
      change: '+2.3%',
      icon: 'package',
      color: 'purple' as const,
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: '+0.2%',
      icon: 'checkCircle',
      color: 'teal' as const,
    },
    {
      title: 'Growth Rate',
      value: '+24.3%',
      change: '+4.2%',
      icon: 'trendingUp',
      color: 'indigo' as const,
    },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && user?.role !== 'admin') {
      router.push(`/${user?.role}/dashboard`);
      return;
    }

    if (!isLoading) {
      setPageLoading(false);
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (pageLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Complete system overview and administration
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="space-y-6">
            <QuickActions />
            
            {/* System Status */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Server Uptime</span>
                    <span className="font-medium">99.8%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[99.8%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium">342</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}