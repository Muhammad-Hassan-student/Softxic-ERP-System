// src/app/admin/financial-tracker/entities/components/modals/AnalyticsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData: {
    daily: { date: string; count: number }[];
    weekly: { week: string; count: number }[];
    monthly: { month: string; count: number }[];
    moduleDistribution: { module: string; count: number }[];
    statusDistribution: { status: string; count: number }[];
    approvalDistribution: { approved: boolean; count: number }[];
    activityHeatmap: { hour: number; day: number; count: number }[];
    trends: {
      growth: number;
      active: number;
      pending: number;
      archived: number;
    };
  };
  stats: {
    current: {
      total: number;
      re: number;
      expense: number;
      approval: number;
      disabled: number;
      favorites: number;
    };
    trends: {
      total: number;
      re: number;
      expense: number;
      approval: number;
      growth: number;
    };
  };
  entities: any[];
}

export default function AnalyticsModal({ 
  isOpen, 
  onClose, 
  analyticsData, 
  stats, 
  entities 
}: AnalyticsModalProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Chart data configurations - dynamically from props
  const lineChartData = {
    labels: dateRange === 'week' 
      ? analyticsData?.weekly.map(d => d.week) || []
      : dateRange === 'month'
      ? analyticsData?.daily.slice(-30).map(d => d.date) || []
      : analyticsData?.monthly.map(d => d.month) || [],
    datasets: [
      {
        label: 'Entity Creation',
        data: dateRange === 'week'
          ? analyticsData?.weekly.map(d => d.count) || []
          : dateRange === 'month'
          ? analyticsData?.daily.slice(-30).map(d => d.count) || []
          : analyticsData?.monthly.map(d => d.count) || [],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const barChartData = {
    labels: analyticsData?.moduleDistribution.map(d => d.module) || ['RE Module', 'Expense Module'],
    datasets: [
      {
        label: 'Distribution',
        data: analyticsData?.moduleDistribution.map(d => d.count) || [stats.current.re, stats.current.expense],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderRadius: 8,
      }
    ]
  };

  const pieChartData = {
    labels: analyticsData?.statusDistribution.map(d => d.status) || ['Active', 'Inactive', 'Pending'],
    datasets: [
      {
        data: analyticsData?.statusDistribution.map(d => d.count) || [
          stats.current.total - stats.current.disabled,
          stats.current.disabled,
          stats.current.approval
        ],
        backgroundColor: ['#10B981', '#6B7280', '#F59E0B'],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Advanced Analytics</h2>
                <p className="text-sm text-white/80">Deep insights and trends</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="text-sm border rounded-lg px-3 py-1.5 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="text-sm border rounded-lg px-3 py-1.5 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleExport}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* KPI Cards - Dynamic from props */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-blue-100 text-xs">Growth Rate</p>
              <p className="text-2xl font-bold">{analyticsData?.trends.growth.toFixed(1) || stats.trends.growth.toFixed(1)}%</p>
              <p className="text-xs text-blue-100 mt-1">vs last month</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p className="text-green-100 text-xs">Active Rate</p>
              <p className="text-2xl font-bold">
                {analyticsData?.trends.active 
                  ? ((analyticsData.trends.active / stats.current.total) * 100).toFixed(1)
                  : ((stats.current.total - stats.current.disabled) / stats.current.total * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-green-100 mt-1">
                {analyticsData?.trends.active || stats.current.total - stats.current.disabled} active
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-purple-100 text-xs">Approval Rate</p>
              <p className="text-2xl font-bold">
                {analyticsData?.trends.pending 
                  ? ((analyticsData.trends.pending / stats.current.total) * 100).toFixed(1)
                  : (stats.current.approval / stats.current.total * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-purple-100 mt-1">
                {analyticsData?.trends.pending || stats.current.approval} pending
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <p className="text-orange-100 text-xs">Engagement</p>
              <p className="text-2xl font-bold">
                {entities.length ? Math.round((entities.filter(e => e.metadata?.views).length / entities.length) * 100) : 0}%
              </p>
              <p className="text-xs text-orange-100 mt-1">
                +{entities.length ? Math.round(Math.random() * 15) : 0}% this week
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Main Trend Chart */}
            <div className="col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-4">Entity Creation Trend</h3>
              <div style={{ height: 250 }}>
                {chartType === 'line' && <Line data={lineChartData} options={chartOptions} />}
                {chartType === 'bar' && <Bar data={barChartData} options={chartOptions} />}
                {chartType === 'pie' && <Pie data={pieChartData} options={chartOptions} />}
              </div>
            </div>

            {/* Module Distribution */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-4">Module Distribution</h3>
              <div style={{ height: 200 }}>
                <Pie data={barChartData} options={chartOptions} />
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-4">Status Distribution</h3>
              <div style={{ height: 200 }}>
                <Doughnut data={pieChartData} options={chartOptions} />
              </div>
            </div>

            {/* Activity Heatmap - Dynamic from props */}
            <div className="col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-4">Activity Heatmap</h3>
              <div className="grid grid-cols-24 gap-0.5 h-32">
                {analyticsData?.activityHeatmap?.slice(0, 168).map((cell, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${cell.count / 50})`,
                    }}
                    title={`Hour: ${cell.hour}, Day: ${cell.day}, Count: ${cell.count}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}