// src/app/admin/financial-tracker/[module]/[entity]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExcelTableMaster } from '@/app/financial-tracker/components/user/ExcelTableMaster';
import { useAdminRecords } from '@/app/financial-tracker/hooks/useAdminRecords';
import { useAdminFields } from '@/app/financial-tracker/hooks/useAdmiFields';
import { useAdminPermissions } from '@/app/financial-tracker/hooks/useAdminPermissions';
import { ExportFormat } from '@/app/financial-tracker/types';

import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  History,
  GitCompare,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Star,
  Archive,
  Tag,
  MessageSquare,
  Paperclip,
  Copy,
  Trash2,
  Edit,
  Plus,
  Filter,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  Database,
  Server,
  HardDrive,
  Cpu,
  Network,
  Cloud,
  CloudOff,
  Bell,
  BellRing,
  Mail,
  MessageCircle,
  HelpCircle,
  Info,
  AlertCircle,
  Home,
  LogOut,
  User,
  FolderTree,
  DollarSign,
  CreditCard,
  Building2,
  Briefcase,
  Package,
  Home as HomeIcon,
  GripVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, formatDate, formatDistanceToNow } from 'date-fns';

type ModuleType = 're' | 'expense';
type ViewMode = 'records' | 'activity' | 'audit' | 'analytics' | 'settings' | 'fields';

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function AdminEntityPage() {
  const params = useParams();
  const router = useRouter();
  const module = params.module as ModuleType;
  const entity = params.entity as string;
  
  // User state
  const [user, setUser] = useState<UserData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('records');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'rejected'>('all');
  
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
    totalComments: 0,
    totalAttachments: 0,
    lastUpdated: new Date().toISOString(),
    usersActive: 0,
    storageUsed: 0,
  });
  
  // Hooks
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
  } = useAdminRecords(module, entity);
  
  const {
    fields,
    isLoading: fieldsLoading,
    refreshFields,
    createField,
    updateField,
    deleteField,
    toggleField,
    reorderFields,
  } = useAdminFields(module, entity);
  
  const {
    permissions,
    canCreate,
    canEdit,
    canDelete,
    canEditColumn,
    canViewColumn,
    updatePermissions,
    refreshPermissions,
  } = useAdminPermissions(module, entity);
  
  // Load user data
  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      router.push('/');
      return;
    }

    // Fetch user data
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);
  
  // Load stats
  useEffect(() => {
    loadStats();
  }, [records]);
  
  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  
  // Handle bulk actions
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
  
  const handleExport = async (exportFormat: ExportFormat): Promise<Blob> => {
    try {
      const blob = await exportRecords(exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // ✅ Use formatDate function
      a.download = `${module}-${entity}-${formatDate(new Date(), 'yyyy-MM-dd')}.${
        exportFormat === 'excel' ? 'xlsx' : exportFormat
      }`;
      
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${exportFormat.toUpperCase()}`);
      return blob;
    } catch (error) {
      toast.error('Export failed');
      throw error;
    }
  };
  
  // ✅ FIXED: handleImport returns Promise<ImportResult>
  const handleImport = async (file: File): Promise<{ success: number; failed: number; errors: any[] }> => {
    try {
      const result = await importRecords(file);
      toast.success(`Imported ${result.success} records, ${result.failed} failed`);
      refreshRecords();
      loadStats();
      return result; // ✅ Return result
    } catch (error) {
      toast.error('Import failed');
      throw error; // ✅ Throw error
    }
  };
  
  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };
  
  const handleSearch = async (term: string) => {
    if (!term) {
      refreshRecords();
      return;
    }
    const results = await searchRecords(term);
    // Handle search results - ExcelTableMaster will handle filtering internally
  };
  
  // Get entity icon
  const getEntityIcon = () => {
    switch (entity) {
      case 'dealer': return Users;
      case 'fhh-client': return Users;
      case 'cp-client': return Users;
      case 'builder': return Briefcase;
      case 'project': return Package;
      case 'office': return HomeIcon;
      default: return Building2;
    }
  };
  
  // Get entity color
  const getEntityColor = () => {
    switch (entity) {
      case 'dealer': return 'blue';
      case 'fhh-client': return 'green';
      case 'cp-client': return 'purple';
      case 'builder': return 'orange';
      case 'project': return 'pink';
      case 'office': return 'indigo';
      default: return 'gray';
    }
  };
  
  const EntityIcon = getEntityIcon();
  const entityColor = getEntityColor();
  
  if (fieldsLoading || recordsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-2xl border border-gray-200">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading {entity}...</p>
          <p className="text-sm text-gray-500">Please wait while we prepare your data</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
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
                  {entity.charAt(0).toUpperCase() + entity.slice(1).replace('-', ' ')} Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                  Admin Panel • {module.toUpperCase()} Module • {totalCount.toLocaleString()} Records
                  {stats.storageUsed > 0 && ` • ${(stats.storageUsed / 1024 / 1024).toFixed(1)} MB`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
              
              {/* Admin Badge */}
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">Admin</span>
              </div>
              
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
          
          {/* Stats Cards */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
              <p className="text-xs text-blue-600">Total</p>
              <p className="text-xl font-bold text-blue-700">{stats.totalRecords.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
              <p className="text-xs text-green-600">Today</p>
              <p className="text-xl font-bold text-green-700">{stats.todayRecords.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
              <p className="text-xs text-purple-600">Week</p>
              <p className="text-xl font-bold text-purple-700">{stats.weekRecords.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600">Month</p>
              <p className="text-xl font-bold text-yellow-700">{stats.monthRecords.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
              <p className="text-xs text-red-600">Pending</p>
              <p className="text-xl font-bold text-red-700">{stats.pendingApprovals.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-200">
              <p className="text-xs text-indigo-600">Deleted</p>
              <p className="text-xl font-bold text-indigo-700">{stats.deletedRecords.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 border border-pink-200">
              <p className="text-xs text-pink-600">Archived</p>
              <p className="text-xl font-bold text-pink-700">{stats.archivedRecords.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
              <p className="text-xs text-orange-600">Starred</p>
              <p className="text-xl font-bold text-orange-700">{stats.starredRecords.toLocaleString()}</p>
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
                onClick={() => setViewMode('audit')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  viewMode === 'audit'
                    ? `border-${entityColor}-600 text-${entityColor}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Audit Trail</span>
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
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg ${
                  showFilters ? `bg-${entityColor}-100 text-${entityColor}-600` : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Toggle Filters"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Quick Filter */}
          {viewMode === 'records' && (
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
              {showFilters && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-lg">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Show</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="all">All Records</option>
                        <option value="starred">Starred Only</option>
                        <option value="archived">Archived Only</option>
                        <option value="deleted">Deleted Only</option>
                      </select>
                    </div>
                    <div className="flex items-end space-x-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Apply Filters
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
      
      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {viewMode === 'records' && (
          <ExcelTableMaster
            module={module}
            entity={entity}
            fields={fields}
            initialRecords={records}
            totalCount={totalCount}
            onCreate={createRecord}
            onUpdate={updateRecord}
            onDelete={deleteRecord}
            onBulkUpdate={bulkUpdate}
            onBulkDelete={bulkDelete}
            onClone={cloneRecord}
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
            enableWorkflow={true}
            enableAutomation={true}
            enableNotifications={true}
            enableWebhooks={true}
            enableShortcuts={true}
            className="shadow-2xl"
          />
        )}
        
        {viewMode === 'fields' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Field Configuration</h2>
              <button
                onClick={() => {/* Open field creation modal */}}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </button>
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
                    <button
                      onClick={() => toggleField(field._id)}
                      className={`p-1 rounded hover:bg-gray-200 ${
                        field.isEnabled ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {field.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
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
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              <h2 className="text-lg font-bold mb-4">Performance Analytics</h2>
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">Chart will be displayed here</p>
              </div>
            </div>
            <div className="col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <h2 className="text-lg font-bold mb-4">Quick Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-bold">{stats.usersActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Today</span>
                    <span className="font-bold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="font-bold">{(stats.storageUsed / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response</span>
                    <span className="font-bold">124ms</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <h2 className="text-lg font-bold mb-4">Top Users</h2>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium">U{i}</span>
                        </div>
                        <span className="text-sm">User {i}</span>
                      </div>
                      <span className="text-sm font-medium">{Math.floor(Math.random() * 100)} records</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
            <h2 className="text-lg font-bold mb-4">Entity Settings</h2>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium mb-1">Entity Name</label>
                <input
                  type="text"
                  value={entity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                <label className="block text-sm font-medium mb-1">Last Updated</label>
                <input
                  type="text"
                  value={stats.lastUpdated ? format(new Date(stats.lastUpdated), 'PPP p') : 'Never'}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div className="pt-4">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Archive Entity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}