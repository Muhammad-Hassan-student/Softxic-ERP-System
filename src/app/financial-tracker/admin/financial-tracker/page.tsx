// src/app/admin/financial-tracker/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  // Core Icons
  LayoutDashboard, TrendingUp, TrendingDown, Building2, 
  Users, Package, Home, Briefcase, DollarSign, CreditCard,
  ArrowRight, Sparkles, Zap, Shield, Clock, BarChart3,
  PieChart, Activity, Download, Upload, Settings, Search,
  Filter, Grid3x3, List, Star, Archive, Trash2, Eye,
  EyeOff, Lock, Unlock, Bell, HelpCircle, Info, ChevronRight,
  ChevronLeft, Calendar, Globe, HardDrive, Cpu, Network,
  Database, Cloud, Shield as ShieldIcon, Rocket, Award,
  Medal, Crown, Gem, Diamond, Sparkle, Flame, Droplets,
  Wind, Snowflake, SunSnow, CloudSun, CloudMoon, CloudRain,
  CloudLightning, Umbrella, Thermometer, Gauge, Compass,
  Target, Crosshair, Circle, Square, Heart, ThumbsUp,
  Share, Send, AtSign, Hash, Wallet, Banknote, Coins,
  PiggyBank, ShoppingBag, ShoppingCart, Package as PackageIcon,
  Box, Boxes, Warehouse, Truck, Plane, Ship, Bike, Bus,
  Car, Train, MapPin, MapPinned, Navigation, Locate,
  Satellite, Radio, Antenna, Bluetooth, Monitor, Tv,
  Tablet, Smartphone, Watch, Headphones, Speaker, Mic,
  Camera, Video, Film, Music, Disc, Podcast, Gamepad,
  Puzzle, Palette, Paintbrush, Brush, Pen, Highlighter,
  Type, Bold, Italic, Underline, List as ListIcon,
  FileText, FileSpreadsheet, FileJson, FileCode, FileImage,
  FileVideo, FileAudio, FileArchive, Folder, FolderTree,
  RotateCcw, RotateCw, Sun, Moon, Cloud as CloudIcon,
  Sunrise, Sunset, Wind as WindIcon, Waves, Anchor,
  TreePine, Mountain, Leaf, Flower2, Sprout,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  ZoomOut,
  ZoomIn,
  Minimize2,
  Fullscreen,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

// ==================== TYPES ====================
type ModuleType = 're' | 'expense';
type ViewMode = 'grid' | 'list' | 'analytics' | 'compact';
type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

interface Entity {
  _id: string;
  module: ModuleType;
  entityKey: string;
  name: string;
  description: string;
  isEnabled: boolean;
  enableApproval: boolean;
  createdAt: string;
  updatedAt: string;
  recordCount?: number;
  lastActivity?: string;
  color?: string;
  stats?: {
    total: number;
    today: number;
    week: number;
    month: number;
    pending: number;
    approved: number;
    rejected: number;
    starred: number;
    archived: number;
    deleted: number;
    totalAmount?: number;
    avgAmount?: number;
    minAmount?: number;
    maxAmount?: number;
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
  performance?: {
    avgLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

interface ModuleData {
  re: Entity[];
  expense: Entity[];
  all: Entity[];
}

interface DashboardStats {
  totalRecords: number;
  totalRE: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  activeEntities: number;
  totalEntities: number;
  pendingApprovals: number;
  recentActivity: number;
  totalUsers: number;
  activeUsers: number;
  storageUsed: number;
  apiCalls: number;
  avgResponseTime: number;
  uptime: number;
  lastBackup: string;
  systemHealth: 'healthy' | 'warning' | 'error';
  trends: {
    records: number;
    re: number;
    expense: number;
    profit: number;
    users: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

interface Activity {
  id: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'STAR' | 'ARCHIVE';
  module: ModuleType;
  entity: string;
  timestamp: string;
  details?: string;
}

// ==================== MAIN COMPONENT ====================
export default function FinancialTrackerDashboard() {
  const router = useRouter();
  
  // ==================== STATE ====================
  const [modules, setModules] = useState<ModuleData>({ re: [], expense: [], all: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<ModuleType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'records' | 'activity' | 'created'>('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  // Stats state
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    totalRE: 0,
    totalExpense: 0,
    netProfit: 0,
    profitMargin: 0,
    activeEntities: 0,
    totalEntities: 0,
    pendingApprovals: 0,
    recentActivity: 0,
    totalUsers: 0,
    activeUsers: 0,
    storageUsed: 0,
    apiCalls: 0,
    avgResponseTime: 0,
    uptime: 99.9,
    lastBackup: new Date().toISOString(),
    systemHealth: 'healthy',
    trends: {
      records: 0,
      re: 0,
      expense: 0,
      profit: 0,
      users: 0
    }
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });

  // ==================== API CALLS ====================
  const getToken = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const fetchEntities = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [reRes, expenseRes] = await Promise.all([
        fetch('/financial-tracker/api/financial-tracker/entities?module=re', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/financial-tracker/api/financial-tracker/entities?module=expense', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      if (!reRes.ok || !expenseRes.ok) {
        throw new Error('Failed to fetch entities');
      }

      const reData = await reRes.json();
      const expenseData = await expenseRes.json();

      // Fetch detailed stats for each entity
      const reWithStats = await Promise.all(
        (reData.entities || []).map(async (entity: Entity) => {
          const stats = await fetchEntityStats('re', entity.entityKey);
          const fields = await fetchEntityFields('re', entity.entityKey);
          const users = await fetchEntityUsers('re', entity.entityKey);
          return { 
            ...entity, 
            stats, 
            fields,
            users,
            color: getEntityColor(entity.entityKey)
          };
        })
      );

      const expenseWithStats = await Promise.all(
        (expenseData.entities || []).map(async (entity: Entity) => {
          const stats = await fetchEntityStats('expense', entity.entityKey);
          const fields = await fetchEntityFields('expense', entity.entityKey);
          const users = await fetchEntityUsers('expense', entity.entityKey);
          return { 
            ...entity, 
            stats, 
            fields,
            users,
            color: getEntityColor(entity.entityKey)
          };
        })
      );

      const allEntities = [...reWithStats, ...expenseWithStats].filter(e => showInactive ? true : e.isEnabled);
      
      setModules({
        re: reWithStats.filter(e => showInactive ? true : e.isEnabled),
        expense: expenseWithStats.filter(e => showInactive ? true : e.isEnabled),
        all: allEntities
      });

      // Calculate global stats
      await calculateGlobalStats(allEntities);
      await fetchRecentActivities();
      await fetchChartData(timeRange);

    } catch (error) {
      console.error('Error fetching entities:', error);
      toast.error('Failed to load modules');
    } finally {
      setIsLoading(false);
    }
  }, [showInactive, timeRange]);

  const fetchEntityStats = async (module: ModuleType, entity: string) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/records/stats?module=${module}&entity=${entity}&range=${timeRange}`,
        { credentials: 'include' }
      );
      if (!response.ok) return getDefaultStats();
      return await response.json();
    } catch {
      return getDefaultStats();
    }
  };

  const fetchEntityFields = async (module: ModuleType, entity: string) => {
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
  };

  const fetchEntityUsers = async (module: ModuleType, entity: string) => {
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
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/activities?limit=10`,
        { credentials: 'include' }
      );
      if (!response.ok) return;
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchChartData = async (range: TimeRange) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/analytics/chart?range=${range}`,
        { credentials: 'include' }
      );
      if (!response.ok) return;
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const calculateGlobalStats = async (entities: Entity[]) => {
    try {
      const totalRecords = entities.reduce((acc, e) => acc + (e.stats?.total || 0), 0);
      const totalRE = entities.filter(e => e.module === 're').reduce((acc, e) => acc + (e.stats?.totalAmount || 0), 0);
      const totalExpense = entities.filter(e => e.module === 'expense').reduce((acc, e) => acc + (e.stats?.totalAmount || 0), 0);
      const netProfit = totalRE - totalExpense;
      const profitMargin = totalRE > 0 ? (netProfit / totalRE) * 100 : 0;

      // Fetch system stats
      const systemRes = await fetch('/financial-tracker/api/financial-tracker/system/stats', {
        credentials: 'include'
      });
      const systemData = systemRes.ok ? await systemRes.json() : {};

      setStats({
        totalRecords,
        totalRE,
        totalExpense,
        netProfit,
        profitMargin,
        activeEntities: entities.filter(e => e.isEnabled).length,
        totalEntities: entities.length,
        pendingApprovals: entities.reduce((acc, e) => acc + (e.stats?.pending || 0), 0),
        recentActivity: activities.length,
        totalUsers: systemData.totalUsers || 0,
        activeUsers: systemData.activeUsers || 0,
        storageUsed: systemData.storageUsed || 0,
        apiCalls: systemData.apiCalls || 0,
        avgResponseTime: systemData.avgResponseTime || 0,
        uptime: systemData.uptime || 99.9,
        lastBackup: systemData.lastBackup || new Date().toISOString(),
        systemHealth: systemData.health || 'healthy',
        trends: {
          records: systemData.trends?.records || 0,
          re: systemData.trends?.re || 0,
          expense: systemData.trends?.expense || 0,
          profit: systemData.trends?.profit || 0,
          users: systemData.trends?.users || 0
        }
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getDefaultStats = () => ({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    starred: 0,
    archived: 0,
    deleted: 0,
    totalAmount: 0,
    avgAmount: 0,
    minAmount: 0,
    maxAmount: 0
  });

  useEffect(() => {
    fetchEntities();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchEntities, 30000);
    return () => clearInterval(interval);
  }, [fetchEntities]);

  // ==================== FILTERS & SORT ====================
  const filteredAndSortedEntities = useMemo(() => {
    let entities = selectedModule === 'all' ? modules.all : modules[selectedModule];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      entities = entities.filter(e => 
        e.name.toLowerCase().includes(term) ||
        e.entityKey.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    entities = [...entities].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'records':
          comparison = (a.stats?.total || 0) - (b.stats?.total || 0);
          break;
        case 'activity':
          comparison = new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
          break;
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return entities;
  }, [modules, selectedModule, searchTerm, sortBy, sortOrder]);

  // ==================== HANDLERS ====================
  const handleEntityClick = (module: ModuleType, entityKey: string) => {
    router.push(`/admin/financial-tracker/${module}/${entityKey}`);
  };

  const handleSelectAll = () => {
    if (selectedEntities.length === filteredAndSortedEntities.length) {
      setSelectedEntities([]);
    } else {
      setSelectedEntities(filteredAndSortedEntities.map(e => e._id));
    }
  };

  const handleBulkAction = async (action: 'enable' | 'disable' | 'delete') => {
    if (selectedEntities.length === 0) return;
    
    if (!confirm(`Are you sure you want to ${action} ${selectedEntities.length} entities?`)) return;

    try {
      const token = getToken();
      await Promise.all(selectedEntities.map(id => 
        fetch(`/financial-tracker/api/financial-tracker/entities/${id}/${action}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      
      toast.success(`${selectedEntities.length} entities ${action}d successfully`);
      setSelectedEntities([]);
      fetchEntities();
    } catch (error) {
      toast.error(`Failed to ${action} entities`);
    }
  };

  const handleExport = async () => {
    try {
      const token = getToken();
      const response = await fetch('/financial-tracker/api/financial-tracker/entities/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `entities-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Entities exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getEntityIcon = (module: ModuleType, entityKey: string) => {
    const iconMap: Record<string, any> = {
      dealer: Users,
      'fhh-client': Users,
      'cp-client': Users,
      builder: Briefcase,
      project: Package,
      office: Home,
      default: module === 're' ? TrendingUp : TrendingDown
    };
    return iconMap[entityKey] || iconMap.default;
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

  const getActivityIcon = (action: string) => {
    const iconMap: Record<string, any> = {
      CREATE: Plus,
      UPDATE: RefreshCw,
      DELETE: Trash2,
      APPROVE: CheckCircle,
      REJECT: XCircle,
      STAR: Star,
      ARCHIVE: Archive
    };
    return iconMap[action] || Activity;
  };

  const getActivityColor = (action: string) => {
    const colorMap: Record<string, string> = {
      CREATE: 'text-green-500',
      UPDATE: 'text-blue-500',
      DELETE: 'text-red-500',
      APPROVE: 'text-green-500',
      REJECT: 'text-red-500',
      STAR: 'text-yellow-500',
      ARCHIVE: 'text-purple-500'
    };
    return colorMap[action] || 'text-gray-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="relative">
          {/* Animated background rings */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse delay-700"></div>
          
          {/* Main loader */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl">
            {/* Rotating rings */}
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-blue-400/30 border-t-blue-500 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-2 border-4 border-purple-400/30 border-b-purple-500 rounded-full animate-spin-slow-reverse"></div>
              <div className="absolute inset-4 border-4 border-cyan-400/30 border-l-cyan-500 rounded-full animate-spin-slower"></div>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <LayoutDashboard className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            {/* Loading text */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">Loading Dashboard</h2>
            <p className="text-blue-200 text-center mb-6">Fetching your financial data...</p>
            
            {/* Progress bar */}
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full animate-progress"></div>
            </div>
            
            {/* Loading stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 rounded-lg p-3 animate-pulse">
                  <div className="h-2 bg-white/10 rounded w-12 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              ))}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Financial Tracker
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    System Status: <span className="font-medium text-green-600 ml-1 capitalize">{stats.systemHealth}</span>
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">
                    Last Backup: {formatDistanceToNow(new Date(stats.lastBackup), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quick Stats */}
              <div className="flex items-center space-x-4 mr-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">API Calls</p>
                  <p className="text-sm font-bold text-gray-900">{formatNumber(stats.apiCalls)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Avg Response</p>
                  <p className="text-sm font-bold text-gray-900">{stats.avgResponseTime}ms</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Uptime</p>
                  <p className="text-sm font-bold text-green-600">{stats.uptime}%</p>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                <button
                  onClick={() => setZoom(z => Math.max(70, z - 10))}
                  className="p-2 hover:bg-gray-50 rounded-l-lg border-r border-gray-200"
                >
                  <ZoomOut className="h-4 w-4 text-gray-600" />
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(150, z + 10))}
                  className="p-2 hover:bg-gray-50 rounded-r-lg border-l border-gray-200"
                >
                  <ZoomIn className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
              </button>

              <button
                onClick={fetchEntities}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-6 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-200 rounded-lg group-hover:scale-110 transition-transform">
                  <Database className="h-5 w-5 text-blue-700" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stats.trends.records > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stats.trends.records > 0 ? '+' : ''}{stats.trends.records}%
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.totalRecords)}</p>
              <p className="text-xs text-blue-600">Total Records</p>
              <div className="mt-2 h-1 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-200 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-green-700" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stats.trends.re > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stats.trends.re > 0 ? '+' : ''}{stats.trends.re}%
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalRE)}</p>
              <p className="text-xs text-green-600">Total Revenue</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-200 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingDown className="h-5 w-5 text-red-700" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stats.trends.expense > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {stats.trends.expense > 0 ? '+' : ''}{stats.trends.expense}%
                </span>
              </div>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(stats.totalExpense)}</p>
              <p className="text-xs text-red-600">Total Expenses</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-200 rounded-lg group-hover:scale-110 transition-transform">
                  <Wallet className="h-5 w-5 text-purple-700" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stats.trends.profit > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stats.trends.profit > 0 ? '+' : ''}{stats.trends.profit}%
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.netProfit)}</p>
              <p className="text-xs text-purple-600">Net Profit</p>
              <p className="text-xs text-purple-500 mt-1">Margin: {stats.profitMargin.toFixed(1)}%</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200 hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-200 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-yellow-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingApprovals}</p>
              <p className="text-xs text-yellow-600">Pending Approvals</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-200 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-indigo-700" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stats.trends.users > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stats.trends.users > 0 ? '+' : ''}{stats.trends.users}%
                </span>
              </div>
              <p className="text-2xl font-bold text-indigo-700">{stats.activeUsers}/{stats.totalUsers}</p>
              <p className="text-xs text-indigo-600">Active Users</p>
            </div>
          </div>

          {/* Filters and Actions Bar */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              {/* Module Selector */}
              <div className="flex bg-white rounded-lg border p-1 shadow-sm">
                <button
                  onClick={() => setSelectedModule('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                    selectedModule === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  All Modules
                </button>
                <button
                  onClick={() => setSelectedModule('re')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                    selectedModule === 're'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  RE Module
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {modules.re.length}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedModule('expense')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                    selectedModule === 'expense'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Expense Module
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {modules.expense.length}
                  </span>
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex border rounded-lg bg-white shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`p-2 rounded-r-lg ${
                    viewMode === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
              </div>

              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>

              {/* Sort Controls */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm"
              >
                <option value="activity">Sort by Activity</option>
                <option value="name">Sort by Name</option>
                <option value="records">Sort by Records</option>
                <option value="created">Sort by Created</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border rounded-lg hover:bg-gray-50 bg-white shadow-sm"
              >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </button>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Inactive</span>
              </label>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Bulk Actions */}
              {selectedEntities.length > 0 && (
                <div className="flex items-center space-x-2 bg-white rounded-lg border shadow-md px-3 py-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedEntities.length} selected
                  </span>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <button
                    onClick={() => handleBulkAction('enable')}
                    className="p-1 hover:bg-green-50 rounded text-green-600"
                    title="Enable Selected"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleBulkAction('disable')}
                    className="p-1 hover:bg-yellow-50 rounded text-yellow-600"
                    title="Disable Selected"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="p-1 hover:bg-red-50 rounded text-red-600"
                    title="Delete Selected"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSelectAll}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border rounded-lg hover:bg-gray-50 bg-white shadow-sm ${
                  showFilters ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>

              <button
                onClick={handleExport}
                className="p-2 border rounded-lg hover:bg-gray-50 bg-white shadow-sm"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                onClick={() => router.push('/admin/financial-tracker/entities/create')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entity
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search entities by name, key, description, or module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-lg">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Record Count</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Any</option>
                    <option>{'>'} 100</option>
                    <option>{'>'} 1000</option>
                    <option>{'>'} 10000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount Range</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Any</option>
                    <option>{'>'} PKR 100K</option>
                    <option>{'>'} PKR 1M</option>
                    <option>{'>'} PKR 10M</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Activity</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Any</option>
                    <option>Active today</option>
                    <option>Active this week</option>
                    <option>Inactive {'>'} 30 days</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  Reset
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="p-6" style={{ zoom: `${zoom}%` }}>
        {viewMode === 'analytics' ? (
          // ==================== ANALYTICS VIEW ====================
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4">Revenue vs Expense Trend</h3>
                <div className="h-80">
                  {/* Chart component here - using recharts or similar */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-400">Chart visualization would be here</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4">Module Distribution</h3>
                <div className="h-80">
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-400">Pie chart would be here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">API Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</p>
                <p className="text-xs text-green-600 mt-1">↓ 12% from last week</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% from last week</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">0.3%</p>
                <p className="text-xs text-green-600 mt-1">↓ 0.1% from last week</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB</p>
                <p className="text-xs text-yellow-600 mt-1">75% of quota</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold">Recent Activities</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.action);
                  return (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.action).replace('text', 'bg')}/20`}>
                          <Icon className={`h-4 w-4 ${getActivityColor(activity.action)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">
                              <span className="font-medium text-gray-900">{activity.user}</span>
                              {' '}
                              <span className="text-gray-600">{activity.action.toLowerCase()}d</span>
                              {' '}
                              <span className="font-medium text-gray-900">{activity.entity}</span>
                              {' '}
                              <span className="text-gray-500">in {activity.module}</span>
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          {activity.details && (
                            <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          // ==================== LIST VIEW ====================
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEntities.length === filteredAndSortedEntities.length && filteredAndSortedEntities.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fields</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedEntities.map((entity) => {
                  const Icon = getEntityIcon(entity.module, entity.entityKey);
                  const color = entity.color || 'gray';
                  
                  return (
                    <tr
                      key={entity._id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all group"
                      onClick={() => handleEntityClick(entity.module, entity.entityKey)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedEntities.includes(entity._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntities([...selectedEntities, entity._id]);
                            } else {
                              setSelectedEntities(selectedEntities.filter(id => id !== entity._id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg bg-${color}-100 mr-3 group-hover:scale-110 transition-transform`}>
                            <Icon className={`h-5 w-5 text-${color}-600`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{entity.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{entity.entityKey}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entity.module === 're'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {entity.module.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 line-clamp-2">{entity.description || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm font-bold text-gray-900">{entity.stats?.total || 0}</div>
                        <div className="text-xs text-green-600">+{entity.stats?.today || 0} today</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entity.stats?.totalAmount ? (
                          <>
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(entity.stats.totalAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              avg {formatCurrency(entity.stats.avgAmount || 0)}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm font-bold text-gray-900">{entity.fields?.total || 0}</div>
                        <div className="text-xs text-gray-500">
                          {entity.fields?.required || 0} req / {entity.fields?.custom || 0} custom
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            entity.isEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-sm text-gray-600">
                            {entity.isEnabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEntityClick(entity.module, entity.entityKey);
                          }}
                          className="text-blue-600 hover:text-blue-800 group-hover:underline text-sm font-medium"
                        >
                          Open →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // ==================== GRID VIEW ====================
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedEntities.length === 0 ? (
              // Empty State
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
                    <Database className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Entities Found</h3>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  {searchTerm 
                    ? `No entities match "${searchTerm}"`
                    : "Get started by creating your first entity"}
                </p>
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/admin/financial-tracker/entities/create')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Entity
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedEntities.map((entity) => {
                const Icon = getEntityIcon(entity.module, entity.entityKey);
                const color = entity.color || 'gray';
                
                return (
                  <div
                    key={entity._id}
                    onClick={() => handleEntityClick(entity.module, entity.entityKey)}
                    className="group relative bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/5 group-hover:via-purple-600/5 group-hover:to-pink-600/5 transition-all duration-500"></div>
                    
                    {/* Top Accent Bar */}
                    <div className={`h-2 w-full bg-gradient-to-r from-${color}-500 to-${color}-600`}></div>
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-xl bg-${color}-100 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`h-6 w-6 text-${color}-600`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{entity.name}</h3>
                            <p className="text-xs text-gray-500 font-mono">{entity.entityKey}</p>
                          </div>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex space-x-1">
                          {entity.enableApproval && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                              Approval
                            </span>
                          )}
                          <input
                            type="checkbox"
                            checked={selectedEntities.includes(entity._id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setSelectedEntities([...selectedEntities, entity._id]);
                              } else {
                                setSelectedEntities(selectedEntities.filter(id => id !== entity._id));
                              }
                            }}
                            className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      {entity.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{entity.description}</p>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-sm font-bold text-gray-900">{entity.stats?.total || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <p className="text-xs text-gray-500">Today</p>
                          <p className="text-sm font-bold text-green-600">+{entity.stats?.today || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="text-sm font-bold text-yellow-600">{entity.stats?.pending || 0}</p>
                        </div>
                      </div>

                      {/* Amount Bar (if available) */}
                      {entity.stats?.totalAmount ? (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Total Amount</span>
                            <span className="font-bold text-gray-900">{formatCurrency(entity.stats.totalAmount)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full`}
                              style={{ width: `${Math.min(100, (entity.stats.totalAmount / 1000000) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : null}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            entity.isEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-gray-500">
                            {entity.isEnabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-blue-600 group-hover:text-blue-700">
                          <span>Open</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Mini Stats */}
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FolderTree className="h-3 w-3 mr-1" />
                          {entity.fields?.total || 0} fields
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {entity.users?.active || 0} active
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
      `}</style>
    </div>
  );
}