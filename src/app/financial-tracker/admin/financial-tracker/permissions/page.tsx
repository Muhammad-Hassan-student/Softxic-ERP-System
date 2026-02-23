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
  Grid3x3,
  Layers,
  Menu,
  MoreVertical,
  Download,
  Upload,
  Printer,
  Plus,
  X,
  Tag,
  Bookmark,
  Flag,
  Bell,
  Clock,
  User,
  Settings,
  Sliders,
  ArrowUpDown,
  CheckSquare,
  Square,
  ChevronsUpDown,
  GripVertical,
  Pencil,
  FileDown,
  FileUp,
  EyeIcon,
  EyeOffIcon,
  Power,
  PowerOff,
  ToggleLeft,
  ToggleRight,
  ListFilter,
  ListChecks,
  ListTodo,
  ListTree,
  ListOrdered,
  Sparkles,
  Zap,
  Star,
  Globe,
  Award,
  Code,
  Database,
  Key,
  Link,
  Server,
  ShoppingBag,
  ShoppingCart,
  Signal,
  Smartphone,
  ThumbsUp,
  ThumbsDown,
  Ticket,
  Timer,
  Wifi,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  EyeOff
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

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  icon?: string;
  color?: string;
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
  order: number;
}

interface Category {
  _id: string;
  name: string;
  module: 're' | 'expense';
  entity: string;
  isActive: boolean;
  color?: string;
}

// View modes
type ViewMode = 'entities' | 'fields' | 'categories';

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [customFields, setCustomFields] = useState<Record<string, CustomField[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>('re');
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('entities');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEntities: 0,
    totalFields: 0,
    totalCategories: 0
  });

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchEntities(),
        fetchCategories()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users and their permissions
  const fetchUsers = async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/admin/users', {
        headers: { 'Authorization': getToken() }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      setStats(prev => ({ ...prev, totalUsers: data.users.length }));
      
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
      
      if (data.users.length > 0 && !selectedUser) {
        setSelectedUser(data.users[0]._id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  // Fetch entities from database
  const fetchEntities = async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/entities?includeDisabled=true', {
        headers: { 'Authorization': getToken() }
      });
      
      if (!response.ok) throw new Error('Failed to fetch entities');
      
      const data = await response.json();
      setEntities(data.entities || []);
      setStats(prev => ({ ...prev, totalEntities: data.entities?.length || 0 }));

      // Fetch custom fields for each entity
      const fields: Record<string, CustomField[]> = {};
      for (const entity of data.entities || []) {
        const fieldResponse = await fetch(
          `/financial-tracker/api/financial-tracker/fields?module=${entity.module}&entityId=${entity._id}&includeDisabled=true`,
          { headers: { 'Authorization': getToken() } }
        );
        if (fieldResponse.ok) {
          const fieldData = await fieldResponse.json();
          fields[`${entity.module}-${entity._id}`] = fieldData.fields || [];
        }
      }
      setCustomFields(fields);
      
      // Calculate total fields
      const totalFields = Object.values(fields).reduce((acc, curr) => acc + curr.length, 0);
      setStats(prev => ({ ...prev, totalFields }));
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/categories?active=true', {
        headers: { 'Authorization': getToken() }
      });
      
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.categories || []);
      setStats(prev => ({ ...prev, totalCategories: data.categories?.length || 0 }));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Get entities for selected module
  const filteredEntities = useMemo(() => {
    return entities.filter(e => e.module === selectedModule && e.isEnabled);
  }, [entities, selectedModule]);

  // Get fields for a specific entity
  const getEntityFields = useCallback((entityId: string) => {
    return customFields[`${selectedModule}-${entityId}`] || [];
  }, [customFields, selectedModule]);

  // Get categories for a specific entity
  const getEntityCategories = useCallback((entityKey: string) => {
    return categories.filter(c => 
      c.module === selectedModule && 
      c.entity === entityKey && 
      c.isActive
    );
  }, [categories, selectedModule]);

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

  // Toggle all columns for an entity
  const toggleAllColumns = useCallback((
    userId: string,
    module: 're' | 'expense',
    entity: string,
    type: 'view' | 'edit',
    value: boolean
  ) => {
    const entityObj = entities.find(e => e._id === entity);
    if (!entityObj) return;

    const fields = getEntityFields(entity);
    const cats = getEntityCategories(entityObj.entityKey);
    
    // System columns (basic fields)
    const systemColumns = ['name', 'createdAt', 'updatedAt', 'createdBy'];
    systemColumns.forEach(col => {
      updateColumnPermission(userId, module, entity, col, type, value);
    });

    // Custom fields
    fields.forEach(field => {
      updateColumnPermission(userId, module, entity, field.fieldKey, type, value);
    });

    // Categories
    cats.forEach(cat => {
      updateColumnPermission(userId, module, entity, `category-${cat._id}`, type, value);
    });
  }, [entities, getEntityFields, getEntityCategories, updateColumnPermission]);

  // Save permissions for a user
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
      {/* Enterprise Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
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
                  Configure granular access controls from database
                </p>
              </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Users</span>
                    <span className="text-xl font-bold text-blue-600 block leading-5">{stats.totalUsers}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <LayoutDashboard className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Entities</span>
                    <span className="text-xl font-bold text-green-600 block leading-5">{stats.totalEntities}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Grid3x3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Fields</span>
                    <span className="text-xl font-bold text-purple-600 block leading-5">{stats.totalFields}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FolderTree className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Categories</span>
                    <span className="text-xl font-bold text-amber-600 block leading-5">{stats.totalCategories}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Module</label>
              <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-sm">
                <button
                  onClick={() => setSelectedModule('re')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    selectedModule === 're'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  RE Module
                </button>
                <button
                  onClick={() => setSelectedModule('expense')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    selectedModule === 'expense'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  Expense Module
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">View Mode</label>
              <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-sm">
                <button
                  onClick={() => setViewMode('entities')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    viewMode === 'entities'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 inline mr-1" />
                  Entities
                </button>
                <button
                  onClick={() => setViewMode('fields')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    viewMode === 'fields'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 className="h-4 w-4 inline mr-1" />
                  Fields
                </button>
                <button
                  onClick={() => setViewMode('categories')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    viewMode === 'categories'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FolderTree className="h-4 w-4 inline mr-1" />
                  Categories
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">&nbsp;</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl transition-all ${
                    bulkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400 shadow-lg shadow-blue-500/25' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  {bulkMode ? 'Bulk On' : 'Bulk Mode'}
                </button>
                <button
                  onClick={fetchAllData}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white shadow-sm transition-all hover:shadow-md"
                  title="Refresh"
                >
                  <RefreshCw className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden mt-4 space-y-4 p-4 bg-white rounded-xl border-2 border-gray-200 shadow-lg animate-slideDown">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-blue-600" />
                  Quick Filters
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200">
                  <button
                    onClick={() => setSelectedModule('re')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                      selectedModule === 're'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    RE
                  </button>
                  <button
                    onClick={() => setSelectedModule('expense')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                      selectedModule === 'expense'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setViewMode('entities')}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === 'entities'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Entities
                  </button>
                  <button
                    onClick={() => setViewMode('fields')}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === 'fields'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Fields
                  </button>
                  <button
                    onClick={() => setViewMode('categories')}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === 'categories'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Categories
                  </button>
                </div>
              </div>

              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`w-full p-3 border-2 rounded-xl font-medium ${
                  bulkMode
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                {bulkMode ? 'Disable Bulk Mode' : 'Enable Bulk Mode'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User List */}
          <div className="lg:col-span-3 bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
            <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Users ({filteredUsers.length})
              </h3>
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
          <div className="lg:col-span-9">
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
                {selectedUsers.length > 0 && (
                  <button
                    onClick={bulkSavePermissions}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/25 font-medium"
                  >
                    <Save className="h-5 w-5 inline mr-2" />
                    Save All Changes
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* User Info Header */}
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
                        <p className="text-gray-500">{users.find(u => u._id === selectedUser)?.email}</p>
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

                {/* View Mode Content */}
                {viewMode === 'entities' && (
                  <div className="space-y-4">
                    {filteredEntities.map((entity) => {
                      const entityPerms = currentUserPerms[entity._id] || {
                        access: false,
                        create: false,
                        edit: false,
                        delete: false,
                        scope: 'own',
                        columns: {}
                      };
                      const isExpanded = expandedEntities.has(entity._id);
                      const fields = getEntityFields(entity._id);
                      const cats = getEntityCategories(entity.entityKey);

                      return (
                        <div key={entity._id} className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                          {/* Entity Header */}
                          <div
                            className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 flex items-center justify-between cursor-pointer hover:from-gray-100 transition-all"
                            onClick={() => toggleEntity(entity._id)}
                          >
                            <div className="flex items-center space-x-4">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                              )}
                              <div className="p-2.5 bg-blue-100 rounded-xl border-2 border-blue-200">
                                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {entity.name}
                                </h3>
                                <p className="text-sm text-gray-500">{entity.entityKey}</p>
                              </div>
                            </div>
                            <label className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all">
                              <input
                                type="checkbox"
                                checked={entityPerms.access}
                                onChange={(e) => {
                                  updatePermission(selectedUser, selectedModule, entity._id, 'access', e.target.checked);
                                  if (!e.target.checked) {
                                    updatePermission(selectedUser, selectedModule, entity._id, 'create', false);
                                    updatePermission(selectedUser, selectedModule, entity._id, 'edit', false);
                                    updatePermission(selectedUser, selectedModule, entity._id, 'delete', false);
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
                                          entity._id,
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
                                        entity._id,
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
                                        entity._id,
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
                                        entity._id,
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
                                        entity._id,
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
                                        entity._id,
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
                                      {/* System Columns */}
                                      {['name', 'createdAt', 'updatedAt', 'createdBy'].map((col) => {
                                        const columnPerms = entityPerms.columns?.[col] || {
                                          view: true,
                                          edit: false
                                        };

                                        return (
                                          <tr key={col} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900 capitalize">
                                              {col.replace(/([A-Z])/g, ' $1').trim()}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.view}
                                                onChange={(e) => updateColumnPermission(
                                                  selectedUser,
                                                  selectedModule,
                                                  entity._id,
                                                  col,
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
                                                  entity._id,
                                                  col,
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
                                      {fields.map((field) => {
                                        const columnPerms = entityPerms.columns?.[field.fieldKey] || {
                                          view: true,
                                          edit: false
                                        };

                                        return (
                                          <tr key={field._id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-3">
                                              <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-900">{field.label}</span>
                                                {field.required && (
                                                  <span className="text-xs text-red-500">*</span>
                                                )}
                                              </div>
                                              <p className="text-xs text-gray-500 font-mono">{field.fieldKey}</p>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.view}
                                                onChange={(e) => updateColumnPermission(
                                                  selectedUser,
                                                  selectedModule,
                                                  entity._id,
                                                  field.fieldKey,
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
                                                  entity._id,
                                                  field.fieldKey,
                                                  'edit',
                                                  e.target.checked
                                                )}
                                                disabled={!columnPerms.view}
                                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                              />
                                            </td>
                                            <td className="px-6 py-3">
                                              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200">
                                                {field.type}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}

                                      {/* Categories */}
                                      {cats.map((cat) => {
                                        const columnKey = `category-${cat._id}`;
                                        const columnPerms = entityPerms.columns?.[columnKey] || {
                                          view: true,
                                          edit: false
                                        };

                                        return (
                                          <tr key={cat._id} className="hover:bg-green-50 transition-colors">
                                            <td className="px-6 py-3">
                                              <div className="flex items-center space-x-2">
                                                <FolderTree className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.view}
                                                onChange={(e) => updateColumnPermission(
                                                  selectedUser,
                                                  selectedModule,
                                                  entity._id,
                                                  columnKey,
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
                                                  entity._id,
                                                  columnKey,
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
                )}

                {viewMode === 'fields' && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Permissions Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEntities.map((entity) => {
                        const fields = getEntityFields(entity._id);
                        const entityPerms = currentUserPerms[entity._id] || { columns: {} };

                        return (
                          <div key={entity._id} className="border-2 border-gray-200 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{entity.name}</h4>
                            <p className="text-sm text-gray-500 mb-3">{fields.length} custom fields</p>
                            <div className="space-y-2">
                              {fields.slice(0, 3).map(field => (
                                <div key={field._id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">{field.label}</span>
                                  <div className="flex items-center space-x-2">
                                    {entityPerms.columns?.[field.fieldKey]?.view ? (
                                      <Eye className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <EyeOff className="h-4 w-4 text-gray-300" />
                                    )}
                                    {entityPerms.columns?.[field.fieldKey]?.edit ? (
                                      <Edit3 className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <Edit3 className="h-4 w-4 text-gray-300" />
                                    )}
                                  </div>
                                </div>
                              ))}
                              {fields.length > 3 && (
                                <p className="text-xs text-gray-400">+{fields.length - 3} more fields</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {viewMode === 'categories' && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((cat) => {
                        const entity = entities.find(e => e.entityKey === cat.entity);
                        if (!entity) return null;
                        
                        const entityPerms = currentUserPerms[entity._id] || { columns: {} };
                        const columnKey = `category-${cat._id}`;

                        return (
                          <div key={cat._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-center space-x-3 mb-3">
                              <FolderTree className="h-5 w-5 text-green-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                                <p className="text-xs text-gray-500">{entity.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">View Permission</span>
                              {entityPerms.columns?.[columnKey]?.view ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Enabled</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Disabled</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-gray-600">Edit Permission</span>
                              {entityPerms.columns?.[columnKey]?.edit ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Enabled</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Disabled</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}