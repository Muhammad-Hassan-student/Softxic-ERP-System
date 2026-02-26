// src/app/admin/financial-tracker/[module]/[entity]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExcelTableMaster } from '@/app/financial-tracker/components/user/ExcelTableMaster';
import { useAdminRecords } from '@/app/financial-tracker/hooks/useAdminRecords';
import { useAdminFields } from '@/app/financial-tracker/hooks/useAdmiFields';
import { useAdminPermissions } from '@/app/financial-tracker/hooks/useAdminPermissions';
import { 
  LayoutDashboard, Users, Settings, Shield, FileText, Download, Upload, RefreshCw,
  Eye, EyeOff, Filter, Search, Home, LogOut, User, FolderTree, DollarSign, 
  CreditCard, Building2, Briefcase, Package, Home as HomeIcon, Activity, 
  BarChart3, PieChart, History, Star, Archive, Trash2, Edit, Plus, X, 
  ChevronDown, Menu, GripVertical, AlertCircle, CheckCircle, Clock,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Fullscreen, Wifi, WifiOff,
  Bell, HelpCircle, Info, Key, Lock, Unlock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, formatDate, formatDistanceToNow } from 'date-fns';

// ==================== TYPES ====================
type ModuleType = 're' | 'expense';
type ViewMode = 'records' | 'fields' | 'activity' | 'analytics' | 'settings' | 'permissions';

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface EntityData {
  _id: string;
  module: ModuleType;
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== MAIN COMPONENT ====================
export default function AdminEntityPage() {
  const params = useParams();
  const router = useRouter();
  const module = params.module as ModuleType;
  const entityKey = params.entity as string;
  
  // ==================== STATE ====================
  // User & Entity state
  const [user, setUser] = useState<UserData | null>(null);
  const [entityData, setEntityData] = useState<EntityData | null>(null);
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('records');
  const [isLoading, setIsLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Stats state
  const [stats, setStats] = useState({
    totalRecords: 0,
    todayRecords: 0,
    weekRecords: 0,
    monthRecords: 0,
    pendingApprovals: 0,
    deletedRecords: 0,
    archivedRecords: 0,
    starredRecords: 0,
    lastUpdated: new Date().toISOString(),
    storageUsed: 0,
  });
  
  // ==================== HOOKS ====================
  const {
    records,
    totalCount,
    isLoading: recordsLoading,
    createRecord,
    updateRecord,
    deleteRecord,
    bulkUpdate,
    bulkDelete,
    cloneRecord,
    exportRecords,
    importRecords,
    loadMore,
    hasMore,
    refreshRecords,
    getStats,
    toggleStar,
    toggleArchive,
    restoreRecord,
    searchRecords,
  } = useAdminRecords(module, entityKey);
  
  const {
    fields,
    isLoading: fieldsLoading,
    refreshFields,
  } = useAdminFields(module, entityKey);
  
  const {
    permissions,
    isLoading: permissionsLoading,
    fetchPermissions,
    fetchUserPermissions,
    updateUserPermissions,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canEditColumn,
    canViewColumn,
  } = useAdminPermissions(module, entityKey);
  
const fetchEntityData = useCallback(async () => {
  try {
    // ✅ Token check karne ki zaroorat nahi - cookie automatically jayegi
    console.log('📡 Fetching entities for module:', module);
    
    const entityRes = await fetch(`/financial-tracker/api/financial-tracker/entities?module=${module}`, {
      credentials: 'include', // 👈 YEH COOKIES BHEJTA HAI
      headers: {
        'Content-Type': 'application/json'
        // Authorization header ki zaroorat nahi!
      }
    });

    console.log('📊 Response status:', entityRes.status);

    if (entityRes.status === 401) {
      console.log('❌ Unauthorized - redirecting to login');
      router.push('/login?reason=session-expired');
      return;
    }

    if (!entityRes.ok) {
      const errorText = await entityRes.text();
      console.error('❌ API Error:', errorText);
      toast.error('Failed to fetch entities');
      return;
    }

    const data = await entityRes.json();
    console.log('✅ Entities fetched:', data);
    
    const entity = data.entities?.find((e: any) => e.entityKey === entityKey);
    if (entity) {
      setEntityData(entity);
    } else {
      console.log(`❌ Entity "${entityKey}" not found`);
      toast.error(`Entity "${entityKey}" not found`);
    }
    
  } catch (error) {
    console.error('❌ Error in fetchEntityData:', error);
    toast.error('Failed to load entity data');
  }
}, [module, entityKey, router]);
  // ==================== USER DATA ====================
  const fetchUserData = useCallback(async () => {
  try {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      // ❌ Yahan bhi redirect mat karo
      console.log('No token found');
      return;
    }

    const userRes = await fetch('/api/auth/me', {
      headers: { Authorization: token }
    });
    
    if (!userRes.ok) {
      if (userRes.status === 401) {
        console.log('❌ Session expired');
        // ✅ Sirf toast, redirect nahi
        toast.error('Your session has expired. Please login again.');
        return;
      }
      throw new Error(`Failed to fetch user: ${userRes.status}`);
    }
    
    const userData = await userRes.json();
    if (userData.success && userData.data) {
      setUser(userData.data);
    }
  } catch (error) {
    console.error('❌ Error loading user:', error);
    // ❌ YAHAN SE HATA DO router.push('/login')
    toast.error('Failed to load user data');
  }
}, [router]); // router dependency hata bhi sakte ho
  // ==================== INITIAL LOAD ====================
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchEntityData(),
        fetchPermissions(),
      ]);
      setIsLoading(false);
    };
    
    loadInitialData();
  }, [fetchUserData, fetchEntityData, fetchPermissions]);

  // ==================== STATS ====================
  useEffect(() => {
    if (records.length > 0) {
      loadStats();
    }
  }, [records]);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // ==================== BULK ACTIONS ====================
  const handleBulkDelete = async () => {
    if (selectedRecords.length === 0) return;
    
    if (confirm(`Delete ${selectedRecords.length} records permanently?`)) {
      try {
        await bulkDelete(selectedRecords);
        setSelectedRecords([]);
        toast.success(`Deleted ${selectedRecords.length} records`);
        loadStats();
      } catch (error) {
        toast.error('Failed to delete records');
      }
    }
  };

  const handleBulkArchive = async () => {
    if (selectedRecords.length === 0) return;
    
    try {
      await bulkUpdate(selectedRecords, { archived: true });
      setSelectedRecords([]);
      toast.success(`Archived ${selectedRecords.length} records`);
      loadStats();
    } catch (error) {
      toast.error('Failed to archive records');
    }
  };

  const handleBulkStar = async () => {
    if (selectedRecords.length === 0) return;
    
    try {
      await bulkUpdate(selectedRecords, { starred: true });
      setSelectedRecords([]);
      toast.success(`Starred ${selectedRecords.length} records`);
      loadStats();
    } catch (error) {
      toast.error('Failed to star records');
    }
  };

  const handleBulkRestore = async () => {
    if (selectedRecords.length === 0) return;
    
    try {
      await Promise.all(selectedRecords.map(id => restoreRecord(id)));
      setSelectedRecords([]);
      toast.success(`Restored ${selectedRecords.length} records`);
      loadStats();
    } catch (error) {
      toast.error('Failed to restore records');
    }
  };

  // ==================== EXPORT/IMPORT ====================
  const handleExport = async (format: 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html' | 'markdown' | 'yaml' | 'toml' | 'sql' | 'graphql'): Promise<Blob> => {
    try {
      const blob = await exportRecords(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `${module}-${entityKey}-${formatDate(new Date(), 'yyyy-MM-dd')}.${
        format === 'excel' ? 'xlsx' : format
      }`;
      a.href = url;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
      return blob;
    } catch (error) {
      toast.error('Export failed');
      throw error;
    }
  };

  const handleImport = async (file: File): Promise<{ success: number; failed: number; errors: any[] }> => {
    try {
      const result = await importRecords(file);
      toast.success(`Imported ${result.success} records, ${result.failed} failed`);
      refreshRecords();
      loadStats();
      return result;
    } catch (error) {
      toast.error('Import failed');
      throw error;
    }
  };

  // ==================== SEARCH ====================
  const handleSearch = async (term: string) => {
    if (!term) {
      refreshRecords();
      return;
    }
    await searchRecords(term);
  };

  // ==================== TOGGLE FUNCTIONS ====================
  const handleToggleStar = async (recordId: string) => {
    try {
      await toggleStar(recordId);
      loadStats();
    } catch (error) {
      toast.error('Failed to toggle star');
    }
  };

  const handleToggleArchive = async (recordId: string) => {
    try {
      await toggleArchive(recordId);
      loadStats();
    } catch (error) {
      toast.error('Failed to toggle archive');
    }
  };

  // ==================== PERMISSIONS FUNCTIONS ====================
  const handleViewUserPermissions = async (userId: string) => {
    setSelectedUserId(userId);
    const userPerms = await fetchUserPermissions(userId);
    if (userPerms) {
      setShowPermissionsModal(true);
    }
  };

  const handleUpdateUserPermissions = async (userId: string, newPermissions: any) => {
    try {
      await updateUserPermissions(userId, newPermissions);
      toast.success('Permissions updated successfully');
      setShowPermissionsModal(false);
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  // ==================== LOGOUT ====================
  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  // ==================== ZOOM CONTROLS ====================
  const handleZoomIn = () => setZoom(z => Math.min(150, z + 10));
  const handleZoomOut = () => setZoom(z => Math.max(70, z - 10));
  const handleZoomReset = () => setZoom(100);
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ==================== PERMISSION CHECKS FOR UI ====================
  const showRecordsSection = canView;
  const showCreateButton = canCreate;
  const showDeleteButton = canDelete;
  const showEditOptions = canEdit;

  // ==================== ENTITY ICON/COLOR ====================
  const getEntityIcon = useMemo(() => {
    switch (entityKey) {
      case 'dealer': return Users;
      case 'fhh-client': return Users;
      case 'cp-client': return Users;
      case 'builder': return Briefcase;
      case 'project': return Package;
      case 'office': return HomeIcon;
      default: return Building2;
    }
  }, [entityKey]);

  const getEntityColor = useMemo(() => {
    switch (entityKey) {
      case 'dealer': return 'blue';
      case 'fhh-client': return 'green';
      case 'cp-client': return 'purple';
      case 'builder': return 'orange';
      case 'project': return 'pink';
      case 'office': return 'indigo';
      default: return 'gray';
    }
  }, [entityKey]);

  const EntityIcon = getEntityIcon;
  const entityColor = getEntityColor;

  // ==================== LOADING STATE ====================
  if (isLoading || recordsLoading || fieldsLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-2xl border border-gray-200">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading {entityKey}...</p>
          <p className="text-sm text-gray-500">Please wait while we prepare your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* ==================== HEADER ==================== */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/financial-tracker')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <Home className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className={`relative p-3 bg-gradient-to-r from-${entityColor}-600 to-${entityColor}-700 rounded-2xl shadow-lg`}>
                  <EntityIcon className="h-7 w-7 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  {entityData?.name || entityKey.charAt(0).toUpperCase() + entityKey.slice(1).replace('-', ' ')}
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                    Admin Panel • {module.toUpperCase()} Module • {totalCount.toLocaleString()} Records
                  </p>
                  {entityData?.enableApproval && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200">
                      Approval Workflow
                    </span>
                  )}
                  {!entityData?.isEnabled && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                      Disabled
                    </span>
                  )}
                  
                  {/* Permission Badges */}
                  {canView && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full border border-green-200 flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </span>
                  )}
                  {canCreate && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 flex items-center">
                      <Plus className="h-3 w-3 mr-1" />
                      Create
                    </span>
                  )}
                  {canEdit && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-200 flex items-center">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </span>
                  )}
                  {canDelete && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full border border-red-200 flex items-center">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Bulk Actions Bar - Shows when records selected */}
              {selectedRecords.length > 0 && (
                <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 shadow-md px-3 py-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedRecords.length} selected
                  </span>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  
                  {/* Star button - only if user can edit */}
                  {canEdit && (
                    <button
                      onClick={handleBulkStar}
                      className="p-1 hover:bg-yellow-50 rounded text-yellow-600"
                      title="Star Selected"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Archive button - only if user can edit */}
                  {canEdit && (
                    <button
                      onClick={handleBulkArchive}
                      className="p-1 hover:bg-pink-50 rounded text-pink-600"
                      title="Archive Selected"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Restore button - only if user can edit */}
                  {canEdit && (
                    <button
                      onClick={handleBulkRestore}
                      className="p-1 hover:bg-green-50 rounded text-green-600"
                      title="Restore Selected"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Delete button - only if user can delete */}
                  {canDelete && (
                    <button
                      onClick={handleBulkDelete}
                      className="p-1 hover:bg-red-50 rounded text-red-600"
                      title="Delete Selected"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Connection Status */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-50 rounded-l-lg border-r border-gray-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4 text-gray-600" />
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-50 rounded-r-lg border-l border-gray-200"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <button
                onClick={handleZoomReset}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm"
                title="Reset Zoom"
              >
                <Maximize2 className="h-4 w-4 text-gray-600" />
              </button>

              <button
                onClick={handleFullscreen}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4 text-gray-600" /> : <Fullscreen className="h-4 w-4 text-gray-600" />}
              </button>

              {/* Admin Badge */}
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">Admin</span>
              </div>

              {/* Permissions Button */}
              <button
                onClick={() => setShowPermissionsModal(true)}
                className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                title="Manage Permissions"
              >
                <Key className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Permissions</span>
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.fullName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 hidden group-hover:block z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.fullName || 'Admin User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                    <p className="text-xs text-purple-600 mt-1 capitalize">{user?.role || 'admin'}</p>
                  </div>
                  <button
                    onClick={() => router.push('/admin/profile')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    Profile
                  </button>
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2 text-gray-500" />
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - 8 Column Grid with Perfect Proportions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-xl font-bold text-blue-700">{stats.totalRecords.toLocaleString()}</p>
              <p className="text-[10px] text-blue-500 mt-1">records</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Today</p>
              <p className="text-xl font-bold text-green-700">{stats.todayRecords.toLocaleString()}</p>
              <p className="text-[10px] text-green-500 mt-1">new</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Week</p>
              <p className="text-xl font-bold text-purple-700">{stats.weekRecords.toLocaleString()}</p>
              <p className="text-[10px] text-purple-500 mt-1">this week</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium">Month</p>
              <p className="text-xl font-bold text-yellow-700">{stats.monthRecords.toLocaleString()}</p>
              <p className="text-[10px] text-yellow-500 mt-1">this month</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Pending</p>
              <p className="text-xl font-bold text-red-700">{stats.pendingApprovals.toLocaleString()}</p>
              <p className="text-[10px] text-red-500 mt-1">approvals</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium">Deleted</p>
              <p className="text-xl font-bold text-indigo-700">{stats.deletedRecords.toLocaleString()}</p>
              <p className="text-[10px] text-indigo-500 mt-1">soft deleted</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 border border-pink-200">
              <p className="text-xs text-pink-600 font-medium">Archived</p>
              <p className="text-xl font-bold text-pink-700">{stats.archivedRecords.toLocaleString()}</p>
              <p className="text-[10px] text-pink-500 mt-1">archived</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Starred</p>
              <p className="text-xl font-bold text-orange-700">{stats.starredRecords.toLocaleString()}</p>
              <p className="text-[10px] text-orange-500 mt-1">favorites</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex items-center justify-between mt-4 border-b border-gray-200">
            <div className="flex space-x-6 overflow-x-auto pb-1">
              <button
                onClick={() => setViewMode('records')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  viewMode === 'records'
                    ? `border-${entityColor}-600 text-${entityColor}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Records</span>
                <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                  {totalCount}
                </span>
              </button>
              
              <button
                onClick={() => setViewMode('fields')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  viewMode === 'fields'
                    ? `border-${entityColor}-600 text-${entityColor}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FolderTree className="h-4 w-4" />
                <span>Fields</span>
                <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                  {fields.length}
                </span>
              </button>
              
              <button
                onClick={() => setViewMode('permissions')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  viewMode === 'permissions'
                    ? `border-${entityColor}-600 text-${entityColor}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Key className="h-4 w-4" />
                <span>Permissions</span>
                {permissions && (
                  <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {Object.keys(permissions?.[module]?.[entityKey]?.columns || {}).length || 0}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setViewMode('activity')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  viewMode === 'activity'
                    ? `border-${entityColor}-600 text-${entityColor}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Activity</span>
              </button>
              
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  viewMode === 'analytics'
                    ? `border-${entityColor}-600 text-${entityColor}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
              
              <button
                onClick={() => setViewMode('settings')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  viewMode === 'settings'
                    ? `border-${entityColor}-600 text-${entityColor}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshRecords}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-lg ${
                  isFilterOpen ? `bg-${entityColor}-100 text-${entityColor}-600` : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Toggle Filters"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Search & Filter Panel */}
          {viewMode === 'records' && showRecordsSection && (
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search across all fields... (Press Enter to search)"
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(quickFilter)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Panel */}
              {isFilterOpen && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option>All Time</option>
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option>All Status</option>
                        <option>Draft</option>
                        <option>Submitted</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Show</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option>All Records</option>
                        <option>Starred Only</option>
                        <option>Archived Only</option>
                        <option>Deleted Only</option>
                      </select>
                    </div>
                    <div className="flex items-end space-x-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Apply
                      </button>
                      <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="p-4 sm:p-6 lg:p-8" style={{ zoom: `${zoom}%` }}>
        {viewMode === 'records' && showRecordsSection && (
          <ExcelTableMaster
            module={module}
            entity={entityKey}
            fields={fields}
            initialRecords={records}
            totalCount={totalCount}
            onCreate={createRecord}
            onUpdate={updateRecord}
            onDelete={deleteRecord}
            onBulkUpdate={showEditOptions ? bulkUpdate : undefined}
            onBulkDelete={showDeleteButton ? bulkDelete : undefined}
            onClone={showCreateButton ? cloneRecord : undefined}
            onExport={handleExport}
            onImport={handleImport}
            onLoadMore={loadMore}
            hasMore={hasMore}
            enableRealtime={true}
            enableUndo={true}
            enableRedo={true}
            enableComments={true}
            enableAttachments={true}
            enableVersionHistory={true}
            enableAuditLog={true}
            enableStarred={true}
            enableArchived={true}
            enableTags={true}
            enableGrouping={true}
            enablePivot={true}
            enableCharts={true}
            enableKanban={true}
            enableCalendar={true}
            enableGantt={true}
            enableTimeline={true}
            enableMap={true}
            enableGallery={true}
            enableAI={true}
            enableShortcuts={true}
            className="shadow-2xl"
          />
        )}

        {viewMode === 'permissions' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Permission Configuration</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchPermissions()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Current User Permissions */}
            <div className="mb-8">
              <h3 className="font-medium text-gray-700 mb-4">Your Permissions</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border-2 ${canView ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <Eye className={`h-6 w-6 mb-2 ${canView ? 'text-green-600' : 'text-gray-400'}`} />
                  <p className="font-medium">View</p>
                  <p className="text-xs text-gray-500 mt-1">{canView ? 'Allowed' : 'Not Allowed'}</p>
                </div>
                <div className={`p-4 rounded-lg border-2 ${canCreate ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <Plus className={`h-6 w-6 mb-2 ${canCreate ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-medium">Create</p>
                  <p className="text-xs text-gray-500 mt-1">{canCreate ? 'Allowed' : 'Not Allowed'}</p>
                </div>
                <div className={`p-4 rounded-lg border-2 ${canEdit ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                  <Edit className={`h-6 w-6 mb-2 ${canEdit ? 'text-yellow-600' : 'text-gray-400'}`} />
                  <p className="font-medium">Edit</p>
                  <p className="text-xs text-gray-500 mt-1">{canEdit ? 'Allowed' : 'Not Allowed'}</p>
                </div>
                <div className={`p-4 rounded-lg border-2 ${canDelete ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <Trash2 className={`h-6 w-6 mb-2 ${canDelete ? 'text-red-600' : 'text-gray-400'}`} />
                  <p className="font-medium">Delete</p>
                  <p className="text-xs text-gray-500 mt-1">{canDelete ? 'Allowed' : 'Not Allowed'}</p>
                </div>
              </div>
            </div>

            {/* Column Permissions */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4">Column Permissions</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fields.map((field: any) => (
                      <tr key={field._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {field.label}
                          <p className="text-xs text-gray-500 font-mono">{field.fieldKey}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {canViewColumn(field.fieldKey) ? (
                            <Eye className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <EyeOff className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {canEditColumn(field.fieldKey) ? (
                            <Edit className="h-5 w-5 text-blue-500 mx-auto" />
                          ) : (
                            <Lock className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'fields' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Field Configuration</h2>
              {canCreate && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </button>
              )}
            </div>

            <div className="space-y-2">
              {fields.map((field:any, index:any) => (
                <div
                  key={field._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div>
                      <h3 className="font-medium">{field.label}</h3>
                      <p className="text-xs text-gray-500 font-mono">{field.fieldKey}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      field.type === 'text' ? 'bg-blue-100 text-blue-800' :
                      field.type === 'number' ? 'bg-green-100 text-green-800' :
                      field.type === 'date' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Required
                      </span>
                    )}
                    {field.isSystem && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        System
                      </span>
                    )}
                    
                    {/* Show view/edit status based on permissions */}
                    {canViewColumn(field.fieldKey) ? (
                      <span className="p-1 text-green-600" title="Can View">
                        <Eye className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="p-1 text-gray-400" title="Cannot View">
                        <EyeOff className="h-4 w-4" />
                      </span>
                    )}
                    
                    {canEditColumn(field.fieldKey) ? (
                      <span className="p-1 text-blue-600" title="Can Edit">
                        <Edit className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="p-1 text-gray-400" title="Cannot Edit">
                        <Lock className="h-4 w-4" />
                      </span>
                    )}
                    
                    {canEdit && (
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'activity' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Admin User</span> created a new record
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date())} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              <h2 className="text-lg font-bold mb-4">Performance Analytics</h2>
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">Chart will be displayed here</p>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <h2 className="text-lg font-bold mb-4">Quick Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="font-bold">{(stats.storageUsed / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-bold">{formatDistanceToNow(new Date(stats.lastUpdated))} ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-w-2xl">
            <h2 className="text-lg font-bold mb-4">Entity Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entity Name</label>
                <input
                  type="text"
                  value={entityData?.name || ''}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Entity Key</label>
                <input
                  type="text"
                  value={entityData?.entityKey || ''}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-mono"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={entityData?.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Module</label>
                <input
                  type="text"
                  value={module.toUpperCase()}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Fields</label>
                <input
                  type="text"
                  value={fields.length}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Created</label>
                <input
                  type="text"
                  value={entityData?.createdAt ? format(new Date(entityData.createdAt), 'PPP p') : 'N/A'}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Updated</label>
                <input
                  type="text"
                  value={entityData?.updatedAt ? format(new Date(entityData.updatedAt), 'PPP p') : 'N/A'}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div className="pt-4 flex space-x-3">
                {canEdit && (
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                    Edit Entity
                  </button>
                )}
                {canDelete && (
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Archive Entity
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== PERMISSIONS MODAL ==================== */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Permission Details</h2>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Current user has the following permissions for {entityKey}:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Access</p>
                  <p className={`text-lg font-bold ${canView ? 'text-green-600' : 'text-red-600'}`}>
                    {canView ? 'Granted' : 'Denied'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Create</p>
                  <p className={`text-lg font-bold ${canCreate ? 'text-green-600' : 'text-red-600'}`}>
                    {canCreate ? 'Granted' : 'Denied'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Edit</p>
                  <p className={`text-lg font-bold ${canEdit ? 'text-green-600' : 'text-red-600'}`}>
                    {canEdit ? 'Granted' : 'Denied'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Delete</p>
                  <p className={`text-lg font-bold ${canDelete ? 'text-green-600' : 'text-red-600'}`}>
                    {canDelete ? 'Granted' : 'Denied'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-3">Column Permissions</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {fields.map((field: any) => (
                    <div key={field._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{field.label}</span>
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs flex items-center ${canViewColumn(field.fieldKey) ? 'text-green-600' : 'text-gray-400'}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </span>
                        <span className={`text-xs flex items-center ${canEditColumn(field.fieldKey) ? 'text-blue-600' : 'text-gray-400'}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}