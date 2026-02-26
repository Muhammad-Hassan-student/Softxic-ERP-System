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
  Link,
  ExternalLink,
  FileText,
  Image,
  Paperclip,
  Mic,
  Camera,
  VideoIcon,
  Headphones,
  Speaker,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Command,
  Option,
  Shift,
  Ctrl,
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
  Hurricane,
  Earthquake,
  Volcano,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Seedling,
  Bug,
  Bird,
  Fish,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Snake,
  Dragon,
  Unicorn,
  Ghost,
  Skull,
  Alien,
  Robot,
  Android,
  Apple,
  Windows,
  Linux,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Opera,
  InternetExplorer,
  Code,
  Terminal,
  Brackets,
  Braces,
  Parentheses,
  Hash,
  AtSign,
  DollarSign as DollarIcon,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  CreditCard as CreditCardIcon,
  Wallet,
  Banknote,
  Coins,
  PiggyBank,
  Gem,
  Diamond,
  Ring,
  Heart,
  HeartPulse,
  HeartOff,
  Brain,
  Eye as EyeIcon,
  EyeOff,
  Ear,
  Nose,
  Mouth,
  Tooth,
  Bone,
  Muscle,
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
  Rainy,
  Snowy,
  Stormy,
  Foggy,
  Windy,
  Hail,
  Sleet,
  Mist,
  Smoke,
  Dust,
  Sand,
  Ash,
  Fog,
  Tornado as TornadoIcon,
  Hurricane as HurricaneIcon,
  Earthquake as EarthquakeIcon,
  Volcano as VolcanoIcon,
  Mountain as MountainIcon,
  Tree as TreeIcon,
  Flower as FlowerIcon,
  Leaf as LeafIcon,
  Seedling as SeedlingIcon,
  Bug as BugIcon,
  Bird as BirdIcon,
  Fish as FishIcon,
  Cat as CatIcon,
  Dog as DogIcon,
  Rabbit as RabbitIcon,
  Turtle as TurtleIcon,
  Snake as SnakeIcon,
  Dragon as DragonIcon,
  Unicorn as UnicornIcon,
  Ghost as GhostIcon,
  Skull as SkullIcon,
  Alien as AlienIcon,
  Robot as RobotIcon,
  Android as AndroidIcon,
  Apple as AppleIcon,
  Windows as WindowsIcon,
  Linux as LinuxIcon,
  Chrome as ChromeIcon,
  Firefox as FirefoxIcon,
  Safari as SafariIcon,
  Edge as EdgeIcon,
  Opera as OperaIcon,
  InternetExplorer as InternetExplorerIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  Brackets as BracketsIcon,
  Braces as BracesIcon,
  Parentheses as ParenthesesIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  Euro as EuroIcon,
  PoundSterling as PoundSterlingIcon,
  Yen as YenIcon,
  Bitcoin as BitcoinIcon,
  Wallet as WalletIcon,
  Banknote as BanknoteIcon,
  Coins as CoinsIcon,
  PiggyBank as PiggyBankIcon,
  Gem as GemIcon,
  Diamond as DiamondIcon,
  Ring as RingIcon,
  Heart as HeartIcon,
  HeartPulse as HeartPulseIcon,
  HeartOff as HeartOffIcon,
  Brain as BrainIcon,
  EyeOff as EyeOffIcon,
  Ear as EarIcon,
  Nose as NoseIcon,
  Mouth as MouthIcon,
  Tooth as ToothIcon,
  Bone as BoneIcon,
  Muscle as MuscleIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
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
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, formatDistance, formatRelative, subDays, differenceInDays } from 'date-fns';

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  branchId?: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

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
  hover: { scale: 1.05, y: -5, transition: { duration: 0.2 } }
};

const filterChipVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.95 }
};

export default function EntitiesPage() {
  // State Management
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 're' | 'expense'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban' | 'gallery'>('table');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<string>('default');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  const [compactMode, setCompactMode] = useLocalStorage('compactMode', false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteEntities', []);
  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isKeyboardShortcutsModalOpen, setIsKeyboardShortcutsModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Entity[]>([]);

  // Hooks
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { ref: loadMoreRef, inView } = useInView();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Quick Filters
  const quickFilters: QuickFilter[] = useMemo(() => [
    { id: 'all', label: 'All', icon: LayoutDashboard, color: 'blue', filter: () => true },
    { id: 're', label: 'RE Only', icon: DollarSign, color: 'blue', filter: (e) => e.module === 're' },
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

  // Fetch entities with advanced features
  const fetchEntities = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) setIsLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        sortBy,
        sortOrder,
        ...(selectedModule !== 'all' && { module: selectedModule }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedQuickFilter !== 'all' && { filter: selectedQuickFilter }),
      });
      
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
      newEntities.sort((a, b) => {
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
      
      // Add to recent searches if search term exists
      if (debouncedSearch && !recentSearches.includes(debouncedSearch)) {
        setRecentSearches([debouncedSearch, ...recentSearches.slice(0, 9)]);
      }
      
    } catch (error) {
      toast.error('Failed to load entities');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModule, showInactive, debouncedSearch, selectedQuickFilter, sortBy, sortOrder, page, entities, recentSearches, setRecentSearches, quickFilters]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'n': e.preventDefault(); setIsCreateModalOpen(true); break;
          case 'f': e.preventDefault(); document.getElementById('search-input')?.focus(); break;
          case 'e': e.preventDefault(); setViewMode('table'); break;
          case 'c': e.preventDefault(); setViewMode('cards'); break;
          case 'k': e.preventDefault(); setViewMode('kanban'); break;
          case 'g': e.preventDefault(); setViewMode('gallery'); break;
          case 'r': e.preventDefault(); fetchEntities(); break;
          case 's': e.preventDefault(); setShowFilters(!showFilters); break;
          case 'h': e.preventDefault(); setIsKeyboardShortcutsModalOpen(true); break;
          case 'b': e.preventDefault(); setBulkActionMode(!bulkActionMode); break;
          case 'a': e.preventDefault(); if (e.shiftKey) selectAll(); break;
          case 'd': e.preventDefault(); if (e.shiftKey) deselectAll(); break;
          case 'x': e.preventDefault(); exportData(); break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchEntities, showFilters, bulkActionMode]);

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

      switch(format) {
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
            Created: format(new Date(e.createdAt), 'PPP'),
            Updated: format(new Date(e.updatedAt), 'PPP')
          }));
          // Use CSVLink component
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
          const blob = new Blob([jsonStr], { type: 'application/json' });
          saveAs(blob, `entities-${new Date().toISOString()}.json`);
          break;
      }
      
      toast.success(`Exported ${dataToExport.length} entities`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // Handle create
  const handleCreate = () => setIsCreateModalOpen(true);

  // Handle edit
  const handleEdit = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsEditModalOpen(true);
  };

  // Handle view
  const handleView = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsViewModalOpen(true);
  };

  // Handle toggle status
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

  // Handle delete
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

  // Handle clone
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

  // Handle archive
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

  // Toggle favorite
  const toggleFavorite = (entityId: string) => {
    setFavorites(prev => {
      if (prev.includes(entityId)) {
        return prev.filter(id => id !== entityId);
      } else {
        return [...prev, entityId];
      }
    });
  };

  // Apply preset
  const applyPreset = (preset: ViewPreset) => {
    setSelectedPreset(preset.id);
    setSelectedModule(preset.config.module);
    setShowInactive(preset.config.showInactive);
    setSortBy(preset.config.sortBy);
    setSortOrder(preset.config.sortOrder);
    toast.success(`Applied preset: ${preset.name}`);
  };

  // Filter entities with advanced search
  const filteredEntities = useMemo(() => {
    return entities.filter(entity => {
      if (!entity) return false;
      
      const searchLower = (searchTerm || '').toLowerCase();
      const name = (entity.name || '').toLowerCase();
      const entityKey = (entity.entityKey || '').toLowerCase();
      const description = (entity.description || '').toLowerCase();
      const createdBy = (entity.createdBy?.fullName || '').toLowerCase();
      const updatedBy = (entity.updatedBy?.fullName || '').toLowerCase();
      
      return name.includes(searchLower) ||
             entityKey.includes(searchLower) ||
             description.includes(searchLower) ||
             createdBy.includes(searchLower) ||
             updatedBy.includes(searchLower);
    });
  }, [entities, searchTerm]);

  // Calculate stats with trends
  const stats = useMemo(() => {
    const now = new Date();
    const lastWeek = subDays(now, 7);
    
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
    };
    
    return { current, trends };
  }, [filteredEntities, entities, favorites]);

  // Get module icon
  const getModuleIcon = (module: string) => {
    return module === 're' ? DollarSign : CreditCard;
  };

  // Get module color
  const getModuleColor = (module: string) => {
    return module === 're' ? 'blue' : 'green';
  };

  return (
    <motion.div 
      className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
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
          transition: background-color 0.3s, border-color 0.3s, color 0.3s;
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

      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
                <div className="relative p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Entity Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <span>Configure and manage system entities</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                    {filteredEntities.length} active
                  </span>
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Connection Status */}
              <ConnectionStatus module="admin" entity="entities" />

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>

              {/* Compact Mode Toggle */}
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`p-2 border rounded-lg transition-all hover:scale-110 ${
                  compactMode ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Toggle compact mode"
              >
                {compactMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>

              {/* Refresh Button with Animation */}
              <motion.button
                onClick={() => fetchEntities()}
                className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                title="Refresh (Ctrl+R)"
              >
                <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </motion.button>

              {/* Export Button with Dropdown */}
              <ExportButton
                onExport={exportData}
                formats={['excel', 'csv', 'pdf', 'json', 'xml', 'html']}
                size="md"
                variant="outline"
              />

              {/* Create Button with Animation */}
              <motion.button
                onClick={handleCreate}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Create new entity (Ctrl+N)"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Entity
              </motion.button>
            </motion.div>
          </div>

          {/* Quick Actions Bar */}
          <motion.div 
            className="flex items-center justify-between mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              {/* Quick Filters */}
              <div className="flex items-center space-x-2">
                {quickFilters.map((filter, index) => {
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
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedQuickFilter(isSelected ? 'all' : filter.id)}
                      className={`
                        flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                        transition-all hover:scale-105
                        ${isSelected 
                          ? `bg-${filter.color}-100 text-${filter.color}-700 dark:bg-${filter.color}-900 dark:text-${filter.color}-300 shadow-md` 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 mr-1.5 ${
                        isSelected ? `text-${filter.color}-600 dark:text-${filter.color}-400` : ''
                      }`} />
                      {filter.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* View Presets */}
              <div className="flex items-center space-x-2 border-l pl-4 ml-2 border-gray-300 dark:border-gray-700">
                {viewPresets.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset === preset.id;
                  
                  return (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => applyPreset(preset)}
                      className={`
                        p-1.5 rounded-lg transition-all
                        ${isSelected 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 shadow-md' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }
                      `}
                      title={preset.name}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Bulk Actions */}
              <motion.button
                onClick={toggleBulkMode}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  bulkActionMode 
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 shadow-md' 
                    : 'border hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Bulk mode (Ctrl+B)"
              >
                <Layers className="h-4 w-4 mr-1.5" />
                Bulk
                {selectedRows.size > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                    {selectedRows.size}
                  </span>
                )}
              </motion.button>

              {bulkActionMode && (
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                >
                  <button
                    onClick={selectAll}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={() => bulkToggleStatus(true)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => bulkToggleStatus(false)}
                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                  >
                    Delete
                  </button>
                </motion.div>
              )}

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                {[
                  { mode: 'table', icon: List, label: 'Table' },
                  { mode: 'cards', icon: Grid3x3, label: 'Cards' },
                  { mode: 'kanban', icon: GitBranch, label: 'Kanban' },
                  { mode: 'gallery', icon: Layers, label: 'Gallery' },
                ].map(({ mode, icon: Icon, label }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMode(mode as any)}
                    className={`
                      p-2 transition-all
                      ${viewMode === mode 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }
                    `}
                    title={`${label} view (Ctrl+${mode === 'table' ? 'E' : mode === 'cards' ? 'C' : mode === 'kanban' ? 'K' : 'G'})`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="mt-4 grid grid-cols-12 gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Search Bar */}
            <div className="col-span-5 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Search entities (name, key, description, creator)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all hover:shadow-md"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
              
              {/* Recent Searches Dropdown */}
              {searchTerm === '' && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-xl z-20">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchTerm(term)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Clock className="h-3 w-3 mr-2 text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Module Filter */}
            <div className="col-span-2">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all hover:shadow-md"
              >
                <option value="all">All Modules</option>
                <option value="re">🏠 RE Module</option>
                <option value="expense">💰 Expense Module</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all hover:shadow-md"
              >
                <option value="name">Sort by Name</option>
                <option value="entityKey">Sort by Key</option>
                <option value="module">Sort by Module</option>
                <option value="createdAt">Sort by Created Date</option>
                <option value="updatedAt">Sort by Updated Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="col-span-1">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-4 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-md flex items-center justify-center"
                title="Toggle sort order"
              >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </button>
            </div>

            {/* Toggle Filters */}
            <div className="col-span-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-md flex items-center justify-center"
                title="Toggle filters (Ctrl+S)"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Toggle Stats */}
            <div className="col-span-1">
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full px-4 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-md flex items-center justify-center"
                title="Toggle stats"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`p-6 ${compactMode ? 'space-y-4' : 'space-y-6'}`}>
        {/* Stats Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-7 gap-4">
                {/* Total Entities */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total</p>
                      <p className="text-3xl font-bold">{stats.current.total}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <LayoutDashboard className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-blue-100">
                    {stats.trends.total > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{Math.abs(stats.trends.total)} from last week</span>
                  </div>
                </motion.div>

                {/* RE Module */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm">RE Module</p>
                      <p className="text-3xl font-bold">{stats.current.re}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-indigo-100">
                    {stats.trends.re > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{Math.abs(stats.trends.re)} from last week</span>
                  </div>
                </motion.div>

                {/* Expense Module */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Expense Module</p>
                      <p className="text-3xl font-bold">{stats.current.expense}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <CreditCard className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-green-100">
                    {stats.trends.expense > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{Math.abs(stats.trends.expense)} from last week</span>
                  </div>
                </motion.div>

                {/* Approval Required */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Approval</p>
                      <p className="text-3xl font-bold">{stats.current.approval}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Shield className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-purple-100">
                    {stats.trends.approval > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{Math.abs(stats.trends.approval)} from last week</span>
                  </div>
                </motion.div>

                {/* Inactive */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Inactive</p>
                      <p className="text-3xl font-bold">{stats.current.disabled}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <PowerOff className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-100">
                    {((stats.current.disabled / stats.current.total) * 100 || 0).toFixed(1)}% of total
                  </div>
                </motion.div>

                {/* Favorites */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Favorites</p>
                      <p className="text-3xl font-bold">{stats.current.favorites}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Star className="h-6 w-6" />
                    </div>
                  </div>
                </motion.div>

                {/* Active Now */}
                <motion.div
                  variants={statsCardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm">Active Now</p>
                      <p className="text-3xl font-bold">
                        {entities.filter(e => differenceInDays(new Date(), new Date(e.updatedAt)) < 1).length}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-pink-100">
                    Updated in last 24h
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg"
            >
              <div className="grid grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Created Date Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Branch Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Branch
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
                    <option value="">All Branches</option>
                    <option value="karachi">Karachi</option>
                    <option value="lahore">Lahore</option>
                    <option value="islamabad">Islamabad</option>
                  </select>
                </div>

                {/* Created By */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Created By
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600">
                    <option value="">Anyone</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tags..."
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  Reset Filters
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className={`transition-all ${compactMode ? 'space-y-3' : 'space-y-4'}`}>
          {/* Results Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{filteredEntities.length}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{entities.length}</span> entities
              </p>
              {selectedRows.size > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedRows.size} selected
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`grid ${compactMode ? 'grid-cols-4 gap-3' : 'grid-cols-3 gap-4'}`}
              >
                {filteredEntities.map((entity, index) => {
                  if (!entity) return null;
                  
                  const Icon = getModuleIcon(entity.module);
                  const color = getModuleColor(entity.module);
                  const isFavorite = favorites.includes(entity._id);
                  const isSelected = selectedRows.has(entity._id);

                  return (
                    <motion.div
                      key={entity._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className={`
                        bg-white dark:bg-gray-800 rounded-xl border shadow-lg 
                        hover:shadow-xl transition-all cursor-pointer relative overflow-hidden
                        ${!entity.isEnabled ? 'opacity-60' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${compactMode ? 'p-3' : 'p-4'}
                      `}
                      onClick={() => bulkActionMode ? toggleRowSelection(entity._id) : handleView(entity)}
                    >
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-700 rounded-full blur-3xl opacity-50"></div>
                      
                      {/* Selection Checkbox */}
                      {bulkActionMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(entity._id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                        className={`absolute top-2 right-2 p-1 rounded-full transition-all ${
                          isFavorite 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-300 hover:text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      {/* Icon and Name */}
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${
                            compactMode ? 'text-sm' : 'text-base'
                          }`}>
                            {entity.name || 'Untitled'}
                          </h3>
                          <div className="flex items-center mt-0.5 space-x-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">
                              {entity.entityKey || 'N/A'}
                            </code>
                            {entity.branchId && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <MapPin className="h-3 w-3 mr-0.5" />
                                {entity.branchId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {entity.description && !compactMode && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {entity.description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {entity.enableApproval && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                            <Shield className="h-3 w-3 mr-1" />
                            Approval
                          </span>
                        )}
                        {!entity.isEnabled && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            <PowerOff className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistance(new Date(entity.updatedAt), new Date(), { addSuffix: true })}
                        </div>
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {entity.updatedBy?.fullName?.split(' ')[0] || 'System'}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {viewMode === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-4 gap-4 h-[calc(100vh-300px)] overflow-x-auto"
              >
                {/* Active Column */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-green-500" />
                      Active
                    </h3>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                      {filteredEntities.filter(e => e.isEnabled && !e.enableApproval).length}
                    </span>
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)]">
                    {filteredEntities
                      .filter(e => e.isEnabled && !e.enableApproval)
                      .map(entity => (
                        <motion.div
                          key={entity._id}
                          draggable
                          className="bg-white dark:bg-gray-800 rounded-lg border p-3 shadow-sm hover:shadow-md cursor-move"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded bg-${getModuleColor(entity.module)}-100`}>
                              {getModuleIcon(entity.module)({ className: `h-3 w-3 text-${getModuleColor(entity.module)}-600` })}
                            </div>
                            <span className="font-medium text-sm truncate">{entity.name}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Updated {formatDistance(new Date(entity.updatedAt), new Date(), { addSuffix: true })}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Pending Approval Column */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-purple-500" />
                      Pending Approval
                    </h3>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                      {filteredEntities.filter(e => e.enableApproval && e.isEnabled).length}
                    </span>
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)]">
                    {filteredEntities
                      .filter(e => e.enableApproval && e.isEnabled)
                      .map(entity => (
                        <motion.div
                          key={entity._id}
                          className="bg-white dark:bg-gray-800 rounded-lg border p-3 shadow-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded bg-${getModuleColor(entity.module)}-100`}>
                              {getModuleIcon(entity.module)({ className: `h-3 w-3 text-${getModuleColor(entity.module)}-600` })}
                            </div>
                            <span className="font-medium text-sm truncate">{entity.name}</span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Inactive Column */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <PowerOff className="h-4 w-4 mr-2 text-gray-500" />
                      Inactive
                    </h3>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      {filteredEntities.filter(e => !e.isEnabled).length}
                    </span>
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)]">
                    {filteredEntities
                      .filter(e => !e.isEnabled)
                      .map(entity => (
                        <motion.div
                          key={entity._id}
                          className="bg-white dark:bg-gray-800 rounded-lg border p-3 shadow-sm opacity-60"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded bg-${getModuleColor(entity.module)}-100`}>
                              {getModuleIcon(entity.module)({ className: `h-3 w-3 text-${getModuleColor(entity.module)}-600` })}
                            </div>
                            <span className="font-medium text-sm truncate">{entity.name}</span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Recent Column */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      Recent
                    </h3>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                      {filteredEntities.filter(e => differenceInDays(new Date(), new Date(e.createdAt)) < 7).length}
                    </span>
                  </div>
                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)]">
                    {filteredEntities
                      .filter(e => differenceInDays(new Date(), new Date(e.createdAt)) < 7)
                      .map(entity => (
                        <motion.div
                          key={entity._id}
                          className="bg-white dark:bg-gray-800 rounded-lg border p-3 shadow-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded bg-${getModuleColor(entity.module)}-100`}>
                              {getModuleIcon(entity.module)({ className: `h-3 w-3 text-${getModuleColor(entity.module)}-600` })}
                            </div>
                            <span className="font-medium text-sm truncate">{entity.name}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Created {formatDistance(new Date(entity.createdAt), new Date(), { addSuffix: true })}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="columns-3 gap-4 space-y-4"
              >
                {filteredEntities.map((entity, index) => (
                  <motion.div
                    key={entity._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="break-inside-avoid bg-white dark:bg-gray-800 rounded-xl border shadow-lg hover:shadow-xl overflow-hidden"
                  >
                    <div className={`h-32 bg-gradient-to-r ${
                      entity.module === 're' 
                        ? 'from-blue-500 to-indigo-600' 
                        : 'from-green-500 to-emerald-600'
                    } p-4`}>
                      <div className="flex items-center space-x-2 text-white">
                        <div className="p-2 bg-white/20 rounded-lg">
                          {entity.module === 're' ? (
                            <DollarSign className="h-6 w-6" />
                          ) : (
                            <CreditCard className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold">{entity.name}</h3>
                          <p className="text-xs opacity-90">{entity.entityKey}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {entity.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {entity.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {entity.createdBy?.fullName || 'System'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(entity.createdAt), 'PP')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-4 text-center">
              <div className="inline-flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>Loading more...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Menu */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        {/* Help Button */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110"
          title="Help (F1)"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={() => setIsKeyboardShortcutsModalOpen(true)}
          className="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all hover:scale-110"
          title="Keyboard shortcuts (Ctrl+H)"
        >
          <Command className="h-5 w-5" />
        </button>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-all hover:scale-110"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Scroll to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
          title="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </motion.div>

      {/* Modals */}
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
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Add missing ArrowUp import
const ArrowUp = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const ArrowDown = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

const User = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);