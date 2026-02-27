
export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role?: string;
  department?: string;
  phone?: string;
  location?: string;
}

export interface Comment {
  _id: string;
  userId: User;
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

export interface Attachment {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedBy: User;
  uploadedAt: string;
  description?: string;
  tags?: string[];
  downloads?: number;
  views?: number;
}

// Comprehensive metadata interface that works for both
export interface EntityMetadata {
  // Page.tsx properties
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  
  // Modal.tsx properties
  version?: number;
  tags?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'published' | 'archived' | 'deleted';
  commentObjects?: Comment[];
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
}

// Unified Entity interface
export interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  branchId?: string;
  createdBy: User;
  updatedBy: User;
  createdAt: string;
  updatedAt: string;
  metadata?: EntityMetadata;
}

// Activity Log
export interface ActivityLog {
  _id: string;
  userId: User;
  action: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    type?: string;
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

// Related Entity
export interface RelatedEntity {
  _id: string;
  name: string;
  module: 're' | 'expense';
  entityKey: string;
  relationship: string;
  direction?: string;
  strength?: string;
  metadata?: Record<string, any>;
}

// Metric Data
export interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon?: React.ElementType;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  history?: { date: string; value: number }[];
}

// Audit Entry
export interface AuditEntry {
  _id: string;
  timestamp: string;
  userId: { fullName: string; email: string };
  action: string;
  details: string;
  ip: string;
  userAgent: string;
}