'use client';

import React, { useState, useEffect } from 'react';
import {
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
  Save,
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
  LayoutDashboard
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
  columns: Record<string, {
    view: boolean;
    edit: boolean;
  }>;
}

interface UserPermissions {
  [userId: string]: {
    re: Record<string, Permission>;
    expense: Record<string, Permission>;
  };
}

// Entity definitions with icons and colors
const ENTITIES = {
  re: [
    { id: 'dealer', name: 'Dealers', icon: Users, color: 'blue' },
    { id: 'fhh-client', name: 'FHH Clients', icon: Users, color: 'green' },
    { id: 'cp-client', name: 'CP Clients', icon: Users, color: 'purple' },
    { id: 'builder', name: 'Builders', icon: Building2, color: 'orange' },
    { id: 'project', name: 'Projects', icon: Package, color: 'pink' }
  ],
  expense: [
    { id: 'dealer', name: 'Dealers', icon: Users, color: 'blue' },
    { id: 'fhh-client', name: 'FHH Clients', icon: Users, color: 'green' },
    { id: 'cp-client', name: 'CP Clients', icon: Users, color: 'purple' },
    { id: 'office', name: 'Office', icon: Home, color: 'indigo' },
    { id: 'project', name: 'Projects', icon: Package, color: 'pink' },
    { id: 'all', name: 'All Entities', icon: LayoutDashboard, color: 'gray' }
  ]
};

// Column definitions per entity
const ENTITY_COLUMNS: Record<string, string[]> = {
  dealer: ['name', 'contact', 'email', 'phone', 'commission', 'sales', 'target', 'status'],
  'fhh-client': ['name', 'project', 'amount', 'installment', 'dueDate', 'status', 'remarks'],
  'cp-client': ['name', 'property', 'downPayment', 'monthlyPayment', 'balance', 'status'],
  builder: ['name', 'projects', 'commission', 'agreement', 'contact', 'status'],
  project: ['name', 'location', 'budget', 'revenue', 'expense', 'profit', 'status'],
  office: ['name', 'rent', 'utilities', 'maintenance', 'expenses', 'notes'],
  all: ['name', 'amount', 'date', 'category', 'description', 'status']
};

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>('re');
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/financial-tracker/api/financial-tracker/admin/users', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      
      // Fetch permissions for each user
      const perms: UserPermissions = {};
      for (const user of data.users) {
        const permResponse = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${user._id}/permissions`, {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        });
        if (permResponse.ok) {
          const permData = await permResponse.json();
          perms[user._id] = permData.permissions || { re: {}, expense: {} };
        }
      }
      setPermissions(perms);
      
      if (data.users.length > 0) {
        setSelectedUser(data.users[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update permission - FIXED: Removed duplicate defaults
  const updatePermission = (
    userId: string,
    module: 're' | 'expense',
    entity: string,
    field: keyof Permission,
    value: any
  ) => {
    setPermissions(prev => {
      const currentUserPerms = prev[userId]?.[module]?.[entity] || {
        access: false,
        create: false,
        edit: false,
        delete: false,
        scope: 'own',
        columns: {}
      };

      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          [module]: {
            ...prev[userId]?.[module],
            [entity]: {
              ...currentUserPerms,
              [field]: value
            }
          }
        }
      };
    });
  };

  // Update column permission - FIXED: Removed duplicate defaults
  const updateColumnPermission = (
    userId: string,
    module: 're' | 'expense',
    entity: string,
    column: string,
    type: 'view' | 'edit',
    value: boolean
  ) => {
    setPermissions(prev => {
      const currentUserPerms = prev[userId]?.[module]?.[entity] || {
        access: false,
        create: false,
        edit: false,
        delete: false,
        scope: 'own',
        columns: {}
      };

      const currentColumnPerms = currentUserPerms.columns[column] || {
        view: true,
        edit: false
      };

      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          [module]: {
            ...prev[userId]?.[module],
            [entity]: {
              ...currentUserPerms,
              columns: {
                ...currentUserPerms.columns,
                [column]: {
                  ...currentColumnPerms,
                  [type]: value
                }
              }
            }
          }
        }
      };
    });
  };

  // Toggle all columns
  const toggleAllColumns = (
    userId: string,
    module: 're' | 'expense',
    entity: string,
    type: 'view' | 'edit',
    value: boolean
  ) => {
    const columns = ENTITY_COLUMNS[entity] || [];
    columns.forEach(column => {
      updateColumnPermission(userId, module, entity, column, type, value);
    });
  };

  // Save permissions
  const savePermissions = async (userId: string) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ permissions: permissions[userId] })
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

  // Bulk save permissions
  const bulkSavePermissions = async () => {
    try {
      setIsSaving(true);
      
      for (const userId of selectedUsers) {
        await fetch(`/financial-tracker/api/financial-tracker/admin/users/${userId}/permissions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          },
          body: JSON.stringify({ permissions: permissions[userId] })
        });
      }
      
      toast.success('Permissions saved for all selected users');
      setBulkMode(false);
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy permissions from another user
  const copyPermissions = async (sourceUserId: string, targetUserId: string) => {
    if (!confirm('Copy permissions from selected user?')) return;
    
    setPermissions(prev => ({
      ...prev,
      [targetUserId]: JSON.parse(JSON.stringify(prev[sourceUserId]))
    }));
    
    toast.success('Permissions copied');
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Get current user permissions
  const currentUserPerms = selectedUser ? permissions[selectedUser]?.[selectedModule] || {} : {};

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600 mt-1">Configure granular permissions for users</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              bulkMode ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Mode
          </button>
          {bulkMode && (
            <button
              onClick={bulkSavePermissions}
              disabled={selectedUsers.length === 0 || isSaving}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save All ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* User List */}
        <div className="col-span-3 bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser === user._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                } ${bulkMode ? 'flex items-center space-x-3' : ''}`}
                onClick={() => !bulkMode && setSelectedUser(user._id)}
              >
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user._id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                    {!bulkMode && selectedUser === user._id && (
                      <button
                        onClick={() => savePermissions(user._id)}
                        disabled={isSaving}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full capitalize">
                      {user.role}
                    </span>
                    {user.department && (
                      <span className="text-xs text-gray-500 ml-2">{user.department}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="col-span-9 bg-white rounded-lg border p-6">
          {!bulkMode && !selectedUser ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
              <p className="text-gray-500">Choose a user from the list to manage their permissions</p>
            </div>
          ) : bulkMode ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Mode Selected</h3>
              <p className="text-gray-500 mb-4">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-gray-400">
                Edit permissions for individual users above, then save all
              </p>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="mb-6 pb-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {users.find(u => u._id === selectedUser)?.fullName}
                  </h2>
                  <p className="text-gray-500">
                    {users.find(u => u._id === selectedUser)?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const sourceId = prompt('Enter user ID to copy permissions from:');
                    if (sourceId) copyPermissions(sourceId, selectedUser);
                  }}
                  className="flex items-center px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy from User
                </button>
              </div>

              {/* Module Tabs */}
              <div className="mb-4 border-b">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedModule('re')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      selectedModule === 're'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    RE Module
                  </button>
                  <button
                    onClick={() => setSelectedModule('expense')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      selectedModule === 'expense'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Expense Module
                  </button>
                </div>
              </div>

              {/* Entities */}
              <div className="space-y-4">
                {ENTITIES[selectedModule].map((entity) => {
                  const entityPerms = currentUserPerms[entity.id] || {
                    access: false,
                    create: false,
                    edit: false,
                    delete: false,
                    scope: 'own',
                    columns: {}
                  };
                  const isExpanded = expandedEntities.has(entity.id);
                  const Icon = entity.icon;

                  return (
                    <div key={entity.id} className="border rounded-lg overflow-hidden">
                      {/* Entity Header */}
                      <div
                        className={`bg-${entity.color}-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-${entity.color}-100`}
                        onClick={() => toggleEntity(entity.id)}
                      >
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDown className={`h-4 w-4 text-${entity.color}-600`} />
                          ) : (
                            <ChevronRight className={`h-4 w-4 text-${entity.color}-600`} />
                          )}
                          <Icon className={`h-5 w-5 text-${entity.color}-600`} />
                          <h3 className={`font-medium text-${entity.color}-900`}>
                            {entity.name}
                          </h3>
                        </div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={entityPerms.access}
                            onChange={(e) => {
                              updatePermission(selectedUser, selectedModule, entity.id, 'access', e.target.checked);
                              if (!e.target.checked) {
                                // Disable all other permissions when access is off
                                updatePermission(selectedUser, selectedModule, entity.id, 'create', false);
                                updatePermission(selectedUser, selectedModule, entity.id, 'edit', false);
                                updatePermission(selectedUser, selectedModule, entity.id, 'delete', false);
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Enable Access</span>
                        </label>
                      </div>

                      {/* Permission Details */}
                      {isExpanded && entityPerms.access && (
                        <div className="p-4 space-y-4">
                          {/* CRUD Permissions */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Record Permissions
                            </h4>
                            <div className="grid grid-cols-5 gap-4">
                              <div>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={entityPerms.create}
                                    onChange={(e) => updatePermission(
                                      selectedUser,
                                      selectedModule,
                                      entity.id,
                                      'create',
                                      e.target.checked
                                    )}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Create</span>
                                </label>
                              </div>
                              <div>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={entityPerms.edit}
                                    onChange={(e) => updatePermission(
                                      selectedUser,
                                      selectedModule,
                                      entity.id,
                                      'edit',
                                      e.target.checked
                                    )}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Edit</span>
                                </label>
                              </div>
                              <div>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={entityPerms.delete}
                                    onChange={(e) => updatePermission(
                                      selectedUser,
                                      selectedModule,
                                      entity.id,
                                      'delete',
                                      e.target.checked
                                    )}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Delete</span>
                                </label>
                              </div>
                              <div className="col-span-2">
                                <select
                                  value={entityPerms.scope}
                                  onChange={(e) => updatePermission(
                                    selectedUser,
                                    selectedModule,
                                    entity.id,
                                    'scope',
                                    e.target.value as 'own' | 'all' | 'department'
                                  )}
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
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">
                                Column Permissions
                              </h4>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => toggleAllColumns(
                                    selectedUser,
                                    selectedModule,
                                    entity.id,
                                    'view',
                                    true
                                  )}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  View All
                                </button>
                                <button
                                  onClick={() => toggleAllColumns(
                                    selectedUser,
                                    selectedModule,
                                    entity.id,
                                    'view',
                                    false
                                  )}
                                  className="text-xs text-gray-600 hover:text-gray-800"
                                >
                                  Hide All
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => toggleAllColumns(
                                    selectedUser,
                                    selectedModule,
                                    entity.id,
                                    'edit',
                                    true
                                  )}
                                  className="text-xs text-green-600 hover:text-green-800"
                                >
                                  Edit All
                                </button>
                                <button
                                  onClick={() => toggleAllColumns(
                                    selectedUser,
                                    selectedModule,
                                    entity.id,
                                    'edit',
                                    false
                                  )}
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
                                  {(ENTITY_COLUMNS[entity.id] || []).map((column) => {
                                    const columnPerms = entityPerms.columns?.[column] || {
                                      view: true,
                                      edit: false
                                    };

                                    return (
                                      <tr key={column} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                                          {column.replace(/([A-Z])/g, ' $1').trim()}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                          <input
                                            type="checkbox"
                                            checked={columnPerms.view}
                                            onChange={(e) => updateColumnPermission(
                                              selectedUser,
                                              selectedModule,
                                              entity.id,
                                              column,
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
                                              selectedUser,
                                              selectedModule,
                                              entity.id,
                                              column,
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
                      {isExpanded && !entityPerms.access && (
                        <div className="p-4 text-center text-gray-500">
                          <Lock className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Access is disabled for this entity</p>
                          <p className="text-xs mt-1">Enable access to configure permissions</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}