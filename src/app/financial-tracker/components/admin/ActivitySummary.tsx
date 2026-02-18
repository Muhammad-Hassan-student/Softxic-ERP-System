'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2
} from 'lucide-react';
import { ChartComponent } from '../shared/ChartComponents';
import { format, subDays } from 'date-fns';

interface ActivitySummaryProps {
  days?: number;
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  days = 30
}) => {
  const [summary, setSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    creates: 0,
    updates: 0,
    deletes: 0,
    approves: 0,
    rejects: 0
  });

  useEffect(() => {
    fetchSummary();
  }, [days]);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/financial-tracker/audit-logs/summary?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch summary');

      const data = await response.json();
      setSummary(data.summary);

      // Calculate totals
      const totals = data.summary.reduce((acc: any, item: any) => {
        acc.total += item.total;
        if (item.action === 'CREATE') acc.creates += item.total;
        if (item.action === 'UPDATE') acc.updates += item.total;
        if (item.action === 'DELETE') acc.deletes += item.total;
        if (item.action === 'APPROVE') acc.approves += item.total;
        if (item.action === 'REJECT') acc.rejects += item.total;
        return acc;
      }, { total: 0, creates: 0, updates: 0, deletes: 0, approves: 0, rejects: 0 });

      setStats(totals);
    } catch (error) {
      console.error('Failed to load activity summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const chartData = summary.map(item => ({
    name: item.action,
    value: item.total,
    module: item.module
  }));

  // Group by date for timeline
  const timelineData = summary.flatMap((item: any) =>
    item.daily.map((d: any) => ({
      date: d.date,
      [item.action]: d.count,
      module: item.module
    }))
  ).reduce((acc: any, curr: any) => {
    const existing = acc.find((a: any) => a.date === curr.date);
    if (existing) {
      existing[curr.action] = (existing[curr.action] || 0) + curr[curr.action];
    } else {
      acc.push(curr);
    }
    return acc;
  }, []).sort((a: any, b: any) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Activities</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.creates}</p>
          <p className="text-sm text-gray-500">Creates</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit3 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.updates}</p>
          <p className="text-sm text-gray-500">Updates</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.deletes}</p>
          <p className="text-sm text-gray-500">Deletes</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.approves}</p>
          <p className="text-sm text-gray-500">Approves</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.rejects}</p>
          <p className="text-sm text-gray-500">Rejects</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-medium text-gray-900 mb-4">Activity Timeline</h3>
        <div className="h-64">
          <ChartComponent
            data={timelineData}
            type="line"
            height={250}
            dataKey="CREATE"
            xAxisKey="date"
          />
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-medium text-gray-900 mb-4">By Action</h3>
          <div className="h-64">
            <ChartComponent
              data={chartData}
              type="pie"
              height={250}
              dataKey="value"
              xAxisKey="name"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-medium text-gray-900 mb-4">By Module</h3>
          <div className="space-y-3">
            {['re', 'expense', 'admin'].map(module => {
              const moduleTotal = summary
                .filter(item => item.module === module)
                .reduce((sum, item) => sum + item.total, 0);
              
              const percentage = stats.total ? (moduleTotal / stats.total * 100).toFixed(1) : 0;

              return (
                <div key={module}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{module}</span>
                    <span className="font-medium">{moduleTotal} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};