'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  PieChart,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  UserPlus,
  FolderTree,
  Shield,
  BarChart,
  Settings,
  LogOut,
  Search,
  Bell,
  Mail,
  MessageSquare,
  HelpCircle,
  Globe,
  Award,
  Target,
  Zap,
  Star,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  // User Stats
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  usersByRole: {
    admin: number;
    manager: number;
    employee: number;
  };
  
  // Record Stats
  totalRecords: number;
  recordsToday: number;
  recordsThisWeek: number;
  recordsThisMonth: number;
  
  // Financial Stats
  totalRE: number;
  totalExpense: number;
  netProfit: number;
  reToday: number;
  expenseToday: number;
  
  // Approval Stats
  pendingApprovals: number;
  approvedToday: number;
  rejectedToday: number;
  
  // Module Stats
  moduleStats: {
    re: {
      count: number;
      total: number;
      avg: number;
      growth: number;
    };
    expense: {
      count: number;
      total: number;
      avg: number;
      growth: number;
    };
  };
  
  // Chart Data
  weeklyData: Array<{
    day: string;
    re: number;
    expense: number;
    profit: number;
  }>;
  
  monthlyData: Array<{
    month: string;
    re: number;
    expense: number;
  }>;
  
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  
  // Activity
  recentActivities: Array<{
    id: string;
    user: string;
    userAvatar?: string;
    action: string;
    module: string;
    entity: string;
    timestamp: string;
    details?: string;
  }>;
  
  // Top Users
  topUsers: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
    records: number;
    reAmount: number;
    expenseAmount: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  
  // System Health
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    lastBackup: string;
    errors24h: number;
    warnings24h: number;
  };
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'expense' | 'both'>('both');
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/dashboard?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  // Handle navigation
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/financial-tracker/dashboard/export?format=${format}&range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${dateRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Dashboard exported successfully');
    } catch (error) {
      toast.error('Failed to export dashboard');
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  {stats.systemHealth.status === 'healthy' ? 'System Healthy' : 'System Warning'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardStats}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-gray-500" />
              </button>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="p-2 border rounded-lg hover:bg-gray-50">
                  <Download className="h-5 w-5 text-gray-500" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Bell className="h-5 w-5 text-gray-500" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 border-b">
                        <p className="text-sm text-gray-900">5 pending approvals</p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50 border-b">
                        <p className="text-sm text-gray-900">New user registered</p>
                        <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50">
                        <p className="text-sm text-gray-900">Daily backup completed</p>
                        <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                      </div>
                    </div>
                    <div className="p-3 border-t">
                      <button className="text-sm text-blue-600 hover:text-blue-800 w-full text-center">
                        View All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-1 border rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-6 gap-4 mt-4">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600">Active Users</p>
              <p className="text-lg font-bold text-green-700">{stats.activeUsers}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">Records Today</p>
              <p className="text-lg font-bold text-blue-700">{stats.recordsToday}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600">RE Today</p>
              <p className="text-lg font-bold text-purple-700">PKR {stats.reToday.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs text-red-600">Expense Today</p>
              <p className="text-lg font-bold text-red-700">PKR {stats.expenseToday.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-yellow-600">Pending</p>
              <p className="text-lg font-bold text-yellow-700">{stats.pendingApprovals}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-xs text-indigo-600">Net Profit</p>
              <p className="text-lg font-bold text-indigo-700">PKR {stats.netProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {/* Total Users Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +{stats.newUsersToday} today
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Users</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Admins: {stats.usersByRole.admin}</span>
              <span className="text-gray-600">Managers: {stats.usersByRole.manager}</span>
              <span className="text-gray-600">Employees: {stats.usersByRole.employee}</span>
            </div>
          </div>

          {/* Total Records Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                +{stats.recordsToday} today
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalRecords}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Records</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">This Week: {stats.recordsThisWeek}</span>
              <span className="text-gray-600">This Month: {stats.recordsThisMonth}</span>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className={`text-xs ${stats.moduleStats.re.growth >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
                {stats.moduleStats.re.growth >= 0 ? '+' : ''}{stats.moduleStats.re.growth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">PKR {stats.totalRE.toLocaleString()}</h3>
            <p className="text-sm text-gray-500 mt-1">Total RE</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">{stats.moduleStats.re.count} transactions</span>
              <span className="text-gray-600">Avg: PKR {stats.moduleStats.re.avg.toLocaleString()}</span>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <span className={`text-xs ${stats.moduleStats.expense.growth <= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
                {stats.moduleStats.expense.growth >= 0 ? '+' : ''}{stats.moduleStats.expense.growth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">PKR {stats.totalExpense.toLocaleString()}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Expense</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">{stats.moduleStats.expense.count} transactions</span>
              <span className="text-gray-600">Avg: PKR {stats.moduleStats.expense.avg.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="col-span-2 bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Revenue vs Expense</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedChart('both')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    selectedChart === 'both' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => setSelectedChart('revenue')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    selectedChart === 'revenue' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setSelectedChart('expense')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    selectedChart === 'expense' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyData}>
                  <defs>
                    <linearGradient id="colorRe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  {(selectedChart === 'both' || selectedChart === 'revenue') && (
                    <Area type="monotone" dataKey="re" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRe)" name="Revenue" />
                  )}
                  {(selectedChart === 'both' || selectedChart === 'expense') && (
                    <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-4">Category Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {stats.categoryData.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color || COLORS[idx] }} />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">PKR {cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="col-span-2 bg-white rounded-xl border shadow-sm">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Recent Activities</h3>
              <button
                onClick={() => handleNavigate('/admin/financial-tracker/logs')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.action === 'CREATE' ? 'bg-green-100' :
                      activity.action === 'UPDATE' ? 'bg-blue-100' :
                      activity.action === 'DELETE' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {activity.action === 'CREATE' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.action === 'UPDATE' && <RefreshCw className="h-4 w-4 text-blue-600" />}
                      {activity.action === 'DELETE' && <XCircle className="h-4 w-4 text-red-600" />}
                      {activity.action === 'APPROVE' && <ThumbsUp className="h-4 w-4 text-green-600" />}
                      {activity.action === 'REJECT' && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span>
                          {' '}{activity.action.toLowerCase()}d{' '}
                          <span className="font-medium">{activity.entity}</span>
                          {' '}in {activity.module}
                        </p>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users & Quick Actions */}
          <div className="space-y-6">
            {/* Top Users */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-6 py-4 border-b">
                <h3 className="font-medium text-gray-900">Top Performers</h3>
              </div>
              <div className="divide-y">
                {stats.topUsers.map((user) => (
                  <div key={user.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.records} records</p>
                        <p className="text-xs text-green-600">PKR {user.reAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavigate('/admin/financial-tracker/users/create')}
                  className="p-3 border rounded-lg hover:bg-gray-50 text-left group"
                >
                  <UserPlus className="h-5 w-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Add User</p>
                  <p className="text-xs text-gray-500">Create new user</p>
                </button>
                <button
                  onClick={() => handleNavigate('/admin/financial-tracker/categories')}
                  className="p-3 border rounded-lg hover:bg-gray-50 text-left group"
                >
                  <FolderTree className="h-5 w-5 text-green-600 mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Categories</p>
                  <p className="text-xs text-gray-500">Manage categories</p>
                </button>
                <button
                  onClick={() => handleNavigate('/admin/financial-tracker/permissions')}
                  className="p-3 border rounded-lg hover:bg-gray-50 text-left group"
                >
                  <Shield className="h-5 w-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Permissions</p>
                  <p className="text-xs text-gray-500">Configure access</p>
                </button>
                <button
                  onClick={() => handleNavigate('/admin/financial-tracker/reports')}
                  className="p-3 border rounded-lg hover:bg-gray-50 text-left group"
                >
                  <BarChart className="h-5 w-5 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">Reports</p>
                  <p className="text-xs text-gray-500">Generate reports</p>
                </button>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-3">System Health</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stats.systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    stats.systemHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stats.systemHealth.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">{stats.systemHealth.uptime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="font-medium">{stats.systemHealth.lastBackup}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Errors (24h)</span>
                  <span className="font-medium text-red-600">{stats.systemHealth.errors24h}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Warnings (24h)</span>
                  <span className="font-medium text-yellow-600">{stats.systemHealth.warnings24h}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}