// src/app/financial-tracker/hooks/useAdminPermissions.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Permission {
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  scope: 'own' | 'all' | 'department';
  columns?: Record<string, { view: boolean; edit: boolean }>;
}

interface Permissions {
  re: Record<string, Permission>;
  expense: Record<string, Permission>;
}

export const useAdminPermissions = (module: 're' | 'expense', entity: string) => {
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  // ✅ FETCH PERMISSIONS
  const fetchPermissions = useCallback(async (): Promise<Permissions | null> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ module, entity });
      const response = await fetch(`/financial-tracker/api/financial-tracker/permissions?${params}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to fetch permissions');

      const data = await response.json();
      setPermissions(data.permissions);
      return data.permissions;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [module, entity]);

  // ✅ UPDATE PERMISSIONS
  const updatePermissions = useCallback(async (userId: string, newPermissions: Permissions): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/permissions/${userId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ permissions: newPermissions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update permissions');
      }

      toast.success('Permissions updated successfully');
      await fetchPermissions();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [fetchPermissions]);

  // ✅ REFRESH PERMISSIONS
  const refreshPermissions = useCallback(async (): Promise<void> => {
    await fetchPermissions();
  }, [fetchPermissions]);

  // ✅ CHECK PERMISSIONS
  const canCreate = permissions?.[module]?.[entity]?.create || false;
  const canEdit = permissions?.[module]?.[entity]?.edit || false;
  const canDelete = permissions?.[module]?.[entity]?.delete || false;
  const canView = permissions?.[module]?.[entity]?.access || false;

  const canEditColumn = useCallback((column: string): boolean => {
    if (!permissions) return false;
    const entityPerms = permissions[module]?.[entity];
    if (!entityPerms) return false;
    return entityPerms.edit && (entityPerms.columns?.[column]?.edit ?? false);
  }, [permissions, module, entity]);

  const canViewColumn = useCallback((column: string): boolean => {
    if (!permissions) return false;
    const entityPerms = permissions[module]?.[entity];
    if (!entityPerms) return false;
    return entityPerms.access && (entityPerms.columns?.[column]?.view ?? true);
  }, [permissions, module, entity]);

  return {
    permissions,
    isLoading,
    fetchPermissions,
    updatePermissions,
    refreshPermissions,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canEditColumn,
    canViewColumn,
  };
};