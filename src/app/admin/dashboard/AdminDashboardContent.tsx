'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AuthUser } from '@/lib/auth/server-auth';
import { 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  UserPlus,
  BarChart3,
  Settings,
  Shield,
  Building,
  CreditCard,
  Calendar,
  Activity
} from 'lucide-react';
import { StatsCard } from '@/components/ui/dashboard/StatsCard';
import { useAuth } from '@/context/AuthContext';

interface AdminDashboardContentProps {
  user: AuthUser;
}

export default function AdminDashboardContent({ user }: AdminDashboardContentProps) {
  const { logout } = useAuth();
  
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
      title: 'Active Projects',
      value: '24',
      change: '+5.2%',
      icon: 'activity',
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

  const quickActions = [
    { icon: UserPlus, label: 'Add User', color: 'blue', path: '/admin/users/add' },
    { icon: Users, label: 'Manage Users', color: 'green', path: '/admin/users' },
    { icon: Shield, label: 'Role Management', color: 'purple', path: '/admin/roles' },
    { icon: Settings, label: 'System Settings', color: 'gray', path: '/admin/settings' },
    { icon: BarChart3, label: 'Analytics', color: 'orange', path: '/admin/analytics' },
    { icon: Building, label: 'Departments', color: 'teal', path: '/admin/departments' },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'added new employee', time: '5 min ago', type: 'success' },
    { user: 'System', action: 'database backup completed', time: '15 min ago', type: 'info' },
    { user: 'Sarah Smith', action: 'updated payroll records', time: '30 min ago', type: 'warning' },
    { user: 'Auto System', action: 'security audit passed', time: '1 hour ago', type: 'success' },
    { user: 'Mike Johnson', action: 'created new department', time: '2 hours ago', type: 'info' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, <span className="font-semibold text-blue-600">{user.fullName}</span>
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-500">Administrator Access Level</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Last login</p>
                <p className="text-sm font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button
                onClick={() => logout()}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-6">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={idx}
                      href={action.path}
                      className={`flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center`}
                    >
                      <div className={`h-12 w-12 rounded-full bg-${action.color}-100 flex items-center justify-center mb-3`}>
                        <Icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <span className="font-medium text-sm">{action.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

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
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Database Load</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[42%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900">
                  Recent Activity
                </h3>
                <a href="/admin/activity" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  View All →
                </a>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        activity.type === 'success' ? 'bg-green-100' :
                        activity.type === 'warning' ? 'bg-orange-100' :
                        'bg-blue-100'
                      }`}>
                        {activity.type === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : activity.type === 'warning' ? (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-gray-500">{activity.action}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  User Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { role: 'Employees', count: 850, color: 'blue', percentage: 68 },
                    { role: 'Managers', count: 120, color: 'green', percentage: 10 },
                    { role: 'HR', count: 45, color: 'purple', percentage: 4 },
                    { role: 'Admins', count: 8, color: 'orange', percentage: 1 },
                    { role: 'Others', count: 225, color: 'gray', percentage: 18 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full bg-${item.color}-500 mr-2`}></div>
                        <span className="text-sm">{item.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${item.color}-500`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  System Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">API Requests</span>
                      <span className="font-medium">1,248/sec</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[75%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Memory Usage</span>
                      <span className="font-medium">64%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[64%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Storage</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[82%]"></div>
                    </div>
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