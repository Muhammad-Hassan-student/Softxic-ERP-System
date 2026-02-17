'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export interface PermissionScope {
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  scope: 'own' | 'all' | 'department'; // Added 'department' to fix type error
  columns?: Record<string, { view: boolean; edit: boolean }>;
}

interface UsePermissionsReturn {
  // Permission checks
  canAccess: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  scope: 'own' | 'all' | 'department'; // Added 'department'
  
  // Column-level permissions
  canViewColumn: (columnKey: string) => boolean;
  canEditColumn: (columnKey: string) => boolean;
  
  // Record-level checks
  canEditRecord: (createdBy: string) => boolean;
  canDeleteRecord: (createdBy: string) => boolean;
  
  // State
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
  
  // Column metadata
  visibleColumns: string[];
  editableColumns: string[];
}

/**
 * Hook for managing entity-level permissions
 * @param module - 're' | 'expense'
 * @param entity - 'dealer' | 'fhh-client' | 'cp-client'
 */
export function usePermissions(
  module: string,
  entity: string
): UsePermissionsReturn {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionScope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch permissions from API
  const fetchPermissions = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Admin bypass - full permissions
    if (user.role === 'admin') {
      setPermissions({
        access: true,
        create: true,
        edit: true,
        delete: true,
        scope: 'all',
        columns: {} // Admin sees all columns
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/financial-tracker/permissions?module=${module}&entity=${entity}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permission check failed');
      console.error('Permission fetch error:', err);
      
      // Set default denied permissions on error
      setPermissions({
        access: false,
        create: false,
        edit: false,
        delete: false,
        scope: 'own'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, module, entity]);

  // Load permissions on mount and when dependencies change
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Permission checks
  const canAccess = permissions?.access ?? false;
  const canCreate = permissions?.create ?? false;
  const canEdit = permissions?.edit ?? false;
  const canDelete = permissions?.delete ?? false;
  const scope = permissions?.scope ?? 'own';

  // Column-level permission checks
  const canViewColumn = useCallback((columnKey: string): boolean => {
    if (!permissions) return false;
    if (user?.role === 'admin') return true;
    
    // Check if column has specific view permission
    const columnPerms = permissions.columns?.[columnKey];
    if (columnPerms !== undefined) {
      return columnPerms.view;
    }
    
    // Default to true if column not specified
    return true;
  }, [permissions, user?.role]);

  const canEditColumn = useCallback((columnKey: string): boolean => {
    if (!permissions) return false;
    if (!canEdit) return false; // Can't edit any column if no edit permission
    if (user?.role === 'admin') return true;
    
    // Check if column has specific edit permission
    const columnPerms = permissions.columns?.[columnKey];
    if (columnPerms !== undefined) {
      return columnPerms.edit;
    }
    
    // Default to false for unspecified columns (conservative)
    return false;
  }, [permissions, canEdit, user?.role]);

  // Record-level permission checks
  const canEditRecord = useCallback((createdBy: string): boolean => {
    if (!canEdit) return false;
    if (user?.role === 'admin') return true;
    if (scope === 'all') return true;
    if (scope === 'own') return createdBy === user?.id;
    if (scope === 'department') {
      // For department scope, we need to check if user is in same department
      // This would require additional logic with department info
      // For now, return true and let backend handle it
      return true;
    }
    return false;
  }, [canEdit, scope, user?.id, user?.role]);

  const canDeleteRecord = useCallback((createdBy: string): boolean => {
    if (!canDelete) return false;
    if (user?.role === 'admin') return true;
    if (scope === 'all') return true;
    if (scope === 'own') return createdBy === user?.id;
    if (scope === 'department') {
      // For department scope, we need to check if user is in same department
      // This would require additional logic with department info
      // For now, return true and let backend handle it
      return true;
    }
    return false;
  }, [canDelete, scope, user?.id, user?.role]);

  // Get visible columns (for filtering)
  const visibleColumns = useMemo(() => {
    if (!permissions || user?.role === 'admin') return [];
    
    return Object.entries(permissions.columns || {})
      .filter(([_, perms]) => perms.view)
      .map(([key]) => key);
  }, [permissions, user?.role]);

  // Get editable columns
  const editableColumns = useMemo(() => {
    if (!permissions || !canEdit) return [];
    if (user?.role === 'admin') return [];
    
    return Object.entries(permissions.columns || {})
      .filter(([_, perms]) => perms.edit)
      .map(([key]) => key);
  }, [permissions, canEdit, user?.role]);

  return {
    // Permission checks
    canAccess,
    canCreate,
    canEdit,
    canDelete,
    scope,
    
    // Column-level permissions
    canViewColumn,
    canEditColumn,
    
    // Record-level checks
    canEditRecord,
    canDeleteRecord,
    
    // State
    isLoading,
    error,
    refreshPermissions: fetchPermissions,
    
    // Column metadata
    visibleColumns,
    editableColumns
  };
}