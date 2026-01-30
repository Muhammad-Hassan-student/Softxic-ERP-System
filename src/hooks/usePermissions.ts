import { useState, useEffect } from 'react';

interface UserPermissions {
  [module: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export?: boolean;
    approve?: boolean;
  };
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPermissions(data.data.permissions);
          setRole(data.data.role);
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (module: string, action: keyof UserPermissions[string]): boolean => {
    if (role === 'admin') return true; // Admin has all permissions
    return permissions[module]?.[action] || false;
  };

  const canView = (module: string) => hasPermission(module, 'view');
  const canCreate = (module: string) => hasPermission(module, 'create');
  const canEdit = (module: string) => hasPermission(module, 'edit');
  const canDelete = (module: string) => hasPermission(module, 'delete');
  const canExport = (module: string) => hasPermission(module, 'export') || false;
  const canApprove = (module: string) => hasPermission(module, 'approve') || false;

  return {
    permissions,
    role,
    loading,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canApprove,
    refresh: fetchPermissions,
  };
}