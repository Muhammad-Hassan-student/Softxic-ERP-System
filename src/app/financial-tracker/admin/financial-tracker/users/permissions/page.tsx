'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Shield,
  Users,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  DollarSign,
  CreditCard,
  Building2,
  Home,
  Briefcase,
  Package,
  Copy,
  Download,
  Upload,
  Globe,
  UserCog,
  Settings,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ✅ Token utility function
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};
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
  columns: Record<string, {
    view: boolean;
    edit: boolean;
  }>;
}

interface UserPermissions {
  re: Record<string, Permission>;
  expense: Record<string, Permission>;
}

// Entity definitions
const ENTITIES = {
  re: [
    { id: 'dealer', name: 'Dealers', icon: Users, color: 'blue', description: 'Manage dealer records and commissions' },
    { id: 'fhh-client', name: 'FHH Clients', icon: Users, color: 'green', description: 'FHH client management' },
    { id: 'cp-client', name: 'CP Clients', icon: Users, color: 'purple', description: 'CP client management' },
    { id: 'builder', name: 'Builders', icon: Building2, color: 'orange', description: 'Builder partnerships' },
    { id: 'project', name: 'Projects', icon: Package, color: 'pink', description: 'Project management' }
  ],
  expense: [
    { id: 'dealer', name: 'Dealers', icon: Users, color: 'blue', description: 'Dealer expense management' },
    { id: 'fhh-client', name: 'FHH Clients', icon: Users, color: 'green', description: 'Client expense tracking' },
    { id: 'cp-client', name: 'CP Clients', icon: Users, color: 'purple', description: 'Client expense tracking' },
    { id: 'office', name: 'Office', icon: Home, color: 'indigo', description: 'Office expenses' },
    { id: 'project', name: 'Projects', icon: Package, color: 'pink', description: 'Project expenses' },
    { id: 'all', name: 'All Entities', icon: Globe, color: 'gray', description: 'Global expense access' }
  ]
};

// Column definitions
const ENTITY_COLUMNS: Record<string, Array<{ key: string; label: string; description?: string }>> = {
  dealer: [
    { key: 'name', label: 'Name', description: 'Dealer name' },
    { key: 'contact', label: 'Contact', description: 'Contact person' },
    { key: 'email', label: 'Email', description: 'Email address' },
    { key: 'phone', label: 'Phone', description: 'Phone number' },
    { key: 'commission', label: 'Commission %', description: 'Commission percentage' },
    { key: 'sales', label: 'Sales', description: 'Sales amount' },
    { key: 'target', label: 'Target', description: 'Sales target' },
    { key: 'status', label: 'Status', description: 'Account status' }
  ],
  'fhh-client': [
    { key: 'name', label: 'Name', description: 'Client name' },
    { key: 'project', label: 'Project', description: 'Associated project' },
    { key: 'amount', label: 'Amount', description: 'Transaction amount' },
    { key: 'installment', label: 'Installment', description: 'Installment amount' },
    { key: 'dueDate', label: 'Due Date', description: 'Payment due date' },
    { key: 'status', label: 'Status', description: 'Client status' },
    { key: 'remarks', label: 'Remarks', description: 'Additional notes' }
  ],
  office: [
    { key: 'name', label: 'Name', description: 'Expense name' },
    { key: 'rent', label: 'Rent', description: 'Office rent' },
    { key: 'utilities', label: 'Utilities', description: 'Utility bills' },
    { key: 'maintenance', label: 'Maintenance', description: 'Maintenance cost' },
    { key: 'expenses', label: 'Expenses', description: 'Other expenses' },
    { key: 'notes', label: 'Notes', description: 'Additional notes' }
  ],
  project: [
    { key: 'name', label: 'Name', description: 'Project name' },
    { key: 'location', label: 'Location', description: 'Project location' },
    { key: 'budget', label: 'Budget', description: 'Project budget' },
    { key: 'revenue', label: 'Revenue', description: 'Project revenue' },
    { key: 'expense', label: 'Expense', description: 'Project expenses' },
    { key: 'profit', label: 'Profit', description: 'Net profit' },
    { key: 'status', label: 'Status', description: 'Project status' }
  ],
  all: [
    { key: 'name', label: 'Name', description: 'Record name' },
    { key: 'amount', label: 'Amount', description: 'Transaction amount' },
    { key: 'date', label: 'Date', description: 'Transaction date' },
    { key: 'category', label: 'Category', description: 'Expense category' },
    { key: 'description', label: 'Description', description: 'Record description' },
    { key: 'status', label: 'Status', description: 'Record status' }
  ]
};

// Default columns for entities not specified
const getEntityColumns = (entityId: string) => {
  return ENTITY_COLUMNS[entityId] || [
    { key: 'name', label: 'Name', description: 'Record name' },
    { key: 'amount', label: 'Amount', description: 'Amount' },
    { key: 'status', label: 'Status', description: 'Status' }
  ];
};

export default function UserPermissionsPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>({
    re: {},
    expense: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>('re');
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('advanced');

  // Fetch user and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user details
        const userResponse = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${params.userId}`, {
          headers: {
            'Authorization': getToken()
          }
        });
        
        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch permissions
        const permResponse = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${params.userId}/permissions`, {
          headers: {
            'Authorization': getToken()
          }
        });
        
        if (permResponse.ok) {
          const permData = await permResponse.json();
          setPermissions(permData.permissions || { re: {}, expense: {} });
        }

        // Expand first entity by default
        if (ENTITIES.re.length > 0) {
          setExpandedEntities(new Set([ENTITIES.re[0].id]));
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

  // Update permission
  const updatePermission = (
    module: 're' | 'expense',
    entity: string,
    field: keyof Permission,
    value: any
  ) => {
    setPermissions(prev => {
      const currentEntity = prev[module][entity] || {
        access: false,
        create: false,
        edit: false,
        delete: false,
        scope: 'own',
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

  // Update column permission
  const updateColumnPermission = (
    module: 're' | 'expense',
    entity: string,
    column: string,
    type: 'view' | 'edit',
    value: boolean
  ) => {
    setPermissions(prev => {
      const currentEntity = prev[module][entity] || {
        access: false,
        create: false,
        edit: false,
        delete: false,
        scope: 'own',
        columns: {}
      };

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
    const columns = getEntityColumns(entity);
    columns.forEach(column => {
      updateColumnPermission(module, entity, column.key, type, value);
    });
  };

  // Set preset permissions
  const setPreset = (module: 're' | 'expense', entity: string, preset: 'full' | 'readonly' | 'none') => {
    switch (preset) {
      case 'full':
        updatePermission(module, entity, 'access', true);
        updatePermission(module, entity, 'create', true);
        updatePermission(module, entity, 'edit', true);
        updatePermission(module, entity, 'delete', true);
        updatePermission(module, entity, 'scope', 'all');
        toggleAllColumns(module, entity, 'view', true);
        toggleAllColumns(module, entity, 'edit', true);
        break;
      case 'readonly':
        updatePermission(module, entity, 'access', true);
        updatePermission(module, entity, 'create', false);
        updatePermission(module, entity, 'edit', false);
        updatePermission(module, entity, 'delete', false);
        updatePermission(module, entity, 'scope', 'own');
        toggleAllColumns(module, entity, 'view', true);
        toggleAllColumns(module, entity, 'edit', false);
        break;
      case 'none':
        updatePermission(module, entity, 'access', false);
        updatePermission(module, entity, 'create', false);
        updatePermission(module, entity, 'edit', false);
        updatePermission(module, entity, 'delete', false);
        break;
    }
  };

  // Copy permissions from another entity
  const copyFromEntity = (sourceEntity: string, targetEntity: string) => {
    const sourcePerms = permissions[selectedModule][sourceEntity];
    if (!sourcePerms) return;

    setPermissions(prev => ({
      ...prev,
      [selectedModule]: {
        ...prev[selectedModule],
        [targetEntity]: JSON.parse(JSON.stringify(sourcePerms))
      }
    }));

    toast.success(`Permissions copied from ${sourceEntity}`);
  };

  // Save permissions
  const savePermissions = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${params.userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken()
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

  // Filter entities by search
  const filteredEntities = ENTITIES[selectedModule].filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
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
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-medium text-lg">
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
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'simple' | 'advanced')}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="simple">Simple View</option>
              <option value="advanced">Advanced View</option>
            </select>
            <button
              onClick={savePermissions}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        <div className="flex space-x-6">
          <button
            onClick={() => setSelectedModule('re')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center ${
              selectedModule === 're'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            RE Module
          </button>
          <button
            onClick={() => setSelectedModule('expense')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center ${
              selectedModule === 'expense'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Expense Module
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Permissions Grid */}
      <div className="space-y-4">
        {filteredEntities.map((entity) => {
          const entityPerms = permissions[selectedModule][entity.id] || {
            access: false,
            create: false,
            edit: false,
            delete: false,
            scope: 'own',
            columns: {}
          };
          const isExpanded = expandedEntities.has(entity.id);
          const Icon = entity.icon;
          const columns = getEntityColumns(entity.id);

          return (
            <div key={entity.id} className="bg-white rounded-lg border overflow-hidden">
              {/* Entity Header */}
              <div
                className={`bg-${entity.color}-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-${entity.color}-100`}
                onClick={() => toggleEntity(entity.id)}
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className={`h-5 w-5 text-${entity.color}-600`} />
                  ) : (
                    <ChevronRight className={`h-5 w-5 text-${entity.color}-600`} />
                  )}
                  <div className={`p-2 rounded-lg bg-${entity.color}-100`}>
                    <Icon className={`h-5 w-5 text-${entity.color}-600`} />
                  </div>
                  <div>
                    <h3 className={`font-medium text-${entity.color}-900`}>
                      {entity.name}
                    </h3>
                    <p className="text-sm text-gray-500">{entity.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Quick Access Toggle */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={entityPerms.access}
                      onChange={(e) => {
                        updatePermission(selectedModule, entity.id, 'access', e.target.checked);
                        if (!e.target.checked) {
                          updatePermission(selectedModule, entity.id, 'create', false);
                          updatePermission(selectedModule, entity.id, 'edit', false);
                          updatePermission(selectedModule, entity.id, 'delete', false);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm text-gray-700">Enable Access</span>
                  </label>

                  {/* Preset Dropdown */}
                  <select
                    onChange={(e) => {
                      setPreset(selectedModule, entity.id, e.target.value as any);
                    }}
                    className="text-sm border rounded-lg px-2 py-1"
                    onClick={(e) => e.stopPropagation()}
                    value={entityPerms.access ? (entityPerms.edit ? 'full' : 'readonly') : 'none'}
                  >
                    <option value="full">Full Access</option>
                    <option value="readonly">Read Only</option>
                    <option value="none">No Access</option>
                  </select>
                </div>
              </div>

              {/* Permission Details */}
              {isExpanded && entityPerms.access && (
                <div className="p-6 space-y-6">
                  {/* CRUD Permissions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Record Permissions</h4>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={entityPerms.create}
                          onChange={(e) => updatePermission(selectedModule, entity.id, 'create', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          id={`${entity.id}-create`}
                        />
                        <label htmlFor={`${entity.id}-create`} className="text-sm text-gray-700">Create</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={entityPerms.edit}
                          onChange={(e) => updatePermission(selectedModule, entity.id, 'edit', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          id={`${entity.id}-edit`}
                        />
                        <label htmlFor={`${entity.id}-edit`} className="text-sm text-gray-700">Edit</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={entityPerms.delete}
                          onChange={(e) => updatePermission(selectedModule, entity.id, 'delete', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          id={`${entity.id}-delete`}
                        />
                        <label htmlFor={`${entity.id}-delete`} className="text-sm text-gray-700">Delete</label>
                      </div>
                      <div className="col-span-2">
                        <select
                          value={entityPerms.scope}
                          onChange={(e) => updatePermission(selectedModule, entity.id, 'scope', e.target.value)}
                          className="px-3 py-1 border rounded-lg text-sm w-full"
                        >
                          <option value="own">Own Records Only</option>
                          <option value="department">Department Records</option>
                          <option value="all">All Records</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Column Permissions */}
                  {viewMode === 'advanced' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Column Permissions</h4>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => toggleAllColumns(selectedModule, entity.id, 'view', true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View All
                          </button>
                          <button
                            onClick={() => toggleAllColumns(selectedModule, entity.id, 'view', false)}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Hide All
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => toggleAllColumns(selectedModule, entity.id, 'edit', true)}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Edit All
                          </button>
                          <button
                            onClick={() => toggleAllColumns(selectedModule, entity.id, 'edit', false)}
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
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
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
                            {columns.map((column) => {
                              const columnPerms = entityPerms.columns?.[column.key] || {
                                view: true,
                                edit: false
                              };

                              return (
                                <tr key={column.key} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">
                                    <div className="text-sm text-gray-900">{column.label}</div>
                                    <div className="text-xs text-gray-500">{column.description}</div>
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={columnPerms.view}
                                      onChange={(e) => updateColumnPermission(
                                        selectedModule,
                                        entity.id,
                                        column.key,
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
                                        selectedModule,
                                        entity.id,
                                        column.key,
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
                  )}
                </div>
              )}

              {/* No Access Message */}
              {isExpanded && !entityPerms.access && (
                <div className="p-12 text-center text-gray-500">
                  <Lock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900 mb-1">Access Disabled</p>
                  <p className="text-sm">Enable access to configure permissions for this entity</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}