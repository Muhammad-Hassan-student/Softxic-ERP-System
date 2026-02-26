// src/app/financial-tracker/components/EntitiesTable.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Copy,
  Archive,
  Star,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  Filter,
  Download,
  Upload,
  Share2,
  Printer,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  RefreshCw,
  Search,
  Grid,
  List,
  Columns,
  Maximize2,
  Minimize2,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Globe,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Bell,
  BellOff,
  MessageSquare,
  MessageCircle,
  Send,
  Inbox,
  DraftingCompass,
  Pen,
  PenTool,
  Highlighter,
  Eraser,
  Paintbrush,
  Palette,
  Brush,
  Sparkles,
  Zap,
  ZapOff,
  Flame,
  Snowflake,
  Wind,
  Droplet,
  Leaf,
  TreePine,
  Mountain,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Tornado,

  Waves,
  Anchor,
  Ship,
  Sailboat,
  Truck,
  Car,
  Bike,
  Bus,
  Train,
  Plane,
  Rocket,
  Satellite,
  Space,
  
  Star as StarIcon,

  Moon as MoonIcon,
  Sun as SunIcon,
  Earth,
  Mars,
  Venus,

  Save,
  File,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Folder,
  FolderOpen,
  FolderTree,
  FolderPlus,
  FolderMinus,
  FolderClosed,
  FolderOpen as FolderOpenIcon,
  FolderTree as FolderTreeIcon,
  FolderPlus as FolderPlusIcon,
  FolderMinus as FolderMinusIcon,
  FolderClosed as FolderClosedIcon
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format, formatDistance, formatRelative, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

// ============================================
// INTERFACES & TYPES
// ============================================

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

interface Column {
  id: string;
  label: string;
  accessor: keyof Entity | ((entity: Entity) => any);
  sortable: boolean;
  filterable: boolean;
  visible: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, entity: Entity) => React.ReactNode;
}

interface SortConfig {
  key: keyof Entity | null;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: {
    value: any;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  };
}

interface GroupConfig {
  by: keyof Entity | null;
  expandedGroups: Set<string>;
}

interface EntitiesTableProps {
  entities: Entity[];
  isLoading: boolean;
  onEdit: (entity: Entity) => void;
  onView: (entity: Entity) => void;
  onToggle: (id: string, currentStatus: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClone?: (entity: Entity) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
  onToggleFavorite?: (id: string) => void;
  onShare?: (entity: Entity) => void;
  onExport?: (entities: Entity[], format: string) => void;
  onBulkAction?: (action: string, ids: string[]) => Promise<void>;
  favorites?: string[];
  selectedRows?: Set<string>;
  onToggleRowSelection?: (id: string) => void;
  bulkMode?: boolean;
  compactMode?: boolean;
  onRefresh?: () => void;
  onColumnChange?: (columns: Column[]) => void;
  onSortChange?: (sort: SortConfig) => void;
  onFilterChange?: (filters: FilterConfig) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EntitiesTable({
  entities,
  isLoading,
  onEdit,
  onView,
  onToggle,
  onDelete,
  onClone,
  onArchive,
  onToggleFavorite,
  onShare,
  onExport,
  onBulkAction,
  favorites = [],
  selectedRows = new Set(),
  onToggleRowSelection,
  bulkMode = false,
  compactMode = false,
  onRefresh,
  onColumnChange,
  onSortChange,
  onFilterChange
}: EntitiesTableProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [groupConfig, setGroupConfig] = useState<GroupConfig>({ by: null, expandedGroups: new Set() });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'name', 'module', 'entityKey', 'features', 'status', 'updatedAt', 'actions'
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entity: Entity } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ rowId: string; colId: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ rowId: string; colId: string } | null>(null);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // COLUMN DEFINITIONS
  // ============================================

  const columns: Column[] = useMemo(() => [
    {
      id: 'select',
      label: '',
      accessor: '_id',
      sortable: false,
      filterable: false,
      visible: bulkMode,
      width: 40,
      align: 'center',
      render: (_, entity) => (
        <input
          type="checkbox"
          checked={selectedRows.has(entity._id)}
          onChange={() => onToggleRowSelection?.(entity._id)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      id: 'expand',
      label: '',
      accessor: '_id',
      sortable: false,
      filterable: false,
      visible: true,
      width: 40,
      align: 'center',
      render: (_, entity) => (
        <button
          onClick={() => toggleRow(entity._id)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          {expandedRows.has(entity._id) ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
      )
    },
    {
      id: 'favorite',
      label: '',
      accessor: '_id',
      sortable: false,
      filterable: false,
      visible: true,
      width: 40,
      align: 'center',
      render: (_, entity) => {
        const isFavorite = favorites.includes(entity._id);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(entity._id);
            }}
            className={`p-1 rounded transition-all hover:scale-110 ${
              isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
            }`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        );
      }
    },
    {
      id: 'name',
      label: 'Entity',
      accessor: 'name',
      sortable: true,
      filterable: true,
      visible: true,
      width: 200,
      render: (value, entity) => (
        <div className="flex items-center">
          <div className={`p-1.5 rounded-lg mr-2 ${
            entity.module === 're' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {entity.module === 're' ? (
              <DollarSign className="h-4 w-4 text-blue-600" />
            ) : (
              <CreditCard className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {value || 'Untitled'}
            </div>
            {entity.description && !compactMode && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {entity.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'module',
      label: 'Module',
      accessor: 'module',
      sortable: true,
      filterable: true,
      visible: true,
      width: 100,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 're' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        }`}>
          {value?.toUpperCase() || 'N/A'}
        </span>
      )
    },
    {
      id: 'entityKey',
      label: 'Key',
      accessor: 'entityKey',
      sortable: true,
      filterable: true,
      visible: true,
      width: 120,
      render: (value) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
          {value || 'N/A'}
        </code>
      )
    },
    {
      id: 'features',
      label: 'Features',
      accessor: (entity) => entity.enableApproval,
      sortable: true,
      filterable: true,
      visible: true,
      width: 120,
      render: (_, entity) => (
        <div className="flex items-center space-x-1">
          {entity.enableApproval && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
              <Shield className="h-3 w-3 mr-1" />
              Approval
            </span>
          )}
        </div>
      )
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'isEnabled',
      sortable: true,
      filterable: true,
      visible: true,
      width: 100,
      render: (value) => (
        value ? (
          <span className="inline-flex items-center text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
            <Power className="h-3 w-3 mr-1" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center text-gray-500 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <PowerOff className="h-3 w-3 mr-1" />
            Inactive
          </span>
        )
      )
    },
    {
      id: 'branchId',
      label: 'Branch',
      accessor: 'branchId',
      sortable: true,
      filterable: true,
      visible: false,
      width: 100,
      render: (value) => value || '-'
    },
    {
      id: 'createdBy',
      label: 'Created By',
      accessor: (entity) => entity.createdBy?.fullName,
      sortable: true,
      filterable: true,
      visible: false,
      width: 150,
      render: (_, entity) => (
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1 text-gray-400" />
          <span>{entity.createdBy?.fullName || 'Unknown'}</span>
        </div>
      )
    },
    {
      id: 'createdAt',
      label: 'Created',
      accessor: 'createdAt',
      sortable: true,
      filterable: true,
      visible: false,
      width: 150,
      render: (value) => (
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
          <span>{value ? format(new Date(value), 'PP') : 'N/A'}</span>
        </div>
      )
    },
    {
      id: 'updatedBy',
      label: 'Updated By',
      accessor: (entity) => entity.updatedBy?.fullName,
      sortable: true,
      filterable: true,
      visible: false,
      width: 150,
      render: (_, entity) => (
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1 text-gray-400" />
          <span>{entity.updatedBy?.fullName || 'Unknown'}</span>
        </div>
      )
    },
    {
      id: 'updatedAt',
      label: 'Last Updated',
      accessor: 'updatedAt',
      sortable: true,
      filterable: true,
      visible: true,
      width: 150,
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        const now = new Date();
        const hoursDiff = differenceInHours(now, date);
        const minutesDiff = differenceInMinutes(now, date);
        
        return (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-gray-400" />
            <span title={format(date, 'PPpp')}>
              {hoursDiff < 24 
                ? hoursDiff < 1 
                  ? `${minutesDiff}m ago`
                  : `${hoursDiff}h ago`
                : formatDistance(date, now, { addSuffix: true })}
            </span>
          </div>
        );
      }
    },
    {
      id: 'actions',
      label: 'Actions',
      accessor: '_id',
      sortable: false,
      filterable: false,
      visible: true,
      width: 200,
      align: 'right',
      render: (_, entity) => (
        <div className="flex items-center justify-end space-x-1">
          <ActionButton
            icon={<Eye className="h-4 w-4" />}
            onClick={() => onView(entity)}
            tooltip="View Details (Ctrl+Click)"
            color="gray"
          />
          <ActionButton
            icon={<Edit className="h-4 w-4" />}
            onClick={() => onEdit(entity)}
            tooltip="Edit (Double Click)"
            color="blue"
          />
          <ActionButton
            icon={entity.isEnabled ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            onClick={() => onToggle(entity._id, entity.isEnabled)}
            tooltip={entity.isEnabled ? 'Deactivate' : 'Activate'}
            color={entity.isEnabled ? 'orange' : 'green'}
          />
          <DropdownMenu entity={entity} />
        </div>
      )
    }
  ], [bulkMode, selectedRows, expandedRows, favorites, compactMode]);

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible && selectedColumns.includes(col.id)),
    [columns, selectedColumns]
  );

  const filteredAndSearchedEntities = useMemo(() => {
    let result = [...entities];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(entity => 
        entity.name?.toLowerCase().includes(searchLower) ||
        entity.entityKey?.toLowerCase().includes(searchLower) ||
        entity.description?.toLowerCase().includes(searchLower) ||
        entity.createdBy?.fullName?.toLowerCase().includes(searchLower) ||
        entity.updatedBy?.fullName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    Object.entries(filterConfig).forEach(([key, { value, operator }]) => {
      result = result.filter(entity => {
        const entityValue = entity[key as keyof Entity];
        
        switch (operator) {
          case 'eq': return entityValue === value;
          case 'neq': return entityValue !== value;
          case 'gt': return entityValue! > value;
          case 'lt': return entityValue! < value;
          case 'gte': return entityValue! >= value;
          case 'lte': return entityValue! <= value;
          case 'contains': 
            return String(entityValue).toLowerCase().includes(String(value).toLowerCase());
          case 'startsWith':
            return String(entityValue).toLowerCase().startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(entityValue).toLowerCase().endsWith(String(value).toLowerCase());
          default: return true;
        }
      });
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a:any, b:any) => {
        let aVal = a[sortConfig.key!];
        let bVal = b[sortConfig.key!];
        
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        }
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aVal! < bVal! ? -1 : aVal! > bVal! ? 1 : 0;
        } else {
          return aVal! > bVal! ? -1 : aVal! < bVal! ? 1 : 0;
        }
      });
    }

    return result;
  }, [entities, searchTerm, filterConfig, sortConfig]);

  const groupedEntities = useMemo(() => {
    if (!groupConfig.by) return { ungrouped: filteredAndSearchedEntities };
    
    const groups: Record<string, Entity[]> = {};
    
    filteredAndSearchedEntities.forEach(entity => {
      const groupValue = String(entity[groupConfig.by!] || 'Unknown');
      if (!groups[groupValue]) groups[groupValue] = [];
      groups[groupValue].push(entity);
    });
    
    return groups;
  }, [filteredAndSearchedEntities, groupConfig]);

  // ============================================
  // HANDLERS
  // ============================================

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (key: keyof Entity) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    onSortChange?.({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleFilter = (key: string, value: any, operator: FilterConfig[string]['operator'] = 'eq') => {
    setFilterConfig(prev => ({
      ...prev,
      [key]: { value, operator }
    }));
    onFilterChange?.({
      ...filterConfig,
      [key]: { value, operator }
    });
  };

  const handleGroup = (by: keyof Entity | null) => {
    setGroupConfig({
      by,
      expandedGroups: new Set()
    });
  };

  const handleColumnResize = (columnId: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [columnId]: width }));
  };

  const handleDragStart = (e: React.DragEvent, rowId: string, colId: string) => {
    setIsDragging(true);
    setDragStart({ rowId, colId });
    e.dataTransfer.setData('text/plain', JSON.stringify({ rowId, colId }));
  };

  const handleDragOver = (e: React.DragEvent, rowId: string, colId: string) => {
    e.preventDefault();
    if (isDragging) {
      setDragEnd({ rowId, colId });
    }
  };

  const handleDragEnd = () => {
    if (dragStart && dragEnd) {
      // Handle cell merge or move logic here
      console.log('Moved from', dragStart, 'to', dragEnd);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const handleCopyCell = (value: any) => {
    navigator.clipboard.writeText(String(value));
    toast.success('Copied to clipboard');
  };

  const handleExportCSV = () => {
    const data :any = filteredAndSearchedEntities.map(e => ({
      Name: e.name,
      Key: e.entityKey,
      Module: e.module,
      Status: e.isEnabled ? 'Active' : 'Inactive',
      Approval: e.enableApproval ? 'Yes' : 'No',
      Created: format(new Date(e.createdAt), 'PP'),
      Updated: format(new Date(e.updatedAt), 'PP')
    }));
    
    const csv = new CSVLink(data, `entities-${new Date().toISOString()}.csv`);
    // Implementation depends on react-csv
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAndSearchedEntities);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entities');
    XLSX.writeFile(wb, `entities-${new Date().toISOString()}.xlsx`);
    toast.success('Exported to Excel');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Entities Report', 14, 15);
    autoTable(doc, {
      head: [['Name', 'Key', 'Module', 'Status', 'Approval']],
      body: filteredAndSearchedEntities.map(e => [
        e.name,
        e.entityKey,
        e.module,
        e.isEnabled ? 'Active' : 'Inactive',
        e.enableApproval ? 'Yes' : 'No'
      ]),
      startY: 25,
    });
    doc.save(`entities-${new Date().toISOString()}.pdf`);
    toast.success('Exported to PDF');
  };

  // ============================================
  // VIRTUALIZATION
  // ============================================

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSearchedEntities.length,
    getScrollElement: () => bodyRef.current,
    estimateSize: () => compactMode ? 48 : 64,
    overscan: 10
  });

  // ============================================
  // RENDER METHODS
  // ============================================

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-lg">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading entities...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }

  if (!entities || entities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-lg">
        <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No entities found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first entity</p>
        <button
          onClick={() => onEdit({} as Entity)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          Create New Entity
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entities..."
                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Column Selector */}
            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Columns className="h-4 w-4 mr-2" />
                Columns
              </button>
              {showColumnSelector && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-2">
                    {columns.map(col => (
                      <label key={col.id} className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(col.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColumns([...selectedColumns, col.id]);
                            } else {
                              setSelectedColumns(selectedColumns.filter(id => id !== col.id));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{col.label || col.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-3 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                Object.keys(filterConfig).length > 0 ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {Object.keys(filterConfig).length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {Object.keys(filterConfig).length}
                </span>
              )}
            </button>

            {/* Group Button */}
            <button
              onClick={() => setShowGroupPanel(!showGroupPanel)}
              className={`px-3 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                groupConfig.by ? 'border-purple-500 text-purple-600' : ''
              }`}
            >
              <Grid className="h-4 w-4 mr-2" />
              Group
              {groupConfig.by && (
                <span className="ml-2 px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {groupConfig.by}
                </span>
              )}
            </button>

            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportPanel(!showExportPanel)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              {showExportPanel && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleExportCSV}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      CSV
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Excel
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Results Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSearchedEntities.length} of {entities.length} entities
            {selectedRows.size > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                ({selectedRows.size} selected)
              </span>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Module
                  </label>
                  <select
                    onChange={(e) => handleFilter('module', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">All</option>
                    <option value="re">RE</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    onChange={(e) => handleFilter('isEnabled', e.target.value === 'true')}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Approval
                  </label>
                  <select
                    onChange={(e) => handleFilter('enableApproval', e.target.value === 'true')}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">All</option>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group Panel */}
        <AnimatePresence>
          {showGroupPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg"
            >
              <select
                value={groupConfig.by || ''}
                onChange={(e) => handleGroup(e.target.value as keyof Entity || null)}
                className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">No Grouping</option>
                <option value="module">Group by Module</option>
                <option value="isEnabled">Group by Status</option>
                <option value="enableApproval">Group by Approval</option>
                <option value="branchId">Group by Branch</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        className="overflow-x-auto"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div style={{ minWidth: visibleColumns.reduce((acc, col) => acc + (col.width || 150), 0) }}>
          {/* Header */}
          <div
            ref={headerRef}
            className="flex bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
          >
            <Reorder.Group
              axis="x"
              values={visibleColumns}
              onReorder={(newOrder:any) => {
                const newSelected = newOrder.map((col:any) => col.id);
                setSelectedColumns(newSelected);
                onColumnChange?.(newOrder);
              }}
              className="flex flex-1"
            >
              {visibleColumns.map((column) => (
                <Reorder.Item
                  key={column.id}
                  value={column}
                  className={`
                    relative px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
                    select-none cursor-move hover:bg-gray-200 dark:hover:bg-gray-600
                    ${column.align === 'right' ? 'justify-end' : ''}
                  `}
                  style={{ width: columnWidths[column.id] || column.width }}
                  onDragStart={(e:any) => e.dataTransfer.setData('text/plain', column.id)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.id as keyof Entity)}
                        className="ml-2 hover:bg-gray-300 dark:hover:bg-gray-500 rounded p-1"
                      >
                        {sortConfig.key === column.id ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </button>
                    )}
                  </div>
                  
                  {/* Resize Handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                    onMouseDown={(e) => {
                      setResizingColumn(column.id);
                      const startX = e.clientX;
                      const startWidth = columnWidths[column.id] || column.width || 150;
                      
                      const handleMouseMove = (e: MouseEvent) => {
                        const diff = e.clientX - startX;
                        handleColumnResize(column.id, Math.max(50, startWidth + diff));
                      };
                      
                      const handleMouseUp = () => {
                        setResizingColumn(null);
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            className="relative overflow-auto"
            style={{ height: 500 }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative'
              }}
            >
              {groupConfig.by ? (
                // Grouped View
                Object.entries(groupedEntities).map(([groupValue, groupEntities]) => (
                  <div key={groupValue}>
                    <div
                      className="sticky top-0 bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-sm cursor-pointer"
                      onClick={() => {
                        setGroupConfig(prev => ({
                          ...prev,
                          expandedGroups: new Set(prev.expandedGroups).has(groupValue)
                            ? new Set([...prev.expandedGroups].filter(g => g !== groupValue))
                            : new Set([...prev.expandedGroups, groupValue])
                        }));
                      }}
                    >
                      {groupValue} ({groupEntities.length})
                    </div>
                    {groupConfig.expandedGroups.has(groupValue) && (
                      <div>
                        {groupEntities.map((entity) => (
                          <TableRow
                            key={entity._id}
                            entity={entity}
                            columns={visibleColumns}
                            expanded={expandedRows.has(entity._id)}
                            onToggleRow={() => toggleRow(entity._id)}
                            onView={onView}
                            onEdit={onEdit}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onClone={onClone}
                            onArchive={onArchive}
                            onToggleFavorite={onToggleFavorite}
                            isFavorite={favorites.includes(entity._id)}
                            isSelected={selectedRows.has(entity._id)}
                            onToggleSelection={onToggleRowSelection}
                            bulkMode={bulkMode}
                            compactMode={compactMode}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            onCopyCell={handleCopyCell}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Regular View with Virtualization
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const entity = filteredAndSearchedEntities[virtualRow.index];
                  if (!entity) return null;
                  
                  return (
                    <div
                      key={entity._id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                    >
                      <TableRow
                        entity={entity}
                        columns={visibleColumns}
                        expanded={expandedRows.has(entity._id)}
                        onToggleRow={() => toggleRow(entity._id)}
                        onView={onView}
                        onEdit={onEdit}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onClone={onClone}
                        onArchive={onArchive}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={favorites.includes(entity._id)}
                        isSelected={selectedRows.has(entity._id)}
                        onToggleSelection={onToggleRowSelection}
                        bulkMode={bulkMode}
                        compactMode={compactMode}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onCopyCell={handleCopyCell}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {selectedRows.size > 0 ? (
              <div className="flex items-center space-x-4">
                <span>{selectedRows.size} selected</span>
                <button
                  onClick={() => onBulkAction?.('activate', Array.from(selectedRows))}
                  className="text-green-600 hover:text-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => onBulkAction?.('deactivate', Array.from(selectedRows))}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => onBulkAction?.('delete', Array.from(selectedRows))}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ) : (
              <span>Page {Math.floor(rowVirtualizer.getVirtualItems()[0]?.index / 50) + 1 || 1}</span>
            )}
          </div>
          <div>
            <span>Last updated {formatDistance(new Date(), new Date())} ago</span>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            onClick={() => {
              onView(contextMenu.entity);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            View
          </button>
          <button
            onClick={() => {
              onEdit(contextMenu.entity);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onClone?.(contextMenu.entity);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Clone
          </button>
          <button
            onClick={() => {
              onArchive?.(contextMenu.entity._id);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Archive
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={() => {
              handleCopyCell(JSON.stringify(contextMenu.entity, null, 2));
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Copy as JSON
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.entity._id);
              toast.success('ID copied to clipboard');
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Copy ID
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
}

function ActionButton({ icon, onClick, tooltip, color = 'gray' }: ActionButtonProps) {
  const colorClasses = {
    blue: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30',
    green: 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30',
    red: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30',
    yellow: 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30',
    purple: 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30',
    orange: 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30',
    gray: 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
  };

  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded transition-all hover:scale-110 ${colorClasses[color]}`}
      title={tooltip}
    >
      {icon}
    </button>
  );
}

interface DropdownMenuProps {
  entity: Entity;
}

function DropdownMenu({ entity }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(entity._id);
                  toast.success('ID copied');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(entity.entityKey);
                  toast.success('Key copied');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Tag className="h-4 w-4 mr-2" />
                Copy Key
              </button>
              <button
                onClick={() => {
                  const shareData = {
                    title: entity.name,
                    text: entity.description,
                    url: window.location.href + '/' + entity._id
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(JSON.stringify(shareData));
                    toast.success('Share data copied');
                  }
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  window.print();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TableRowProps {
  entity: Entity;
  columns: Column[];
  expanded: boolean;
  onToggleRow: () => void;
  onView: (entity: Entity) => void;
  onEdit: (entity: Entity) => void;
  onToggle: (id: string, currentStatus: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClone?: (entity: Entity) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
  onToggleFavorite?: (id: string) => void;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleSelection?: (id: string) => void;
  bulkMode: boolean;
  compactMode: boolean;
  onDragStart: (e: React.DragEvent, rowId: string, colId: string) => void;
  onDragOver: (e: React.DragEvent, rowId: string, colId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onCopyCell: (value: any) => void;
}

function TableRow({
  entity,
  columns,
  expanded,
  onToggleRow,
  onView,
  onEdit,
  onToggle,
  onDelete,
  onClone,
  onArchive,
  onToggleFavorite,
  isFavorite,
  isSelected,
  onToggleSelection,
  bulkMode,
  compactMode,
  onDragStart,
  onDragOver,
  onDragEnd,
  onCopyCell
}: TableRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleAction = async (action: Promise<any>) => {
    setIsProcessing(true);
    try {
      await action;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className={`
          flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50
          transition-colors cursor-default
          ${!entity.isEnabled ? 'opacity-60' : ''}
          ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
          ${compactMode ? 'py-1' : 'py-2'}
        `}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowActions(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowActions(false);
        }}
        onDoubleClick={() => onEdit(entity)}
        onContextMenu={(e) => {
          e.preventDefault();
          // Handle context menu
        }}
      >
        {columns.map((column) => {
          const value = typeof column.accessor === 'function'
            ? column.accessor(entity)
            : entity[column.accessor as keyof Entity];
          
          return (
            <div
              key={column.id}
              className={`
                px-4 truncate flex items-center
                ${column.align === 'right' ? 'justify-end' : ''}
                ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
              `}
              style={{ width: column.width }}
              draggable
              onDragStart={(e) => onDragStart(e, entity._id, column.id)}
              onDragOver={(e) => onDragOver(e, entity._id, column.id)}
              onDragEnd={onDragEnd}
              onDoubleClick={() => onCopyCell(value)}
            >
              {column.render ? column.render(value, entity) : value}
            </div>
          );
        })}
      </div>

      {/* Expanded Row */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="px-12 py-4">
              {/* Description */}
              {entity.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{entity.description}</p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Created By */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Created</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{entity.createdBy?.fullName}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${entity.createdBy?.email}`} className="text-blue-600 hover:underline">
                        {entity.createdBy?.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {format(new Date(entity.createdAt), 'PPP p')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Updated By */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Last Updated</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{entity.updatedBy?.fullName}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${entity.updatedBy?.email}`} className="text-blue-600 hover:underline">
                        {entity.updatedBy?.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {format(new Date(entity.updatedAt), 'PPP p')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Branch Info */}
                {entity.branchId && (
                  <div className="col-span-2">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Branch</h4>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{entity.branchId}</span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="col-span-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Age</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {differenceInDays(new Date(), new Date(entity.createdAt))} days
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Last Update</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {differenceInHours(new Date(), new Date(entity.updatedAt))}h ago
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                      <div className="text-lg font-semibold">
                        {entity.isEnabled ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => onClone?.(entity)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Clone
                </button>
                <button
                  onClick={() => onArchive?.(entity._id)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Archive
                </button>
                <button
                  onClick={() => onToggleFavorite?.(entity._id)}
                  className={`px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                    isFavorite ? 'text-yellow-600' : ''
                  }`}
                >
                  <Star className={`h-3 w-3 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button
                  onClick={() => onDelete(entity._id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}