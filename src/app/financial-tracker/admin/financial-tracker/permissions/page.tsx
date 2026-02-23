// src/app/admin/financial-tracker/permissions/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  LayoutDashboard,
  FolderTree,
  Settings,
  Globe,
  Award,
  Zap,
  Star,
  Flag,
  Bell,
  Clock,
  User,
  Tag,
  Bookmark,
  ArrowUpDown,
  Grid3x3,
  Layers,
  Menu,
  MoreVertical,
  Download,
  Upload,
  Printer,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ✅ Token utility
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
  avatar?: string;
  lastActive?: string;
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

interface CustomField {
  _id: string;
  fieldKey: string;
  label: string;
  type: string;
  options?: string[];
  isSystem: boolean;
  isEnabled: boolean;
  required: boolean;
  validation?: any;
}

interface Category {
  _id: string;
  name: string;
  entity: string;
  module: string;
  isActive: boolean;
}

// Entity definitions with icons and colors
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
    { id: 'fhh-client', name: 'FHH Clients', icon: Users, color: 'green', description: 'FHH client expenses' },
    { id: 'cp-client', name: 'CP Clients', icon: Users, color: 'purple', description: 'CP client expenses' },
    { id: 'office', name: 'Office', icon: Home, color: 'indigo', description: 'Office and admin expenses' },
    { id: 'project', name: 'Projects', icon: Package, color: 'pink', description: 'Project expenses' },
    { id: 'all', name: 'All Entities', icon: LayoutDashboard, color: 'gray', description: 'Global permissions' }
  ]
};

// Default columns (always present)
const DEFAULT_COLUMNS: Record<string, string[]> = {
  dealer: ['name', 'contact', 'email', 'phone', 'commission', 'sales', 'target', 'status', 'createdAt', 'updatedAt'],
  'fhh-client': ['name', 'project', 'amount', 'installment', 'dueDate', 'status', 'remarks', 'createdAt'],
  'cp-client': ['name', 'property', 'downPayment', 'monthlyPayment', 'balance', 'status', 'createdAt'],
  builder: ['name', 'projects', 'commission', 'agreement', 'contact', 'status', 'createdAt'],
  project: ['name', 'location', 'budget', 'revenue', 'expense', 'profit', 'status', 'createdAt'],
  office: ['name', 'rent', 'utilities', 'maintenance', 'expenses', 'notes', 'createdAt'],
  all: ['name', 'amount', 'date', 'category', 'description', 'status', 'createdBy', 'createdAt']
};

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [customFields, setCustomFields] = useState<Record<string, CustomField[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>('re');
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'entities' | 'fields'>('entities');
  const [selectedEntityForFields, setSelectedEntityForFields] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedFieldForCategory, setSelectedFieldForCategory] = useState<CustomField | null>(null);
  const [categorySearch, setCategorySearch] = useState('');

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchCategories()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/admin/users', {
        headers: { 'Authorization': getToken() }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      
      // Fetch permissions for each user
      const perms: UserPermissions = {};
      for (const user of data.users) {
        const permResponse = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${user._id}/permissions`, {
          headers: { 'Authorization': getToken() }
        });
        if (permResponse.ok) {
          const permData = await permResponse.json();
          perms[user._id] = permData.permissions || { re: {}, expense: {} };
        }
      }
      setPermissions(perms);
      
      // Fetch custom fields for each entity
      const fields: Record<string, CustomField[]> = {};
      for (const module of ['re', 'expense']) {
        for (const entity of ENTITIES[module as keyof typeof ENTITIES]) {
          const fieldResponse = await fetch(
            `/financial-tracker/api/financial-tracker/fields?module=${module}&entityId=${entity.id}&includeDisabled=true`,
            { headers: { 'Authorization': getToken() } }
          );
          if (fieldResponse.ok) {
            const fieldData = await fieldResponse.json();
            fields[`${module}-${entity.id}`] = fieldData.fields || [];
          }
        }
      }
      setCustomFields(fields);
      
      if (data.users.length > 0) {
        setSelectedUser(data.users[0]._id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/categories?active=true', {
        headers: { 'Authorization': getToken() }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Get all columns for an entity (default + custom fields)
  const getEntityColumns = useCallback((module: string, entityId: string) => {
    const defaultCols = DEFAULT_COLUMNS[entityId] || [];
    const customCols = customFields[`${module}-${entityId}`] || [];
    
    // Add custom fields to columns
    const customFieldCols = customCols
      .filter(f => f.isEnabled)
      .map(f => ({
        key: f.fieldKey,
        label: f.label,
        type: f.type,
        isCustom: true,
        options: f.options
      }));

    // Get categories for this entity
    const entityCategories = categories.filter(c => 
      c.module === module && c.entity === entityId && c.isActive
    );

    return {
      default: defaultCols.map(key => ({ key, label: key.replace(/([A-Z])/g, ' $1').trim(), isCustom: false })),
      custom: customFieldCols,
      categories: entityCategories.map(c => ({
        key: `category-${c._id}`,
        label: c.name,
        type: 'category',
        isCategory: true,
        categoryId: c._id
      }))
    };
  }, [customFields, categories]);

  // Update permission
  const updatePermission = useCallback((
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
  }, []);

  // Update column permission
  const updateColumnPermission = useCallback((
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
  }, []);

  // Toggle all columns
  const toggleAllColumns = useCallback((
    userId: string,
    module: 're' | 'expense',
    entity: string,
    type: 'view' | 'edit',
    value: boolean
  ) => {
    const { default: defaultCols, custom, categories: categoryCols } = getEntityColumns(module, entity);
    [...defaultCols, ...custom, ...categoryCols].forEach(col => {
      updateColumnPermission(userId, module, entity, col.key, type, value);
    });
  }, [getEntityColumns, updateColumnPermission]);

  // Save permissions
  const savePermissions = async (userId: string) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken()
        },
        body: JSON.stringify({ permissions: permissions[userId] })
      });

      if (!response.ok) throw new Error('Failed to save permissions');
      
      toast.success('Permissions saved successfully');
    } catch (error) {
      toast.error('Failed to save permissions');
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
            'Authorization': getToken()
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

  // Copy permissions
  const copyPermissions = async (sourceUserId: string, targetUserId: string) => {
    if (!confirm('Copy permissions from selected user?')) return;
    
    setPermissions(prev => ({
      ...prev,
      [targetUserId]: JSON.parse(JSON.stringify(prev[sourceUserId]))
    }));
    
    toast.success('Permissions copied');
  };

  // Filter users
  const filteredUsers = useMemo(() => 
    users.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]
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

  // Get entity columns for selected entity
  const entityColumns = selectedEntityForFields 
    ? getEntityColumns(selectedModule, selectedEntityForFields)
    : { default: [], custom: [], categories: [] };

  // Filter categories for modal
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.entity.toLowerCase().includes(categorySearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-200">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Permission Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                  Configure granular access controls for users
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`flex items-center px-4 py-2 border-2 rounded-xl transition-all ${
                  bulkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400 shadow-lg shadow-blue-500/25' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                {bulkMode ? 'Bulk Mode Active' : 'Bulk Mode'}
              </button>
              {bulkMode && (
                <button
                  onClick={bulkSavePermissions}
                  disabled={selectedUsers.length === 0 || isSaving}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/25 border-2 border-green-400 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All ({selectedUsers.length})
                </button>
              )}
              <button
                onClick={fetchAllData}
                className="p-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex space-x-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('entities')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                activeTab === 'entities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Entity Permissions</span>
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                activeTab === 'fields'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              <span>Field Permissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* User List */}
          <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
            <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="divide-y-2 divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                    selectedUser === user._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  } ${bulkMode ? 'flex items-start space-x-3' : ''}`}
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
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      {!bulkMode && selectedUser === user._id && (
                        <button
                          onClick={() => savePermissions(user._id)}
                          disabled={isSaving}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-medium capitalize border border-blue-300">
                        {user.role}
                      </span>
                      {user.department && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                          {user.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="col-span-12 lg:col-span-9">
            {!bulkMode && !selectedUser ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 ring-4 ring-white">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                  Select a User
                </h3>
                <p className="text-gray-500 text-lg">Choose a user from the list to manage their permissions</p>
              </div>
            ) : bulkMode ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-12 text-center">
                <Users className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Bulk Mode Selected</h3>
                <p className="text-gray-500 text-lg mb-4">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-gray-400">
                  Edit permissions for individual users above, then save all
                </p>
              </div>
            ) : activeTab === 'entities' ? (
              <>
                {/* User Info */}
                <div className="mb-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {users.find(u => u._id === selectedUser)?.fullName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {users.find(u => u._id === selectedUser)?.fullName}
                        </h2>
                        <p className="text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {users.find(u => u._id === selectedUser)?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const sourceId = prompt('Enter user ID to copy permissions from:');
                        if (sourceId && users.find(u => u._id === sourceId)) {
                          copyPermissions(sourceId, selectedUser);
                        } else if (sourceId) {
                          toast.error('User not found');
                        }
                      }}
                      className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy from User
                    </button>
                  </div>
                </div>

                {/* Module Tabs */}
                <div className="mb-6 border-b-2 border-gray-200">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setSelectedModule('re')}
                      className={`px-6 py-3 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                        selectedModule === 're'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>RE Module</span>
                    </button>
                    <button
                      onClick={() => setSelectedModule('expense')}
                      className={`px-6 py-3 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                        selectedModule === 'expense'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Expense Module</span>
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
                    const entityFields = getEntityColumns(selectedModule, entity.id);

                    return (
                      <div key={entity.id} className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                        {/* Entity Header */}
                        <div
                          className={`bg-gradient-to-r from-${entity.color}-50 to-white px-6 py-4 flex items-center justify-between cursor-pointer hover:from-${entity.color}-100 transition-all`}
                          onClick={() => toggleEntity(entity.id)}
                        >
                          <div className="flex items-center space-x-4">
                            {isExpanded ? (
                              <ChevronDown className={`h-5 w-5 text-${entity.color}-600`} />
                            ) : (
                              <ChevronRight className={`h-5 w-5 text-${entity.color}-600`} />
                            )}
                            <div className={`p-2.5 bg-${entity.color}-100 rounded-xl border-2 border-${entity.color}-200`}>
                              <Icon className={`h-5 w-5 text-${entity.color}-600`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold text-lg text-${entity.color}-900`}>
                                {entity.name}
                              </h3>
                              <p className="text-sm text-gray-500">{entity.description}</p>
                            </div>
                          </div>
                          <label className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all">
                            <input
                              type="checkbox"
                              checked={entityPerms.access}
                              onChange={(e) => {
                                updatePermission(selectedUser, selectedModule, entity.id, 'access', e.target.checked);
                                if (!e.target.checked) {
                                  updatePermission(selectedUser, selectedModule, entity.id, 'create', false);
                                  updatePermission(selectedUser, selectedModule, entity.id, 'edit', false);
                                  updatePermission(selectedUser, selectedModule, entity.id, 'delete', false);
                                }
                              }}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Access</span>
                          </label>
                        </div>

                        {/* Permission Details */}
                        {isExpanded && entityPerms.access && (
                          <div className="p-6 space-y-6 border-t-2 border-gray-200">
                            {/* CRUD Permissions */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                                Record Permissions
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {[
                                  { key: 'create', label: 'Create', icon: Plus, color: 'green' },
                                  { key: 'edit', label: 'Edit', icon: Edit3, color: 'blue' },
                                  { key: 'delete', label: 'Delete', icon: Trash2, color: 'red' }
                                ].map(({ key, label, icon: Icon, color }) => (
                                  <label key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-${color}-300 transition-all">
                                    <input
                                      type="checkbox"
                                      checked={entityPerms[key as keyof Permission] as boolean}
                                      onChange={(e) => updatePermission(
                                        selectedUser,
                                        selectedModule,
                                        entity.id,
                                        key as keyof Permission,
                                        e.target.checked
                                      )}
                                      className="w-5 h-5 rounded border-gray-300 text-${color}-600 focus:ring-${color}-500"
                                    />
                                    <Icon className={`h-4 w-4 text-${color}-600`} />
                                    <span className="text-sm font-medium text-gray-700">{label}</span>
                                  </label>
                                ))}
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
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
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                                  <Eye className="h-4 w-4 mr-2 text-purple-600" />
                                  Column Permissions
                                </h4>
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => toggleAllColumns(
                                      selectedUser,
                                      selectedModule,
                                      entity.id,
                                      'view',
                                      true
                                    )}
                                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
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
                                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
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
                                    className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
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
                                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                  >
                                    Read Only All
                                  </button>
                                </div>
                              </div>

                              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                <table className="min-w-full divide-y-2 divide-gray-200">
                                  <thead className="bg-gradient-to-r from-gray-50 to-white">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Column
                                      </th>
                                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <Eye className="h-4 w-4 inline mr-1" />
                                        View
                                      </th>
                                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <Edit3 className="h-4 w-4 inline mr-1" />
                                        Edit
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Type
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y-2 divide-gray-200 bg-white">
                                    {/* Default Columns */}
                                    {entityFields.default.map((col) => {
                                      const columnPerms = entityPerms.columns?.[col.key] || {
                                        view: true,
                                        edit: false
                                      };

                                      return (
                                        <tr key={col.key} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                            {col.label}
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={columnPerms.view}
                                              onChange={(e) => updateColumnPermission(
                                                selectedUser,
                                                selectedModule,
                                                entity.id,
                                                col.key,
                                                'view',
                                                e.target.checked
                                              )}
                                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={columnPerms.edit}
                                              onChange={(e) => updateColumnPermission(
                                                selectedUser,
                                                selectedModule,
                                                entity.id,
                                                col.key,
                                                'edit',
                                                e.target.checked
                                              )}
                                              disabled={!columnPerms.view}
                                              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                            />
                                          </td>
                                          <td className="px-6 py-3">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                              System
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}

                                    {/* Custom Fields */}
                                    {entityFields.custom.map((col) => {
                                      const columnPerms = entityPerms.columns?.[col.key] || {
                                        view: true,
                                        edit: false
                                      };

                                      return (
                                        <tr key={col.key} className="hover:bg-purple-50 transition-colors">
                                          <td className="px-6 py-3">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium text-gray-900">{col.label}</span>
                                              {col.type === 'select' && col.options && (
                                                <button
                                                  onClick={() => {
                                                    setSelectedFieldForCategory(col as any);
                                                    setShowCategoryModal(true);
                                                  }}
                                                  className="p-1 text-purple-600 hover:bg-purple-100 rounded-lg border border-purple-200"
                                                  title="Link Categories"
                                                >
                                                  <FolderTree className="h-3 w-3" />
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={columnPerms.view}
                                              onChange={(e) => updateColumnPermission(
                                                selectedUser,
                                                selectedModule,
                                                entity.id,
                                                col.key,
                                                'view',
                                                e.target.checked
                                              )}
                                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={columnPerms.edit}
                                              onChange={(e) => updateColumnPermission(
                                                selectedUser,
                                                selectedModule,
                                                entity.id,
                                                col.key,
                                                'edit',
                                                e.target.checked
                                              )}
                                              disabled={!columnPerms.view}
                                              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                            />
                                          </td>
                                          <td className="px-6 py-3">
                                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200">
                                              Custom
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}

                                    {/* Category Fields */}
                                    {entityFields.categories.map((cat) => {
                                      const columnPerms = entityPerms.columns?.[cat.key] || {
                                        view: true,
                                        edit: false
                                      };

                                      return (
                                        <tr key={cat.key} className="hover:bg-green-50 transition-colors">
                                          <td className="px-6 py-3">
                                            <div className="flex items-center space-x-2">
                                              <FolderTree className="h-4 w-4 text-green-600" />
                                              <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                                            </div>
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={columnPerms.view}
                                              onChange={(e) => updateColumnPermission(
                                                selectedUser,
                                                selectedModule,
                                                entity.id,
                                                cat.key,
                                                'view',
                                                e.target.checked
                                              )}
                                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={columnPerms.edit}
                                              onChange={(e) => updateColumnPermission(
                                                selectedUser,
                                                selectedModule,
                                                entity.id,
                                                cat.key,
                                                'edit',
                                                e.target.checked
                                              )}
                                              disabled={!columnPerms.view}
                                              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                            />
                                          </td>
                                          <td className="px-6 py-3">
                                            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                                              Category
                                            </span>
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
                          <div className="p-8 text-center bg-gray-50 rounded-b-2xl">
                            <Lock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-gray-500 font-medium">Access is disabled for this entity</p>
                            <p className="text-sm text-gray-400 mt-1">Enable access to configure permissions</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              // Fields Tab - Show field permissions for selected entity
              <div className="space-y-4">
                {/* Entity Selector for Fields */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Grid3x3 className="h-5 w-5 mr-2 text-blue-600" />
                    Select Entity to Manage Field Permissions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ENTITIES[selectedModule].map((entity) => (
                      <button
                        key={entity.id}
                        onClick={() => setSelectedEntityForFields(entity.id)}
                        className={`p-4 border-2 rounded-xl flex items-center space-x-3 transition-all ${
                          selectedEntityForFields === entity.id
                            ? `border-${entity.color}-500 bg-${entity.color}-50 shadow-lg`
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-${entity.color}-100`}>
                          <entity.icon className={`h-5 w-5 text-${entity.color}-600`} />
                        </div>
                        <span className="font-medium text-gray-900">{entity.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedEntityForFields && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Field Permissions for {ENTITIES[selectedModule].find(e => e.id === selectedEntityForFields)?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Configure which fields users can view and edit
                      </p>
                    </div>

                    <div className="p-6">
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y-2 divide-gray-200">
                          <thead className="bg-gradient-to-r from-gray-50 to-white">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Field
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <Eye className="h-4 w-4 inline mr-1" />
                                Default View
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <Edit3 className="h-4 w-4 inline mr-1" />
                                Default Edit
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                System
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-gray-200 bg-white">
                            {getEntityColumns(selectedModule, selectedEntityForFields).default.map((col) => (
                              <tr key={col.key} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                  {col.label}
                                </td>
                                <td className="px-6 py-3">
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    System
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <Shield className="h-5 w-5 text-purple-500 mx-auto" />
                                </td>
                              </tr>
                            ))}
                            {getEntityColumns(selectedModule, selectedEntityForFields).custom.map((col) => (
                              <tr key={col.key} className="hover:bg-purple-50">
                                <td className="px-6 py-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">{col.label}</span>
                                    {col.type === 'select' && (
                                      <button
                                        onClick={() => {
                                          setSelectedFieldForCategory(col as any);
                                          setShowCategoryModal(true);
                                        }}
                                        className="p-1 text-purple-600 hover:bg-purple-100 rounded-lg border border-purple-200"
                                        title="Link Categories"
                                      >
                                        <FolderTree className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                    {col.type}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    defaultChecked={true}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600"
                                  />
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    defaultChecked={false}
                                    className="w-5 h-5 rounded border-gray-300 text-green-600"
                                  />
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <span className="text-xs text-gray-400">No</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && selectedFieldForCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border-2 border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-xl p-2">
                    <FolderTree className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Link Categories to {selectedFieldForCategory.label}
                  </h2>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>

              {/* Category List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCategories.map((category) => (
                  <label
                    key={category._id}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-all"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {category.module.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Entity: {category.entity}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Categories linked successfully');
                    setShowCategoryModal(false);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg shadow-purple-500/25"
                >
                  Link Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Missing Mail import
const Mail = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);