'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export interface ApprovalRequest {
  _id: string;
  recordId: string;
  record: any;
  submittedBy: {
    _id: string;
    fullName: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

interface UseApprovalReturn {
  pendingApprovals: ApprovalRequest[];
  isLoading: boolean;
  error: string | null;
  fetchPendingApprovals: () => Promise<void>;
  approve: (requestId: string, comment?: string) => Promise<void>;
  reject: (requestId: string, comment: string) => Promise<void>;
  getApprovalHistory: (recordId: string) => Promise<any[]>;
}

/**
 * Hook for approval workflow management
 * @param module - 're' | 'expense'
 * @param entity - Entity name
 */
export function useApproval(
  module: string,
  entity: string
): UseApprovalReturn {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending approvals
  const fetchPendingApprovals = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/financial-tracker/approvals/pending?module=${module}&entity=${entity}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }

      const data = await response.json();
      setPendingApprovals(data.approvals);

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load pending approvals');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, module, entity]);

  // Approve request
  const approve = useCallback(async (requestId: string, comment?: string) => {
    try {
      const response = await fetch(`/api/financial-tracker/approvals/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        throw new Error('Failed to approve');
      }

      // Remove from pending list
      setPendingApprovals(prev => prev.filter(a => a._id !== requestId));
      
      toast.success('Request approved successfully');
      
      // Refresh pending list
      await fetchPendingApprovals();

    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchPendingApprovals]);

  // Reject request
  const reject = useCallback(async (requestId: string, comment: string) => {
    if (!comment.trim()) {
      toast.error('Rejection comment is required');
      throw new Error('Comment required');
    }

    try {
      const response = await fetch(`/api/financial-tracker/approvals/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        throw new Error('Failed to reject');
      }

      // Remove from pending list
      setPendingApprovals(prev => prev.filter(a => a._id !== requestId));
      
      toast.success('Request rejected');
      
      // Refresh pending list
      await fetchPendingApprovals();

    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchPendingApprovals]);

  // Get approval history
  const getApprovalHistory = useCallback(async (recordId: string) => {
    try {
      const response = await fetch(
        `/api/financial-tracker/approvals/history?recordId=${recordId}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch approval history');
      }

      const data = await response.json();
      return data.history;

    } catch (err: any) {
      toast.error(err.message);
      return [];
    }
  }, []);

  return {
    pendingApprovals,
    isLoading,
    error,
    fetchPendingApprovals,
    approve,
    reject,
    getApprovalHistory
  };
}