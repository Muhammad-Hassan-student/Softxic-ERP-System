'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from './useSocket';
import { usePermissions } from './usePermission'; // Fixed import
import { useConcurrency } from './useConcurrency';
import { toast } from 'react-hot-toast';

export interface IRecord { // Renamed from Record to IRecord to avoid conflict with built-in Record type
  _id: string;
  data: Record<string, any>;
  version: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface UseRecordsReturn {
  records: IRecord[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  createRecord: (data: Record<string, any>) => Promise<string>;
  updateRecord: (recordId: string, data: Record<string, any>, version: number) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  submitForApproval: (recordId: string) => Promise<void>;
  approveRecord: (recordId: string, comment?: string) => Promise<void>;
  rejectRecord: (recordId: string, comment: string) => Promise<void>;
  refreshRecords: () => Promise<void>;
  optimisticUpdate: (recordId: string, field: string, value: any) => void;
}

/**
 * Hook for managing records with real-time sync
 * @param module - 're' | 'expense'
 * @param entity - Entity name
 * @param pageSize - Number of records per page
 */
export function useRecords(
  module: string,
  entity: string,
  pageSize: number = 50
): UseRecordsReturn {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(module, entity);
  const { canCreate, canEdit, canDelete, canEditRecord, canDeleteRecord } = 
    usePermissions(module, entity);
  const { handleVersionConflict } = useConcurrency(module, entity);
  
  const [records, setRecords] = useState<IRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const pendingUpdates = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch records from API
  const fetchRecords = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!user?.id) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/financial-tracker/records?` + 
        `module=${module}&entity=${entity}&` +
        `page=${pageNum}&limit=${pageSize}&includeDeleted=false`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();
      
      setRecords(prev => append ? [...prev, ...data.records] : data.records);
      setTotalCount(data.total);
      setHasMore(data.records.length === pageSize);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      setError(err.message);
      toast.error('Failed to load records');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, module, entity, pageSize]);

  // Initial load
  useEffect(() => {
    fetchRecords(1, false);
    setPage(1);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRecords]);

  // Load more records (pagination)
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    await fetchRecords(nextPage, true);
    setPage(nextPage);
  }, [isLoading, hasMore, page, fetchRecords]);

  // Refresh records
  const refreshRecords = useCallback(async () => {
    await fetchRecords(1, false);
    setPage(1);
  }, [fetchRecords]);

  // Real-time socket handlers
  useEffect(() => {
    if (!socket) return;

    const handleRecordCreated = (data: any) => {
      setRecords(prev => {
        // Check if record already exists (prevent duplicates)
        if (prev.some(r => r._id === data.recordId)) {
          return prev;
        }
        return [{
          _id: data.recordId,
          data: data.data,
          version: data.version,
          status: 'draft',
          createdBy: data.createdBy,
          updatedBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          isDeleted: false
        }, ...prev];
      });
      setTotalCount(prev => prev + 1);
      
      // Optional: Show toast for new records
      if (data.createdBy !== user?.id) {
        toast.success('New record added', { id: `new-${data.recordId}` });
      }
    };

    const handleRecordUpdated = (data: any) => {
      setRecords(prev => 
        prev.map(record => 
          record._id === data.recordId
            ? {
                ...record,
                data: data.data,
                version: data.version,
                updatedAt: data.updatedAt,
                updatedBy: data.updatedBy
              }
            : record
        )
      );
    };

    const handleRecordDeleted = (data: any) => {
      setRecords(prev => prev.filter(r => r._id !== data.recordId));
      setTotalCount(prev => prev - 1);
      
      toast.success('Record deleted', { id: `delete-${data.recordId}` });
    };

    socket.on('recordCreated', handleRecordCreated);
    socket.on('recordUpdated', handleRecordUpdated);
    socket.on('recordDeleted', handleRecordDeleted);
    socket.on('versionConflict', handleVersionConflict);

    return () => {
      socket.off('recordCreated', handleRecordCreated);
      socket.off('recordUpdated', handleRecordUpdated);
      socket.off('recordDeleted', handleRecordDeleted);
      socket.off('versionConflict', handleVersionConflict);
    };
  }, [socket, user?.id, handleVersionConflict]);

  // Create record
  const createRecord = useCallback(async (data: Record<string, any>): Promise<string> => {
    if (!canCreate) {
      toast.error('You do not have permission to create records');
      throw new Error('Permission denied');
    }

    try {
      const response = await fetch('/api/financial-tracker/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({
          module,
          entity,
          data
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create record');
      }

      const result = await response.json();
      toast.success('Record created successfully');
      return result.recordId;
      
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [module, entity, canCreate]);

  // Optimistic update (for immediate UI feedback)
  const optimisticUpdate = useCallback((recordId: string, field: string, value: any) => {
    setRecords(prev =>
      prev.map(record =>
        record._id === recordId
          ? {
              ...record,
              data: { ...record.data, [field]: value }
            }
          : record
      )
    );
  }, []);

  // Update record with debouncing
  const updateRecord = useCallback(async (
    recordId: string,
    data: Record<string, any>,
    version: number
  ) => {
    const record = records.find(r => r._id === recordId);
    if (!record) return;

    // Check permission
    if (!canEditRecord(record.createdBy)) {
      toast.error('You do not have permission to edit this record');
      throw new Error('Permission denied');
    }

    // Clear any pending update for this record
    if (pendingUpdates.current.has(recordId)) {
      clearTimeout(pendingUpdates.current.get(recordId));
    }

    // Debounce the API call
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/financial-tracker/records/${recordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          },
          body: JSON.stringify({
            data,
            version
          })
        });

        if (!response.ok) {
          const error = await response.json();
          
          // Handle version conflict
          if (response.status === 409) {
            handleVersionConflict({
              recordId,
              latestRecord: error.latestRecord,
              message: error.message
            });
          } else {
            throw new Error(error.message);
          }
        }

        pendingUpdates.current.delete(recordId);
        
      } catch (err: any) {
        toast.error(err.message);
        // Revert optimistic update on error
        await refreshRecords();
      }
    }, 500); // 500ms debounce

    pendingUpdates.current.set(recordId, timeout);
  }, [records, canEditRecord, handleVersionConflict, refreshRecords]);

  // Delete record (soft delete)
  const deleteRecord = useCallback(async (recordId: string) => {
    const record = records.find(r => r._id === recordId);
    if (!record) return;

    // Check permission
    if (!canDeleteRecord(record.createdBy)) {
      toast.error('You do not have permission to delete this record');
      throw new Error('Permission denied');
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/financial-tracker/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Record deleted successfully');
      
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [records, canDeleteRecord]);

  // Submit for approval
  const submitForApproval = useCallback(async (recordId: string) => {
    try {
      const response = await fetch(`/api/financial-tracker/records/${recordId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Record submitted for approval');
      
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, []);

  // Approve record
  const approveRecord = useCallback(async (recordId: string, comment?: string) => {
    try {
      const response = await fetch(`/api/financial-tracker/records/${recordId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Record approved');
      
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, []);

  // Reject record
  const rejectRecord = useCallback(async (recordId: string, comment: string) => {
    if (!comment.trim()) {
      toast.error('Rejection comment is required');
      throw new Error('Comment required');
    }

    try {
      const response = await fetch(`/api/financial-tracker/records/${recordId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Record rejected');
      
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, []);

  return {
    records,
    totalCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    createRecord,
    updateRecord,
    deleteRecord,
    submitForApproval,
    approveRecord,
    rejectRecord,
    refreshRecords,
    optimisticUpdate
  };
}