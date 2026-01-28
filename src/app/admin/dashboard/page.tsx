import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import  {StatColor, StatsCard}  from '@/components/ui/dashboard/StatsCard';
import { RecentActivity } from '@/components/ui/dashboard/RecentActivity';
import { QuickActions } from '@/components/ui/dashboard/QuickActions';
import { DASHBOARD_TEXTS } from '@/lib/constants/text';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  TrendingUp,
  Package,
  FileText,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
    const stats = [
      {
        title: DASHBOARD_TEXTS.dashboard.stats.totalUsers,
        value: '1,248',
        change: '+12.5%',
        icon: 'users',
        color: 'blue',
      },
      {
        title: DASHBOARD_TEXTS.dashboard.stats.activeSessions,
        value: '342',
        change: '+5.2%',
        icon: 'activity',
        color: 'green',
      },
      {
        title: DASHBOARD_TEXTS.dashboard.stats.pendingTasks,
        value: '42',
        change: '-3.1%',
        icon: 'alertCircle',
        color: 'orange',
      },
      {
        title: DASHBOARD_TEXTS.dashboard.stats.revenue,
        value: '$124,580',
        change: '+18.7%',
        icon: 'trendingUp',
        color: 'purple',
      },
      {
        title: DASHBOARD_TEXTS.dashboard.stats.completion,
        value: '89%',
        change: '+4.2%',
        icon: 'checkCircle',
        color: 'teal',
      },
      {
        title: 'Inventory Items',
        value: '4,872',
        change: '+2.3%',
        icon: 'package',
        color: 'indigo',
      },
    ] as const;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {DASHBOARD_TEXTS.header.title}
        </h1>
        <p className="text-gray-600 mt-2">
          Overview of your ERP system performance and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat}  />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions & Side Stats */}
        <div className="space-y-6">
          <QuickActions />
          
          {/* System Health */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              {DASHBOARD_TEXTS.dashboard.systemHealth}
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
                  <span className="text-gray-600">Database Load</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[42%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage Usage</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[78%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}