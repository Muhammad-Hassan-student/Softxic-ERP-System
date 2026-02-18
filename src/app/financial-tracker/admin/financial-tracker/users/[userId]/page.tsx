'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft,
  Shield,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
}

interface Permission {
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  scope: 'own' | 'all' | 'department';
  columns: Record<string, { view: boolean; edit: boolean }>;
}

interface Permissions {
  re: Record<string, Permission>;
  expense: Record<string, Permission>;
}

// Available entities per module
const MODULE_ENTITIES = {
  re: ['dealer', 'fhh-client', 'cp-client', 'builder', 'project'],
  expense: ['dealer', 'fhh-client', 'cp-client', 'office', 'project', 'all']
};

// Available fields per entity (would be fetched from API)
const ENTITY_FIELDS: Record<string, string[]> = {
  dealer: ['name', 'contact', 'commission', 'sales', 'target', 'achieved'],
  'fhh-client': ['name', 'project', 'amount', 'installment', 'dueDate', 'status'],
  'cp-client': ['name', 'property', 'downPayment', 'monthlyPayment', 'balance'],
  builder: ['name', 'project', 'commission', 'agreement', 'status'],
  project: ['name', 'location', 'budget', 'revenue', 'expense', 'profit'],
  office: ['name', 'rent', 'utilities', 'maintenance', 'expenses'],
  all: ['name', 'amount', 'date', 'description', 'category']
};

export default function UserPermissionsPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({
    re: {},
    expense: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeModule, setActiveModule] = useState<'re' | 'expense'>('re');
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  // Fetch user and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user details
        const userResponse = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${params.userId}`, {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        });
        
        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch permissions
        const permResponse = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${params.userId}/permissions`, {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        });
        
        if (permResponse.ok) {
          const permData = await permResponse.json();
          setPermissions(permData.permissions || { re: {}, expense: {} });
        }
      } catch (error) {
        toast.error('Failed to load user data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.userId]);

  // Toggle entity expansion
  const toggleEntity = (entity: string) => {
    setExpandedEntities(prev => {
      const next = new Set(prev);
      if (next.has(entity)) {
        next.delete(entity);
      } else {
        next.add(entity);
      }
      return next;
    });
  };

  // Update permission - FIXED: Removed duplicate defaults
  const updatePermission = (
    module: 're' | 'expense',
    entity: string,
    field: keyof Permission,
    value: any
  ) => {
    setPermissions(prev => {
      // Get current entity permissions or create default
      const currentEntity = prev[module]?.[entity] || {
        access: false,
        create: false,
        edit: false,
        delete: false,
        scope: 'own' as const,
        columns: {}
      };

      return {
        ...prev,
        [module]: {
          ...prev[module],
          [entity]: {
            ...currentEntity,
            [field]: value
          }
        }
      };
    });
  };

  // Update column permission - FIXED: Removed duplicate defaults
  const updateColumnPermission = (
    module: 're' | 'expense',
    entity: string,
    column: string,
    type: 'view' | 'edit',
    value: boolean
  ) => {
    setPermissions(prev => {
      // Get current entity permissions or create default
      const currentEntity = prev[module]?.[entity] || {
        access: false,
        create: false,
        edit: false,
        delete: false,
        scope: 'own' as const,
        columns: {}
      };

      // Get current column permissions or create default
      const currentColumn = currentEntity.columns[column] || {
        view: true,
        edit: false
      };

      return {
        ...prev,
        [module]: {
          ...prev[module],
          [entity]: {
            ...currentEntity,
            columns: {
              ...currentEntity.columns,
              [column]: {
                ...currentColumn,
                [type]: value
              }
            }
          }
        }
      };
    });
  };

  // Toggle all columns
  const toggleAllColumns = (
    module: 're' | 'expense',
    entity: string,
    type: 'view' | 'edit',
    value: boolean
  ) => {
    const fields = ENTITY_FIELDS[entity] || [];
    fields.forEach(field => {
      updateColumnPermission(module, entity, field, type, value);
    });
  };

  // Save permissions
  const savePermissions = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${params.userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ permissions })
      });

      if (!response.ok) throw new Error('Failed to save permissions');
      
      toast.success('Permissions saved successfully');
    } catch (error) {
      toast.error('Failed to save permissions');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy permissions from role
  const copyFromRole = async () => {
    toast.success('Role copy feature coming soon');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading user permissions...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        User not found
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
            <div className="mt-2 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-lg font-medium text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-500">
                  {user.email} • {user.role} • {user.department || 'No Department'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={copyFromRole}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Copy from Role
            </button>
            <button
              onClick={savePermissions}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveModule('re')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeModule === 're'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            RE Module
          </button>
          <button
            onClick={() => setActiveModule('expense')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeModule === 'expense'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Expense Module
          </button>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="space-y-4">
        {MODULE_ENTITIES[activeModule].map((entity) => {
          const entityPerms = permissions[activeModule]?.[entity];
          const isExpanded = expandedEntities.has(entity);
          const fields = ENTITY_FIELDS[entity] || [];

          return (
            <div key={entity} className="bg-white rounded-lg border overflow-hidden">
              {/* Entity Header */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleEntity(entity)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {entity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h3>
                </div>

                {/* Quick Access Toggle */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={entityPerms?.access || false}
                    onChange={(e) => updatePermission(activeModule, entity, 'access', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Access</span>
                </label>
              </div>

              {/* Permission Details */}
              {isExpanded && entityPerms?.access && (
                <div className="p-6 border-t">
                  {/* CRUD Permissions */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Record Permissions</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={entityPerms?.create || false}
                            onChange={(e) => updatePermission(activeModule, entity, 'create', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Create</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={entityPerms?.edit || false}
                            onChange={(e) => updatePermission(activeModule, entity, 'edit', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Edit</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={entityPerms?.delete || false}
                            onChange={(e) => updatePermission(activeModule, entity, 'delete', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Delete</span>
                        </label>
                      </div>
                      <div>
                        <select
                          value={entityPerms?.scope || 'own'}
                          onChange={(e) => updatePermission(activeModule, entity, 'scope', e.target.value as 'own' | 'all' | 'department')}
                          className="px-3 py-1 border rounded-lg text-sm"
                        >
                          <option value="own">Own Records Only</option>
                          <option value="department">Department Records</option>
                          <option value="all">All Records</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Column Permissions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Column Permissions</h4>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => toggleAllColumns(activeModule, entity, 'view', true)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View All
                        </button>
                        <button
                          onClick={() => toggleAllColumns(activeModule, entity, 'view', false)}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Hide All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => toggleAllColumns(activeModule, entity, 'edit', true)}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          Edit All
                        </button>
                        <button
                          onClick={() => toggleAllColumns(activeModule, entity, 'edit', false)}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Read Only All
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Column
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                              <Eye className="h-4 w-4 inline mr-1" />
                              View
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                              <Edit3 className="h-4 w-4 inline mr-1" />
                              Edit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {fields.map((field) => {
                            const columnPerms = entityPerms?.columns?.[field] || {
                              view: true,
                              edit: false
                            };

                            return (
                              <tr key={field} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                                  {field.replace(/([A-Z])/g, ' $1').trim()}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={columnPerms.view}
                                    onChange={(e) => updateColumnPermission(
                                      activeModule,
                                      entity,
                                      field,
                                      'view',
                                      e.target.checked
                                    )}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={columnPerms.edit}
                                    onChange={(e) => updateColumnPermission(
                                      activeModule,
                                      entity,
                                      field,
                                      'edit',
                                      e.target.checked
                                    )}
                                    disabled={!columnPerms.view}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* No Access Message */}
              {isExpanded && !entityPerms?.access && (
                <div className="p-6 border-t text-center text-gray-500">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Access is disabled for this entity</p>
                  <p className="text-sm mt-1">Enable access to configure permissions</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}