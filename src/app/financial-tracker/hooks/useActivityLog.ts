'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  module: string;
  entity: string;
  recordId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'SUBMIT' | 'APPROVE' | 'REJECT';
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  ipAddress?: string;
  timestamp: string;
}

export interface ActivityFilters {
  userId?: string;
  module?: string;
  entity?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  recordId?: string;
}

interface UseActivityLogReturn {
  logs: ActivityLog[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filters: ActivityFilters;
  setFilters: (filters: ActivityFilters) => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refreshLogs: () => Promise<void>;
  exportLogs: () => Promise<void>;
}

/**
 * Hook for viewing and filtering activity logs
 */
export function useActivityLog(
  initialFilters: ActivityFilters = {},
  pageSize: number = 50
): UseActivityLogReturn {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Build query string
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', pageSize.toString());
    
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.module) params.append('module', filters.module);
    if (filters.entity) params.append('entity', filters.entity);
    if (filters.action) params.append('action', filters.action);
    if (filters.recordId) params.append('recordId', filters.recordId);
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate.toISOString());
    }
    
    return params.toString();
  }, [filters, page, pageSize]);

  // Fetch logs
  const fetchLogs = useCallback(async (resetPage: boolean = false) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }

      const response = await fetch(
        `/api/financial-tracker/activity-logs?${buildQueryString()}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data = await response.json();
      
      setLogs(prev => resetPage ? data.logs : [...prev, ...data.logs]);
      setTotalCount(data.total);
      setHasMore(data.logs.length === pageSize);

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, page, buildQueryString, pageSize]);

  // Initial load and filter changes
  useEffect(() => {
    fetchLogs(true);
  }, [filters]);

  // Load more
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setPage(prev => prev + 1);
    await fetchLogs(false);
  }, [isLoading, hasMore, fetchLogs]);

  // Refresh logs
  const refreshLogs = useCallback(async () => {
    await fetchLogs(true);
  }, [fetchLogs]);

  // Export logs
  const exportLogs = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/financial-tracker/activity-logs/export?${buildQueryString()}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export logs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Logs exported successfully');

    } catch (err: any) {
      toast.error(err.message);
    }
  }, [buildQueryString]);

  return {
    logs,
    totalCount,
    isLoading,
    error,
    filters,
    setFilters,
    loadMore,
    hasMore,
    refreshLogs,
    exportLogs
  };
}