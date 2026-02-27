// src/app/admin/financial-tracker/entities/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Grid3x3,
  List,
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Home,
  Briefcase,
  DollarSign,
  CreditCard,
  AlertCircle,
  Eye,
  Edit,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Star,
  Zap,
  Shield,
  Lock,
  Unlock,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Moon,
  Sun,
  Settings,
  Bell,
  HelpCircle,
  BookOpen,
  Video,
  MessageSquare,
  Share2,
  Copy,
  Printer,
  Archive,
  Tag,
  Layers,
  GitBranch,
  Workflow,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Users2,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Maximize2,
  Minimize2,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Command,
  Delete,
  Save,
  Upload,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  HardDrive,
  Cpu,
  Database,
  Server,
  Network,
  Globe2,
  Compass,
  Navigation,
  Map,
  Flag,
  Award,
  Medal,
  Crown,
  Rocket,
  Plane,
  Train,
  Car,
  Bike,
  Bus,
  Ship,
  Truck,
  Coffee,
  Pizza,
  Beer,
  Wine,
  Cake,
  Gift,
  PartyPopper,
  Music,
  Radio,
  Podcast,
  Tv,
  Film,
  Clapperboard,
  Theater,
  Palette,
  Brush,
  Pen,
  Pencil,
  Highlighter,
  Eraser,
  Ruler,
  Compass as CompassIcon,
  Weight,
  Scale,
  Thermometer,
  Wind,
  Droplet,
  Sun as SunIcon,
  Moon as MoonIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Umbrella,
  Tornado,
  DollarSign as DollarIcon,
  Bitcoin,
  CreditCard as CreditCardIcon,
  Wallet,
  Banknote,
  Coins,
  PiggyBank,
  Gem,
  Diamond,
  Heart,
  HeartPulse,
  HeartOff,
  Brain,
  Eye as EyeIcon,
  EyeOff,
  Ear,
  Activity as ActivityIcon,
  Thermometer as ThermometerIcon,
  Droplet as DropletIcon,
  Wind as WindIcon,
  Sunrise,
  Sunset,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  Cloud as CloudIcon,
  Cloudy,
  Cloudy as CloudyIcon,
  Tornado as TornadoIcon,
  Flower as FlowerIcon,
  Leaf as LeafIcon,
  Bug as BugIcon,
  Bird as BirdIcon,
  Fish as FishIcon,
  Cat as CatIcon,
  Dog as DogIcon,
  Rabbit as RabbitIcon,
  Turtle as TurtleIcon,
  Ghost as GhostIcon,
  Skull as SkullIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  Brackets as BracketsIcon,
  Braces as BracesIcon,
  Parentheses as ParenthesesIcon,
  PowerOff,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

import EntitiesTable from '@/app/financial-tracker/components/EntitiesTable';
import CreateEntityModal from '@/app/financial-tracker/components/CreateEntityModal';
import EditEntityModal from '@/app/financial-tracker/components/EditEntityModal';
import ViewEntityModal from '@/app/financial-tracker/components/ViewEntityModal';
import EntityStats from '@/app/financial-tracker/components/EntityStats';
import { ExportButton } from '@/app/financial-tracker/components/shared/ExportButton';
import { ConnectionStatus } from '@/app/financial-tracker/components/shared/ConnectionStatus';
import { useLocalStorage } from '@/app/financial-tracker/hooks/useLocalStorage';
import { useDebounce } from '@/app/financial-tracker/hooks/useDebounce';
import { useInView } from 'react-intersection-observer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, formatDistance, formatRelative, subDays, differenceInDays, differenceInHours, differenceInMinutes, subWeeks, subMonths, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, formatDate } from 'date-fns';

// Import Modal Components
import BulkEditModal from './components/modals/BulkEditModal';
import ShareModal from './components/modals/ShareModal';
import ExportModal from './components/modals/ExportModal';
import ImportModal from './components/modals/ImportModal';
import CloneModal from './components/modals/CloneModal';
import ArchiveModal from './components/modals/ArchiveModal';
import AnalyticsModal from './components/modals/AnalyticsModal';
import SettingsModal from './components/modals/SettingsModal';
import KeyboardShortcutsModal from './components/modals/KeyboardShortcutsModal';
import TourModal from './components/modals/TourModal';
import FeedbackModal from './components/modals/FeedbackModal';


import { Entity } from '@/app/financial-tracker/types/entity.types';



interface QuickFilter {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  filter: (entity: Entity) => boolean;
}

interface ViewPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  config: {
    module: 'all' | 're' | 'expense';
    showInactive: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

interface AnalyticsData {
  daily: { date: string; count: number }[];
  weekly: { week: string; count: number }[];
  monthly: { month: string; count: number }[];
  moduleDistribution: { module: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  approvalDistribution: { approved: boolean; count: number }[];
  activityHeatmap: { hour: number; day: number; count: number }[];
  trends: {
    growth: number;
    active: number;
    pending: number;
    archived: number;
  };
}

const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const statsCardVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.02, y: -3, transition: { duration: 0.2 } }
};

const filterChipVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export default function EntitiesPage() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Core Data
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 're' | 'expense'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<string>('default');

  // Sorting
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Entity[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // UI State
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban' | 'gallery'>('table');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  const [compactMode, setCompactMode] = useLocalStorage('compactMode', false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteEntities', []);
  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showCharts, setShowCharts] = useState(true);

  // Zoom & View Preferences
  const [zoomLevel, setZoomLevel] = useLocalStorage('zoomLevel', 1);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);
  const [chartDensity, setChartDensity] = useLocalStorage<'compact' | 'comfortable' | 'luxury'>('chartDensity', 'comfortable');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isKeyboardShortcutsModalOpen, setIsKeyboardShortcutsModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Hooks
  const [debouncedSearch, debouncedControls] = useDebounce(searchTerm, 300);
  const { ref: loadMoreRef, inView } = useInView();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ============================================
  // MEMOIZED VALUES
  // ============================================

  // Quick Filters
  const quickFilters: QuickFilter[] = useMemo(() => [
    { id: 'all', label: 'All', icon: LayoutDashboard, color: 'blue', filter: () => true },
    { id: 're', label: 'RE Only', icon: DollarSign, color: 'blue', filter: (e: any) => e.module === 're' },
    { id: 'expense', label: 'Expense Only', icon: CreditCard, color: 'green', filter: (e) => e.module === 'expense' },
    { id: 'active', label: 'Active', icon: Zap, color: 'green', filter: (e) => e.isEnabled },
    { id: 'inactive', label: 'Inactive', icon: PowerOff, color: 'gray', filter: (e) => !e.isEnabled },
    { id: 'approval', label: 'Approval Required', icon: Shield, color: 'purple', filter: (e) => e.enableApproval },
    { id: 'recent', label: 'Recently Updated', icon: Clock, color: 'orange', filter: (e) => differenceInDays(new Date(), new Date(e.updatedAt)) < 7 },
    { id: 'favorites', label: 'Favorites', icon: Star, color: 'yellow', filter: (e) => favorites.includes(e._id) },
  ], [favorites]);

  // View Presets
  const viewPresets: ViewPreset[] = useMemo(() => [
    { id: 'default', name: 'Default View', icon: LayoutDashboard, config: { module: 'all', showInactive: false, sortBy: 'name', sortOrder: 'asc' } },
    { id: 're-only', name: 'RE Focus', icon: DollarSign, config: { module: 're', showInactive: false, sortBy: 'name', sortOrder: 'asc' } },
    { id: 'expense-only', name: 'Expense Focus', icon: CreditCard, config: { module: 'expense', showInactive: false, sortBy: 'name', sortOrder: 'asc' } },
    { id: 'approval-needed', name: 'Approval Needed', icon: Shield, config: { module: 'all', showInactive: true, sortBy: 'enableApproval', sortOrder: 'desc' } },
    { id: 'recent-updates', name: 'Recent Updates', icon: Clock, config: { module: 'all', showInactive: true, sortBy: 'updatedAt', sortOrder: 'desc' } },
    { id: 'newest-first', name: 'Newest First', icon: Calendar, config: { module: 'all', showInactive: true, sortBy: 'createdAt', sortOrder: 'desc' } },
  ], []);

  // Filtered Entities
  const filteredEntities = useMemo(() => {
    return entities.filter(entity => {
      if (!entity) return false;

      const searchLower = (searchTerm || '').toLowerCase();
      const name = (entity.name || '').toLowerCase();
      const entityKey = (entity.entityKey || '').toLowerCase();
      const description = (entity.description || '').toLowerCase();
      const createdBy = (entity.createdBy?.fullName || '').toLowerCase();
      const updatedBy = (entity.updatedBy?.fullName || '').toLowerCase();
      const tags = entity.metadata?.tags?.join(' ').toLowerCase() || '';

      return name.includes(searchLower) ||
        entityKey.includes(searchLower) ||
        description.includes(searchLower) ||
        createdBy.includes(searchLower) ||
        updatedBy.includes(searchLower) ||
        tags.includes(searchLower);
    });
  }, [entities, searchTerm]);

  // Stats with Trends
  const stats = useMemo(() => {
    const now = new Date();
    const lastWeek = subWeeks(now, 1);
    const lastMonth = subMonths(now, 1);

    const current = {
      total: filteredEntities.length,
      re: filteredEntities.filter(e => e?.module === 're').length,
      expense: filteredEntities.filter(e => e?.module === 'expense').length,
      approval: filteredEntities.filter(e => e?.enableApproval).length,
      disabled: filteredEntities.filter(e => !e?.isEnabled).length,
      favorites: filteredEntities.filter(e => favorites.includes(e._id)).length,
    };

    const previous = {
      total: entities.filter(e => new Date(e.createdAt) < lastWeek).length,
      re: entities.filter(e => e?.module === 're' && new Date(e.createdAt) < lastWeek).length,
      expense: entities.filter(e => e?.module === 'expense' && new Date(e.createdAt) < lastWeek).length,
      approval: entities.filter(e => e?.enableApproval && new Date(e.createdAt) < lastWeek).length,
    };

    const trends = {
      total: current.total - previous.total,
      re: current.re - previous.re,
      expense: current.expense - previous.expense,
      approval: current.approval - previous.approval,
      growth: previous.total ? ((current.total - previous.total) / previous.total) * 100 : 0,
    };

    return { current, trends };
  }, [filteredEntities, entities, favorites]);

  // ============================================
  // ANALYTICS DATA GENERATION
  // ============================================

  const generateAnalyticsData = useCallback((): AnalyticsData => {
    const now = new Date();

    // Daily data for last 30 days
    const daily = eachDayOfInterval({
      start: subDays(now, 29),
      end: now
    }).map(date => ({
      date: format(date, 'MMM dd'),
      count: Math.floor(Math.random() * 20) + 5 // Replace with actual data
    }));

    // Weekly data for last 12 weeks
    const weekly = eachWeekOfInterval({
      start: subWeeks(now, 11),
      end: now
    }).map(week => ({
      week: `Week ${format(week, 'w')}`,
      count: Math.floor(Math.random() * 50) + 20
    }));

    // Monthly data for last 12 months
    const monthly = eachMonthOfInterval({
      start: subMonths(now, 11),
      end: now
    }).map(month => ({
      month: format(month, 'MMM yyyy'),
      count: Math.floor(Math.random() * 100) + 50
    }));

    // Distribution data
    const moduleDistribution = [
      { module: 'RE', count: stats.current.re },
      { module: 'Expense', count: stats.current.expense }
    ];

    const statusDistribution = [
      { status: 'Active', count: stats.current.total - stats.current.disabled },
      { status: 'Inactive', count: stats.current.disabled }
    ];

    const approvalDistribution = [
      { approved: true, count: stats.current.approval },
      { approved: false, count: stats.current.total - stats.current.approval }
    ];

    // Activity heatmap (24h x 7d)
    const activityHeatmap = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        activityHeatmap.push({
          hour,
          day,
          count: Math.floor(Math.random() * 50)
        });
      }
    }

    return {
      daily,
      weekly,
      monthly,
      moduleDistribution,
      statusDistribution,
      approvalDistribution,
      activityHeatmap,
      trends: {
        growth: stats.trends.growth,
        active: stats.current.total - stats.current.disabled,
        pending: stats.current.approval,
        archived: stats.current.disabled
      }
    };
  }, [stats]);

  // ============================================
  // CHART CONFIGURATIONS
  // ============================================

  const lineChartData = {
    labels: analyticsData?.daily.map(d => d.date) || [],
    datasets: [
      {
        label: 'Entity Creation',
        data: analyticsData?.daily.map(d => d.count) || [],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const barChartData = {
    labels: analyticsData?.monthly.map(m => m.month) || [],
    datasets: [
      {
        label: 'Monthly Growth',
        data: analyticsData?.monthly.map(m => m.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ]
  };

  const pieChartData = {
    labels: analyticsData?.moduleDistribution.map(d => d.module) || [],
    datasets: [
      {
        data: analyticsData?.moduleDistribution.map(d => d.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 2,
      }
    ]
  };

  const doughnutChartData = {
    labels: analyticsData?.statusDistribution.map(d => d.status) || [],
    datasets: [
      {
        data: analyticsData?.statusDistribution.map(d => d.count) || [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(107, 114, 128)',
        ],
        borderWidth: 2,
      }
    ]
  };

  const radarChartData = {
    labels: ['Active', 'Pending', 'Approved', 'Archived', 'Draft', 'Review'],
    datasets: [
      {
        label: 'Current',
        data: [65, 59, 90, 81, 56, 55],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgb(139, 92, 246)',
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(139, 92, 246)',
      },
      {
        label: 'Previous',
        data: [45, 49, 70, 61, 46, 45],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, family: 'Inter, sans-serif' },
        bodyFont: { size: 11, family: 'Inter, sans-serif' },
        padding: 8,
        cornerRadius: 4,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 10, family: 'Inter, sans-serif' }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10, family: 'Inter, sans-serif' },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // ============================================
  // API CALLS
  // ============================================

  const fetchEntities = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) setIsLoading(true);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '50');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      if (selectedModule !== 'all') {
        params.append('module', selectedModule);
      }

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (selectedQuickFilter !== 'all') {
        params.append('filter', selectedQuickFilter);
      }

      const token = getToken();

      const response = await fetch(`/financial-tracker/api/financial-tracker/entities?${params.toString()}`, {
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to fetch entities');

      const data = await response.json();

      let newEntities = (data.entities || []).filter((e: any) => e != null);

      if (!showInactive) {
        newEntities = newEntities.filter((e: Entity) => e.isEnabled === true);
      }

      // Apply quick filter
      const quickFilter = quickFilters.find(f => f.id === selectedQuickFilter);
      if (quickFilter && selectedQuickFilter !== 'all') {
        newEntities = newEntities.filter(quickFilter.filter);
      }

      // Sort entities
      newEntities.sort((a: any, b: any) => {
        let aVal = a[sortBy as keyof Entity];
        let bVal = b[sortBy as keyof Entity];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        }

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      setEntities(loadMore ? [...entities, ...newEntities] : newEntities);
      setHasMore(newEntities.length === 50);

      // Update analytics
      setAnalyticsData(generateAnalyticsData());

      // Add to recent searches
      if (debouncedSearch && !recentSearches.includes(debouncedSearch)) {
        setRecentSearches([debouncedSearch, ...recentSearches.slice(0, 9)]);
      }

    } catch (error) {
      toast.error('Failed to load entities');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModule, showInactive, debouncedSearch, selectedQuickFilter, sortBy, sortOrder, page, entities, recentSearches, setRecentSearches, quickFilters, generateAnalyticsData]);

  // Initial fetch
  useEffect(() => {
    fetchEntities();
  }, [selectedModule, showInactive, debouncedSearch, selectedQuickFilter, sortBy, sortOrder]);

  // Load more on scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(p => p + 1);
      fetchEntities(true);
    }
  }, [inView, hasMore, isLoading, fetchEntities]);

  // ============================================
  // HANDLERS
  // ============================================

  // Selection handlers
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedRows(new Set(filteredEntities.map(e => e._id)));
    toast.success(`Selected ${filteredEntities.length} entities`);
  };

  const deselectAll = () => {
    setSelectedRows(new Set());
    toast.success('All selections cleared');
  };

  const toggleBulkMode = () => {
    setBulkActionMode(!bulkActionMode);
    if (!bulkActionMode) setSelectedRows(new Set());
  };

  // Bulk actions
  const bulkToggleStatus = async (enable: boolean) => {
    try {
      const token = getToken();
      const promises = Array.from(selectedRows).map(id =>
        fetch(`/financial-tracker/api/financial-tracker/entities/${id}/toggle`, {
          method: 'PATCH',
          headers: { 'Authorization': token }
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedRows.size} entities ${enable ? 'activated' : 'deactivated'}`);
      fetchEntities();
      setSelectedRows(new Set());
      setBulkActionMode(false);
    } catch (error) {
      toast.error('Bulk operation failed');
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} entities?`)) return;

    try {
      const token = getToken();
      const promises = Array.from(selectedRows).map(id =>
        fetch(`/financial-tracker/api/financial-tracker/entities/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': token }
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedRows.size} entities deleted`);
      fetchEntities();
      setSelectedRows(new Set());
      setBulkActionMode(false);
    } catch (error) {
      toast.error('Bulk delete failed');
    }
  };

  // Export functionality
  const exportData = async (format: 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html' = 'excel') => {
    try {
      const dataToExport = selectedRows.size > 0
        ? entities.filter(e => selectedRows.has(e._id))
        : filteredEntities;

      switch (format) {
        case 'excel':
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Entities');
          XLSX.writeFile(wb, `entities-${new Date().toISOString()}.xlsx`);
          break;

        case 'csv':
          const csvData = dataToExport.map(e => ({
            Name: e.name,
            Key: e.entityKey,
            Module: e.module,
            Status: e.isEnabled ? 'Active' : 'Inactive',
            Approval: e.enableApproval ? 'Yes' : 'No',
            Created: formatDate(new Date(e.createdAt), 'PPP'),
            Updated: formatDate(new Date(e.updatedAt), 'PPP')
          }));
          const ws_csv = XLSX.utils.json_to_sheet(csvData);
          const csv = XLSX.utils.sheet_to_csv(ws_csv);
          const blob = new Blob([csv], { type: 'text/csv' });
          saveAs(blob, `entities-${new Date().toISOString()}.csv`);
          break;

        case 'pdf':
          const doc = new jsPDF();
          doc.text('Entities Report', 14, 15);
          autoTable(doc, {
            head: [['Name', 'Key', 'Module', 'Status', 'Approval']],
            body: dataToExport.map(e => [
              e.name,
              e.entityKey,
              e.module,
              e.isEnabled ? 'Active' : 'Inactive',
              e.enableApproval ? 'Yes' : 'No'
            ]),
            startY: 25,
          });
          doc.save(`entities-${new Date().toISOString()}.pdf`);
          break;

        case 'json':
          const jsonStr = JSON.stringify(dataToExport, null, 2);
          const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
          saveAs(jsonBlob, `entities-${new Date().toISOString()}.json`);
          break;

        case 'xml':
          // Generate XML
          break;

        case 'html':
          // Generate HTML
          break;
      }

      toast.success(`Exported ${dataToExport.length} entities`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // CRUD handlers
  const handleCreate = () => setIsCreateModalOpen(true);

  const handleEdit = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsEditModalOpen(true);
  };

  const handleView = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsViewModalOpen(true);
  };

  const handleToggleStatus = async (entityId: string, currentStatus: boolean) => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entityId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to toggle entity');

      toast.success(`Entity ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchEntities();
    } catch (error) {
      toast.error('Failed to toggle entity');
    }
  };

  const handleDelete = async (entityId: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;

    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entityId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to delete entity');

      toast.success('Entity deleted successfully');
      fetchEntities();
    } catch (error) {
      toast.error('Failed to delete entity');
    }
  };

  const handleClone = async (entity: Entity) => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entity._id}/clone`, {
        method: 'POST',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to clone entity');

      toast.success('Entity cloned successfully');
      fetchEntities();
    } catch (error) {
      toast.error('Failed to clone entity');
    }
  };

  const handleArchive = async (entityId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entityId}/archive`, {
        method: 'POST',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to archive entity');

      toast.success('Entity archived successfully');
      fetchEntities();
    } catch (error) {
      toast.error('Failed to archive entity');
    }
  };

  const toggleFavorite = (entityId: string) => {
    setFavorites((prev: any) => {
      if (prev.includes(entityId)) {
        return prev.filter((id: any) => id !== entityId);
      } else {
        return [...prev, entityId];
      }
    });
  };

  // Preset handler
  const applyPreset = (preset: ViewPreset) => {
    setSelectedPreset(preset.id);
    setSelectedModule(preset.config.module);
    setShowInactive(preset.config.showInactive);
    setSortBy(preset.config.sortBy);
    setSortOrder(preset.config.sortOrder);
    toast.success(`Applied preset: ${preset.name}`);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
  const handleZoomReset = () => setZoomLevel(1);

  // ============================================
  // RENDER
  // ============================================

  return (
    <motion.div
      className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{ zoom: zoomLevel }}
    >
      <style jsx global>{`
        :root {
          --color-primary: #3b82f6;
          --color-secondary: #10b981;
          --color-accent: #8b5cf6;
          --color-background: #f9fafb;
          --color-surface: #ffffff;
          --color-text: #111827;
          --color-text-secondary: #6b7280;
          --color-border: #e5e7eb;
          --color-hover: #f3f4f6;
        }
        
        .dark {
          --color-primary: #60a5fa;
          --color-secondary: #34d399;
          --color-accent: #a78bfa;
          --color-background: #111827;
          --color-surface: #1f2937;
          --color-text: #f9fafb;
          --color-text-secondary: #9ca3af;
          --color-border: #374151;
          --color-hover: #374151;
        }
        
        * {
          transition: background-color 0.2s, border-color 0.2s, color 0.2s;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--color-hover);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--color-text-secondary);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-text);
        }
      `}</style>

      {/* Header with Glassmorphism - Optimized Size */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-2">
          {/* Top Bar - Compact */}
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-50 animate-pulse"></div>
                <div className="relative p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Entity Management
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                  <span>Configure entities</span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center">
                    <Zap className="h-2.5 w-2.5 mr-0.5 text-yellow-500" />
                    {filteredEntities.length} active
                  </span>
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Connection Status */}
              <ConnectionStatus module="admin" entity="entities" />

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs px-1">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleZoomReset}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ml-1"
                  title="Reset zoom"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-700" />
                )}
              </button>

              {/* Compact Mode Toggle */}
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`p-1.5 border rounded-lg transition-all ${compactMode ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                title="Toggle compact mode"
              >
                {compactMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Refresh Button */}
              <motion.button
                onClick={() => fetchEntities()}
                className="p-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                title="Refresh (Ctrl+R)"
              >
                <RefreshCw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </motion.button>

              {/* Export Button */}
              <ExportButton
                onExport={exportData}
                formats={['excel', 'csv', 'pdf', 'json']}
                size="sm"
                variant="outline"
              />

              {/* Create Button */}
              <motion.button
                onClick={handleCreate}
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Create new entity (Ctrl+N)"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </motion.button>
            </motion.div>
          </div>

          {/* Quick Actions Bar - Compact */}
          <motion.div
            className="flex items-center justify-between mt-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              {/* Quick Filters - Smaller */}
              <div className="flex items-center space-x-1">
                {quickFilters.slice(0, 6).map((filter, index) => {
                  const Icon = filter.icon;
                  const isSelected = selectedQuickFilter === filter.id;

                  return (
                    <motion.button
                      key={filter.id}
                      variants={filterChipVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      whileTap="tap"
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedQuickFilter(isSelected ? 'all' : filter.id)}
                      className={`
                        flex items-center px-2 py-1 rounded-full text-xs font-medium
                        transition-all
                        ${isSelected
                          ? `bg-${filter.color}-100 text-${filter.color}-700 dark:bg-${filter.color}-900 dark:text-${filter.color}-300 shadow-sm`
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className={`h-3 w-3 mr-1 ${isSelected ? `text-${filter.color}-600 dark:text-${filter.color}-400` : ''
                        }`} />
                      {filter.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* View Presets */}
              <div className="flex items-center space-x-1 border-l pl-2 ml-1 border-gray-300 dark:border-gray-700">
                {viewPresets.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset === preset.id;

                  return (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applyPreset(preset)}
                      className={`
                        p-1 rounded-lg transition-all
                        ${isSelected
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 shadow-sm'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }
                      `}
                      title={preset.name}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Bulk Actions */}
              <motion.button
                onClick={toggleBulkMode}
                className={`flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all ${bulkActionMode
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 shadow-sm'
                    : 'border hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Bulk mode (Ctrl+B)"
              >
                <Layers className="h-3.5 w-3.5 mr-1" />
                Bulk
                {selectedRows.size > 0 && (
                  <span className="ml-1 px-1 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                    {selectedRows.size}
                  </span>
                )}
              </motion.button>

              {bulkActionMode && (
                <motion.div
                  className="flex items-center space-x-1"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                >
                  <button
                    onClick={selectAll}
                    className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                  >
                    All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  >
                    None
                  </button>
                  <button
                    onClick={() => bulkToggleStatus(true)}
                    className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => bulkToggleStatus(false)}
                    className="px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                  >
                    Delete
                  </button>
                </motion.div>
              )}

              {/* View Mode Toggle - Compact */}
              <div className="flex border rounded-lg overflow-hidden">
                {[
                  { mode: 'table', icon: List, label: 'Table' },
                  { mode: 'cards', icon: Grid3x3, label: 'Cards' },
                  { mode: 'kanban', icon: GitBranch, label: 'Kanban' },
                  { mode: 'gallery', icon: Layers, label: 'Gallery' },
                ].map(({ mode, icon: Icon, label }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode as any)}
                    className={`
                      p-1.5 transition-all text-xs
                      ${viewMode === mode
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }
                    `}
                    title={`${label} view`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Search and Filters - Compact */}
          <motion.div
            className="mt-2 grid grid-cols-12 gap-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Search Bar */}
            <div className="col-span-5 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  ×
                </button>
              )}
            </div>

            {/* Module Filter */}
            <div className="col-span-2">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All</option>
                <option value="re">🏠 RE</option>
                <option value="expense">💰 Expense</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="name">Name</option>
                <option value="entityKey">Key</option>
                <option value="module">Module</option>
                <option value="createdAt">Created</option>
                <option value="updatedAt">Updated</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="col-span-1">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-2 py-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 flex items-center justify-center text-sm"
                title="Toggle sort order"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Toggle Filters */}
            <div className="col-span-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-2 py-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-sm"
                title="Toggle filters"
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                {showFilters ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Toggle Stats */}
            <div className="col-span-1">
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full px-2 py-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-sm"
                title="Toggle stats"
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                Stats
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Perfectly Scaled */}
      <div className={`p-4 ${compactMode ? 'space-y-3' : 'space-y-4'}`} style={{ zoom: 1 }}>
        {/* Stats Cards - Compact */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-7 gap-3">
                {/* Total Entities */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-[10px]">Total</p>
                      <p className="text-xl font-bold">{stats.current.total}</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center text-[9px] text-blue-100">
                    {stats.trends.total > 0 ? (
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                    )}
                    <span>{Math.abs(stats.trends.total)}</span>
                  </div>
                </motion.div>

                {/* RE Module */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 text-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-[10px]">RE</p>
                      <p className="text-xl font-bold">{stats.current.re}</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center text-[9px] text-indigo-100">
                    {stats.trends.re > 0 ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                    <span>{Math.abs(stats.trends.re)}</span>
                  </div>
                </motion.div>

                {/* Expense Module */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-[10px]">Expense</p>
                      <p className="text-xl font-bold">{stats.current.expense}</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center text-[9px] text-green-100">
                    {stats.trends.expense > 0 ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                    <span>{Math.abs(stats.trends.expense)}</span>
                  </div>
                </motion.div>

                {/* Approval Required */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-[10px]">Approval</p>
                      <p className="text-xl font-bold">{stats.current.approval}</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Shield className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center text-[9px] text-purple-100">
                    {stats.trends.approval > 0 ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                    <span>{Math.abs(stats.trends.approval)}</span>
                  </div>
                </motion.div>

                {/* Inactive */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-3 text-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-[10px]">Inactive</p>
                      <p className="text-xl font-bold">{stats.current.disabled}</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <PowerOff className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-1 text-[9px] text-gray-100">
                    {((stats.current.disabled / stats.current.total) * 100 || 0).toFixed(0)}%
                  </div>
                </motion.div>

                {/* Favorites */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-[10px]">Fav</p>
                      <p className="text-xl font-bold">{stats.current.favorites}</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Star className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Active Now */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-[10px]">24h</p>
                      <p className="text-xl font-bold">
                        {entities.filter(e => differenceInHours(new Date(), new Date(e.updatedAt)) < 24).length}
                      </p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Activity className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Charts - Seaborn Style */}
        {showCharts && analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-3"
          >
            {/* Line Chart - Daily Trend */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">Daily Trend</h3>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-gray-500">+{stats.trends.growth.toFixed(1)}%</span>
                  {stats.trends.growth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
              <div style={{ height: '120px' }}>
                <Line data={lineChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
              </div>
            </div>

            {/* Bar Chart - Monthly */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">Monthly Growth</h3>
                <button
                  onClick={() => setIsAnalyticsModalOpen(true)}
                  className="text-[10px] text-blue-600 hover:text-blue-700"
                >
                  View Details →
                </button>
              </div>
              <div style={{ height: '120px' }}>
                <Bar data={barChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
              </div>
            </div>

            {/* Pie Chart - Module Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Modules</h3>
              <div style={{ height: '100px' }} className="flex justify-center">
                <Pie data={pieChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
              </div>
              <div className="mt-2 flex justify-center space-x-3 text-[10px]">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                  <span>RE: {stats.current.re}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span>Expense: {stats.current.expense}</span>
                </div>
              </div>
            </div>

            {/* Doughnut Chart - Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
              <div style={{ height: '100px' }} className="flex justify-center">
                <Doughnut data={doughnutChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
              </div>
              <div className="mt-2 flex justify-center space-x-3 text-[10px]">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span>Active: {stats.current.total - stats.current.disabled}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-500 mr-1"></div>
                  <span>Inactive: {stats.current.disabled}</span>
                </div>
              </div>
            </div>

            {/* Radar Chart - Comparison */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Comparison</h3>
              <div style={{ height: '120px' }}>
                <Radar data={radarChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />
              </div>
            </div>

            {/* Mini Heatmap */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Heatmap</h3>
              <div className="grid grid-cols-24 gap-0.5 h-[80px]">
                {analyticsData.activityHeatmap.slice(0, 168).map((cell, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${cell.count / 50})`,
                      height: '100%'
                    }}
                    title={`Hour: ${cell.hour}, Day: ${cell.day}, Count: ${cell.count}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[8px] text-gray-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{filteredEntities.length}</span> of{' '}
              <span className="font-medium">{entities.length}</span> entities
            </p>
            {selectedRows.size > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {selectedRows.size} selected
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span>Page {page}</span>
            <span>•</span>
            <span>Updated {formatDistance(new Date(), new Date())} ago</span>
          </div>
        </div>

        {/* View Modes */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <EntitiesTable
                entities={filteredEntities}
                isLoading={isLoading}
                onEdit={handleEdit}
                onView={handleView}
                onToggle={handleToggleStatus}
                onDelete={handleDelete}
                onClone={handleClone}
                onArchive={handleArchive}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
                selectedRows={selectedRows}
                onToggleRowSelection={toggleRowSelection}
                bulkMode={bulkActionMode}
                compactMode={compactMode}
              />
            </motion.div>
          )}

          {viewMode === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`grid ${compactMode ? 'grid-cols-5 gap-2' : 'grid-cols-4 gap-3'}`}
            >
              {filteredEntities.map((entity, index) => {
                if (!entity) return null;

                const Icon = entity.module === 're' ? DollarSign : CreditCard;
                const color = entity.module === 're' ? 'blue' : 'green';
                const isFavorite = favorites.includes(entity._id);
                const isSelected = selectedRows.has(entity._id);

                return (
                  <motion.div
                    key={entity._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className={`
                      bg-white dark:bg-gray-800 rounded-lg border shadow-sm 
                      hover:shadow transition-all cursor-pointer relative overflow-hidden
                      ${!entity.isEnabled ? 'opacity-60' : ''}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      ${compactMode ? 'p-2' : 'p-3'}
                    `}
                    onClick={() => bulkActionMode ? toggleRowSelection(entity._id) : handleView(entity)}
                  >
                    {/* Selection Checkbox */}
                    {bulkActionMode && (
                      <div className="absolute top-1 left-1 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(entity._id)}
                          className="w-3 h-3 rounded border-gray-300 text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    {/* Favorite Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(entity._id);
                      }}
                      className={`absolute top-1 right-1 p-0.5 rounded-full transition-all ${isFavorite
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-gray-400 dark:text-gray-600'
                        }`}
                    >
                      <Star className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    {/* Icon and Name */}
                    <div className="flex items-start space-x-2">
                      <div className={`p-1 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                        <Icon className={`h-3.5 w-3.5 text-${color}-600 dark:text-${color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-gray-900 dark:text-white truncate text-xs`}>
                          {entity.name || 'Untitled'}
                        </h3>
                        <div className="flex items-center mt-0.5">
                          <code className="text-[9px] bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded font-mono">
                            {entity.entityKey || 'N/A'}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-0.5">
                      {entity.enableApproval && (
                        <span className="inline-flex items-center px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[8px] rounded-full">
                          <Shield className="h-2 w-2 mr-0.5" />
                          Approval
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-2 flex items-center justify-between text-[8px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-2 w-2 mr-0.5" />
                        {formatDistance(new Date(entity.updatedAt), new Date(), { addSuffix: true })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-3 text-center">
            <div className="inline-flex items-center space-x-1 text-gray-500 text-xs">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
              <span>Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Menu - Compact */}
      <motion.div
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-1.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <button
          onClick={() => setIsAnalyticsModalOpen(true)}
          className="p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-105"
          title="Analytics"
        >
          <BarChart3 className="h-4 w-4" />
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsKeyboardShortcutsModalOpen(true)}
          className="p-2 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all hover:scale-105"
          title="Keyboard shortcuts"
        >
          <Command className="h-4 w-4" />
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-105"
          title="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </motion.div>

      {/* ============================================
          MODALS
          ============================================ */}

      {/* Create Entity Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateEntityModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              fetchEntities();
              toast.success('Entity created successfully!');
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Entity Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedEntity && (
          <EditEntityModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedEntity(null);
            }}
            entity={selectedEntity}
            onSuccess={() => {
              fetchEntities();
              toast.success('Entity updated successfully!');
            }}
          />
        )}
      </AnimatePresence>

      {/* View Entity Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedEntity && (
          <ViewEntityModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedEntity(null);
            }}
            entity={selectedEntity}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(selectedEntity._id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClone={handleClone}
            onArchive={handleArchive}
            onRefresh={fetchEntities}
          />
        )}
      </AnimatePresence>

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {isBulkEditModalOpen && selectedRows.size > 0 && (
          <BulkEditModal
            isOpen={isBulkEditModalOpen}
            onClose={() => setIsBulkEditModalOpen(false)}
            entityIds={Array.from(selectedRows)}
            entities={entities.filter(e => selectedRows.has(e._id))}
            onSuccess={() => {
              fetchEntities();
              setSelectedRows(new Set());
              setBulkActionMode(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && selectedEntity && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            entity={selectedEntity}
            shareUrl={`${window.location.origin}/admin/financial-tracker/entities/${selectedEntity._id}`}
          />
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExport={exportData}
            selectedCount={selectedRows.size}
            totalCount={filteredEntities.length}
          />
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={() => {
              fetchEntities();
              toast.success('Entities imported successfully');
            }}
          />
        )}
      </AnimatePresence>

      {/* Clone Modal */}
      <AnimatePresence>
        {isCloneModalOpen && selectedEntity && (
          <CloneModal
            isOpen={isCloneModalOpen}
            onClose={() => setIsCloneModalOpen(false)}
            entity={selectedEntity}
            onSuccess={(clonedEntity: any) => {
              fetchEntities();
              toast.success(`Entity cloned successfully`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Archive Modal */}
      <AnimatePresence>
        {isArchiveModalOpen && selectedEntity && (
          <ArchiveModal
            isOpen={isArchiveModalOpen}
            onClose={() => setIsArchiveModalOpen(false)}
            entity={selectedEntity}
            onConfirm={async () => {
              await handleArchive(selectedEntity._id);
              setIsArchiveModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>



      {/* Analytics Modal */}
      <AnimatePresence>

        {isAnalyticsModalOpen && analyticsData && (
          <AnalyticsModal
            isOpen={isAnalyticsModalOpen}
            onClose={() => setIsAnalyticsModalOpen(false)}
            analyticsData={analyticsData}
            stats={stats}
            entities={entities}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            theme={theme}
            setTheme={setTheme}
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            chartDensity={chartDensity}
            setChartDensity={setChartDensity}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {isKeyboardShortcutsModalOpen && (
          <KeyboardShortcutsModal
            isOpen={isKeyboardShortcutsModalOpen}
            onClose={() => setIsKeyboardShortcutsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Tour Modal */}
      <AnimatePresence>
        {isTourModalOpen && (
          <TourModal
            isOpen={isTourModalOpen}
            onClose={() => setIsTourModalOpen(false)}
            onComplete={() => {
              toast.success('Tour completed! You\'re ready to go!');
            }}
          />
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            onSubmit={(feedback: any) => {
              toast.success('Thank you for your feedback!');
              console.log('Feedback:', feedback);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper components
const ArrowUp = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);