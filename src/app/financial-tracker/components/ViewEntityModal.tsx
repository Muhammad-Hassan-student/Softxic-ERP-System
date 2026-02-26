// src/app/admin/financial-tracker/entities/components/ViewEntityModal.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Activity } from 'react';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { format, formatDistance, formatRelative, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
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
import { Bar, Pie, Line, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import { ActivityIcon, AlertCircle, Archive, ArrowDown, ArrowUp, BarChart3, Calendar, ChevronDown, ChevronUp, Clock, Code, CommandIcon, Copy, CreditCard, DollarSign, Download, Edit, ExternalLink, Eye, File, FileArchive, FileAudio, FileCode, FileImage, FileJson, FileSpreadsheet, FileText, FileVideo, Flag, GitBranch, GitCommit, HdIcon, Heart, History, Info, Mail, MapPin, Maximize2, MessageSquare, Minimize2, Paperclip, Power, PowerOff, Printer, QrCode, RefreshCw, Search, Send, Settings, Share2, ShieldCheck, ShieldOff, Star, Tag, Trash2, TrendingDown, TrendingUp, TrendingUpDownIcon, Upload, X } from 'lucide-react';
import User from '@/models/User';
import { Command } from 'ioredis';

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
    avatar?: string;
    role?: string;
    department?: string;
    phone?: string;
    location?: string;
  };
  updatedBy: { 
    _id: string;
    fullName: string; 
    email: string;
    avatar?: string;
    role?: string;
    department?: string;
    phone?: string;
    location?: string;
  };
  createdAt: string;
  updatedAt: string;
  metadata?: {
    version?: number;
    tags?: string[];
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'draft' | 'published' | 'archived' | 'deleted';
    views?: number;
    likes?: number;
    shares?: number;
    comments?: Comment[];
    attachments?: Attachment[];
    customFields?: Record<string, any>;
    relations?: {
      parent?: string[];
      children?: string[];
      references?: string[];
      dependencies?: string[];
    };
    analytics?: {
      daily?: { date: string; count: number }[];
      weekly?: { week: string; count: number }[];
      monthly?: { month: string; count: number }[];
      yearly?: { year: string; count: number }[];
    };
    permissions?: {
      read?: string[];
      write?: string[];
      delete?: string[];
      admin?: string[];
    };
    settings?: Record<string, any>;
  };
}

interface Comment {
  _id: string;
  userId: { 
    _id: string;
    fullName: string; 
    email: string; 
    avatar?: string;
    role?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy?: string[];
  replies?: Comment[];
  isEdited?: boolean;
  isPinned?: boolean;
  isResolved?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  uploadedAt: string;
  description?: string;
  tags?: string[];
  downloads?: number;
  views?: number;
}

interface ActivityLog {
  _id: string;
  userId: { 
    _id: string;
    fullName: string; 
    email: string;
    avatar?: string;
    role?: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE' | 'APPROVE' | 'REJECT' | 'ARCHIVE' | 'RESTORE' | 'VIEW' | 'EXPORT' | 'SHARE' | 'COMMENT' | 'ATTACH' | 'TAG' | 'CLONE' | 'MERGE' | 'IMPORT' | 'EXPORT' | 'PRINT' | 'DOWNLOAD';
  changes?: Array<{ 
    field: string; 
    oldValue: any; 
    newValue: any;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    path?: string[];
  }>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  location?: string;
  device?: string;
  browser?: string;
  os?: string;
  metadata?: Record<string, any>;
}

interface RelatedEntity {
  _id: string;
  name: string;
  module: 're' | 'expense';
  entityKey: string;
  relationship: 'parent' | 'child' | 'reference' | 'dependency' | 'related' | 'version' | 'copy' | 'template';
  direction?: 'incoming' | 'outgoing' | 'bidirectional';
  strength?: 'weak' | 'strong' | 'required' | 'optional';
  metadata?: Record<string, any>;
}

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon?: React.ElementType;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  history?: { date: string; value: number }[];
}

interface AuditEntry {
  _id: string;
  timestamp: string;
  userId: { fullName: string; email: string };
  action: string;
  details: string;
  ip: string;
  userAgent: string;
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

  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'metrics' | 'comments' | 'attachments' | 'related' | 'audit' | 'settings' | 'analytics' | 'versions' | 'permissions' | 'history'>('details');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [relatedEntities, setRelatedEntities] = useState<RelatedEntity[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    activities: false,
    comments: false,
    attachments: false,
    related: false,
    metrics: false,
    audit: false,
    versions: false
  });
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showCloneConfirm, setShowCloneConfirm] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['info', 'metadata', 'relations']));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polar'>('bar');
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (isOpen && entity) {
      fetchData();
    }
  }, [isOpen, entity, activeTab, dateRange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch(e.key) {
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
          if (e.ctrlKey || e.metaKey && e.shiftKey) {
            e.preventDefault();
            setShowDeleteConfirm(true);
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey && e.shiftKey) {
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
  // DATA FETCHING
  // ============================================

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const fetchData = async () => {
    switch(activeTab) {
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
    }
  };

  const fetchActivities = async () => {
    setLoading(prev => ({ ...prev, activities: true }));
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/activity-logs?entity=entities&recordId=${entity._id}&limit=100&sort=${sortOrder}`, {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  };

  const fetchComments = async () => {
    setLoading(prev => ({ ...prev, comments: true }));
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/comments?entityId=${entity._id}&sort=${sortOrder}`, {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(prev => ({ ...prev, comments: false }));
    }
  };

  const fetchAttachments = async () => {
    setLoading(prev => ({ ...prev, attachments: true }));
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/attachments?entityId=${entity._id}&sort=${sortBy}&order=${sortOrder}`, {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setAttachments(data.attachments || []);
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    } finally {
      setLoading(prev => ({ ...prev, attachments: false }));
    }
  };

  const fetchRelatedEntities = async () => {
    setLoading(prev => ({ ...prev, related: true }));
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entity._id}/related`, {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setRelatedEntities(data.related || []);
      }
    } catch (error) {
      console.error('Failed to fetch related entities:', error);
    } finally {
      setLoading(prev => ({ ...prev, related: false }));
    }
  };

  const fetchMetrics = async () => {
    setLoading(prev => ({ ...prev, metrics: true }));
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entity._id}/metrics?range=${dateRange}`, {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || []);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(prev => ({ ...prev, audit: true }));
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/audit?entityId=${entity._id}&limit=100`, {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(prev => ({ ...prev, audit: false }));
    }
  };

  const fetchVersions = async () => {
    setLoading(prev => ({ ...prev, versions: true }));
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entity._id}/versions`, {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(prev => ({ ...prev, versions: false }));
    }
  };

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
      
      // Focus back on comment input
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

  const handleEditComment = async (commentId: string, newContent: string) => {
    // Implement edit comment logic
    setEditingComment(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    // Implement delete comment logic
  };

  const handleLikeComment = async (commentId: string) => {
    // Implement like comment logic
  };

  const handlePinComment = async (commentId: string) => {
    // Implement pin comment logic
  };

  const handleResolveComment = async (commentId: string) => {
    // Implement resolve comment logic
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

  const handleDeleteAttachment = async (attachmentId: string) => {
    // Implement delete attachment logic
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
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

  const handlePreviewAttachment = (attachment: Attachment) => {
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
      // Default export logic
      const dataStr = JSON.stringify(entity, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${entity.entityKey}-${new Date().toISOString()}.${format}`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success(`Entity exported as ${format.toUpperCase()}`);
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

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Usage',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
        fill: true,
      },
      {
        label: 'Growth',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        fill: true,
      }
    ]
  };

  const pieChartData = {
    labels: ['Active', 'Inactive', 'Pending'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#10B981', '#6B7280', '#F59E0B'],
        borderColor: ['#059669', '#4B5563', '#D97706'],
        borderWidth: 1,
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
              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                isFavorite 
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
              className={`inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                selectedTags.includes(tag) ? 'ring-2 ring-blue-500' : ''
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

              {entity.metadata?.customFields && (
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

      {/* Relations */}
      {entity.metadata?.relations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Relations</h4>
            <button
              onClick={() => toggleSection('relations')}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSections.has('relations') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence>
            {expandedSections.has('relations') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {entity.metadata.relations.parent && entity.metadata.relations.parent.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Parent Entities</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {entity.metadata.relations.parent.map(id => (
                        <span key={id} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {id.slice(-8)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entity.metadata.relations.children && entity.metadata.relations.children.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Child Entities</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {entity.metadata.relations.children.map(id => (
                        <span key={id} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                          {id.slice(-8)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-4">
      {/* Activity Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">Recent Activities</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Toggle sort order"
          >
            {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
          </button>
          <button
            onClick={fetchActivities}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
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
              {/* Timeline dot */}
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

                {(log.ip || log.location) && (
                  <div className="mt-2 flex items-center space-x-3 text-xs text-gray-400">
                    {log.ip && <span>IP: {log.ip}</span>}
                    {log.location && <span>• {log.location}</span>}
                    {log.device && <span>• {log.device}</span>}
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
      {/* Metrics Controls */}
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
          
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-3 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="doughnut">Doughnut Chart</option>
            <option value="radar">Radar Chart</option>
            <option value="polar">Polar Area</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon || Activity;
          const trendColor = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all ${
                selectedMetric === metric.label ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedMetric(selectedMetric === metric.label ? null : metric.label)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                  <Icon className={`h-4 w-4 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
                <div className={`flex items-center ${trendColor}`}>
                  <TrendingUpDownIcon className="h-3 w-3 mr-1" />
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

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
        style={{ height: 400 }}
      >
        {chartType === 'pie' || chartType === 'doughnut' ? (
          chartType === 'pie' ? (
            <Pie data={pieChartData} options={chartOptions} />
          ) : (
            <Doughnut data={pieChartData} options={chartOptions} />
          )
        ) : chartType === 'radar' ? (
          <Radar data={chartData} options={chartOptions} />
        ) : chartType === 'polar' ? (
          <PolarArea data={pieChartData} options={chartOptions} />
        ) : chartType === 'line' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </motion.div>
    </div>
  );

  const renderCommentsTab = () => (
    <div className="space-y-4">
      {/* New Comment Input */}
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
            {newComment.length} characters • Markdown supported
          </span>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments List */}
      {loading.comments ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
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
                      {comment.isEdited && ' • edited'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {comment.isPinned && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                      Pinned
                    </span>
                  )}
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-red-500"
                  >
                    <Heart className={`h-4 w-4 ${comment.likedBy?.includes('current-user') ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-xs">{comment.likes}</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 text-gray-700 dark:text-gray-300">
                {comment.content}
              </div>

              {/* Comment Actions */}
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                <button
                  onClick={() => setReplyingTo(comment._id)}
                  className="hover:text-purple-600"
                >
                  Reply
                </button>
                <button
                  onClick={() => handlePinComment(comment._id)}
                  className="hover:text-yellow-600"
                >
                  Pin
                </button>
                <button
                  onClick={() => handleResolveComment(comment._id)}
                  className="hover:text-green-600"
                >
                  Resolve
                </button>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-8 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{reply.userId.fullName}</p>
                            <p className="text-xs text-gray-500">{formatDistance(new Date(reply.createdAt), new Date(), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === comment._id && (
                <div className="mt-4 ml-8">
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
      {/* Attachment Controls */}
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
            <option value="application/vnd.openxmlformats-officedocument">Documents</option>
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

      {/* Attachments Grid */}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAttachment(attachment._id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Attachment Preview Modal */}
      {selectedAttachment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">{selectedAttachment.name}</h3>
              <button
                onClick={() => setSelectedAttachment(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {selectedAttachment.type.startsWith('image/') ? (
                <img
                  src={selectedAttachment.url}
                  alt={selectedAttachment.name}
                  className="max-w-full h-auto"
                />
              ) : selectedAttachment.type.startsWith('video/') ? (
                <video
                  src={selectedAttachment.url}
                  controls
                  className="w-full"
                />
              ) : selectedAttachment.type.startsWith('audio/') ? (
                <audio
                  src={selectedAttachment.url}
                  controls
                  className="w-full"
                />
              ) : (
                <div className="text-center py-12">
                  <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <button
                    onClick={() => handleDownloadAttachment(selectedAttachment)}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
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
                  <div className={`p-2 rounded-lg ${
                    related.module === 're' ? 'bg-blue-100' : 'bg-green-100'
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        related.relationship === 'parent' ? 'bg-blue-100 text-blue-700' :
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Views Over Time</h4>
          <div style={{ height: 200 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Engagement</h4>
          <div style={{ height: 200 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Views</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">1,234</p>
          <p className="text-xs text-green-600">+12%</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Unique Visitors</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">892</p>
          <p className="text-xs text-green-600">+8%</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Avg. Time</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">4m 32s</p>
          <p className="text-xs text-red-600">-2%</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Bounce Rate</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">32%</p>
          <p className="text-xs text-green-600">-5%</p>
        </div>
      </div>
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
          {versions.map((version, index) => (
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
                      {format(new Date(version.createdAt), 'PPP p')} by {version.createdBy.fullName}
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
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Access</p>
              <p className="text-sm text-gray-500">Allow public viewing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-archive</p>
              <p className="text-sm text-gray-500">Automatically archive after 30 days</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
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
            <select className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <option>Everyone</option>
              <option>Admins Only</option>
              <option>Specific Users</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Write Access</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <option>Admins Only</option>
              <option>Specific Users</option>
              <option>No One</option>
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
                  onClick={onRefresh}
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

            {/* Quick Stats Bar */}
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
                  {entity.metadata?.views || 0}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <div className="text-xs text-white/70">Likes</div>
                <div className="text-sm text-white font-medium flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {entity.metadata?.likes || 0}
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
                    <HdIcon className={`h-4 w-4 ${isActive ? 'text-purple-600' : ''}`} />
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
                <CommandIcon className="h-3 w-3" />
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

              <div>
                <label className="text-sm text-gray-600">Share via</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <button className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                    <Mail className="h-5 w-5 mx-auto" />
                  </button>
                  <button className="p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                    <MessageSquare className="h-5 w-5 mx-auto" />
                  </button>
                  <button className="p-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                    <Send className="h-5 w-5 mx-auto" />
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <Printer className="h-5 w-5 mx-auto" />
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