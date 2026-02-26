// src/app/admin/financial-tracker/all-records/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  // Core Icons
  FileText, Download, RefreshCw, Filter, Search, 
  CheckCircle, XCircle, AlertCircle, Info, Bell, Activity,
  LayoutDashboard, TrendingUp, TrendingDown, Calendar,
  Clock, Eye, Edit, Trash2, Copy, Star, Archive,
  ArrowUp, ArrowDown, ChevronsUpDown, Grid3x3, List,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Fullscreen,
  Wifi, WifiOff, Database, Server, HardDrive, Cpu,
  Globe, Lock, Unlock, Shield, Key, Users, User,
  DollarSign, CreditCard, Wallet, Banknote, Coins,
  Package, ShoppingBag, Home, Briefcase, Building2,
  ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight,
  Plus, Save, X, Settings2, Sliders, GripVertical,
  Move, Menu, MoreVertical, MoreHorizontal, PanelLeft,
  PanelRight, FilterX, SlidersHorizontal, Printer,
  RotateCcw, RotateCw, Sun, Moon, Cloud, Sparkles,
  Rocket, Zap, Award, Crown, Medal, Gem, Diamond,
  Flame, Droplets, Wind, Snowflake, Umbrella,
  Thermometer, Gauge, Compass, Target, Crosshair,
  Heart, ThumbsUp, Share, Send, AtSign, Hash,
  Banknote as BanknoteIcon, Coins as CoinsIcon,
  PiggyBank, ShoppingBag as ShoppingBagIcon,
  Box, Boxes, Warehouse, Truck, Plane, Ship,
  Bike, Bus, Car, Train, MapPin, MapPinned,
  Navigation, Locate, Satellite, Radio, Antenna,
  Bluetooth, Monitor, Tv, Tablet, Smartphone,
  Watch, Headphones, Speaker, Mic, Camera,
  Video, Film, Music, Disc, Podcast, Gamepad,
  Puzzle, Palette, Paintbrush, Brush, Pen,
  Highlighter, Type, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  MessageSquare,
  Paperclip,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, formatDate, formatDistanceToNow } from 'date-fns';

// ==================== TYPES ====================
type ModuleType = 're' | 'expense' | 'all';
type ViewMode = 'table' | 'grid' | 'kanban' | 'calendar';
type SortField = 'createdAt' | 'updatedAt' | 'amount' | 'status' | 'module';
type SortOrder = 'asc' | 'desc';
type BulkAction = 'delete' | 'approve' | 'reject' | 'star' | 'unstar' | 'archive' | 'unarchive' | 'export';

// 🔥 FIXED: Renamed from 'Record' to 'DataRecord' to avoid conflict with built-in Record type
interface DataRecord {
  _id: string;
  module: 're' | 'expense';
  entity: string;
  data: Record<string, any>;  // 👈 Now uses built-in Record type correctly
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  version: number;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  updatedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  starred?: boolean;
  archived?: boolean;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  attachments?: number;
  comments?: number;
}

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  color?: string;
  stats?: {
    total: number;
    today: number;
    pending: number;
    totalAmount?: number;
  };
  fields?: {
    total: number;
    required: number;
    system: number;
    custom: number;
  };
  users?: {
    total: number;
    active: number;
  };
}

interface Filters {
  module: ModuleType;
  entity: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  createdBy: string;
  minAmount: string;
  maxAmount: string;
  search: string;
  tags: string[];
  priority: string[];
  starred: boolean | null;
  archived: boolean | null;
}

interface Stats {
  total: number;
  re: number;
  expense: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  today: number;
  week: number;
  month: number;
  starred: number;
  archived: number;
  totalAmount: number;
  avgAmount: number;
}

interface ExportFormat {
  label: string;
  value: 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html';
  icon: any;
  color: string;
}

interface Activity {
  id: string;
  user: string;
  userAvatar?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'STAR' | 'ARCHIVE';
  module: 're' | 'expense' | 'admin';
  entity: string;
  recordId?: string;
  timestamp: string;
  details?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
    borderColor: string;
    backgroundColor: string;
  }>;
  summary: {
    totalRE: number;
    totalExpense: number;
    totalProfit: number;
    avgRE: number;
    avgExpense: number;
  };
}

interface SystemStats {
  totalRecords: number;
  totalUsers: number;
  activeUsers: number;
  totalEntities: number;
  totalFields: number;
  storageUsed: number;
  apiCalls: number;
  avgResponseTime: number;
  uptime: number;
  lastBackup: string;
  health: 'healthy' | 'warning' | 'error';
  trends: {
    records: number;
    re: number;
    expense: number;
    profit: number;
    users: number;
  };
  system: {
    memory: {
      total: number;
      free: number;
      used: number;
      usage: number;
    };
    cpu: {
      load: number;
      cores: number;
    };
    uptime: number;
    platform: string;
    arch: string;
  };
}

// ==================== CONSTANTS ====================
const EXPORT_FORMATS: ExportFormat[] = [
  { label: 'Excel (.xlsx)', value: 'excel', icon: FileText, color: 'text-green-600' },
  { label: 'CSV (.csv)', value: 'csv', icon: FileText, color: 'text-blue-600' },
  { label: 'PDF (.pdf)', value: 'pdf', icon: FileText, color: 'text-red-600' },
  { label: 'JSON (.json)', value: 'json', icon: FileText, color: 'text-yellow-600' },
  { label: 'XML (.xml)', value: 'xml', icon: FileText, color: 'text-purple-600' },
  { label: 'HTML (.html)', value: 'html', icon: FileText, color: 'text-orange-600' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status', icon: null, color: 'gray' },
  { value: 'draft', label: 'Draft', icon: Clock, color: 'gray' },
  { value: 'submitted', label: 'Submitted', icon: AlertCircle, color: 'yellow' },
  { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'green' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'blue' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
];

// ==================== UTILITIES ====================
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getEntityColor = (entityKey: string): string => {
  const colorMap: Record<string, string> = {
    dealer: 'blue',
    'fhh-client': 'green',
    'cp-client': 'purple',
    builder: 'orange',
    project: 'pink',
    'office-lunch': 'indigo',
    travel: 'yellow',
    equipment: 'red',
    salary: 'teal',
    marketing: 'cyan'
  };
  return colorMap[entityKey] || 'gray';
};

// ==================== MAIN COMPONENT ====================
export default function AllRecordsPage() {
  const router = useRouter();
  
  // ==================== STATE ====================
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState<Filters>({
    module: 'all',
    entity: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    createdBy: '',
    minAmount: '',
    maxAmount: '',
    search: '',
    tags: [],
    priority: [],
    starred: null,
    archived: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [entities, setEntities] = useState<Entity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  
  const [stats, setStats] = useState<Stats>({
    total: 0,
    re: 0,
    expense: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    today: 0,
    week: 0,
    month: 0,
    starred: 0,
    archived: 0,
    totalAmount: 0,
    avgAmount: 0
  });

  // ==================== API CALLS ====================
  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortField,
        sortOrder
      });
      
      if (filters.module !== 'all') params.append('module', filters.module);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.createdBy) params.append('createdBy', filters.createdBy);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags.length) params.append('tags', filters.tags.join(','));
      if (filters.priority.length) params.append('priority', filters.priority.join(','));
      if (filters.starred !== null) params.append('starred', filters.starred.toString());
      if (filters.archived !== null) params.append('archived', filters.archived.toString());

      const response = await fetch(`/financial-tracker/api/financial-tracker/records?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?reason=session-expired');
          return;
        }
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();
      setRecords(data.records || []);
      setTotalCount(data.total || 0);
      
      // Calculate stats
      const recordsList = data.records || [];
      const totalAmount = recordsList.reduce((acc: number, r: DataRecord) => 
        acc + (r.data.amount || r.data.total || 0), 0);
      
      setStats({
        total: data.total || 0,
        re: data.stats?.re || recordsList.filter((r: DataRecord) => r.module === 're').length,
        expense: data.stats?.expense || recordsList.filter((r: DataRecord) => r.module === 'expense').length,
        draft: data.stats?.draft || recordsList.filter((r: DataRecord) => r.status === 'draft').length,
        submitted: data.stats?.submitted || recordsList.filter((r: DataRecord) => r.status === 'submitted').length,
        approved: data.stats?.approved || recordsList.filter((r: DataRecord) => r.status === 'approved').length,
        rejected: data.stats?.rejected || recordsList.filter((r: DataRecord) => r.status === 'rejected').length,
        today: data.stats?.today || 0,
        week: data.stats?.week || 0,
        month: data.stats?.month || 0,
        starred: recordsList.filter((r: DataRecord) => r.starred).length,
        archived: recordsList.filter((r: DataRecord) => r.archived).length,
        totalAmount,
        avgAmount: recordsList.length ? totalAmount / recordsList.length : 0
      });

    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to load records');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortField, sortOrder, filters, router]);

  const fetchEntities = useCallback(async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/entities', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities || []);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  }, []);

  const fetchEntityStats = useCallback(async (module: 're' | 'expense', entity: string) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/records/stats?module=${module}&entity=${entity}`,
        { credentials: 'include' }
      );
      if (!response.ok) return { total: 0, today: 0, pending: 0, totalAmount: 0 };
      return await response.json();
    } catch {
      return { total: 0, today: 0, pending: 0, totalAmount: 0 };
    }
  }, []);

  const fetchEntityFields = useCallback(async (module: 're' | 'expense', entity: string) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/fields?module=${module}&entityId=${entity}`,
        { credentials: 'include' }
      );
      if (!response.ok) return { total: 0, required: 0, system: 0, custom: 0 };
      const data = await response.json();
      const fields = data.fields || [];
      return {
        total: fields.length,
        required: fields.filter((f: any) => f.required).length,
        system: fields.filter((f: any) => f.isSystem).length,
        custom: fields.filter((f: any) => !f.isSystem).length
      };
    } catch {
      return { total: 0, required: 0, system: 0, custom: 0 };
    }
  }, []);

  const fetchEntityUsers = useCallback(async (module: 're' | 'expense', entity: string) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/records/users?module=${module}&entity=${entity}`,
        { credentials: 'include' }
      );
      if (!response.ok) return { total: 0, active: 0 };
      return await response.json();
    } catch {
      return { total: 0, active: 0 };
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/activities?limit=10', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, []);

  const fetchChartData = useCallback(async (range: string) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/analytics/chart?range=${range}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }, []);

  const fetchSystemStats = useCallback(async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/system/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchEntities();
    fetchRecentActivities();
    fetchChartData('month');
    fetchSystemStats();
  }, [fetchRecords, fetchEntities, fetchRecentActivities, fetchChartData, fetchSystemStats]);

  // ==================== BULK OPERATIONS ====================
  const handleBulkDelete = useCallback(async () => {
    if (selectedRecords.size === 0) return;
    
    if (!confirm(`Delete ${selectedRecords.size} records permanently?`)) return;

    try {
      const token = getToken();
      
      // Method 1: Bulk DELETE endpoint
      const response = await fetch('/financial-tracker/api/financial-tracker/records/bulk', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordIds: Array.from(selectedRecords)
        })
      });

      if (!response.ok) {
        // Method 2: Fallback to individual deletes
        await Promise.all(Array.from(selectedRecords).map(id => 
          fetch(`/financial-tracker/api/financial-tracker/records/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ));
      }
      
      toast.success(`Deleted ${selectedRecords.size} records`);
      setSelectedRecords(new Set());
      fetchRecords();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some records');
    }
  }, [selectedRecords, fetchRecords]);

  // 🔥 FIXED: Using index signature instead of Record type
  type UpdateData = { [key: string]: any };
  
  const handleBulkUpdate = useCallback(async (updates: UpdateData) => {
    if (selectedRecords.size === 0) return;

    try {
      const token = getToken();
      
      // Try bulk update endpoint first
      const response = await fetch('/financial-tracker/api/financial-tracker/records/bulk', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordIds: Array.from(selectedRecords),
          data: updates
        })
      });

      if (!response.ok) {
        // Fallback to individual updates
        await Promise.all(Array.from(selectedRecords).map(id => 
          fetch(`/financial-tracker/api/financial-tracker/records/${id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: updates })
          })
        ));
      }
      
      toast.success(`Updated ${selectedRecords.size} records`);
      setSelectedRecords(new Set());
      fetchRecords();
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update records');
    }
  }, [selectedRecords, fetchRecords]);

  const handleBulkAction = useCallback((action: BulkAction) => {
    switch (action) {
      case 'delete':
        handleBulkDelete();
        break;
      case 'approve':
        handleBulkUpdate({ status: 'approved' });
        break;
      case 'reject':
        handleBulkUpdate({ status: 'rejected' });
        break;
      case 'star':
        handleBulkUpdate({ starred: true });
        break;
      case 'unstar':
        handleBulkUpdate({ starred: false });
        break;
      case 'archive':
        handleBulkUpdate({ archived: true });
        break;
      case 'unarchive':
        handleBulkUpdate({ archived: false });
        break;
      case 'export':
        handleExport('excel');
        break;
    }
  }, [handleBulkUpdate, handleBulkDelete]);

  // ==================== EXPORT ====================
  const handleExport = useCallback(async (format: 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html') => {
    try {
      const token = getToken();
      const params = new URLSearchParams({ format });
      
      // Add current filters to export
      if (filters.module !== 'all') params.append('module', filters.module);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.search) params.append('search', filters.search);
      
      // If records selected, export only selected
      if (selectedRecords.size > 0) {
        params.append('recordIds', Array.from(selectedRecords).join(','));
      }

      const response = await fetch(`/financial-tracker/api/financial-tracker/records/export?${params}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `records-export-${formatDate(new Date(), 'yyyy-MM-dd')}.${
        format === 'excel' ? 'xlsx' : format
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${selectedRecords.size || 'all'} records as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  }, [filters, selectedRecords]);

  // ==================== UI HELPERS ====================
  const getStatusBadge = (status: string) => {
    const config = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = PRIORITY_OPTIONS.find(p => p.value === priority);
    if (!config) return null;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {priority}
      </span>
    );
  };

  const getModuleIcon = (module: string) => {
    return module === 're' ? TrendingUp : TrendingDown;
  };

  const getModuleColor = (module: string) => {
    return module === 're' ? 'blue' : 'purple';
  };

  // ==================== NAVIGATION ====================
  const handleView = useCallback((record: DataRecord) => {
    router.push(`/admin/financial-tracker/${record.module}/${record.entity}/${record._id}`);
  }, [router]);

  const handleEdit = useCallback((record: DataRecord) => {
    router.push(`/admin/financial-tracker/${record.module}/${record.entity}/${record._id}/edit`);
  }, [router]);

  // ==================== SELECTION ====================
  const toggleSelectAll = useCallback(() => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map(r => r._id)));
    }
  }, [selectedRecords, records]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedRecords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ==================== FILTERED & SORTED ====================
  const filteredRecords = useMemo(() => {
    return records; // Already filtered by API
  }, [records]);

  // ==================== LOADING STATE ====================
  if (isLoading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse delay-700"></div>
          
          {/* Main loader */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-blue-400/30 border-t-blue-500 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-2 border-4 border-purple-400/30 border-b-purple-500 rounded-full animate-spin-slow-reverse"></div>
              <div className="absolute inset-4 border-4 border-cyan-400/30 border-l-cyan-500 rounded-full animate-spin-slower"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl transform rotate-12">
                  <Database className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-2">Loading Records</h2>
            <p className="text-blue-200 text-center mb-6">Fetching your financial data...</p>
            
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 ${
      isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''
    }`}>
      {/* ==================== HEADER ==================== */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-lg">
        <div className="px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg group-hover:scale-105 transition-transform">
                  <Database className="h-7 w-7 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  All Records
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    {totalCount.toLocaleString()} total records
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">
                    {stats.today} new today
                  </p>
                  {selectedRecords.size > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm font-medium text-blue-600">
                        {selectedRecords.size} selected
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                <button
                  onClick={() => setZoom(z => Math.max(70, z - 10))}
                  className="p-2 hover:bg-gray-50 rounded-l-lg border-r"
                >
                  <ZoomOut className="h-4 w-4 text-gray-600" />
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(150, z + 10))}
                  className="p-2 hover:bg-gray-50 rounded-r-lg border-l"
                >
                  <ZoomIn className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
              </button>

              <button
                onClick={fetchRecords}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-8 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 hover:shadow-md transition-all">
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-xl font-bold text-blue-700">{formatNumber(stats.total)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200 hover:shadow-md transition-all">
              <p className="text-xs text-green-600 font-medium">Approved</p>
              <p className="text-xl font-bold text-green-700">{stats.approved}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200 hover:shadow-md transition-all">
              <p className="text-xs text-yellow-600 font-medium">Pending</p>
              <p className="text-xl font-bold text-yellow-700">{stats.submitted}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all">
              <p className="text-xs text-gray-600 font-medium">Draft</p>
              <p className="text-xl font-bold text-gray-700">{stats.draft}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200 hover:shadow-md transition-all">
              <p className="text-xs text-red-600 font-medium">Rejected</p>
              <p className="text-xl font-bold text-red-700">{stats.rejected}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 hover:shadow-md transition-all">
              <p className="text-xs text-purple-600 font-medium">Starred</p>
              <p className="text-xl font-bold text-purple-700">{stats.starred}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-200 hover:shadow-md transition-all">
              <p className="text-xs text-indigo-600 font-medium">Archived</p>
              <p className="text-xl font-bold text-indigo-700">{stats.archived}</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-3 border border-teal-200 hover:shadow-md transition-all">
              <p className="text-xs text-teal-600 font-medium">Amount</p>
              <p className="text-xl font-bold text-teal-700">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center space-x-3">
            {/* Module Filter */}
            <select
              value={filters.module}
              onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value as ModuleType, entity: '' }))}
              className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">📊 All Modules</option>
              <option value="re">📈 RE Module</option>
              <option value="expense">📉 Expense Module</option>
            </select>

            {/* Entity Filter */}
            <select
              value={filters.entity}
              onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm min-w-[180px] focus:ring-2 focus:ring-blue-500"
            >
              <option value="">🏢 All Entities</option>
              {entities
                .filter(e => filters.module === 'all' || e.module === filters.module)
                .map(e => (
                  <option key={e._id} value={e.entityKey}>📁 {e.name}</option>
                ))
              }
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>⚡ {option.label}</option>
              ))}
            </select>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, amount, description, tags..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg hover:bg-gray-50 bg-white shadow-sm transition-all ${
                showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : ''
              }`}
              title="Advanced Filters"
            >
              <Filter className="h-4 w-4" />
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="p-2 border rounded-lg hover:bg-gray-50 bg-white shadow-sm">
                <Download className="h-4 w-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border hidden group-hover:block z-50">
                {EXPORT_FORMATS.map(format => (
                  <button
                    key={format.value}
                    onClick={() => handleExport(format.value)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <format.icon className={`h-4 w-4 ${format.color}`} />
                    <span>{format.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex border rounded-lg bg-white shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-white rounded-xl border border-gray-200 shadow-lg animate-slideDown">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min Amount (PKR)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Amount (PKR)</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                  <select
                    value={filters.priority[0] || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value ? [e.target.value] : [] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priorities</option>
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Created By</label>
                  <input
                    type="text"
                    placeholder="User name or ID"
                    value={filters.createdBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, createdBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="Comma separated"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.starred === true}
                      onChange={(e) => setFilters(prev => ({ ...prev, starred: e.target.checked ? true : null }))}
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span>Starred only</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.archived === true}
                      onChange={(e) => setFilters(prev => ({ ...prev, archived: e.target.checked ? true : null }))}
                      className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                    <span>Archived</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setFilters({
                    module: 'all',
                    entity: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                    createdBy: '',
                    minAmount: '',
                    maxAmount: '',
                    search: '',
                    tags: [],
                    priority: [],
                    starred: null,
                    archived: null
                  })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                >
                  Reset All
                </button>
                <button
                  onClick={fetchRecords}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedRecords.size > 0 && (
            <div className="mt-4 flex items-center space-x-2 bg-white rounded-lg border border-blue-200 shadow-md px-4 py-2 animate-slideDown">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{selectedRecords.size}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">records selected</span>
              </div>
              
              <div className="w-px h-5 bg-gray-300 mx-2" />
              
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                title="Delete Selected"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
              
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center"
                title="Approve Selected"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </button>
              
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                title="Reject Selected"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </button>
              
              <button
                onClick={() => handleBulkAction('star')}
                className="px-3 py-1.5 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg flex items-center"
                title="Star Selected"
              >
                <Star className="h-4 w-4 mr-1" fill="currentColor" />
                Star
              </button>
              
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center"
                title="Archive Selected"
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </button>
              
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center"
                title="Export Selected"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              
              <button
                onClick={() => setSelectedRecords(new Set())}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg ml-2"
                title="Clear Selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="p-6" style={{ zoom: `${zoom}%` }}>
        {records.length === 0 ? (
          // ==================== BEAUTIFUL EMPTY STATE ====================
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              
              <div className="relative">
                {/* Rotating rings */}
                <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-3 border-4 border-purple-200 border-b-purple-500 rounded-full animate-spin-slow-reverse"></div>
                
                {/* Center icon */}
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <Database className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
              No Records Found
            </h2>

            <p className="text-gray-600 text-center max-w-lg mb-8 text-lg">
              {filters.search || filters.status || filters.entity || filters.priority.length > 0 ? (
                <>
                  No records match your current filters.
                  <br />
                  Try adjusting your search criteria.
                </>
              ) : (
                <>
                  No records have been created in this module yet.
                  <br />
                  Get started by creating your first record.
                </>
              )}
            </p>

            <div className="flex space-x-4">
              {(filters.search || filters.status || filters.entity || filters.priority.length > 0) && (
                <button
                  onClick={() => setFilters({
                    module: 'all',
                    entity: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                    createdBy: '',
                    minAmount: '',
                    maxAmount: '',
                    search: '',
                    tags: [],
                    priority: [],
                    starred: null,
                    archived: null
                  })}
                  className="group px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                >
                  <FilterX className="h-5 w-5 mr-2 text-gray-600 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium text-gray-700">Clear Filters</span>
                </button>
              )}
              
              <button
                onClick={() => router.push('/admin/financial-tracker/entities')}
                className="group px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Create New Record</span>
                <Sparkles className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Quick Tips */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl">
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Search</p>
                <p className="text-xs text-gray-500 mt-1">Search by any field</p>
              </div>
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Filter className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Filter</p>
                <p className="text-xs text-gray-500 mt-1">Advanced filters</p>
              </div>
              <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Download className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Export</p>
                <p className="text-xs text-gray-500 mt-1">Multiple formats</p>
              </div>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          // ==================== TABLE VIEW ====================
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRecords.size === records.length && records.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => {
                          setSortField('createdAt');
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Date</span>
                        {sortField === 'createdAt' && (
                          sortOrder === 'asc' ? 
                            <ArrowUp className="h-3 w-3" /> : 
                            <ArrowDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => {
                    const ModuleIcon = getModuleIcon(record.module);
                    const moduleColor = getModuleColor(record.module);
                    const firstDataValue = Object.values(record.data)[0];
                    const amount = record.data.amount || record.data.total || 0;
                    
                    return (
                      <tr
                        key={record._id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => handleView(record)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRecords.has(record._id)}
                            onChange={() => toggleSelect(record._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(record.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(record.createdAt), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-${moduleColor}-100 text-${moduleColor}-800`}>
                            <ModuleIcon className="h-3 w-3 mr-1" />
                            {record.module.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{record.entity}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {typeof firstDataValue === 'object' 
                              ? JSON.stringify(firstDataValue).slice(0, 50)
                              : String(firstDataValue).slice(0, 50)}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {Object.keys(record.data).length} fields
                            </span>
                            {record.attachments ? (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {record.attachments}
                              </span>
                            ) : null}
                            {record.comments ? (
                              <span className="text-xs text-gray-500 flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {record.comments}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {amount ? (
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(Number(amount))}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-4 py-3">
                          {record.priority ? getPriorityBadge(record.priority) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {record.createdBy?.fullName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {record.createdBy?.fullName?.split(' ')[0] || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500">
                                v{record.version}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(record);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(record);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBulkUpdate({ starred: !record.starred });
                              }}
                              className={`p-1.5 rounded-lg ${
                                record.starred 
                                  ? 'text-yellow-500 hover:bg-yellow-50' 
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              }`}
                              title={record.starred ? 'Unstar' : 'Star'}
                            >
                              <Star className="h-4 w-4" fill={record.starred ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="ml-2 px-2 py-1 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <span className="px-4 py-2 text-sm bg-white border rounded-lg">
                  Page {page} of {Math.ceil(totalCount / limit)}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === Math.ceil(totalCount / limit)}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(Math.ceil(totalCount / limit))}
                  disabled={page === Math.ceil(totalCount / limit)}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // ==================== GRID VIEW ====================
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {records.map((record) => {
              const ModuleIcon = getModuleIcon(record.module);
              const moduleColor = getModuleColor(record.module);
              const amount = record.data.amount || record.data.total || 0;
              const firstDataValue = Object.values(record.data)[0];
              
              return (
                <div
                  key={record._id}
                  onClick={() => handleView(record)}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className={`h-2 w-full bg-gradient-to-r from-${moduleColor}-500 to-${moduleColor}-600`}></div>
                  
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl bg-${moduleColor}-100 group-hover:scale-110 transition-transform`}>
                          <ModuleIcon className={`h-5 w-5 text-${moduleColor}-600`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{record.entity}</h3>
                          <p className="text-xs text-gray-500">
                            {format(new Date(record.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      {record.starred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>

                    {/* Data Preview */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {typeof firstDataValue === 'object' 
                          ? JSON.stringify(firstDataValue).slice(0, 80)
                          : String(firstDataValue).slice(0, 80)}
                      </p>
                    </div>

                    {/* Amount and Status */}
                    <div className="flex items-center justify-between mb-3">
                      {amount ? (
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(Number(amount))}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">No amount</span>
                      )}
                      {getStatusBadge(record.status)}
                    </div>

                    {/* Tags */}
                    {record.tags && record.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {record.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                        {record.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{record.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {record.createdBy?.fullName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {record.createdBy?.fullName?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(record);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBulkUpdate({ starred: !record.starred });
                          }}
                          className={`p-1.5 rounded-lg ${
                            record.starred 
                              ? 'text-yellow-500 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Star className="h-4 w-4" fill={record.starred ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(720deg); }
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 10s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 15s linear infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}