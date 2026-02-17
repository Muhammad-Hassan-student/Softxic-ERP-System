'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePermissions } from '@/app/financial-tracker/hooks/usePermission';
import { useRecords } from '@/app/financial-tracker/hooks/useRecord';
import { useFields } from '@/app/financial-tracker/hooks/useField';
import {
  LineChart,
  Line,
  BarChart,
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

export default function UserDashboardPage() {
  const params = useParams();
  const module = params.module as 're' | 'expense';
  const entity = params.entity as string;

  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const { canAccess } = usePermissions(module, entity);
  const { records, isLoading, refreshRecords } = useRecords(module, entity);
  const { visibleFields } = useFields(module, entity);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    if (!canAccess) {
      toast.error('Access denied');
      setTimeout(() => window.location.href = '/dashboard', 2000);
    }
  }, [canAccess]);

  useEffect(() => {
    if (records.length > 0) {
      calculateStats();
    }
  }, [records, dateRange]);

  const calculateStats = () => {
    // Filter records by date range
    const now = new Date();
    const filteredRecords = records.filter(record => {
      const recordDate = new Date(record.createdAt);
      const diffTime = Math.abs(now.getTime() - recordDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dateRange) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'quarter': return diffDays <= 90;
        case 'year': return diffDays <= 365;
        default: return true;
      }
    });

    // Calculate totals
    const total = filteredRecords.reduce((sum, r:any) => sum + (Number(r.data.amount) || 0), 0);
    const average = filteredRecords.length > 0 ? total / filteredRecords.length : 0;
    const max = Math.max(...filteredRecords.map(r => Number(r.data.amount) || 0));
    const min = Math.min(...filteredRecords.map(r => Number(r.data.amount) || 0));

    setStats({
      total,
      average,
      max,
      min,
      count: filteredRecords.length
    });

    // Group by date for chart
    const groupedByDate: Record<string, number> = {};
    filteredRecords.forEach((record:any) => {
      const date = new Date(record.createdAt).toLocaleDateString();
      groupedByDate[date] = (groupedByDate[date] || 0) + (Number(record.data.amount) || 0);
    });

    setChartData(Object.entries(groupedByDate).map(([date, amount]) => ({
      date,
      amount
    })).slice(-10));

    // Group by category
    const groupedByCategory: Record<string, number> = {};
    filteredRecords.forEach((record:any) => {
      const category = record.data.category || 'Uncategorized';
      groupedByCategory[category] = (groupedByCategory[category] || 0) + (Number(record.data.amount) || 0);
    });

    setCategoryData(Object.entries(groupedByCategory).map(([name, value]) => ({
      name,
      value
    })));
  };

  if (!canAccess) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="h-6 w-6 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <span className="text-sm text-gray-500 capitalize">
                {module} / {entity}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>

              <button
                onClick={refreshRecords}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              PKR {stats?.total.toLocaleString() || 0}
            </h3>
            <p className="text-sm text-gray-500">Total {module === 're' ? 'Revenue' : 'Expense'}</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.count || 0}</h3>
            <p className="text-sm text-gray-500">Total Transactions</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              PKR {stats?.average.toLocaleString() || 0}
            </h3>
            <p className="text-sm text-gray-500">Average Amount</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats?.count ? Math.round(stats.count / (dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : dateRange === 'quarter' ? 90 : 365)) : 0}
            </h3>
            <p className="text-sm text-gray-500">Per Day Average</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-4">By Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-medium text-gray-900">Recent Records</h3>
          </div>
          <div className="divide-y">
            {records.slice(0, 5).map((record:any) => (
              <div key={record._id} className="px-6 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {record.data.category || 'Uncategorized'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      PKR {(Number(record.data.amount) || 0).toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.status === 'approved' ? 'bg-green-100 text-green-800' :
                      record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      record.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}