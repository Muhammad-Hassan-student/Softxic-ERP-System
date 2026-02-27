// src/app/admin/financial-tracker/entities/components/ViewEntityModal.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistance, subDays, subWeeks, subMonths } from 'date-fns';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Icons
import {
  X, User, Calendar, Clock, Power, PowerOff, DollarSign, CreditCard, Eye,
  Activity, History, Tag, Mail, Copy, Star, Edit, Trash2, Archive, Share2,
  Download, Printer, MapPin, Shield, ShieldCheck, ShieldOff, Flag, Heart,
  MessageSquare, Paperclip, GitBranch, Settings, RefreshCw, ChevronUp,
  ChevronDown, Maximize2, Minimize2, ExternalLink, Upload, Send, Search,
  File, FileText, FileSpreadsheet, FileJson, FileCode, FileImage, FileVideo,
  FileAudio, FileArchive, QrCode, AlertCircle, Info, BarChart3, TrendingUp,
  TrendingDown, ArrowUp, ArrowDown, Command, GitCommit, ActivityIcon, Code
} from 'lucide-react';

// Import shared types
import { 
  Entity, 
  Comment as CommentType, 
  Attachment as AttachmentType,
  ActivityLog,
  RelatedEntity,
  AuditEntry
} from '@/app/financial-tracker/types/entity.types';

// ============================================
// INTERFACES
// ============================================

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon?: React.ElementType;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  data?: number[];
  labels?: string[];
}

interface ViewEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity;
  onToggleFavorite?: (entityId: string) => void;
  isFavorite?: boolean;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entityId: string) => Promise<void>;
  onArchive?: (entityId: string) => Promise<void>;
  onClone?: (entity: Entity) => Promise<void>;
  onShare?: (entity: Entity) => void;
  onExport?: (entity: Entity, format: string) => void;
  onComment?: (entityId: string, comment: string, parentId?: string) => Promise<void>;
  onAttach?: (entityId: string, file: File) => Promise<void>;
  onTag?: (entityId: string, tag: string) => Promise<void>;
  onRefresh?: () => void;
  onVersion?: (entityId: string) => void;
  onHistory?: (entityId: string) => void;
  onSettings?: (entityId: string) => void;
  onPrint?: (entity: Entity) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ViewEntityModal({
  isOpen,
  onClose,
  entity,
  onToggleFavorite,
  isFavorite = false,
  onEdit,
  onDelete,
  onArchive,
  onClone,
  onShare,
  onExport,
  onComment,
  onAttach,
  onTag,
  onRefresh,
  onVersion,
  onHistory,
  onSettings,
  onPrint
}: ViewEntityModalProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'metrics' | 'comments' | 'attachments' | 'related' | 'audit' | 'settings' | 'analytics' | 'versions'>('details');
  
  // Data states
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [relatedEntities, setRelatedEntities] = useState<RelatedEntity[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  
  // Analytics data
  const [viewsData, setViewsData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [engagementData, setEngagementData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [moduleDistribution, setModuleDistribution] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [statusDistribution, setStatusDistribution] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  
  // Loading states
  const [loading, setLoading] = useState({
    activities: false,
    comments: false,
    attachments: false,
    related: false,
    metrics: false,
    audit: false,
    versions: false,
    analytics: false
  });

  // UI States
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showCloneConfirm, setShowCloneConfirm] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentType | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['info', 'metadata']));
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Chart controls
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polar'>('bar');
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================
  // API HELPER
  // ============================================

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const apiFetch = async <T,>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker${endpoint}`, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request cancelled');
        return {} as T;
      }
      throw error;
    }
  };

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchActivities = useCallback(async () => {
    setLoading(prev => ({ ...prev, activities: true }));
    try {
      const data = await apiFetch<{ logs: ActivityLog[] }>(
        `/activity-logs?entity=entities&recordId=${entity._id}&limit=50`
      );
      setActivities(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, [entity._id]);

  const fetchComments = useCallback(async () => {
    setLoading(prev => ({ ...prev, comments: true }));
    try {
      const data = await apiFetch<{ comments: CommentType[] }>(
        `/comments?entityId=${entity._id}`
      );
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(prev => ({ ...prev, comments: false }));
    }
  }, [entity._id]);

  const fetchAttachments = useCallback(async () => {
    setLoading(prev => ({ ...prev, attachments: true }));
    try {
      const data = await apiFetch<{ attachments: AttachmentType[] }>(
        `/attachments?entityId=${entity._id}`
      );
      setAttachments(data.attachments || []);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    } finally {
      setLoading(prev => ({ ...prev, attachments: false }));
    }
  }, [entity._id]);

  const fetchRelatedEntities = useCallback(async () => {
    setLoading(prev => ({ ...prev, related: true }));
    try {
      const data = await apiFetch<{ related: RelatedEntity[] }>(
        `/entities/${entity._id}/related`
      );
      setRelatedEntities(data.related || []);
    } catch (error) {
      console.error('Failed to fetch related entities:', error);
    } finally {
      setLoading(prev => ({ ...prev, related: false }));
    }
  }, [entity._id]);

  const fetchMetrics = useCallback(async () => {
    setLoading(prev => ({ ...prev, metrics: true }));
    try {
      const data = await apiFetch<{ metrics: MetricData[] }>(
        `/entities/${entity._id}/metrics?range=${dateRange}`
      );
      setMetrics(data.metrics || []);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Fallback to empty array
      setMetrics([]);
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  }, [entity._id, dateRange]);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(prev => ({ ...prev, audit: true }));
    try {
      const data = await apiFetch<{ logs: AuditEntry[] }>(
        `/audit?entityId=${entity._id}&limit=50`
      );
      setAuditLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(prev => ({ ...prev, audit: false }));
    }
  }, [entity._id]);

  const fetchVersions = useCallback(async () => {
    setLoading(prev => ({ ...prev, versions: true }));
    try {
      const data = await apiFetch<{ versions: any[] }>(
        `/entities/${entity._id}/versions`
      );
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(prev => ({ ...prev, versions: false }));
    }
  }, [entity._id]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(prev => ({ ...prev, analytics: true }));
    try {
      const [views, engagement, modules, status] = await Promise.all([
        apiFetch<{ labels: string[]; data: number[] }>(`/analytics/views?entityId=${entity._id}&range=${dateRange}`),
        apiFetch<{ labels: string[]; data: number[] }>(`/analytics/engagement?entityId=${entity._id}&range=${dateRange}`),
        apiFetch<{ labels: string[]; data: number[] }>(`/analytics/modules?entityId=${entity._id}`),
        apiFetch<{ labels: string[]; data: number[] }>(`/analytics/status?entityId=${entity._id}`)
      ]);
      
      setViewsData(views);
      setEngagementData(engagement);
      setModuleDistribution(modules);
      setStatusDistribution(status);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }));
    }
  }, [entity._id, dateRange]);

  const fetchData = useCallback(async () => {
    switch (activeTab) {
      case 'activity':
        await fetchActivities();
        break;
      case 'comments':
        await fetchComments();
        break;
      case 'attachments':
        await fetchAttachments();
        break;
      case 'related':
        await fetchRelatedEntities();
        break;
      case 'metrics':
        await fetchMetrics();
        break;
      case 'audit':
        await fetchAuditLogs();
        break;
      case 'versions':
        await fetchVersions();
        break;
      case 'analytics':
        await fetchAnalytics();
        break;
    }
  }, [activeTab, fetchActivities, fetchComments, fetchAttachments, fetchRelatedEntities, fetchMetrics, fetchAuditLogs, fetchVersions, fetchAnalytics]);

  // Initial data fetch
  useEffect(() => {
    if (isOpen && entity) {
      fetchData();
    }
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, entity, activeTab, dateRange, fetchData]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setFullscreen(!fullscreen);
          }
          break;
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoomLevel(prev => Math.min(prev + 0.1, 2));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoomLevel(1);
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if (e.altKey) {
            const tabIndex = parseInt(e.key) - 1;
            const tabs = ['details', 'activity', 'metrics', 'comments', 'attachments', 'related', 'audit', 'analytics', 'versions'];
            if (tabs[tabIndex]) {
              setActiveTab(tabs[tabIndex] as any);
            }
          }
          break;
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onEdit?.(entity);
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleShare();
          }
          break;
        case 'p':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onPrint?.(entity);
          }
          break;
        case 'd':
          if (e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            setShowDeleteConfirm(true);
          }
          break;
        case 'c':
          if (e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            setShowCloneConfirm(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fullscreen, onClose, onEdit, onPrint, entity]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddComment = async () => {
    if (!newComment.trim() || !onComment) return;

    try {
      await onComment(entity._id, newComment);
      setNewComment('');
      await fetchComments();
      toast.success('Comment added successfully');

      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleAddReply = async (commentId: string, reply: string) => {
    if (!reply.trim() || !onComment) return;

    try {
      await onComment(entity._id, reply, commentId);
      setReplyingTo(null);
      await fetchComments();
      toast.success('Reply added successfully');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleUploadAttachment = async (files: FileList | null) => {
    if (!files || !onAttach) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await onAttach(entity._id, file);
        toast.success(`Uploaded: ${file.name}`);
      } catch (error) {
        toast.error(`Failed to upload: ${file.name}`);
      }
    }

    await fetchAttachments();
  };

  const handleDownloadAttachment = async (attachment: AttachmentType) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded: ${attachment.name}`);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handlePreviewAttachment = (attachment: AttachmentType) => {
    setSelectedAttachment(attachment);
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete(entity._id);
      toast.success('Entity deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete entity');
    }
  };

  const handleArchive = async () => {
    if (!onArchive) return;

    try {
      await onArchive(entity._id);
      toast.success('Entity archived successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to archive entity');
    }
  };

  const handleClone = async () => {
    if (!onClone) return;

    try {
      await onClone(entity);
      toast.success('Entity cloned successfully');
    } catch (error) {
      toast.error('Failed to clone entity');
    }
    setShowCloneConfirm(false);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(entity);
    } else {
      setShowShareDialog(true);
    }
  };

  const handleExport = (format: string) => {
    if (onExport) {
      onExport(entity, format);
    } else {
      apiFetch(`/entities/${entity._id}/export?format=${format}`, {
        method: 'POST'
      }).then(() => {
        toast.success(`Exported as ${format.toUpperCase()}`);
      }).catch(() => {
        toast.error('Export failed');
      });
    }
    setShowExportDialog(false);
  };

  const handleCopyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  const moduleIcon = entity.module === 're' ? DollarSign : CreditCard;
  const moduleColor = entity.module === 're' ? 'blue' : 'green';
  const moduleGradient = entity.module === 're'
    ? 'from-blue-600 to-indigo-700'
    : 'from-green-600 to-emerald-700';

  const statusColor = entity.isEnabled ? 'green' : 'gray';
  const statusIcon = entity.isEnabled ? Power : PowerOff;
  const statusText = entity.isEnabled ? 'Active' : 'Inactive';

  const approvalColor = entity.enableApproval ? 'purple' : 'gray';
  const approvalIcon = entity.enableApproval ? ShieldCheck : ShieldOff;
  const approvalText = entity.enableApproval ? 'Approval Required' : 'No Approval';

  const priorityColors = {
    low: 'blue',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return FileVideo;
    if (type.startsWith('audio/')) return FileAudio;
    if (type.includes('pdf')) return FileText;
    if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
    if (type.includes('json')) return FileJson;
    if (type.includes('code') || type.includes('javascript')) return FileCode;
    if (type.includes('archive') || type.includes('zip')) return FileArchive;
    return File;
  };

  const filteredAttachments = useMemo(() => {
    return attachments
      .filter(att =>
        att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(att => filterType === 'all' || att.type.startsWith(filterType))
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'asc'
            ? new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
            : new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        }
        if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortBy === 'size') {
          return sortOrder === 'asc'
            ? a.size - b.size
            : b.size - a.size;
        }
        return 0;
      });
  }, [attachments, searchTerm, filterType, sortBy, sortOrder]);

  // Chart data generators
  const getChartData = useCallback((data: { labels: string[]; data: number[] }) => ({
    labels: data.labels,
    datasets: [{
      data: data.data,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(139, 92, 246)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(107, 114, 128)',
      ],
      borderWidth: 1,
    }]
  }), []);

  const getLineChartData = useCallback((data: { labels: string[]; data: number[] }) => ({
    labels: data.labels,
    datasets: [{
      label: 'Value',
      data: data.data,
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgb(139, 92, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  }), []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  // ============================================
  // RENDER METHODS
  // ============================================

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-${moduleColor}-100 dark:bg-${moduleColor}-900/30`}>
              {React.createElement(moduleIcon, { className: `h-6 w-6 text-${moduleColor}-600 dark:text-${moduleColor}-400` })}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{entity.name}</h3>
              <div className="flex items-center mt-1 space-x-2">
                <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {entity.entityKey}
                </code>
                {entity.branchId && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {entity.branchId}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite?.(entity._id)}
              className={`p-2 rounded-lg transition-all hover:scale-110 ${isFavorite
                  ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShowQRCode(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Show QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
        </div>

        {entity.description && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">{entity.description}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-3 py-1 bg-${statusColor}-100 dark:bg-${statusColor}-900/30 text-${statusColor}-700 dark:text-${statusColor}-300 text-sm rounded-full`}>
            {React.createElement(statusIcon, { className: "h-3 w-3 mr-1" })}
            {statusText}
          </span>

          <span className={`inline-flex items-center px-3 py-1 bg-${approvalColor}-100 dark:bg-${approvalColor}-900/30 text-${approvalColor}-700 dark:text-${approvalColor}-300 text-sm rounded-full`}>
            {React.createElement(approvalIcon, { className: "h-3 w-3 mr-1" })}
            {approvalText}
          </span>

          {entity.metadata?.priority && (
            <span className={`inline-flex items-center px-3 py-1 bg-${priorityColors[entity.metadata.priority]}-100 dark:bg-${priorityColors[entity.metadata.priority]}-900/30 text-${priorityColors[entity.metadata.priority]}-700 dark:text-${priorityColors[entity.metadata.priority]}-300 text-sm rounded-full`}>
              <Flag className="h-3 w-3 mr-1" />
              {entity.metadata.priority.charAt(0).toUpperCase() + entity.metadata.priority.slice(1)} Priority
            </span>
          )}

          {entity.metadata?.tags?.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${selectedTags.includes(tag) ? 'ring-2 ring-blue-500' : ''
                }`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4 mr-1" />
              Created By
            </div>
            <button
              onClick={() => handleCopyToClipboard(entity.createdBy.email, 'Email copied')}
              className="text-gray-400 hover:text-gray-600"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {entity.createdBy.avatar ? (
              <img
                src={entity.createdBy.avatar}
                alt={entity.createdBy.fullName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{entity.createdBy.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{entity.createdBy.email}</p>
              {entity.createdBy.role && (
                <p className="text-xs text-gray-400 mt-1">{entity.createdBy.role} • {entity.createdBy.department}</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(entity.createdAt), 'PPP')}
            <Clock className="h-3 w-3 ml-2 mr-1" />
            {format(new Date(entity.createdAt), 'p')}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4 mr-1" />
              Last Updated By
            </div>
            <button
              onClick={() => handleCopyToClipboard(entity.updatedBy.email, 'Email copied')}
              className="text-gray-400 hover:text-gray-600"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {entity.updatedBy.avatar ? (
              <img
                src={entity.updatedBy.avatar}
                alt={entity.updatedBy.fullName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{entity.updatedBy.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{entity.updatedBy.email}</p>
              {entity.updatedBy.role && (
                <p className="text-xs text-gray-400 mt-1">{entity.updatedBy.role} • {entity.updatedBy.department}</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(entity.updatedAt), 'PPP')}
            <Clock className="h-3 w-3 ml-2 mr-1" />
            {format(new Date(entity.updatedAt), 'p')}
          </div>
        </motion.div>
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Additional Information</h4>
          <button
            onClick={() => toggleSection('info')}
            className="text-gray-400 hover:text-gray-600"
          >
            {expandedSections.has('info') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {expandedSections.has('info') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Entity ID</label>
                  <div className="flex items-center mt-1">
                    <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono flex-1">
                      {entity._id}
                    </code>
                    <button
                      onClick={() => handleCopyToClipboard(entity._id, 'ID copied')}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Version</label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-900 dark:text-white">
                      v{entity.metadata?.version || 1}.0.0
                    </span>
                    {onVersion && (
                      <button
                        onClick={() => onVersion(entity._id)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        View History
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {entity.metadata?.customFields && Object.keys(entity.metadata.customFields).length > 0 && (
                <div className="mt-4">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Custom Fields</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {Object.entries(entity.metadata.customFields).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{key}</span>
                        <p className="text-sm text-gray-900 dark:text-white">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">Recent Activities</h3>
        <button
          onClick={fetchActivities}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading.activities ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <ActivityIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {activities.map((log, index) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-6 pb-3 border-l-2 border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-purple-500"></div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {log.userId?.avatar ? (
                      <img
                        src={log.userId.avatar}
                        alt={log.userId.fullName}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <User className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.userId?.fullName || 'System'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(log.timestamp), 'PPp')}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    {log.action}
                  </span>
                </div>

                {log.changes && log.changes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {log.changes.map((change, i) => (
                      <div key={i} className="text-xs bg-white dark:bg-gray-800 rounded p-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{change.field}:</span>{' '}
                        <span className="text-gray-500 line-through mr-2">
                          {JSON.stringify(change.oldValue)}
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {JSON.stringify(change.newValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h3>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={fetchMetrics}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading.metrics ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading metrics...</p>
        </div>
      ) : metrics.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No metrics available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon || Activity;
              const trendColor = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';

              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all ${selectedMetric === metric.label ? 'ring-2 ring-purple-500' : ''
                    }`}
                  onClick={() => setSelectedMetric(selectedMetric === metric.label ? null : metric.label)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                      <Icon className={`h-4 w-4 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                    </div>
                    <div className={`flex items-center ${trendColor}`}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <Activity className="h-3 w-3 mr-1" />
                      )}
                      <span className="text-xs">{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.format === 'currency' && '$'}
                    {metric.value.toLocaleString()}
                    {metric.format === 'percentage' && '%'}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {metrics.some(m => m.data && m.labels) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              style={{ height: 400 }}
            >
              {chartType === 'pie' || chartType === 'doughnut' ? (
                chartType === 'pie' ? (
                  <Pie data={getChartData({ labels: metrics[0]?.labels || [], data: metrics[0]?.data || [] })} options={chartOptions} />
                ) : (
                  <Doughnut data={getChartData({ labels: metrics[0]?.labels || [], data: metrics[0]?.data || [] })} options={chartOptions} />
                )
              ) : chartType === 'radar' ? (
                <Radar data={getChartData({ labels: metrics[0]?.labels || [], data: metrics[0]?.data || [] })} options={chartOptions} />
              ) : chartType === 'polar' ? (
                <PolarArea data={getChartData({ labels: metrics[0]?.labels || [], data: metrics[0]?.data || [] })} options={chartOptions} />
              ) : chartType === 'line' ? (
                <Line data={getLineChartData({ labels: metrics[0]?.labels || [], data: metrics[0]?.data || [] })} options={chartOptions} />
              ) : (
                <Bar data={getChartData({ labels: metrics[0]?.labels || [], data: metrics[0]?.data || [] })} options={chartOptions} />
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );

  const renderCommentsTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
        <textarea
          ref={commentInputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment... (Ctrl+Enter to submit)"
          className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={3}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter') {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {newComment.length} characters
          </span>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </button>
        </div>
      </div>

      {loading.comments ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {comment.userId.avatar ? (
                    <img
                      src={comment.userId.avatar}
                      alt={comment.userId.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{comment.userId.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-gray-700 dark:text-gray-300">
                {comment.content}
              </div>

              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                <button
                  onClick={() => setReplyingTo(comment._id)}
                  className="hover:text-purple-600"
                >
                  Reply
                </button>
              </div>

              {replyingTo === comment._id && (
                <div className="mt-4">
                  <textarea
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 text-sm border rounded-lg resize-none dark:bg-gray-700 dark:border-gray-600"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 'Enter') {
                        e.preventDefault();
                        handleAddReply(comment._id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                        handleAddReply(comment._id, textarea.value);
                        textarea.value = '';
                      }}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAttachmentsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search attachments..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Files</option>
            <option value="image/">Images</option>
            <option value="video/">Videos</option>
            <option value="audio/">Audio</option>
            <option value="application/pdf">PDFs</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUploadAttachment(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </button>
        </div>
      </div>

      {loading.attachments ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading attachments...</p>
        </div>
      ) : filteredAttachments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <Paperclip className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No attachments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
          {filteredAttachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.type);

            return (
              <motion.div
                key={attachment._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => handlePreviewAttachment(attachment)}
              >
                <div className="flex items-start space-x-3">
                  {attachment.type.startsWith('image/') ? (
                    <img
                      src={attachment.thumbnail || attachment.url}
                      alt={attachment.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FileIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate" title={attachment.name}>
                      {attachment.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>•</span>
                      <span>{attachment.type.split('/').pop()?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-gray-400">
                        <User className="h-3 w-3 mr-1" />
                        {attachment.uploadedBy.fullName}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAttachment(attachment);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderRelatedTab = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Related Entities</h3>

      {loading.related ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading related entities...</p>
        </div>
      ) : relatedEntities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No related entities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relatedEntities.map((related) => (
            <motion.div
              key={related._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${related.module === 're' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                    {related.module === 're' ? (
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{related.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {related.entityKey}
                      </code>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${related.relationship === 'parent' ? 'bg-blue-100 text-blue-700' :
                          related.relationship === 'child' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {related.relationship}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`/admin/financial-tracker/entities/${related._id}`, '_blank')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Audit Trail</h3>

      {loading.audit ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading audit logs...</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <History className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log._id}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {format(new Date(log.timestamp), 'PPp')}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{log.ip}</span>
              </div>
              <p className="mt-1 text-gray-900 dark:text-white">
                <span className="font-medium">{log.userId.fullName}</span> {log.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">{log.userAgent}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading.analytics ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Views Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Views Over Time</h4>
            <div style={{ height: 200 }}>
              {viewsData.labels && viewsData.labels.length > 0 ? (
                <Line data={getLineChartData(viewsData)} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No views data available
                </div>
              )}
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Engagement</h4>
            <div style={{ height: 200 }}>
              {engagementData.labels && engagementData.labels.length > 0 ? (
                <Bar data={getChartData(engagementData)} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No engagement data available
                </div>
              )}
            </div>
          </div>

          {/* Module Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Module Distribution</h4>
            <div style={{ height: 200 }}>
              {moduleDistribution.labels && moduleDistribution.labels.length > 0 ? (
                <Pie data={getChartData(moduleDistribution)} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No module data available
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Status Distribution</h4>
            <div style={{ height: 200 }}>
              {statusDistribution.labels && statusDistribution.labels.length > 0 ? (
                <Doughnut data={getChartData(statusDistribution)} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No status data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVersionsTab = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Version History</h3>

      {loading.versions ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading versions...</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No version history found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <GitCommit className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Version {version.number}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(version.createdAt), 'PPP p')} by {version.createdBy?.fullName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onVersion?.(version._id)}
                  className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded"
                >
                  View
                </button>
              </div>
              {version.changes && (
                <div className="mt-2 text-xs text-gray-600">
                  {version.changes.length} changes
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Settings</h3>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about this entity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                defaultChecked={entity.metadata?.settings?.notifications ?? true}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-medium mb-4">Permissions</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Read Access</label>
            <select 
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              defaultValue={entity.metadata?.permissions?.read?.[0] || 'everyone'}
            >
              <option value="everyone">Everyone</option>
              <option value="admins">Admins Only</option>
              <option value="specific">Specific Users</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Write Access</label>
            <select 
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              defaultValue={entity.metadata?.permissions?.write?.[0] || 'admins'}
            >
              <option value="admins">Admins Only</option>
              <option value="specific">Specific Users</option>
              <option value="none">No One</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-medium mb-4">Danger Zone</h4>
        <div className="space-y-3">
          <button
            onClick={() => setShowArchiveConfirm(true)}
            className="w-full px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50"
          >
            Archive Entity
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
          >
            Delete Entity
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${fullscreen ? 'p-0' : 'p-4'}`}>
      <div className="flex min-h-screen items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`
            relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
            transform transition-all w-full
            ${fullscreen ? 'max-w-7xl' : 'max-w-4xl'}
          `}
          style={{ zoom: zoomLevel }}
        >
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${moduleGradient} rounded-t-2xl px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/20 rounded-lg p-2"
                >
                  <Eye className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Entity Details</h2>
                  <p className="text-sm text-white/80 flex items-center">
                    <Code className="h-3 w-3 mr-1" />
                    ID: {entity._id.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded"
                    title="Zoom out (Ctrl-)"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-white px-2">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded"
                    title="Zoom in (Ctrl+)"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setFullscreen(!fullscreen)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
                  title="Toggle fullscreen (Ctrl+F)"
                >
                  {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>

                {/* Refresh */}
                <button
                  onClick={() => {
                    if (onRefresh) {
                      onRefresh();
                    } else {
                      fetchData();
                    }
                  }}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
                  title="Refresh"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Stats Bar - Dynamic from entity metadata */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-white/70">Created</div>
                <div className="text-sm text-white font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDistance(new Date(entity.createdAt), new Date(), { addSuffix: true })}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-white/70">Updated</div>
                <div className="text-sm text-white font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistance(new Date(entity.updatedAt), new Date(), { addSuffix: true })}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-white/70">Views</div>
                <div className="text-sm text-white font-medium flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {entity.metadata?.views?.toLocaleString() || 0}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-white/70">Likes</div>
                <div className="text-sm text-white font-medium flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {entity.metadata?.likes?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              {[
                { id: 'details', icon: Info, label: 'Details', shortcut: 'Alt+1' },
                { id: 'activity', icon: Activity, label: 'Activity', shortcut: 'Alt+2' },
                { id: 'metrics', icon: BarChart3, label: 'Metrics', shortcut: 'Alt+3' },
                { id: 'comments', icon: MessageSquare, label: 'Comments', shortcut: 'Alt+4' },
                { id: 'attachments', icon: Paperclip, label: 'Attachments', shortcut: 'Alt+5' },
                { id: 'related', icon: GitBranch, label: 'Related', shortcut: 'Alt+6' },
                { id: 'audit', icon: History, label: 'Audit', shortcut: 'Alt+7' },
                { id: 'analytics', icon: TrendingUp, label: 'Analytics', shortcut: 'Alt+8' },
                { id: 'versions', icon: GitCommit, label: 'Versions', shortcut: 'Alt+9' },
                { id: 'settings', icon: Settings, label: 'Settings', shortcut: 'Alt+0' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      py-3 px-4 border-b-2 font-medium text-sm transition-all flex items-center space-x-2
                      ${isActive
                        ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                    title={tab.shortcut}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'details' && renderDetailsTab()}
                {activeTab === 'activity' && renderActivityTab()}
                {activeTab === 'metrics' && renderMetricsTab()}
                {activeTab === 'comments' && renderCommentsTab()}
                {activeTab === 'attachments' && renderAttachmentsTab()}
                {activeTab === 'related' && renderRelatedTab()}
                {activeTab === 'audit' && renderAuditTab()}
                {activeTab === 'analytics' && renderAnalyticsTab()}
                {activeTab === 'versions' && renderVersionsTab()}
                {activeTab === 'settings' && renderSettingsTab()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Command className="h-3 w-3" />
                <span>Alt+1-9 to switch tabs • Ctrl+E to edit • Ctrl+S to share</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit?.(entity)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit (Ctrl+E)
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share (Ctrl+S)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">QR Code</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center p-4">
              <QRCodeSVG
                value={JSON.stringify({
                  id: entity._id,
                  name: entity.name,
                  key: entity.entityKey
                })}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Scan to view entity details
            </p>
            <button
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  const link = document.createElement('a');
                  link.download = `qrcode-${entity.entityKey}.png`;
                  link.href = canvas.toDataURL();
                  link.click();
                }
              }}
              className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Share Entity</h3>
              <button
                onClick={() => setShowShareDialog(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Share Link</label>
                <div className="flex mt-1">
                  <input
                    type="text"
                    value={`${window.location.origin}/admin/financial-tracker/entities/${entity._id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-l-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <button
                    onClick={() => handleCopyToClipboard(
                      `${window.location.origin}/admin/financial-tracker/entities/${entity._id}`,
                      'Link copied'
                    )}
                    className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Export Entity</h3>
              <button
                onClick={() => setShowExportDialog(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {['JSON', 'CSV', 'PDF', 'Excel'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format.toLowerCase())}
                  className="w-full px-4 py-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>{format}</span>
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Delete Entity</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this entity? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
              <Archive className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Archive Entity</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to archive this entity? You can restore it later.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Confirmation */}
      {showCloneConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
              <Copy className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Clone Entity</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Create a copy of this entity with all its properties?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCloneConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}