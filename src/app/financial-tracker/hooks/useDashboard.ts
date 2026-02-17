'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export interface DashboardStats {
  today: {
    re: number;
    expense: number;
    count: number;
  };
  week: {
    re: number;
    expense: number;
    count: number;
  };
  month: {
    re: number;
    expense: number;
    count: number;
  };
  totals: {
    re: number;
    expense: number;
    count: number;
  };
  activeUsers: number;
  pendingApprovals: number;
}

export interface CalendarData {
  date: string;
  re: number;
  expense: number;
  count: number;
  net: number;
}

export interface DateRange {
  start: Date;
  end: Date;
  label: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  calendarData: CalendarData[];
  isLoading: boolean;
  error: string | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange | DateRange['label']) => void; // Fixed: Accept both types
  refreshDashboard: () => Promise<void>;
  exportDashboard: (format: 'excel' | 'csv' | 'pdf') => Promise<void>;
}

/**
 * Hook for dashboard data with date filtering
 * @param module - Optional module filter
 * @param entity - Optional entity filter
 * @param branchId - Optional branch filter
 */
export function useDashboard(
  module?: string,
  entity?: string,
  branchId?: string
): UseDashboardReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRangeState] = useState<DateRange>(() => {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return { start, end, label: 'today' };
  });

  // Build query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    if (module) params.append('module', module);
    if (entity) params.append('entity', entity);
    if (branchId) params.append('branchId', branchId);
    
    params.append('startDate', dateRange.start.toISOString());
    params.append('endDate', dateRange.end.toISOString());
    
    return params.toString();
  }, [module, entity, branchId, dateRange]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const queryString = buildQueryString();
      
      // Fetch stats
      const statsResponse = await fetch(
        `/api/financial-tracker/dashboard/stats?${queryString}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch calendar data
      const calendarResponse = await fetch(
        `/api/financial-tracker/dashboard/calendar?${queryString}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!calendarResponse.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const calendarData = await calendarResponse.json();
      setCalendarData(calendarData);

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, buildQueryString]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh dashboard
  const refreshDashboard = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Export dashboard data
  const exportDashboard = useCallback(async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const queryString = buildQueryString();
      
      const response = await fetch(
        `/api/financial-tracker/dashboard/export?format=${format}&${queryString}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export dashboard');
      }

      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `dashboard-export.${format}`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Dashboard exported successfully');

    } catch (err: any) {
      toast.error(err.message);
    }
  }, [buildQueryString]);

  // Set date range - handles both preset labels and full DateRange objects
  const setDateRange = useCallback((range: DateRange | DateRange['label']) => {
    if (typeof range === 'string') {
      // Handle preset label
      const now = new Date();
      let start: Date;
      let end: Date;

      switch (range) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          start = new Date(yesterday.setHours(0, 0, 0, 0));
          end = new Date(yesterday.setHours(23, 59, 59, 999));
          break;
        case 'week':
          start = new Date(now.setDate(now.getDate() - now.getDay()));
          start.setHours(0, 0, 0, 0);
          end = new Date();
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          start.setHours(0, 0, 0, 0);
          end = new Date();
          end.setHours(23, 59, 59, 999);
          break;
        default:
          return;
      }
      setDateRangeState({ start, end, label: range });
    } else {
      // Handle full DateRange object
      setDateRangeState(range);
    }
  }, []);

  return {
    stats,
    calendarData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    refreshDashboard,
    exportDashboard
  };
}