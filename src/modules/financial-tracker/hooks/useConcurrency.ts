'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

// ==================== TYPE DEFINITIONS ====================

export interface ConflictData {
  recordId: string;
  latestRecord: Record<string, unknown>;
  message: string;
}

interface UseConcurrencyReturn {
  handleVersionConflict: (data: ConflictData) => void;
  resolveConflict: (
    recordId: string,
    resolution: 'client' | 'server' | 'manual',
    clientData?: Record<string, unknown>
  ) => Promise<Record<string, unknown> | undefined>;
  activeConflicts: Map<string, ConflictData>;
  clearConflict: (recordId: string) => void;
}

// ==================== HOOK IMPLEMENTATION ====================

/**
 * Hook for handling optimistic locking conflicts
 */
export function useConcurrency(
  _module?: string,
  _entity?: string
): UseConcurrencyReturn {
  // State for tracking active conflicts
  const [activeConflicts, setActiveConflicts] = useState<Map<string, ConflictData>>(new Map());

  /**
   * Handle a version conflict from WebSocket
   */
  const handleVersionConflict = useCallback((data: ConflictData): void => {
    // Update state with new conflict
    setActiveConflicts((prev: Map<string, ConflictData>): Map<string, ConflictData> => {
      const updated = new Map<string, ConflictData>(prev);
      updated.set(data.recordId, data);
      return updated;
    });

    // Show simple toast notification (no JSX in .ts file)
    toast.error(
      `⚠️ Version Conflict: ${data.message}\n\nRecord ID: ${data.recordId}`,
      {
        duration: Infinity,
        position: 'top-center',
        id: `conflict-${data.recordId}`,
        icon: '⚠️'
      }
    );
  }, [setActiveConflicts]);

  /**
   * Resolve a conflict with a specific strategy
   */
  const resolveConflict = useCallback(async (
    recordId: string,
    resolution: 'client' | 'server' | 'manual',
    clientData?: Record<string, unknown>
  ): Promise<Record<string, unknown> | undefined> => {
    // Get the conflict data
    const conflict = activeConflicts.get(recordId);
    if (!conflict) {
      console.warn('No active conflict found for record:', recordId);
      return undefined;
    }

    try {
      // Get auth token safely
      const cookies = document.cookie;
      const tokenMatch = cookies.match(/token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';

      // Send resolution to server
      const response = await fetch(`/api/financial-tracker/records/${recordId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resolution,
          clientData,
          serverVersion: conflict.latestRecord.version
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to resolve conflict');
      }

      const result = (await response.json()) as { record: Record<string, unknown> };
      
      // Remove conflict from state
      setActiveConflicts((prev: Map<string, ConflictData>): Map<string, ConflictData> => {
        const updated = new Map<string, ConflictData>(prev);
        updated.delete(recordId);
        return updated;
      });

      // Dismiss the conflict toast
      toast.dismiss(`conflict-${recordId}`);
      
      // Show success message
      toast.success('Conflict resolved successfully');

      // Return the updated record if needed
      return result.record;
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resolve conflict';
      toast.error(errorMessage);
      return undefined;
    }
  }, [activeConflicts, setActiveConflicts]);

  /**
   * Clear a conflict manually without resolving
   */
  const clearConflict = useCallback((recordId: string): void => {
    // Remove from state
    setActiveConflicts((prev: Map<string, ConflictData>): Map<string, ConflictData> => {
      const updated = new Map<string, ConflictData>(prev);
      updated.delete(recordId);
      return updated;
    });

    // Dismiss the toast
    toast.dismiss(`conflict-${recordId}`);
  }, [setActiveConflicts]);

  return {
    handleVersionConflict,
    resolveConflict,
    activeConflicts,
    clearConflict
  };
}