// src/app/financial-tracker/types.ts
export type ModuleType = 're' | 'expense';
export type StatusType = 'draft' | 'submitted' | 'approved' | 'rejected';
export type ViewMode = 'excel' | 'cards' | 'split' | 'kanban' | 'gallery' | 'timeline' | 'calendar' | 'map' | 'gantt' | 'pivot' | 'chart' | 'form';
export type ThemeMode = 'light' | 'dark' | 'system' | 'solarized' | 'monokai' | 'dracula' | 'nord' | 'github' | 'vscode';
export type ColumnWidth = 'auto' | 'compact' | 'normal' | 'wide' | 'full';
export type RowHeight = 'compact' | 'normal' | 'comfortable' | 'relaxed';
export type SortDirection = 'asc' | 'desc' | null;
export type FilterOperator = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'notBetween' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'null' | 'notNull' | 'true' | 'false' | 'yesterday' | 'today' | 'tomorrow' | 'lastWeek' | 'thisWeek' | 'nextWeek' | 'lastMonth' | 'thisMonth' | 'nextMonth' | 'lastYear' | 'thisYear' | 'nextYear' | 'last7Days' | 'last30Days' | 'last90Days' | 'last365Days' | 'next7Days' | 'next30Days' | 'next90Days' | 'next365Days';
export type FilterType = 'text' | 'number' | 'date' | 'datetime' | 'time' | 'boolean' | 'select' | 'multiselect' | 'color' | 'rating' | 'progress' | 'currency' | 'percent' | 'phone' | 'email' | 'url' | 'ip' | 'mac' | 'json' | 'array' | 'object';
export type CellType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'time' | 'duration' | 'currency' | 'percent' | 'boolean' | 'select' | 'multiselect' | 'file' | 'image' | 'color' | 'rating' | 'progress' | 'badge' | 'link' | 'email' | 'url' | 'phone' | 'json' | 'array' | 'object' | 'ip' | 'mac' | 'qr' | 'barcode' | 'signature' | 'richText' | 'markdown' | 'html' | 'code' | 'formula' | 'function' | 'expression' | 'regex' | 'uuid' | 'password' | 'otp' | 'pin' | 'cvv' | 'cardNumber' | 'iban' | 'swift' | 'routing' | 'accountNumber' | 'tin' | 'ssn' | 'ein' | 'passport' | 'license' | 'vin' | 'imei' | 'serial' | 'sku' | 'upc' | 'ean' | 'isbn' | 'issn' | 'doi' | 'orcid' | 'pubMed' | 'arxiv' | 'crypto' | 'blockchain' | 'nft' | 'token' | 'contract' | 'wallet' | 'address' | 'transaction' | 'hash' | 'signature' | 'publicKey' | 'privateKey' | 'seed' | 'mnemonic' | 'derivation' | 'path' | 'xpub' | 'xprv' | 'zpub' | 'zprv';

export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html' | 'markdown' | 'yaml' | 'toml' | 'sql' | 'graphql';

export interface Field {
  _id: string;
  fieldKey: string;
  label: string;
  type: CellType;
  isSystem: boolean;
  isEnabled: boolean;
  required: boolean;
  readOnly: boolean;
  visible: boolean;
  order: number;
  defaultValue?: any;
  options?: string[];
  validation?: Record<string, any>;
  format?: Record<string, any>;
  style?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface DataRecord {
  _id: string;
  data: Record<string, any>;
  version: number;
  status: StatusType;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  module: ModuleType;
  entity: string;
  tags?: string[];
  starred?: boolean;
  archived?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  pinned?: boolean;
  flagged?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
  dueDate?: string;
  assignedTo?: string;
  team?: string[];
  department?: string;
  branch?: string;
  region?: string;
  country?: string;
  timezone?: string;
  language?: string;
  locale?: string;
  currency?: string;
  timeFormat?: '12h' | '24h';
  dateFormat?: string;
  weekStart?: 'sunday' | 'monday' | 'saturday';
  fiscalYearStart?: string;
  fiscalYearEnd?: string;
}

export interface PaginatedResponse {
  records: DataRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export interface StatsResponse {
  totalRecords: number;
  todayRecords: number;
  weekRecords: number;
  monthRecords: number;
  pendingApprovals: number;
  deletedRecords: number;
  archivedRecords: number;
  starredRecords: number;
  totalComments: number;
  totalAttachments: number;
  lastUpdated: string;
  usersActive?: number;
  storageUsed?: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: any;
}

export interface Attachment {
  id: string;
  recordId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  recordId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  edited: boolean;
  editedAt?: string;
  replies?: Comment[];
  attachments?: string[];
  mentions?: string[];
}

export interface Version {
  version: number;
  data: Record<string, any>;
  updatedBy: string;
  updatedAt: string;
  changes: Array<{ field: string; oldValue: any; newValue: any }>;
}

export interface HistoryState {
  records: DataRecord[];
  selections: string[];
  timestamp: number;
  description: string;
}

export interface ClipboardData {
  rows: Record<string, any>[];
  columns: string[];
  mimeType: 'text/plain' | 'text/csv' | 'application/json';
  cut?: boolean;
}

export interface ViewPreset {
  id: string;
  name: string;
  description?: string;
  filters: Filter[];
  sorts: Sort[];
  groups: Group[];
  hiddenColumns: string[];
  frozenColumns: string[];
  columnWidths: Record<string, number>;
  isDefault?: boolean;
  isSystem?: boolean;
  createdBy?: string;
  createdAt?: string;
  shared?: boolean;
}

export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
  global?: boolean;
}

export interface Filter {
  id: string;
  fieldKey: string;
  operator: FilterOperator;
  value: any;
  value2?: any;
  type: FilterType;
  not?: boolean;
  caseSensitive?: boolean;
  useRegex?: boolean;
}

export interface Sort {
  fieldKey: string;
  direction: SortDirection;
  priority: number;
  type?: 'auto' | 'string' | 'number' | 'date' | 'boolean';
  locale?: string;
  numeric?: boolean;
  sensitivity?: 'base' | 'accent' | 'case' | 'variant';
  ignorePunctuation?: boolean;
}

export interface Group {
  fieldKey: string;
  expanded: boolean;
  level: number;
  parent?: string;
  collapsed?: boolean;
  sort?: Sort;
  limit?: number;
  offset?: number;
  aggregates?: Array<{
    field: string;
    type: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
    alias?: string;
  }>;
}

export interface Column {
  field: Field;
  width: number;
  visible: boolean;
  frozen: boolean;
  index: number;
  group?: string;
  summary?: Record<string, any>;
  totals?: Record<string, any>;
  format?: Record<string, any>;
  conditional?: Array<{
    condition: (value: any) => boolean;
    style: React.CSSProperties;
    class?: string;
  }>;
}