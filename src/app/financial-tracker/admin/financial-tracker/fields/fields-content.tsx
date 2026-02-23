// src/app/admin/financial-tracker/fields/fields-content.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Save,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  AlertCircle,
  Type,
  Hash,
  Calendar,
  ListChecks,
  FileText,
  Image as ImageIcon,
  CheckSquare,
  CircleDot,
  Upload,
  RefreshCw,
  Download,
  Grid3x3,
  Layers,
  FolderTree,
  DollarSign,
  CreditCard,
  Search,
  Filter,
  Sparkles,
  Shield,
  Lock,
  Unlock,
  Copy,
  Globe,
  Zap,
  Star,
  Settings,
  Sliders,
  Menu,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Clock,
  User,
  Tag,
  Bookmark,
  Flag,
  Bell,
  Briefcase,
  Building,
  Code,
  Database,
  Gift,
  Key,
  Lightbulb,
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
  ArrowUpDown,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info,
  Moon,
  Sun,
  Monitor,
  Tablet,
  Smartphone as MobileIcon,
  LayoutGrid,
  List,
  Table,
  Columns,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  Star as StarIcon,
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Github,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Box,
  Package,
  Archive,
  ArchiveRestore,
  ArchiveX,
  ScrollText,
  FileJson,
  FileSpreadsheet,
  FileCode,
  FileDigit,
  Binary,
  Braces,
  Terminal,
  Command,
  Cpu,
  HardDrive,
  Network,
  Cloud,
  CloudOff,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Power,
  PowerOff,
  ToggleLeft,
  ToggleRight,
  ToggleLeft as ToggleLeftIcon,
  ToggleRight as ToggleRightIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ✅ Token utility
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};

interface Field {
  _id: string;
  module: 're' | 'expense';
  entityId: string;
  entityName?: string;
  fieldKey: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'image' | 'checkbox' | 'radio';
  isSystem: boolean;
  isEnabled: boolean;
  required: boolean;
  readOnly: boolean;
  visible: boolean;
  order: number;
  defaultValue?: any;
  options?: string[];
  categoryId?: string; // For single category link
  categoryIds?: string[]; // For multiple categories (select/radio)
  categorySource?: 'all' | 'entity' | 'specific' | 'manual'; // 'all' = all categories in module, 'entity' = all categories for this entity, 'specific' = selected categories, 'manual' = manual options
  validation?: {
    min?: number;
    max?: number;
    regex?: string;
    allowedFileTypes?: string[];
    maxFileSize?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { fullName: string; email: string };
  updatedBy?: { fullName: string; email: string };
}

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface Category {
  _id: string;
  name: string;
  module: 're' | 'expense';
  entity: string;
  isActive: boolean;
  color?: string;
  icon?: string;
  description?: string;
  parentId?: string; // For nested categories
  children?: Category[]; // For nested categories
}

// View modes
type ViewMode = 'grid' | 'list' | 'compact' | 'detail' | 'table';

// Sort options
type SortOption = 'name' | 'type' | 'order' | 'created' | 'updated';
type SortDirection = 'asc' | 'desc';

// Category source types
type CategorySource = 'all' | 'entity' | 'specific' | 'manual';

// ✅ Global helper functions
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text': return <Type className="h-4 w-4" />;
    case 'number': return <Hash className="h-4 w-4" />;
    case 'date': return <Calendar className="h-4 w-4" />;
    case 'select': return <ListChecks className="h-4 w-4" />;
    case 'textarea': return <FileText className="h-4 w-4" />;
    case 'file': return <Upload className="h-4 w-4" />;
    case 'image': return <ImageIcon className="h-4 w-4" />;
    case 'checkbox': return <CheckSquare className="h-4 w-4" />;
    case 'radio': return <CircleDot className="h-4 w-4" />;
    default: return <Type className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'text': return 'bg-blue-50 text-blue-600 border-blue-200 ring-blue-100';
    case 'number': return 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100';
    case 'date': return 'bg-purple-50 text-purple-600 border-purple-200 ring-purple-100';
    case 'select': return 'bg-amber-50 text-amber-600 border-amber-200 ring-amber-100';
    case 'textarea': return 'bg-orange-50 text-orange-600 border-orange-200 ring-orange-100';
    case 'file': return 'bg-indigo-50 text-indigo-600 border-indigo-200 ring-indigo-100';
    case 'image': return 'bg-pink-50 text-pink-600 border-pink-200 ring-pink-100';
    case 'checkbox': return 'bg-teal-50 text-teal-600 border-teal-200 ring-teal-100';
    case 'radio': return 'bg-cyan-50 text-cyan-600 border-cyan-200 ring-cyan-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-200 ring-gray-100';
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'text': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'number': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'date': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'select': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'textarea': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'file': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'image': return 'bg-pink-100 text-pink-700 border-pink-200';
    case 'checkbox': return 'bg-teal-100 text-teal-700 border-teal-200';
    case 'radio': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// ✅ Sortable Field Item Component
const SortableFieldItem = ({ field, onEdit, onToggle, onDelete, onDuplicate, index, totalItems, onMove, viewMode = 'list' }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1
  };

  const getCategorySourceText = (source?: string, count?: number) => {
    if (!source || source === 'manual') return null;
    switch (source) {
      case 'all': return 'All Module Categories';
      case 'entity': return 'All Entity Categories';
      case 'specific': return `${count || 0} Selected Categories`;
      default: return null;
    }
  };

  if (viewMode === 'compact') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${
          !field.isEnabled ? 'opacity-70 bg-gray-50/50' : 'border-gray-200 hover:border-blue-300'
        } ${isDragging ? 'shadow-2xl ring-4 ring-blue-500 ring-opacity-30 scale-[1.02] border-blue-500' : ''}`}
      >
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-move text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <div className={`p-2 rounded-lg border-2 ${getTypeColor(field.type)}`}>
                {getTypeIcon(field.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">{field.label}</span>
                  {field.required && <span className="text-red-500 text-xs">*</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-mono">{field.fieldKey}</span>
                  {field.categorySource && field.categorySource !== 'manual' && (
                    <span className="flex items-center text-green-600">
                      <FolderTree className="h-3 w-3 mr-1" />
                      {getCategorySourceText(field.categorySource, field.categoryIds?.length)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggle(field._id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  field.isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {field.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onEdit(field)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
          !field.isEnabled ? 'opacity-70 bg-gray-50/50' : 'border-gray-200 hover:border-blue-300'
        } ${isDragging ? 'shadow-2xl ring-4 ring-blue-500 ring-opacity-30 scale-[1.02] border-blue-500' : ''}`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
          field.isEnabled
            ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}></div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-xl border-2 ${getTypeColor(field.type)}`}>
                {getTypeIcon(field.type)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{field.label}</h3>
                <p className="text-sm text-gray-500 font-mono">{field.fieldKey}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${getTypeColor(field.type)}`}>
                {field.type}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <div className="flex items-center">
                {field.isEnabled ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-700">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500">Inactive</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Order</p>
              <p className="text-sm font-medium text-gray-900">#{field.order + 1}</p>
            </div>
            {field.required && (
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Required</p>
                <p className="text-sm font-medium text-red-600">Yes</p>
              </div>
            )}
            {field.categorySource && field.categorySource !== 'manual' && (
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Category Source</p>
                <p className="text-sm font-medium text-green-600 flex items-center">
                  <FolderTree className="h-4 w-4 mr-1" />
                  {field.categorySource === 'all' && 'All Module Categories'}
                  {field.categorySource === 'entity' && 'All Entity Categories'}
                  {field.categorySource === 'specific' && `${field.categoryIds?.length || 0} Selected`}
                </p>
              </div>
            )}
          </div>

          {field.options && field.options.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Options ({field.options.length})</p>
              <div className="flex flex-wrap gap-2">
                {field.options.slice(0, 3).map((opt: any, i: any) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                    {opt}
                  </span>
                ))}
                {field.options.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                    +{field.options.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {field.validation && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Validation</p>
              <div className="flex flex-wrap gap-2">
                {field.validation.min !== undefined && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Min: {field.validation.min}</span>
                )}
                {field.validation.max !== undefined && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">Max: {field.validation.max}</span>
                )}
                {field.validation.regex && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-mono">/{field.validation.regex}/</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(field.updatedAt || '').toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onMove(field._id, 'up')}
                disabled={index === 0}
                className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => onMove(field._id, 'down')}
                disabled={index === totalItems - 1}
                className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => onToggle(field._id)}
                className={`p-1.5 rounded-lg ${
                  field.isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {field.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onDuplicate(field)}
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(field)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </button>
              {!field.isSystem && (
                <button
                  onClick={() => onDelete(field)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default list view
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-2xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 ${
        !field.isEnabled ? 'opacity-70 bg-gray-50/50' : ''
      } ${isDragging ? 'shadow-2xl ring-4 ring-blue-500 ring-opacity-30 scale-[1.02] border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
    >
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
        field.isEnabled
          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
          : 'bg-gradient-to-r from-gray-400 to-gray-500'
      }`}></div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Left Section - Drag Handle and Icon */}
          <div className="flex items-start space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-move text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors group-hover:bg-gray-50"
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <div className={`p-3.5 rounded-xl border-2 shadow-sm ${getTypeColor(field.type)}`}>
              {getTypeIcon(field.type)}
            </div>
          </div>

          {/* Middle Section - Field Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-lg font-semibold text-gray-900 truncate">{field.label}</h4>
                <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                  {field.fieldKey}
                </span>
                {field.categorySource && field.categorySource !== 'manual' && (
                  <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                    <FolderTree className="h-3 w-3 mr-1" />
                    {field.categorySource === 'all' && 'All Module Categories'}
                    {field.categorySource === 'entity' && 'All Entity Categories'}
                    {field.categorySource === 'specific' && `${field.categoryIds?.length || 0} Selected Categories`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {field.required && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-full shadow-sm shadow-red-500/25">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Required
                  </span>
                )}
                {field.readOnly && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-medium rounded-full shadow-sm shadow-gray-500/25">
                    <Lock className="h-3 w-3 mr-1" />
                    Read Only
                  </span>
                )}
                {field.isSystem && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-sm shadow-purple-500/25">
                    <Shield className="h-3 w-3 mr-1" />
                    System
                  </span>
                )}
                {!field.visible && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-medium rounded-full shadow-sm shadow-gray-400/25">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </span>
                )}
              </div>
            </div>

            {/* Tags and Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 ${getTypeColor(field.type)}`}>
                {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
              </span>

              {field.options && field.options.length > 0 && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 flex items-center">
                  <ListChecks className="h-3 w-3 mr-1" />
                  {field.options.length} Options
                </span>
              )}

              {field.validation && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg border border-green-200 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Validated
                </span>
              )}

              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 flex items-center">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Order: {field.order + 1}
              </span>
            </div>

            {/* Validation Rules */}
            {field.validation && (
              <div className="mt-3 flex flex-wrap gap-2">
                {field.validation.min !== undefined && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200 flex items-center">
                    <span className="font-medium mr-1">Min:</span> {field.validation.min}
                  </span>
                )}
                {field.validation.max !== undefined && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200 flex items-center">
                    <span className="font-medium mr-1">Max:</span> {field.validation.max}
                  </span>
                )}
                {field.validation.regex && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200 font-mono">
                    /{field.validation.regex}/
                  </span>
                )}
                {field.validation.allowedFileTypes && field.validation.allowedFileTypes.length > 0 && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                    {field.validation.allowedFileTypes.join(', ')}
                  </span>
                )}
                {field.validation.maxFileSize && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                    Max: {field.validation.maxFileSize / 1024 / 1024}MB
                  </span>
                )}
              </div>
            )}

            {/* Footer Metadata */}
            <div className="mt-4 flex items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
              <Clock className="h-3 w-3 mr-1" />
              <span>Updated {new Date(field.updatedAt || '').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
              <span className="mx-2">•</span>
              <User className="h-3 w-3 mr-1" />
              <span>ID: {field._id.slice(-8)}</span>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {/* Move Buttons */}
            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => onMove(field._id, 'up')}
                disabled={index === 0}
                className="p-2.5 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => onMove(field._id, 'down')}
                disabled={index === totalItems - 1}
                className="p-2.5 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed border-l-2 border-gray-200 transition-colors"
                title="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggle(field._id)}
                className={`p-2.5 rounded-xl transition-all border-2 ${
                  field.isEnabled
                    ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                    : 'text-gray-400 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
                title={field.isEnabled ? 'Disable field' : 'Enable field'}
              >
                {field.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>

              <button
                onClick={() => onDuplicate?.(field)}
                className="p-2.5 text-purple-600 hover:bg-purple-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all"
                title="Duplicate field"
              >
                <Copy className="h-4 w-4" />
              </button>

              <button
                onClick={() => onEdit(field)}
                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all"
                title="Edit field"
              >
                <Edit className="h-4 w-4" />
              </button>

              {!field.isSystem && (
                <button
                  onClick={() => onDelete(field)}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all"
                  title="Delete field"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Fields Content Component
export default function FieldsContent() {
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get('module');

  const [fields, setFields] = useState<Field[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>(
    (moduleParam as 're' | 'expense') || 're'
  );
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedEntityObj, setSelectedEntityObj] = useState<Entity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'preview'>('fields');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedFieldForCategory, setSelectedFieldForCategory] = useState<Field | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [categorySource, setCategorySource] = useState<CategorySource>('manual');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, visible: 0, required: 0, system: 0, categoryLinked: 0 });

  const [formData, setFormData] = useState({
    module: 're' as 're' | 'expense',
    entityId: '',
    fieldKey: '',
    label: '',
    type: 'text' as Field['type'],
    required: false,
    readOnly: false,
    visible: true,
    isEnabled: true,
    defaultValue: '',
    options: [''] as string[],
    categoryId: '',
    categoryIds: [] as string[],
    categorySource: undefined as CategorySource | undefined,
    validation: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      regex: '',
      allowedFileTypes: [] as string[],
      maxFileSize: undefined as number | undefined
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Field types for filtering
  const fieldTypes = useMemo(() =>
    ['text', 'number', 'date', 'select', 'textarea', 'file', 'image', 'checkbox', 'radio'],
    []
  );

  // Update stats
  useEffect(() => {
    setStats({
      total: fields.length,
      visible: fields.filter(f => f.visible).length,
      required: fields.filter(f => f.required).length,
      system: fields.filter(f => f.isSystem).length,
      categoryLinked: fields.filter(f => f.categorySource && f.categorySource !== 'manual').length
    });
  }, [fields]);

  // Fetch entities
  const fetchEntities = async () => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities?module=${selectedModule}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities || []);

        if (data.entities.length > 0 && !selectedEntity) {
          setSelectedEntity(data.entities[0]._id);
          setSelectedEntityObj(data.entities[0]);
          setFormData(prev => ({ ...prev, entityId: data.entities[0]._id }));
        }
      }
    } catch (error) {
      toast.error('Failed to load entities');
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = getToken();
      const response = await fetch('/financial-tracker/api/financial-tracker/categories?active=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch fields
  const fetchFields = async () => {
    if (!selectedEntity) return;

    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/fields?module=${selectedModule}&entityId=${selectedEntity}${!showInactive ? '' : '&includeDisabled=true'}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch fields');

      const data = await response.json();
      let sortedFields = data.fields?.sort((a: Field, b: Field) => a.order - b.order) || [];

      // Apply sorting
      sortedFields.sort((a: any, b: any) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.label.localeCompare(b.label);
            break;
          case 'type':
            comparison = a.type.localeCompare(b.type);
            break;
          case 'order':
            comparison = a.order - b.order;
            break;
          case 'created':
            comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            break;
          case 'updated':
            comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      setFields(sortedFields);
    } catch (error) {
      toast.error('Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (selectedModule) params.append('module', selectedModule);
      if (selectedEntity) params.append('entityId', selectedEntity);
      if (showInactive) params.append('includeDisabled', 'true');

      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/export?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fields-${selectedEntityObj?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Fields exported successfully');
    } catch (error) {
      toast.error('Failed to export fields');
    }
  };

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        toast.success('Import feature coming soon');
      }
    };
    input.click();
  };

  // Handle duplicate
  const handleDuplicate = async (field: Field) => {
    setFormData({
      module: field.module,
      entityId: field.entityId,
      fieldKey: `${field.fieldKey}-copy`,
      label: `${field.label} (Copy)`,
      type: field.type,
      required: field.required,
      readOnly: field.readOnly,
      visible: field.visible,
      isEnabled: field.isEnabled,
      defaultValue: field.defaultValue || '',
      options: field.options || [''],
      categoryId: field.categoryId || '',
      categoryIds: field.categoryIds || [],
      categorySource: field.categorySource,
      validation: {
        min: field.validation?.min,
        max: field.validation?.max,
        regex: field.validation?.regex || '',
        allowedFileTypes: field.validation?.allowedFileTypes || [],
        maxFileSize: field.validation?.maxFileSize
      }
    });
    setEditingField(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (selectedEntity) {
      const entity = entities.find(e => e._id === selectedEntity);
      setSelectedEntityObj(entity || null);
    }
  }, [selectedEntity, entities]);

  useEffect(() => {
    fetchEntities();
    fetchCategories();
  }, [selectedModule]);

  useEffect(() => {
    if (selectedEntity) {
      fetchFields();
    }
  }, [selectedEntity, showInactive, sortBy, sortDirection]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f._id === active.id);
      const newIndex = fields.findIndex((f) => f._id === over?.id);

      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);

      try {
        const token = getToken();
        const fieldOrders = newFields.map((field: any, index: any) => ({
          fieldId: field._id,
          order: index
        }));

        const response = await fetch('/financial-tracker/api/financial-tracker/fields/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            entityId: selectedEntity,
            fieldOrders
          })
        });

        if (!response.ok) throw new Error('Failed to save order');
        toast.success('Fields reordered successfully');
      } catch (error) {
        toast.error('Failed to save field order');
        fetchFields();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[a-z0-9-]+$/.test(formData.fieldKey)) {
      toast.error('Field key can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    const filteredOptions = formData.options?.filter(opt => opt.trim() !== '') || [];

    if ((formData.type === 'select' || formData.type === 'radio') && filteredOptions.length === 0 && !formData.categorySource) {
      toast.error('Please add at least one option or link categories');
      return;
    }

    try {
      const token = getToken();
      const url = editingField
        ? `/financial-tracker/api/financial-tracker/fields/${editingField._id}`
        : '/financial-tracker/api/financial-tracker/fields';

      const method = editingField ? 'PUT' : 'POST';

      // Prepare payload
      const payload: any = {
        ...formData,
        options: filteredOptions.length > 0 ? filteredOptions : undefined,
        validation: {
          ...formData.validation,
          regex: formData.validation.regex || undefined,
          allowedFileTypes: formData.validation.allowedFileTypes?.filter(t => t) || undefined,
          maxFileSize: formData.validation.maxFileSize || undefined
        }
      };

      // Handle category linking
      if (formData.categorySource && formData.categorySource !== 'manual') {
        payload.categorySource = formData.categorySource;
        if (formData.categorySource === 'specific') {
          payload.categoryIds = selectedCategoryIds;
        } else if (formData.categorySource === 'all') {
          // Get all categories for this module
          const allCategories = categories.filter(c => c.module === selectedModule && c.isActive);
          payload.categoryIds = allCategories.map(c => c._id);
        } else if (formData.categorySource === 'entity' && selectedEntityObj) {
          // Get all categories for this entity
          const entityCategoriesList = categories.filter(c => 
            c.module === selectedModule && 
            c.entity === selectedEntityObj.entityKey && 
            c.isActive
          );
          payload.categoryIds = entityCategoriesList.map(c => c._id);
        }
      } else {
        payload.categorySource = 'manual';
        payload.categoryIds = [];
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save field');
      }

      toast.success(editingField ? 'Field updated successfully' : 'Field created successfully');
      setIsModalOpen(false);
      setEditingField(null);
      resetForm();
      fetchFields();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleField = async (fieldId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${fieldId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to toggle field');

      toast.success('Field status updated successfully');
      fetchFields();
    } catch (error) {
      toast.error('Failed to toggle field');
    }
  };

  const handleDeleteField = async (field: Field) => {
    if (field.isSystem) {
      toast.error('System fields cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${field.label}"?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${field._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete field');

      toast.success('Field deleted successfully');
      fetchFields();
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f._id === fieldId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) return;

    const newFields = [...fields];
    const temp = newFields[index];
    if (direction === 'up') {
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;
    } else {
      newFields[index] = newFields[index + 1];
      newFields[index + 1] = temp;
    }

    setFields(newFields);

    try {
      const token = getToken();
      const fieldOrders = newFields.map((field, idx) => ({
        fieldId: field._id,
        order: idx
      }));

      await fetch('/financial-tracker/api/financial-tracker/fields/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entityId: selectedEntity,
          fieldOrders
        })
      });
    } catch (error) {
      fetchFields();
    }
  };

  const resetForm = () => {
    setFormData({
      module: selectedModule,
      entityId: selectedEntity,
      fieldKey: '',
      label: '',
      type: 'text',
      required: false,
      readOnly: false,
      visible: true,
      isEnabled: true,
      defaultValue: '',
      options: [''],
      categoryId: '',
      categoryIds: [],
      categorySource: undefined,
      validation: {
        min: undefined,
        max: undefined,
        regex: '',
        allowedFileTypes: [],
        maxFileSize: undefined
      }
    });
    setCategorySource('manual');
    setSelectedCategoryIds([]);
  };

  const handleEdit = (field: Field) => {
    setEditingField(field);
    setFormData({
      module: field.module,
      entityId: field.entityId,
      fieldKey: field.fieldKey,
      label: field.label,
      type: field.type,
      required: field.required,
      readOnly: field.readOnly,
      visible: field.visible,
      isEnabled: field.isEnabled,
      defaultValue: field.defaultValue || '',
      options: field.options && field.options.length > 0 ? field.options : [''],
      categoryId: field.categoryId || '',
      categoryIds: field.categoryIds || [],
      categorySource: field.categorySource,
      validation: {
        min: field.validation?.min,
        max: field.validation?.max,
        regex: field.validation?.regex || '',
        allowedFileTypes: field.validation?.allowedFileTypes || [],
        maxFileSize: field.validation?.maxFileSize
      }
    });
    setCategorySource(field.categorySource || 'manual');
    setSelectedCategoryIds(field.categoryIds || []);
    setIsModalOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  // Filter fields
  const filteredFields = fields.filter(field => {
    const matchesSearch = field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.fieldKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(field.type);

    return matchesSearch && matchesType;
  });

  // Get categories for current entity
  const entityCategories = useMemo(() =>
    categories.filter(c =>
      c.module === selectedModule &&
      c.entity === selectedEntityObj?.entityKey &&
      c.isActive
    ), [categories, selectedModule, selectedEntityObj]
  );

  // Get all categories for current module
  const moduleCategories = useMemo(() =>
    categories.filter(c => c.module === selectedModule && c.isActive),
    [categories, selectedModule]
  );

  // Group categories by entity for display
  const categoriesByEntity = useMemo(() => {
    const grouped: Record<string, Category[]> = {};
    categories
      .filter(c => c.module === selectedModule && c.isActive)
      .forEach(c => {
        if (!grouped[c.entity]) {
          grouped[c.entity] = [];
        }
        grouped[c.entity].push(c);
      });
    return grouped;
  }, [categories, selectedModule]);

  // Handle category selection in modal
  const handleLinkCategories = () => {
    setFormData(prev => ({
      ...prev,
      categorySource,
      categoryIds: categorySource === 'specific' ? selectedCategoryIds : 
                    categorySource === 'all' ? moduleCategories.map(c => c._id) :
                    categorySource === 'entity' ? entityCategories.map(c => c._id) :
                    []
    }));
    setShowCategoryModal(false);
    toast.success('Categories linked successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Enterprise Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Layers className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Dynamic Fields
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                  Configure custom fields with smart category integration
                </p>
              </div>
            </div>

            {/* Desktop Stats */}
            {selectedEntity && (
              <div className="hidden lg:flex items-center space-x-3">
                <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Tag className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Total</span>
                      <span className="text-xl font-bold text-blue-600 block leading-5">{stats.total}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Visible</span>
                      <span className="text-xl font-bold text-green-600 block leading-5">{stats.visible}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Required</span>
                      <span className="text-xl font-bold text-red-600 block leading-5">{stats.required}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">System</span>
                      <span className="text-xl font-bold text-purple-600 block leading-5">{stats.system}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <FolderTree className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Categories</span>
                      <span className="text-xl font-bold text-emerald-600 block leading-5">{stats.categoryLinked}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Module and Entity Selection - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 mt-6">
            <div className="col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Module</label>
              <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-sm">
                <button
                  onClick={() => {
                    setSelectedModule('re');
                    setSelectedEntity('');
                  }}
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
                  onClick={() => {
                    setSelectedModule('expense');
                    setSelectedEntity('');
                  }}
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

            <div className="col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Entity</label>
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setFormData(prev => ({ ...prev, entityId: e.target.value }));
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-700 font-medium"
              >
                <option value="">Select Entity</option>
                {entities.map(entity => (
                  <option key={entity._id} value={entity._id}>
                    {entity.name} ({entity.entityKey})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by label, key, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">&nbsp;</label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 bg-white px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 shadow-sm flex-1 transition-all">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show inactive</span>
                </label>

                <button
                  onClick={handleExport}
                  disabled={!selectedEntity}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white shadow-sm disabled:opacity-50 transition-all hover:shadow-md"
                  title="Export"
                >
                  <Download className="h-5 w-5 text-gray-500" />
                </button>

                <button
                  onClick={handleImport}
                  disabled={!selectedEntity}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white shadow-sm disabled:opacity-50 transition-all hover:shadow-md"
                  title="Import"
                >
                  <Upload className="h-5 w-5 text-gray-500" />
                </button>

                <button
                  onClick={fetchFields}
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
                  Filters
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
                    onClick={() => {
                      setSelectedModule('re');
                      setSelectedEntity('');
                    }}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                      selectedModule === 're'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    RE
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModule('expense');
                      setSelectedEntity('');
                    }}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => {
                    setSelectedEntity(e.target.value);
                    setFormData(prev => ({ ...prev, entityId: e.target.value }));
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-gray-700"
                >
                  <option value="">Select Entity</option>
                  {entities.map(entity => (
                    <option key={entity._id} value={entity._id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                <div className="flex flex-wrap gap-2">
                  {fieldTypes.map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={type}
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(selectedTypes.filter(t => t !== type));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Show inactive fields</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExport}
                  disabled={!selectedEntity}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white disabled:opacity-50 flex items-center justify-center"
                >
                  <Download className="h-5 w-5 text-gray-500 mr-2" />
                  Export
                </button>
                <button
                  onClick={fetchFields}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white flex items-center justify-center"
                >
                  <RefreshCw className="h-5 w-5 text-gray-500 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* Tabs and Actions */}
          {selectedEntity && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                    activeTab === 'fields'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Fields ({filteredFields.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                    activeTab === 'preview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                {/* Sort Options */}
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2.5 text-sm border-r-2 border-gray-200 focus:outline-none bg-white text-gray-700"
                  >
                    <option value="order">Order</option>
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowUpDown className={`h-4 w-4 text-gray-500 transition-transform ${
                      sortDirection === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title="List View"
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 border-l-2 border-gray-200 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title="Grid View"
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-2.5 border-l-2 border-gray-200 transition-all ${
                      viewMode === 'compact'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title="Compact View"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('detail')}
                    className={`p-2.5 border-l-2 border-gray-200 transition-all ${
                      viewMode === 'detail'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title="Detail View"
                  >
                    <Table className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingField(null);
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 font-medium flex items-center border-2 border-blue-400"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Field
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {!selectedEntity ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200 shadow-xl p-12 text-center max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 ring-4 ring-white">
                <FolderTree className="h-14 w-14 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              Select an Entity
            </h3>
            <p className="text-gray-500 mb-8 text-lg">Choose a module and entity to manage its custom fields</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setSelectedModule('re')}
                className="px-8 py-4 bg-blue-50 text-blue-700 rounded-xl border-2 border-blue-200 hover:bg-blue-100 transition-colors font-medium flex items-center justify-center"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                RE Module
              </button>
              <button
                onClick={() => setSelectedModule('expense')}
                className="px-8 py-4 bg-emerald-50 text-emerald-700 rounded-xl border-2 border-emerald-200 hover:bg-emerald-100 transition-colors font-medium flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Expense Module
              </button>
            </div>
          </div>
        ) : activeTab === 'fields' ? (
          isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-200">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
              <span className="ml-4 text-lg font-medium text-gray-600">Loading fields...</span>
            </div>
          ) : filteredFields.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200 shadow-xl p-16 text-center max-w-lg mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30 ring-4 ring-white">
                  <Sparkles className="h-16 w-16 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                No Fields Yet
              </h3>
              <p className="text-gray-500 mb-8 text-lg">
                Create your first custom field for <span className="font-semibold text-blue-600">{selectedEntityObj?.name}</span>
              </p>
              <button
                onClick={() => {
                  setEditingField(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/25 font-medium text-lg border-2 border-blue-400"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Field
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredFields.map(f => f._id)}
                strategy={viewMode === 'grid' ? undefined : verticalListSortingStrategy}
              >
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredFields.map((field, index) => (
                      <div
                        key={field._id}
                        className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 ${
                          !field.isEnabled ? 'opacity-70 bg-gray-50/50' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2.5 rounded-xl border-2 ${
                                field.isEnabled ? getTypeColor(field.type) : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}>
                                {getTypeIcon(field.type)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{field.label}</h4>
                                <p className="text-xs text-gray-500 font-mono">{field.fieldKey}</p>
                                {field.categorySource && field.categorySource !== 'manual' && (
                                  <span className="inline-flex items-center mt-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                    <FolderTree className="h-3 w-3 mr-1" />
                                    {field.categorySource === 'all' && 'All Module Categories'}
                                    {field.categorySource === 'entity' && 'All Entity Categories'}
                                    {field.categorySource === 'specific' && `${field.categoryIds?.length || 0} Selected`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleToggleField(field._id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  field.isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                {field.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleDuplicate(field)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(field)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadgeColor(field.type)}`}>
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Required</span>
                              )}
                              {field.isSystem && (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">System</span>
                              )}
                            </div>

                            {field.options && field.options.length > 0 && (
                              <p className="text-xs text-gray-500">
                                {field.options.length} option{field.options.length > 1 ? 's' : ''}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
                              <span>Order: {field.order + 1}</span>
                              <span>{new Date(field.updatedAt || '').toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFields.map((field, index) => (
                      <SortableFieldItem
                        key={field._id}
                        field={field}
                        index={index}
                        totalItems={filteredFields.length}
                        onEdit={handleEdit}
                        onToggle={handleToggleField}
                        onDelete={handleDeleteField}
                        onDuplicate={handleDuplicate}
                        onMove={handleMoveField}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DndContext>
          )
        ) : (
          // Preview Mode
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-gray-200">
              <div className="p-2.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg shadow-purple-500/25">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Form Preview: {selectedEntityObj?.name}
                </h3>
                <p className="text-sm text-gray-500">This is how the form will look to users</p>
              </div>
            </div>

            <div className="space-y-5">
              {filteredFields.filter(f => f.visible).map((field) => (
                <div key={field._id} className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.categorySource && field.categorySource !== 'manual' && (
                      <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <FolderTree className="h-3 w-3 inline mr-1" />
                        {field.categorySource === 'all' && 'All Categories'}
                        {field.categorySource === 'entity' && 'Entity Categories'}
                        {field.categorySource === 'specific' && `${field.categoryIds?.length || 0} Categories`}
                      </span>
                    )}
                    {field.readOnly && (
                      <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Read only
                      </span>
                    )}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                      disabled
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900"
                      disabled
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900"
                      disabled
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900"
                      disabled
                    />
                  )}

                  {field.type === 'select' && (
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900" disabled>
                      <option>Select {field.label}</option>
                      {field.categorySource ? (
                        <option>Loading categories...</option>
                      ) : (
                        field.options?.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))
                      )}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                      <input type="checkbox" className="h-5 w-5 text-blue-600 border-gray-300 rounded" disabled />
                      <span className="text-sm text-gray-600">Enable {field.label}</span>
                    </div>
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-2 p-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                      {field.categorySource ? (
                        <p className="text-sm text-gray-500">Radio options from categories</p>
                      ) : (
                        field.options?.slice(0, 2).map((opt, i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <input type="radio" className="h-4 w-4 text-blue-600 border-gray-300" disabled />
                            <span className="text-sm text-gray-600">{opt}</span>
                          </div>
                        ))
                      )}
                      {field.options && field.options.length > 2 && (
                        <p className="text-xs text-gray-400 mt-1">+{field.options.length - 2} more options</p>
                      )}
                    </div>
                  )}

                  {field.type === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      {field.validation?.allowedFileTypes && (
                        <p className="text-xs text-gray-400 mt-1">
                          Allowed: {field.validation.allowedFileTypes.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {field.type === 'image' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                  )}

                  {field.validation && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      {field.validation.min !== undefined && `Min: ${field.validation.min} `}
                      {field.validation.max !== undefined && `Max: ${field.validation.max} `}
                      {field.validation.regex && 'Pattern required '}
                    </p>
                  )}
                </div>
              ))}

              {filteredFields.filter(f => f.visible).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <EyeOff className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg">No visible fields to preview</p>
                </div>
              )}
            </div>

            {/* Preview Actions */}
            <div className="mt-8 pt-4 border-t-2 border-gray-200 flex justify-end space-x-3">
              <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium border-2 border-gray-200">
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 font-medium border-2 border-blue-400">
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn border-2 border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-xl p-2 backdrop-blur-sm">
                    {editingField ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingField ? `Edit Field: ${editingField.label}` : 'Create New Field'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingField(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Field Key & Label Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fieldKey}
                    onChange={(e) => setFormData({
                      ...formData,
                      fieldKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-gray-900"
                    placeholder="e.g., office-rent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Lowercase letters, numbers, hyphens
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Office Rent"
                    required
                  />
                </div>
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Field Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { type: 'text', label: 'Text', icon: Type, color: 'blue' },
                    { type: 'number', label: 'Number', icon: Hash, color: 'emerald' },
                    { type: 'date', label: 'Date', icon: Calendar, color: 'purple' },
                    { type: 'select', label: 'Select', icon: ListChecks, color: 'amber' },
                    { type: 'textarea', label: 'Textarea', icon: FileText, color: 'orange' },
                    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'teal' },
                    { type: 'radio', label: 'Radio', icon: CircleDot, color: 'cyan' },
                    { type: 'file', label: 'File', icon: Upload, color: 'indigo' },
                    { type: 'image', label: 'Image', icon: ImageIcon, color: 'pink' }
                  ].map(({ type, label, icon: Icon, color }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type as any })}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                        formData.type === type
                          ? `border-${color}-500 bg-${color}-50 ring-2 ring-${color}-100`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-1 ${
                        formData.type === type ? `text-${color}-600` : 'text-gray-500'
                      }`} />
                      <span className={`text-xs font-medium ${
                        formData.type === type ? `text-${color}-700` : 'text-gray-600'
                      }`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options or Category Source for Select/Radio */}
              {(formData.type === 'select' || formData.type === 'radio') && (
                <div className="space-y-4">
                  {/* Category Source Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option Source
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCategorySource('manual');
                          setFormData(prev => ({
                            ...prev,
                            categorySource: undefined,
                            categoryIds: []
                          }));
                        }}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center transition-all ${
                          !formData.categorySource
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-medium">Manual</span>
                        <span className="text-xs text-gray-500 mt-1">Enter options</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCategorySource('entity');
                          setFormData(prev => ({
                            ...prev,
                            categorySource: 'entity',
                            options: []
                          }));
                        }}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center transition-all ${
                          formData.categorySource === 'entity'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FolderTree className="h-5 w-5 mb-1 text-green-600" />
                        <span className="text-sm font-medium">Entity</span>
                        <span className="text-xs text-gray-500 mt-1">{entityCategories.length} cats</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCategorySource('all');
                          setFormData(prev => ({
                            ...prev,
                            categorySource: 'all',
                            options: []
                          }));
                        }}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center transition-all ${
                          formData.categorySource === 'all'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FolderTree className="h-5 w-5 mb-1 text-purple-600" />
                        <span className="text-sm font-medium">All Module</span>
                        <span className="text-xs text-gray-500 mt-1">{moduleCategories.length} cats</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCategorySource('specific');
                          setFormData(prev => ({
                            ...prev,
                            categorySource: 'specific',
                            options: []
                          }));
                        }}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center transition-all ${
                          formData.categorySource === 'specific'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FolderTree className="h-5 w-5 mb-1 text-amber-600" />
                        <span className="text-sm font-medium">Specific</span>
                        <span className="text-xs text-gray-500 mt-1">Select manually</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Options */}
                  {!formData.categorySource && (
                    <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Options <span className="text-red-500">*</span>
                      </label>
                      {formData.options.map((opt, i) => (
                        <div key={i} className="flex mb-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(i, e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder={`Option ${i + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg border-2 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </button>
                    </div>
                  )}

                  {/* Category Selection for Specific */}
                  {formData.categorySource === 'specific' && (
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full p-4 border-2 border-dashed border-amber-300 rounded-xl hover:bg-amber-50 transition-all flex items-center justify-center"
                    >
                      <FolderTree className="h-5 w-5 mr-2 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">
                        {selectedCategoryIds.length > 0 
                          ? `${selectedCategoryIds.length} Categories Selected` 
                          : 'Select Specific Categories'}
                      </span>
                    </button>
                  )}

                  {/* Category Source Info */}
                  {formData.categorySource && formData.categorySource !== 'specific' && (
                    <div className={`p-4 rounded-xl border-2 ${
                      formData.categorySource === 'entity' ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'
                    }`}>
                      <div className="flex items-start">
                        <FolderTree className={`h-5 w-5 mr-2 mt-0.5 ${
                          formData.categorySource === 'entity' ? 'text-green-600' : 'text-purple-600'
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            formData.categorySource === 'entity' ? 'text-green-800' : 'text-purple-800'
                          }`}>
                            {formData.categorySource === 'entity' && 'Using all categories from this entity'}
                            {formData.categorySource === 'all' && 'Using all categories from this module'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            formData.categorySource === 'entity' ? 'text-green-600' : 'text-purple-600'
                          }`}>
                            {formData.categorySource === 'entity' && `${entityCategories.length} categories will be available as options`}
                            {formData.categorySource === 'all' && `${moduleCategories.length} categories will be available as options`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Default Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Value
                </label>
                <input
                  type="text"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Optional default value"
                />
              </div>

              {/* Validation */}
              <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  Validation Rules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formData.type === 'number' || formData.type === 'text') && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Min {formData.type === 'number' ? 'Value' : 'Length'}
                        </label>
                        <input
                          type="number"
                          value={formData.validation.min || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              min: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          })}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Max {formData.type === 'number' ? 'Value' : 'Length'}
                        </label>
                        <input
                          type="number"
                          value={formData.validation.max || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              max: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          })}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'text' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        Regex Pattern
                      </label>
                      <input
                        type="text"
                        value={formData.validation.regex}
                        onChange={(e) => setFormData({
                          ...formData,
                          validation: { ...formData.validation, regex: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="^[A-Z0-9]+$"
                      />
                    </div>
                  )}

                  {(formData.type === 'file' || formData.type === 'image') && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Max File Size (MB)
                        </label>
                        <input
                          type="number"
                          value={formData.validation.maxFileSize ? formData.validation.maxFileSize / 1024 / 1024 : ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              maxFileSize: e.target.value ? parseInt(e.target.value) * 1024 * 1024 : undefined
                            }
                          })}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Allowed File Types
                        </label>
                        <input
                          type="text"
                          value={formData.validation.allowedFileTypes?.join(', ') || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              allowedFileTypes: e.target.value.split(',').map(t => t.trim())
                            }
                          })}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="jpg, png, pdf"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'required', label: 'Required', description: 'Field must be filled', color: 'red' },
                  { key: 'readOnly', label: 'Read Only', description: 'Cannot be edited', color: 'gray' },
                  { key: 'visible', label: 'Visible', description: 'Shown in forms', color: 'green' },
                  { key: 'isEnabled', label: 'Enabled', description: 'Field is active', color: 'green' }
                ].map(({ key, label, description, color }) => (
                  <label
                    key={key}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData[key as keyof typeof formData]
                        ? `border-${color}-500 bg-${color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData[key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData[key as keyof typeof formData]
                        ? `border-${color}-500 bg-${color}-500`
                        : 'border-gray-300'
                    }`}>
                      {formData[key as keyof typeof formData] && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingField(null);
                  }}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium border-2 border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/25 flex items-center justify-center border-2 border-blue-400"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingField ? 'Update Field' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn border-2 border-gray-200">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-2xl px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-xl p-2">
                    <FolderTree className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Select Categories
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
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
              </div>

              {/* Category List by Entity */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(categoriesByEntity).map(([entity, cats]) => {
                  const entityObj = entities.find(e => e.entityKey === entity);
                  const filteredCats = cats.filter(cat => 
                    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                  );

                  if (filteredCats.length === 0) return null;

                  return (
                    <div key={entity} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200">
                        <h3 className="font-medium text-gray-700">
                          {entityObj?.name || entity}
                        </h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {filteredCats.map((category) => (
                          <label
                            key={category._id}
                            className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(category._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategoryIds([...selectedCategoryIds, category._id]);
                                } else {
                                  setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== category._id));
                                }
                              }}
                              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{category.name}</span>
                                {category.color && (
                                  <span 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: category.color }}
                                  />
                                )}
                              </div>
                              {category.description && (
                                <p className="text-sm text-gray-500">{category.description}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedCategoryIds([]);
                    setShowCategoryModal(false);
                  }}
                  className="px-6 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkCategories}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all font-medium shadow-lg shadow-amber-500/25"
                >
                  Link {selectedCategoryIds.length} Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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