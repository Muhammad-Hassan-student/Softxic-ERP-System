// src/app/financial-tracker/hooks/useAdminRecords.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  DataRecord, 
  PaginatedResponse, 
  ImportResult, 
  StatsResponse,
  ExportFormat 
} from '../types';

export const useAdminRecords = (module: 're' | 'expense', entity: string) => {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ✅ GET TOKEN FROM COOKIE
  const getToken = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  // ✅ GET AUTH HEADER
  const getAuthHeader = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  // ✅ FETCH RECORDS WITH PAGINATION
  const fetchRecords = useCallback(async (page: number = 1, limit: number = 50, filters?: any): Promise<PaginatedResponse> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        module,
        entity,
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }

      const response = await fetch(`/financial-tracker/api/financial-tracker/records?${params}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to fetch records');

      const data: PaginatedResponse = await response.json();
      
      setRecords(prev => page === 1 ? data.records : [...prev, ...data.records]);
      setTotalCount(data.total);
      setCurrentPage(data.page);
      setHasMore(data.page < data.totalPages);
      
      return data;
    } catch (error) {
      toast.error('Failed to load records');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [module, entity]);

  // ✅ CREATE RECORD
  const createRecord = useCallback(async (data: Record<string, any>): Promise<string> => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/records', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          module,
          entity,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create record');
      }

      const result = await response.json();
      toast.success('Record created successfully');
      
      // Refresh list
      await fetchRecords(1, pageSize);
      
      return result.record._id;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [module, entity, fetchRecords, pageSize]);

  // ✅ UPDATE RECORD
  const updateRecord = useCallback(async (
    recordId: string,
    data: Record<string, any>,
    version: number
  ): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/${recordId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          data,
          version,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409) {
          toast.error('This record was modified by another user. Please refresh.');
          throw new Error('Version conflict');
        }
        throw new Error(error.error || 'Failed to update record');
      }

      // Update local state
      setRecords(prev => prev.map(r => 
        r._id === recordId ? { ...r, data, version: version + 1 } : r
      ));
      
      toast.success('Record updated successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // ✅ DELETE RECORD
  const deleteRecord = useCallback(async (recordId: string): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/${recordId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete record');
      }

      // Update local state
      setRecords(prev => prev.filter(r => r._id !== recordId));
      setTotalCount(prev => prev - 1);
      
      toast.success('Record deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // ✅ BULK UPDATE
  const bulkUpdate = useCallback(async (
    recordIds: string[],
    data: Partial<Record<string, any>>
  ): Promise<void> => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/records/bulk', {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({
          recordIds,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to bulk update');
      }

      // Update local state
      setRecords(prev => prev.map(r => 
        recordIds.includes(r._id) ? { ...r, data: { ...r.data, ...data } } : r
      ));
      
      toast.success(`Updated ${recordIds.length} records`);
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // ✅ BULK DELETE
  const bulkDelete = useCallback(async (recordIds: string[]): Promise<void> => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/records/bulk', {
        method: 'DELETE',
        headers: getAuthHeader(),
        body: JSON.stringify({ recordIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to bulk delete');
      }

      // Update local state
      setRecords(prev => prev.filter(r => !recordIds.includes(r._id)));
      setTotalCount(prev => prev - recordIds.length);
      
      toast.success(`Deleted ${recordIds.length} records`);
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // ✅ CLONE RECORD
  const cloneRecord = useCallback(async (recordId: string): Promise<string> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/${recordId}/clone`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clone record');
      }

      const result = await response.json();
      toast.success('Record cloned successfully');
      
      // Refresh list
      await fetchRecords(1, pageSize);
      
      return result.record._id;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [fetchRecords, pageSize]);

  // ✅ EXPORT RECORDS
  const exportRecords = useCallback(async (format: ExportFormat): Promise<Blob> => {
    try {
      const params = new URLSearchParams({
        module,
        entity,
        format,
      });

      const response = await fetch(`/financial-tracker/api/financial-tracker/records/export?${params}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Export failed');

      return await response.blob();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [module, entity]);

  // ✅ IMPORT RECORDS
  const importRecords = useCallback(async (file: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', module);
      formData.append('entity', entity);

      const response = await fetch('/financial-tracker/api/financial-tracker/records/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result: ImportResult = await response.json();
      
      if (result.success > 0) {
        toast.success(`Imported ${result.success} records, ${result.failed} failed`);
        await fetchRecords(1, pageSize);
      }
      
      return result;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [module, entity, fetchRecords, pageSize]);

  // ✅ LOAD MORE
  const loadMore = useCallback(async (): Promise<DataRecord[]> => {
    if (!hasMore || isLoading) return [];
    
    const nextPage = currentPage + 1;
    const data = await fetchRecords(nextPage, pageSize);
    return data.records;
  }, [currentPage, pageSize, hasMore, isLoading, fetchRecords]);

  // ✅ REFRESH
  const refreshRecords = useCallback(async (): Promise<void> => {
    await fetchRecords(1, pageSize);
  }, [fetchRecords, pageSize]);

  // ✅ SEARCH
  const searchRecords = useCallback(async (term: string): Promise<DataRecord[]> => {
    try {
      const params = new URLSearchParams({
        module,
        entity,
        search: term,
        page: '1',
        limit: '50',
      });

      const response = await fetch(`/financial-tracker/api/financial-tracker/records/search?${params}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Search failed');

      const data: PaginatedResponse = await response.json();
      return data.records;
    } catch (error: any) {
      toast.error('Search failed');
      return [];
    }
  }, [module, entity]);

  // ✅ GET STATS
  const getStats = useCallback(async (): Promise<StatsResponse> => {
    try {
      const params = new URLSearchParams({ module, entity });
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/stats?${params}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      return await response.json();
    } catch (error: any) {
      console.error('Stats error:', error);
      return {
        totalRecords: 0,
        todayRecords: 0,
        weekRecords: 0,
        monthRecords: 0,
        pendingApprovals: 0,
        deletedRecords: 0,
        archivedRecords: 0,
        starredRecords: 0,
        totalComments: 0,
        totalAttachments: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }, [module, entity]);

  // ✅ TOGGLE STAR
  const toggleStar = useCallback(async (recordId: string): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/${recordId}/star`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to toggle star');

      setRecords(prev => prev.map(r => 
        r._id === recordId ? { ...r, starred: !r.starred } : r
      ));
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  // ✅ TOGGLE ARCHIVE
  const toggleArchive = useCallback(async (recordId: string): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/${recordId}/archive`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to toggle archive');

      setRecords(prev => prev.map(r => 
        r._id === recordId ? { ...r, archived: !r.archived } : r
      ));
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  // ✅ RESTORE DELETED
  const restoreRecord = useCallback(async (recordId: string): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/${recordId}/restore`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to restore record');

      setRecords(prev => prev.map(r => 
        r._id === recordId ? { ...r, deletedAt: undefined, deletedBy: undefined } : r
      ));
      
      toast.success('Record restored');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  return {
    records,
    totalCount,
    isLoading,
    hasMore,
    currentPage,
    pageSize,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    bulkUpdate,
    bulkDelete,
    cloneRecord,
    exportRecords,
    importRecords,
    loadMore,
    refreshRecords,
    searchRecords,
    getStats,
    toggleStar,
    toggleArchive,
    restoreRecord,
  };
};