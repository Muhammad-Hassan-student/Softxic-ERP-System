// src/app/financial-tracker/hooks/useAdminPermissions.ts
import { useState, useCallback, useEffect } from 'react';
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

  // ✅ FETCH CURRENT USER PERMISSIONS
  const fetchPermissions = useCallback(async (): Promise<Permissions | null> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ module, entity });
      const response = await fetch(`/financial-tracker/api/financial-tracker/permissions?${params}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token invalid - redirect to login
          window.location.href = '/';
          return null;
        }
        throw new Error('Failed to fetch permissions');
      }

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

  // ✅ FETCH SPECIFIC USER PERMISSIONS (Admin only)
  const fetchUserPermissions = useCallback(async (userId: string): Promise<any> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/permissions/${userId}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to fetch user permissions');

      const data = await response.json();
      return data.permissions;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  }, []);

  // ✅ UPDATE SPECIFIC USER PERMISSIONS (Admin only)
  const updateUserPermissions = useCallback(async (
    userId: string, 
    newPermissions: Permissions
  ): Promise<void> => {
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
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, []);

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

  // Fetch permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    isLoading,
    fetchPermissions,
    fetchUserPermissions,
    updateUserPermissions,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canEditColumn,
    canViewColumn,
  };
};