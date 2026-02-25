'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  // Core Icons
  Plus, Save, Trash2, Copy, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Eye, EyeOff, Lock, Unlock, Filter, Search, X,
  Download, Upload, Printer, RefreshCw, Maximize2,
  Minimize2, Columns, Grid3x3, Table as TableIcon,
  Zap, AlertCircle, CheckCircle, Clock, History,
  GitCompare, FileSpreadsheet, FileText, FileJson,
  Settings2, Sliders, ToggleLeft, ToggleRight,
  Pin, PinOff, Star, Award, TrendingUp, TrendingDown,
  Activity, BarChart3, PieChart, Calendar,
  User, Users, Shield, Key, CopyCheck,
  GripVertical, GripHorizontal, Grip,
  Move, MoveHorizontal, MoveVertical,
  ArrowLeft, ArrowRight, ArrowUpIcon, ArrowDownIcon,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Menu, MoreVertical, MoreHorizontal,
  PanelLeft, PanelRight, PanelTop, PanelBottom,
  Split, Combine, Share2, Bookmark,
  FilterX, SlidersHorizontal,
  ZoomIn, ZoomOut, Fullscreen,
  Moon, Sun, Monitor, Smartphone,
  Wifi, WifiOff, Battery, BatteryCharging,
  Cloud, CloudOff, Database, Server,
  HardDrive, Cpu, Network, RadioTower,
  Command, Terminal, Braces, Code,
  Globe, Lock as LockIcon, Unlock as UnlockIcon,
  ToggleLeft as ToggleLeftIcon, ToggleRight as ToggleRightIcon,
  Square, SquareStack, Layers, LayoutGrid,
  TableProperties, TableRowsSplit, TableColumnsSplit,
  FileCheck, FileClock, FileStack,
  CopyPlus, CopyX, CopyCheck as CopyCheckIcon,
  Pencil, PencilOff, Eraser, Scissors,
  ClipboardCopy, ClipboardPaste, ClipboardList,
  Printer as PrinterIcon, PrinterCheck,
  Mail, MessageSquare, Bell, BellRing,
  AlertTriangle, Info, HelpCircle,
  Award as AwardIcon, Crown, Medal,
  Rocket, Zap as ZapIcon, Sparkles,
  Flame, FlameKindling, FireExtinguisher,
  Droplets, Wind, Snowflake, SunSnow,
  CloudSun, CloudMoon, CloudRain, CloudLightning,
  Umbrella, Thermometer, Gauge,
  Ruler, Weight, Scale, Compass,
  Crosshair, Target, Circle, CircleDot,
  Square as SquareIcon, SquareDot,
  Diamond, DiamondPlus, Gem,
  Heart, HeartPulse, HeartOff,
  ThumbsUp, ThumbsDown, ThumbsUp as ThumbsUpIcon,
  Share, Share2 as ShareIcon, Send,
  AtSign, Hash, DollarSign, Euro,
  PoundSterling, Bitcoin,
  CreditCard, Landmark, Wallet,
  Banknote, Coins, PiggyBank,
  Receipt, ReceiptEuro, ReceiptPoundSterling,
  ReceiptRussianRuble, ReceiptCent,
  ShoppingBag, ShoppingCart, Package,
  PackageOpen, PackagePlus, PackageMinus,
  PackageSearch, PackageX,
  Box, Boxes, Warehouse,
  Truck, Plane, PlaneLanding, PlaneTakeoff,
  Ship, ShipWheel, Anchor,
  Bike, Bus, Car, CarTaxiFront,
  Train, TrainFront, TrainTrack,
  MapPin, MapPinned,
  Navigation, NavigationOff,
  Locate, LocateFixed, LocateOff,
  Compass as CompassIcon, Radar,
  Satellite, SatelliteDish,
  Radio, RadioReceiver, RadioTower as RadioTowerIcon,
  Antenna, WifiHigh, WifiLow, WifiZero,
  Signal, SignalHigh, SignalLow, SignalZero,
  Bluetooth, BluetoothConnected, BluetoothOff,
  Monitor as MonitorIcon, MonitorOff,
  Tv, Tv2, Tablet, Smartphone as SmartphoneIcon,
  Watch, Headphones, Speaker,
  Mic, MicOff, Videotape,
  Camera, CameraOff, Video,
  VideoOff, Film, Clapperboard,
  Music, Music2, Music3, Music4,
  Disc, Disc2, Disc3,
  Podcast, PodcastIcon,
  Gamepad, Gamepad2,
  Joystick, Dices,
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  Puzzle, Palette, Paintbrush, Paintbrush2,
  PaintBucket, Brush, Eraser as EraserIcon,
  PencilRuler, PencilLine,
  Pen, PenLine, PenTool,
  Highlighter, Type, CaseSensitive,
  TextCursor, TextCursorInput,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, ListChecks,
  ListTodo, ListPlus, ListMinus,
  ListX, ListCheck, ListCollapse,
  ListEnd, ListStart,
  Indent, IndentDecrease, IndentIncrease,
  Outdent, Quote,
  File, FilePlus, FileMinus,
  FileX, FileCheck as FileCheckIcon,
  FileSearch, FileWarning,
  FileUp, FileDown, FileInput, FileOutput,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileJson as FileJsonIcon,
  FileCode as FileCodeIcon,
  FileText as FileTextIcon,
  FileImage, FileVideo, FileAudio,
  FileArchive, FileDiff, FileSignature,
  FileClock as FileClockIcon,
  FileStack as FileStackIcon,
  FileDigit, FileSymlink,
  FileHeart, Folder, FolderPlus, FolderMinus,
  FolderX, FolderCheck,
  FolderSearch, FolderOpen, FolderClosed,
  FolderTree as FolderTreeIcon,
  FolderGit, FolderGit2,
  FolderKanban, FolderCog, FolderCog2,
  FolderHeart, RotateCcw, RotateCw,
  Sun as SunIcon, Moon as MoonIcon, Cloud as CloudIcon,
  Sunrise as SunriseIcon, Sunset as SunsetIcon,
  Wind as WindIcon, Thermometer as ThermometerIcon,
  Droplet, Waves, Anchor as AnchorIcon,
  Ship as ShipIcon, Sailboat,
  Fish, Shell,
  TreePine, Mountain, CloudSnow,
  CloudRain as CloudRainIcon, CloudLightning as CloudLightningIcon,
  CloudFog, CloudDrizzle, CloudHail,
  SunSnow as SunSnowIcon, MoonStar, Sparkle,
  Leaf, Flower2, Sprout,
  TreeDeciduous
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { usePermissions } from '../../hooks/usePermission';
import { useConcurrency } from '../../hooks/useConcurrency';
import { format, parseISO, differenceInDays, differenceInHours, formatDistance, formatRelative, formatDistanceToNow } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==================== TYPE DEFINITIONS ====================

type ModuleType = 're' | 'expense';
type StatusType = 'draft' | 'submitted' | 'approved' | 'rejected';
type ViewMode = 'excel' | 'cards' | 'split' | 'kanban' | 'gallery' | 'timeline' | 'calendar' | 'map' | 'gantt' | 'pivot' | 'chart' | 'form';
type ThemeMode = 'light' | 'dark' | 'system' | 'solarized' | 'monokai' | 'dracula' | 'nord' | 'github' | 'vscode';
type ColumnWidth = 'auto' | 'compact' | 'normal' | 'wide' | 'full';
type RowHeight = 'compact' | 'normal' | 'comfortable' | 'relaxed';
type SortDirection = 'asc' | 'desc' | null;
type FilterOperator = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'notBetween' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'null' | 'notNull' | 'true' | 'false' | 'yesterday' | 'today' | 'tomorrow' | 'lastWeek' | 'thisWeek' | 'nextWeek' | 'lastMonth' | 'thisMonth' | 'nextMonth' | 'lastYear' | 'thisYear' | 'nextYear' | 'last7Days' | 'last30Days' | 'last90Days' | 'last365Days' | 'next7Days' | 'next30Days' | 'next90Days' | 'next365Days';
type FilterType = 'text' | 'number' | 'date' | 'datetime' | 'time' | 'boolean' | 'select' | 'multiselect' | 'color' | 'rating' | 'progress' | 'currency' | 'percent' | 'phone' | 'email' | 'url' | 'ip' | 'mac' | 'json' | 'array' | 'object';
type CellType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'time' | 'duration' | 'currency' | 'percent' | 'boolean' | 'select' | 'multiselect' | 'file' | 'image' | 'color' | 'rating' | 'progress' | 'badge' | 'link' | 'email' | 'url' | 'phone' | 'json' | 'array' | 'object' | 'ip' | 'mac' | 'qr' | 'barcode' | 'signature' | 'richText' | 'markdown' | 'html' | 'code' | 'formula' | 'function' | 'expression' | 'regex' | 'uuid' | 'password' | 'otp' | 'pin' | 'cvv' | 'cardNumber' | 'iban' | 'swift' | 'routing' | 'accountNumber' | 'tin' | 'ssn' | 'ein' | 'passport' | 'license' | 'vin' | 'imei' | 'serial' | 'sku' | 'upc' | 'ean' | 'isbn' | 'issn' | 'doi' | 'orcid' | 'pubMed' | 'arxiv' | 'crypto' | 'blockchain' | 'nft' | 'token' | 'contract' | 'wallet' | 'address' | 'transaction' | 'hash' | 'signature' | 'publicKey' | 'privateKey' | 'seed' | 'mnemonic' | 'derivation' | 'path' | 'xpub' | 'xprv' | 'zpub' | 'zprv';

interface Field {
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
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    regex?: string;
    email?: boolean;
    url?: boolean;
    phone?: boolean;
    ip?: boolean;
    mac?: boolean;
    uuid?: boolean;
    creditCard?: boolean;
    ssn?: boolean;
    tin?: boolean;
    ein?: boolean;
    vin?: boolean;
    imei?: boolean;
    serial?: boolean;
    sku?: boolean;
    upc?: boolean;
    ean?: boolean;
    isbn?: boolean;
    issn?: boolean;
    doi?: boolean;
    orcid?: boolean;
    pubMed?: boolean;
    arxiv?: boolean;
    custom?: (value: any) => boolean;
    customMessage?: string;
    allowedFileTypes?: string[];
    maxFileSize?: number;
    minFiles?: number;
    maxFiles?: number;
    dimensions?: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
      aspectRatio?: number;
    };
    decimal?: number;
    currency?: string;
    dateFormat?: string;
    timeFormat?: string;
    dateTimeFormat?: string;
    minDate?: string;
    maxDate?: string;
    minTime?: string;
    maxTime?: string;
    step?: number;
    multipleOf?: number;
    unique?: boolean;
    caseSensitive?: boolean;
    trim?: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
    capitalize?: boolean;
    titleCase?: boolean;
    snakeCase?: boolean;
    camelCase?: boolean;
    kebabCase?: boolean;
    pascalCase?: boolean;
    constantCase?: boolean;
    dotCase?: boolean;
    pathCase?: boolean;
    sentenceCase?: boolean;
    slug?: boolean;
    encode?: 'base64' | 'hex' | 'rot13' | 'atbash' | 'caesar' | 'vigenere' | 'aes' | 'rsa';
    encrypt?: boolean;
    hash?: 'md5' | 'sha1' | 'sha256' | 'sha512' | 'bcrypt' | 'argon2' | 'scrypt';
    mask?: string;
    format?: string;
    template?: string;
    formula?: string;
    expression?: string;
    script?: string;
    function?: string;
    query?: string;
    endpoint?: string;
    webhook?: string;
    api?: string;
    service?: string;
    provider?: string;
    source?: string;
    destination?: string;
    mapping?: Record<string, string>;
    transform?: (value: any) => any;
    map?: Record<string, any>;
    reduce?: (acc: any, curr: any) => any;
    filter?: (value: any) => boolean;
    sort?: (a: any, b: any) => number;
    group?: (value: any) => string;
    aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct' | 'first' | 'last' | 'median' | 'mode' | 'variance' | 'stdDev' | 'percentile' | 'quartile' | 'decile';
  };
  format?: {
    prefix?: string;
    suffix?: string;
    decimalPlaces?: number;
    thousandSeparator?: boolean;
    dateFormat?: string;
    timeFormat?: string;
    dateTimeFormat?: string;
    currency?: string;
    percent?: boolean;
    phoneFormat?: string;
    emailFormat?: string;
    urlFormat?: string;
    ipFormat?: string;
    macFormat?: string;
    uuidFormat?: string;
    cardFormat?: string;
    ibanFormat?: string;
    swiftFormat?: string;
    routingFormat?: string;
    accountFormat?: string;
    tinFormat?: string;
    ssnFormat?: string;
    einFormat?: string;
    vinFormat?: string;
    imeiFormat?: string;
    serialFormat?: string;
    skuFormat?: string;
    upcFormat?: string;
    eanFormat?: string;
    isbnFormat?: string;
    issnFormat?: string;
    doiFormat?: string;
    orcidFormat?: string;
    pubMedFormat?: string;
    arxivFormat?: string;
    cryptoFormat?: string;
    blockchainFormat?: string;
    nftFormat?: string;
    tokenFormat?: string;
    contractFormat?: string;
    walletFormat?: string;
    addressFormat?: string;
    transactionFormat?: string;
    hashFormat?: string;
    signatureFormat?: string;
    publicKeyFormat?: string;
    privateKeyFormat?: string;
    seedFormat?: string;
    mnemonicFormat?: string;
    derivationFormat?: string;
    pathFormat?: string;
    xpubFormat?: string;
    xprvFormat?: string;
    zpubFormat?: string;
    zprvFormat?: string;
  };
  style?: {
    width?: ColumnWidth;
    align?: 'left' | 'center' | 'right' | 'justify';
    bgColor?: string;
    textColor?: string;
    fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    fontWeight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
    fontFamily?: string;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
    lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
    whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap' | 'break-spaces';
    wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
    overflowWrap?: 'normal' | 'break-word' | 'anywhere';
    textOverflow?: 'clip' | 'ellipsis' | 'string';
    wrap?: boolean;
    truncate?: boolean;
    boxShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    borderWidth?: 'none' | 'thin' | 'medium' | 'thick';
    borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    borderColor?: string;
    hoverBgColor?: string;
    hoverTextColor?: string;
    hoverBorderColor?: string;
    focusBgColor?: string;
    focusTextColor?: string;
    focusBorderColor?: string;
    activeBgColor?: string;
    activeTextColor?: string;
    activeBorderColor?: string;
    disabledBgColor?: string;
    disabledTextColor?: string;
    disabledBorderColor?: string;
    selectedBgColor?: string;
    selectedTextColor?: string;
    selectedBorderColor?: string;
    evenBgColor?: string;
    oddBgColor?: string;
    firstBgColor?: string;
    lastBgColor?: string;
    striped?: boolean;
    zebra?: boolean;
    gradient?: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientVia?: string;
    gradientDirection?: 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l' | 'tl';
    backdropBlur?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    backdropBrightness?: number;
    backdropContrast?: number;
    backdropGrayscale?: boolean;
    backdropHueRotate?: number;
    backdropInvert?: boolean;
    backdropOpacity?: number;
    backdropSaturate?: number;
    backdropSepia?: boolean;
    mixBlend?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  };
  metadata?: {
    description?: string;
    placeholder?: string;
    helpText?: string;
    example?: any;
    category?: string;
    tags?: string[];
    pinned?: boolean;
    frozen?: boolean;
    group?: string;
    dependsOn?: string[];
    computed?: boolean;
    formula?: string;
    expression?: string;
    script?: string;
    function?: string;
    query?: string;
    endpoint?: string;
    webhook?: string;
    api?: string;
    service?: string;
    provider?: string;
    source?: string;
    destination?: string;
    mapping?: Record<string, string>;
    transform?: (value: any) => any;
    map?: Record<string, any>;
    reduce?: (acc: any, curr: any) => any;
    filter?: (value: any) => boolean;
    sort?: (a: any, b: any) => number;
    groupBy?: (value: any) => string;
    aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct' | 'first' | 'last' | 'median' | 'mode' | 'variance' | 'stdDev' | 'percentile' | 'quartile' | 'decile';
    version?: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    permissions?: {
      view?: string[];
      edit?: string[];
      delete?: string[];
      admin?: string[];
    };
    audit?: {
      enabled?: boolean;
      level?: 'none' | 'basic' | 'detailed' | 'verbose';
      retention?: number;
    };
    encryption?: {
      enabled?: boolean;
      algorithm?: string;
      key?: string;
      iv?: string;
    };
    compression?: {
      enabled?: boolean;
      algorithm?: 'gzip' | 'deflate' | 'brotli' | 'lz4' | 'zstd';
      level?: number;
    };
    cache?: {
      enabled?: boolean;
      ttl?: number;
      strategy?: 'lru' | 'lfu' | 'fifo' | 'random';
      size?: number;
    };
    indexing?: {
      enabled?: boolean;
      type?: 'btree' | 'hash' | 'gin' | 'gist' | 'spgist' | 'brin';
      unique?: boolean;
      sparse?: boolean;
      background?: boolean;
    };
    validation?: {
      enabled?: boolean;
      strict?: boolean;
      coerce?: boolean;
      stripUnknown?: boolean;
      abortEarly?: boolean;
      recursive?: boolean;
    };
    hooks?: {
      beforeCreate?: string;
      afterCreate?: string;
      beforeUpdate?: string;
      afterUpdate?: string;
      beforeDelete?: string;
      afterDelete?: string;
      beforeFind?: string;
      afterFind?: string;
      beforeSave?: string;
      afterSave?: string;
      beforeValidate?: string;
      afterValidate?: string;
    };
    triggers?: Array<{
      name: string;
      event: 'create' | 'update' | 'delete' | 'find' | 'save' | 'validate';
      condition?: string;
      action: string;
      timing?: 'before' | 'after' | 'instead';
      priority?: number;
    }>;
    workflows?: Array<{
      name: string;
      states: string[];
      transitions: Array<{
        from: string;
        to: string;
        condition?: string;
        action?: string;
      }>;
      initial: string;
      final?: string[];
    }>;
    automations?: Array<{
      name: string;
      trigger: 'schedule' | 'event' | 'condition' | 'manual';
      schedule?: string;
      event?: string;
      condition?: string;
      actions: string[];
      enabled: boolean;
    }>;
    notifications?: Array<{
      name: string;
      trigger: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'submit';
      channels: ('email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams' | 'discord' | 'telegram')[];
      recipients: string[];
      template: string;
      enabled: boolean;
    }>;
    webhooks?: Array<{
      name: string;
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      headers?: Record<string, string>;
      body?: any;
      trigger: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'submit' | 'schedule';
      schedule?: string;
      retries?: number;
      timeout?: number;
      enabled: boolean;
    }>;
    integrations?: Array<{
      name: string;
      type: 'api' | 'database' | 'messageQueue' | 'fileSystem' | 'cloud' | 'saas';
      provider: string;
      config: Record<string, any>;
      enabled: boolean;
    }>;
    extensions?: Array<{
      name: string;
      version: string;
      type: 'plugin' | 'module' | 'widget' | 'theme' | 'language' | 'tool';
      config: Record<string, any>;
      enabled: boolean;
    }>;
  };
}

interface DataRecord {
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
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
  settings?: Record<string, any>;
  preferences?: Record<string, any>;
  permissions?: Record<string, any>;
  audit?: Record<string, any>;
  encryption?: Record<string, any>;
  compression?: Record<string, any>;
  cache?: Record<string, any>;
  indexing?: Record<string, any>;
  validation?: Record<string, any>;
  hooks?: Record<string, any>;
  triggers?: Record<string, any>;
  workflows?: Record<string, any>;
  automations?: Record<string, any>;
  notifications?: Record<string, any>;
  webhooks?: Record<string, any>;
  integrations?: Record<string, any>;
  extensions?: Record<string, any>;
}

interface Column {
  field: Field;
  width: number;
  visible: boolean;
  frozen: boolean;
  index: number;
  group?: string;
  summary?: {
    type: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct' | 'first' | 'last' | 'median' | 'mode' | 'variance' | 'stdDev' | 'percentile' | 'quartile' | 'decile';
    value?: number;
    format?: string;
  };
  totals?: {
    type: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
    value?: number;
    format?: string;
  };
  format?: {
    type: 'number' | 'currency' | 'percent' | 'date' | 'time' | 'datetime' | 'duration';
    options?: Record<string, any>;
  };
  conditional?: Array<{
    condition: (value: any) => boolean;
    style: React.CSSProperties;
    class?: string;
  }>;
}

interface Filter {
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

interface Sort {
  fieldKey: string;
  direction: SortDirection;
  priority: number;
  type?: 'auto' | 'string' | 'number' | 'date' | 'boolean';
  locale?: string;
  numeric?: boolean;
  sensitivity?: 'base' | 'accent' | 'case' | 'variant';
  ignorePunctuation?: boolean;
}

interface Group {
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

interface Pivot {
  rows: string[];
  columns: string[];
  values: Array<{
    field: string;
    aggregate: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
    alias?: string;
  }>;
  filters?: Filter[];
  sorts?: Sort[];
  limit?: number;
  offset?: number;
}

interface Chart {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'bubble' | 'radar' | 'polar' | 'heatmap' | 'treemap' | 'sunburst' | 'sankey' | 'funnel' | 'gauge' | 'table' | 'card' | 'metric';
  data: any[];
  options: {
    title?: string;
    subtitle?: string;
    xAxis?: string;
    yAxis?: string;
    series?: Array<{
      name: string;
      field: string;
      type?: string;
      color?: string;
      stack?: boolean;
    }>;
    legend?: boolean;
    tooltip?: boolean;
    grid?: boolean;
    animation?: boolean;
    theme?: string;
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    padding?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    shadow?: boolean;
    interactive?: boolean;
    zoom?: boolean;
    pan?: boolean;
    brush?: boolean;
    crosshair?: boolean;
    labels?: boolean;
    values?: boolean;
    percentages?: boolean;
    stack?: boolean;
    horizontal?: boolean;
    normalize?: boolean;
    cumulative?: boolean;
    movingAverage?: number;
    trendline?: boolean;
    forecast?: boolean;
    confidence?: number;
    outliers?: boolean;
    clustering?: boolean;
    regression?: boolean;
    correlation?: boolean;
  };
}

interface Gantt {
  tasks: Array<{
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string[];
    color?: string;
    group?: string;
  }>;
  options: {
    viewMode: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate: string;
    endDate: string;
    showWeekends: boolean;
    showHolidays: boolean;
    showProgress: boolean;
    showDependencies: boolean;
    showCriticalPath: boolean;
    showMilestones: boolean;
    showBaseline: boolean;
    showActual: boolean;
    showPlanned: boolean;
    showRemaining: boolean;
    showCompleted: boolean;
    showLate: boolean;
    showOnTime: boolean;
    showEarly: boolean;
    showLateFinish: boolean;
    showEarlyFinish: boolean;
    showLateStart: boolean;
    showEarlyStart: boolean;
    showFreeFloat: boolean;
    showTotalFloat: boolean;
    showLag: boolean;
    showLead: boolean;
    showSlack: boolean;
    showBuffer: boolean;
    showContingency: boolean;
    showRisk: boolean;
    showIssue: boolean;
    showChange: boolean;
    showRequest: boolean;
    showApproval: boolean;
    showRejection: boolean;
    showReview: boolean;
    showFeedback: boolean;
    showComment: boolean;
    showAttachment: boolean;
    showLink: boolean;
    showReference: boolean;
  };
}

interface Calendar {
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    color?: string;
    location?: string;
    description?: string;
    attendees?: string[];
    organizer?: string;
    recurrence?: string;
    reminder?: string;
    attachments?: string[];
    tags?: string[];
  }>;
  options: {
    view: 'day' | 'week' | 'month' | 'agenda' | 'timeline';
    startDate: string;
    endDate: string;
    showWeekends: boolean;
    showHolidays: boolean;
    showToday: boolean;
    showPast: boolean;
    showFuture: boolean;
    showRecurring: boolean;
    showReminders: boolean;
    showAttachments: boolean;
    showLocation: boolean;
    showDescription: boolean;
    showAttendees: boolean;
    showOrganizer: boolean;
    showTags: boolean;
  };
}

interface Timeline {
  items: Array<{
    id: string;
    title: string;
    content: string;
    start: string;
    end?: string;
    group?: string;
    className?: string;
    style?: React.CSSProperties;
    editable?: boolean;
    selectable?: boolean;
    removable?: boolean;
    order?: number;
  }>;
  groups?: Array<{
    id: string;
    title: string;
    content: string;
    className?: string;
    style?: React.CSSProperties;
    nestedGroups?: string[];
    showNested?: boolean;
  }>;
  options: {
    orientation: 'top' | 'bottom' | 'both';
    stack: boolean;
    showCurrentTime: boolean;
    showMajorLabels: boolean;
    showMinorLabels: boolean;
    zoomable: boolean;
    moveable: boolean;
    selectable: boolean;
    multiselect: boolean;
    itemsAlwaysDraggable: boolean;
    editable: boolean;
    groupEditable: boolean;
    groupOrder?: string;
    groupOrderSwap?: boolean;
    groupBy?: string;
    groupBySub?: string;
    groupBySubOrder?: string;
    groupBySubSwap?: boolean;
    groupBySubNested?: boolean;
    groupBySubNestedOrder?: string;
    groupBySubNestedSwap?: boolean;
  };
}

interface Map {
  markers: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    color?: string;
    icon?: string;
    size?: number;
    draggable?: boolean;
    editable?: boolean;
    removable?: boolean;
  }>;
  polygons?: Array<{
    id: string;
    points: Array<{ lat: number; lng: number }>;
    color?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    draggable?: boolean;
    editable?: boolean;
    removable?: boolean;
  }>;
  polylines?: Array<{
    id: string;
    points: Array<{ lat: number; lng: number }>;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    draggable?: boolean;
    editable?: boolean;
    removable?: boolean;
  }>;
  circles?: Array<{
    id: string;
    center: { lat: number; lng: number };
    radius: number;
    color?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    draggable?: boolean;
    editable?: boolean;
    removable?: boolean;
  }>;
  rectangles?: Array<{
    id: string;
    bounds: { north: number; south: number; east: number; west: number };
    color?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    draggable?: boolean;
    editable?: boolean;
    removable?: boolean;
  }>;
  heatmap?: Array<{
    latitude: number;
    longitude: number;
    weight?: number;
  }>;
  options: {
    center: { lat: number; lng: number };
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
    mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    scaleControl?: boolean;
    streetViewControl?: boolean;
    rotateControl?: boolean;
    fullscreenControl?: boolean;
    gestureHandling?: 'auto' | 'cooperative' | 'greedy' | 'none';
    keyboardShortcuts?: boolean;
    scrollwheel?: boolean;
    draggable?: boolean;
    draggableCursor?: string;
    draggingCursor?: string;
    clickableIcons?: boolean;
    backgroundColor?: string;
    styles?: Array<{
      featureType?: string;
      elementType?: string;
      stylers: Array<Record<string, any>>;
    }>;
  };
}

// Add missing type definitions
interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: any;
}

interface Attachment {
  id: string;
  recordId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface Comment {
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

interface Version {
  version: number;
  data: Record<string, any>;
  updatedBy: string;
  updatedAt: string;
  changes: Array<{ field: string; oldValue: any; newValue: any }>;
}

interface HistoryState {
  records: DataRecord[];
  selections: string[];
  timestamp: number;
  description: string;
}

interface ClipboardData {
  rows: Record<string, any>[];
  columns: string[];
  mimeType: 'text/plain' | 'text/csv' | 'application/json';
  cut?: boolean;
}

interface ViewPreset {
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

interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
  global?: boolean;
}

// ==================== UTILITIES ====================

const formatValue = (value: any, field?: Field): string => {
  if (value === null || value === undefined) return '-';
  
  if (field?.format) {
    switch (field.type) {
      case 'currency':
        const num = Number(value);
        if (isNaN(num)) return '-';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: field.format.currency || 'PKR',
          minimumFractionDigits: field.format.decimalPlaces || 0,
          maximumFractionDigits: field.format.decimalPlaces || 0
        }).format(num);
        
      case 'percent':
        const pct = Number(value);
        if (isNaN(pct)) return '-';
        return `${(pct * 100).toFixed(field.format.decimalPlaces || 0)}%`;
        
      case 'date':
        try {
          return format(parseISO(value), field.format.dateFormat || 'PPP');
        } catch {
          return value;
        }
        
      case 'datetime':
        try {
          return format(parseISO(value), field.format.dateTimeFormat || 'PPP p');
        } catch {
          return value;
        }
        
      case 'time':
        try {
          return format(parseISO(value), field.format.timeFormat || 'p');
        } catch {
          return value;
        }
        
      case 'duration':
        const ms = Number(value);
        if (isNaN(ms)) return '-';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
        
      case 'phone':
        const phone = String(value).replace(/\D/g, '');
        if (phone.length === 10) {
          return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
        }
        if (phone.length === 11) {
          return `${phone[0]} (${phone.slice(1,4)}) ${phone.slice(4,7)}-${phone.slice(7)}`;
        }
        return value;
        
      case 'email':
        return String(value).toLowerCase();
        
      case 'url':
        const url = String(value);
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        return `https://${url}`;
        
      case 'ip':
        const ip = String(value);
        if (ip.includes(':')) {
          // IPv6
          return ip.toLowerCase();
        }
        // IPv4
        return ip;
        
      case 'mac':
        const mac = String(value).replace(/[^a-fA-F0-9]/g, '').toLowerCase();
        if (mac.length === 12) {
          return mac.match(/.{2}/g)?.join(':') || value;
        }
        return value;
        
      case 'uuid':
        const uuid = String(value).replace(/[^a-fA-F0-9]/g, '').toLowerCase();
        if (uuid.length === 32) {
          return `${uuid.slice(0,8)}-${uuid.slice(8,12)}-${uuid.slice(12,16)}-${uuid.slice(16,20)}-${uuid.slice(20)}`;
        }
        return value;
        
      case 'cardNumber':
        const card = String(value).replace(/\D/g, '');
        if (card.length === 16) {
          return `${card.slice(0,4)} ${card.slice(4,8)} ${card.slice(8,12)} ${card.slice(12)}`;
        }
        return value;
        
      case 'iban':
        const iban = String(value).replace(/\s/g, '').toUpperCase();
        if (iban.length >= 15 && iban.length <= 34) {
          return iban.match(/.{1,4}/g)?.join(' ') || value;
        }
        return value;
        
      case 'swift':
        const swift = String(value).replace(/\s/g, '').toUpperCase();
        if (swift.length === 8 || swift.length === 11) {
          return swift;
        }
        return value;
        
      case 'routing':
        const routing = String(value).replace(/\D/g, '');
        if (routing.length === 9) {
          return routing;
        }
        return value;
        
      case 'accountNumber':
        const account = String(value).replace(/\D/g, '');
        if (account.length >= 4 && account.length <= 17) {
          return account;
        }
        return value;
        
      case 'tin':
      case 'ssn':
      case 'ein':
        const tax = String(value).replace(/\D/g, '');
        if (field.type === 'ssn' && tax.length === 9) {
          return `${tax.slice(0,3)}-${tax.slice(3,5)}-${tax.slice(5)}`;
        }
        if (field.type === 'ein' && tax.length === 9) {
          return `${tax.slice(0,2)}-${tax.slice(2)}`;
        }
        return tax;
        
      case 'vin':
        const vin = String(value).toUpperCase();
        if (vin.length === 17) {
          return vin;
        }
        return value;
        
      case 'imei':
        const imei = String(value).replace(/\D/g, '');
        if (imei.length === 15) {
          return imei;
        }
        return value;
        
      case 'serial':
        const serial = String(value).toUpperCase();
        return serial;
        
      case 'sku':
        const sku = String(value).toUpperCase();
        return sku;
        
      case 'upc':
        const upc = String(value).replace(/\D/g, '');
        if (upc.length === 12) {
          return upc;
        }
        return value;
        
      case 'ean':
        const ean = String(value).replace(/\D/g, '');
        if (ean.length === 13) {
          return ean;
        }
        return value;
        
      case 'isbn':
        const isbn = String(value).replace(/[^0-9X]/g, '').toUpperCase();
        if (isbn.length === 10 || isbn.length === 13) {
          return isbn;
        }
        return value;
        
      case 'issn':
        const issn = String(value).replace(/[^0-9X]/g, '').toUpperCase();
        if (issn.length === 8) {
          return `${issn.slice(0,4)}-${issn.slice(4)}`;
        }
        return value;
        
      case 'doi':
        const doi = String(value).toLowerCase();
        if (doi.startsWith('10.')) {
          return doi;
        }
        return value;
        
      case 'orcid':
        const orcid = String(value).replace(/[^0-9X]/g, '').toUpperCase();
        if (orcid.length === 16) {
          return `${orcid.slice(0,4)}-${orcid.slice(4,8)}-${orcid.slice(8,12)}-${orcid.slice(12)}`;
        }
        return value;
        
      case 'pubMed':
        const pubmed = String(value).replace(/\D/g, '');
        if (pubmed.length > 0) {
          return pubmed;
        }
        return value;
        
      case 'arxiv':
        const arxiv = String(value).toLowerCase();
        if (arxiv.match(/^\d{4}\.\d{4,5}$/)) {
          return arxiv;
        }
        return value;
        
      case 'crypto':
      case 'blockchain':
      case 'nft':
      case 'token':
      case 'contract':
      case 'wallet':
      case 'address':
      case 'transaction':
      case 'hash':
      case 'signature':
      case 'publicKey':
      case 'privateKey':
      case 'seed':
      case 'mnemonic':
      case 'derivation':
      case 'path':
      case 'xpub':
      case 'xprv':
      case 'zpub':
      case 'zprv':
        return String(value);
        
      default:
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return String(value);
    }
  }
  
  if (field?.type === 'boolean') {
    return value ? '✓' : '✗';
  }
  
  if (field?.type === 'rating') {
    const num = Number(value);
    if (isNaN(num)) return '-';
    return '★'.repeat(Math.min(5, Math.max(0, Math.round(num))));
  }
  
  if (field?.type === 'progress') {
    const num = Number(value);
    if (isNaN(num)) return '-';
    return `${Math.min(100, Math.max(0, num))}%`;
  }
  
  if (field?.type === 'badge') {
    return String(value);
  }
  
  if (field?.type === 'link') {
    return String(value);
  }
  
  if (field?.type === 'email') {
    return String(value).toLowerCase();
  }
  
  if (field?.type === 'phone') {
    const phone = String(value).replace(/\D/g, '');
    if (phone.length === 10) {
      return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
    }
    return value;
  }
  
  if (field?.type === 'json') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  
  if (field?.type === 'array') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  
  if (field?.type === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
};

const parseValue = (value: string, field: Field): any => {
  if (!value || value.trim() === '') return null;
  
  switch (field.type) {
    case 'number':
    case 'currency':
    case 'percent':
    case 'progress':
      return Number(value.replace(/[^0-9.-]/g, ''));
      
    case 'date':
      return parseISO(value);
      
    case 'datetime':
      return parseISO(value);
      
    case 'time':
      return parseISO(`1970-01-01T${value}`);
      
    case 'duration':
      const parts = value.match(/(\d+)\s*([dhms])/g);
      if (!parts) return Number(value);
      let ms = 0;
      parts.forEach(part => {
        const [, num, unit] = part.match(/(\d+)\s*([dhms])/) || [];
        if (unit === 'd') ms += Number(num) * 86400000;
        if (unit === 'h') ms += Number(num) * 3600000;
        if (unit === 'm') ms += Number(num) * 60000;
        if (unit === 's') ms += Number(num) * 1000;
      });
      return ms;
      
    case 'boolean':
      return value.toLowerCase() === 'true' || value === '1' || value === '✓' || value === 'yes';
      
    case 'rating':
      return Math.min(5, Math.max(0, value.split('★').length - 1));
      
    case 'phone':
      return value.replace(/\D/g, '');
      
    case 'email':
      return value.toLowerCase();
      
    case 'url':
      return value.toLowerCase();
      
    case 'ip':
      return value.toLowerCase();
      
    case 'mac':
      return value.toLowerCase().replace(/[^a-f0-9]/g, '');
      
    case 'uuid':
      return value.toLowerCase().replace(/[^a-f0-9]/g, '');
      
    case 'cardNumber':
      return value.replace(/\D/g, '');
      
    case 'iban':
      return value.replace(/\s/g, '').toUpperCase();
      
    case 'swift':
      return value.replace(/\s/g, '').toUpperCase();
      
    case 'routing':
      return value.replace(/\D/g, '');
      
    case 'accountNumber':
      return value.replace(/\D/g, '');
      
    case 'tin':
    case 'ssn':
    case 'ein':
      return value.replace(/\D/g, '');
      
    case 'vin':
      return value.toUpperCase();
      
    case 'imei':
      return value.replace(/\D/g, '');
      
    case 'serial':
      return value.toUpperCase();
      
    case 'sku':
      return value.toUpperCase();
      
    case 'upc':
      return value.replace(/\D/g, '');
      
    case 'ean':
      return value.replace(/\D/g, '');
      
    case 'isbn':
      return value.replace(/[^0-9X]/g, '').toUpperCase();
      
    case 'issn':
      return value.replace(/[^0-9X]/g, '').toUpperCase();
      
    case 'doi':
      return value.toLowerCase();
      
    case 'orcid':
      return value.replace(/[^0-9X]/g, '').toUpperCase();
      
    case 'pubMed':
      return value.replace(/\D/g, '');
      
    case 'arxiv':
      return value.toLowerCase();
      
    case 'json':
    case 'array':
    case 'object':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
      
    default:
      return value;
  }
};

const validateValue = (value: any, field: Field, allValues: Record<string, any> = {}): { valid: boolean; error?: string; warning?: string } => {
  if (field.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.label} is required` };
  }
  
  if (!field.required && (value === null || value === undefined || value === '')) {
    return { valid: true };
  }
  
  if (field.validation) {
    // Numeric validation
    if (field.type === 'number' || field.type === 'currency' || field.type === 'percent' || field.type === 'progress') {
      const num = Number(value);
      if (isNaN(num)) {
        return { valid: false, error: `${field.label} must be a number` };
      }
      
      if (field.validation.min !== undefined && num < field.validation.min) {
        return { valid: false, error: `${field.label} must be at least ${field.validation.min}` };
      }
      
      if (field.validation.max !== undefined && num > field.validation.max) {
        return { valid: false, error: `${field.label} must be at most ${field.validation.max}` };
      }
      
      if (field.validation.step !== undefined && num % field.validation.step !== 0) {
        return { valid: false, error: `${field.label} must be a multiple of ${field.validation.step}` };
      }
      
      if (field.validation.multipleOf !== undefined && num % field.validation.multipleOf !== 0) {
        return { valid: false, error: `${field.label} must be a multiple of ${field.validation.multipleOf}` };
      }
    }
    
    // String validation
    if (field.type === 'text' || field.type === 'textarea' || field.type === 'richText' || field.type === 'markdown' || field.type === 'html' || field.type === 'code') {
      const str = String(value);
      
      if (field.validation.minLength !== undefined && str.length < field.validation.minLength) {
        return { valid: false, error: `${field.label} must be at least ${field.validation.minLength} characters` };
      }
      
      if (field.validation.maxLength !== undefined && str.length > field.validation.maxLength) {
        return { valid: false, error: `${field.label} must be at most ${field.validation.maxLength} characters` };
      }
      
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(str)) {
          return { valid: false, error: `${field.label} has invalid format` };
        }
      }
      
      if (field.validation.regex) {
        const regex = new RegExp(field.validation.regex);
        if (!regex.test(str)) {
          return { valid: false, error: `${field.label} has invalid format` };
        }
      }
      
      if (field.validation.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
        return { valid: false, error: `${field.label} must be a valid email` };
      }
      
      if (field.validation.url) {
        try {
          new URL(str);
        } catch {
          return { valid: false, error: `${field.label} must be a valid URL` };
        }
      }
      
      if (field.validation.phone) {
        const phone = str.replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 15) {
          return { valid: false, error: `${field.label} must be a valid phone number` };
        }
      }
      
      if (field.validation.ip) {
        const ip = str.toLowerCase();
        const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6 = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/;
        if (!ipv4.test(ip) && !ipv6.test(ip)) {
          return { valid: false, error: `${field.label} must be a valid IP address` };
        }
      }
      
      if (field.validation.mac) {
        const mac = str.replace(/[^a-f0-9]/g, '').toLowerCase();
        if (mac.length !== 12) {
          return { valid: false, error: `${field.label} must be a valid MAC address` };
        }
      }
      
      if (field.validation.uuid) {
        const uuid = str.replace(/[^a-f0-9]/g, '').toLowerCase();
        if (uuid.length !== 32) {
          return { valid: false, error: `${field.label} must be a valid UUID` };
        }
      }
      
      if (field.validation.creditCard) {
        const card = str.replace(/\D/g, '');
        if (!/^\d{13,19}$/.test(card)) {
          return { valid: false, error: `${field.label} must be a valid credit card number` };
        }
        
        // Luhn algorithm
        let sum = 0;
        let alternate = false;
        for (let i = card.length - 1; i >= 0; i--) {
          let n = parseInt(card[i]);
          if (alternate) {
            n *= 2;
            if (n > 9) n -= 9;
          }
          sum += n;
          alternate = !alternate;
        }
        if (sum % 10 !== 0) {
          return { valid: false, error: `${field.label} must be a valid credit card number` };
        }
      }
      
      if (field.validation.ssn) {
        const ssn = str.replace(/\D/g, '');
        if (ssn.length !== 9) {
          return { valid: false, error: `${field.label} must be a valid SSN` };
        }
      }
      
      if (field.validation.ein) {
        const ein = str.replace(/\D/g, '');
        if (ein.length !== 9) {
          return { valid: false, error: `${field.label} must be a valid EIN` };
        }
      }
      
      if (field.validation.vin) {
        const vin = str.toUpperCase();
        if (vin.length !== 17) {
          return { valid: false, error: `${field.label} must be a valid VIN` };
        }
        
        // Check digits
        const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
        const map: Record<string, number> = {
          'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
          'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9, 'S': 2,
          'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
          '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
        };
        
        let sum = 0;
        for (let i = 0; i < 17; i++) {
          sum += map[vin[i]] * weights[i];
        }
        const check = sum % 11;
        const checkDigit = check === 10 ? 'X' : check.toString();
        
        if (vin[8] !== checkDigit) {
          return { valid: false, error: `${field.label} has invalid check digit` };
        }
      }
      
      if (field.validation.imei) {
        const imei = str.replace(/\D/g, '');
        if (imei.length !== 15) {
          return { valid: false, error: `${field.label} must be a valid IMEI` };
        }
        
        // Luhn algorithm
        let sum = 0;
        for (let i = 0; i < 14; i++) {
          let n = parseInt(imei[i]);
          if (i % 2 === 1) {
            n *= 2;
            if (n > 9) n -= 9;
          }
          sum += n;
        }
        const check = (10 - (sum % 10)) % 10;
        if (parseInt(imei[14]) !== check) {
          return { valid: false, error: `${field.label} has invalid check digit` };
        }
      }
      
      if (field.validation.upc) {
        const upc = str.replace(/\D/g, '');
        if (upc.length !== 12) {
          return { valid: false, error: `${field.label} must be a valid UPC` };
        }
        
        // Check digit
        let sum = 0;
        for (let i = 0; i < 11; i++) {
          const n = parseInt(upc[i]);
          sum += i % 2 === 0 ? n * 3 : n;
        }
        const check = (10 - (sum % 10)) % 10;
        if (parseInt(upc[11]) !== check) {
          return { valid: false, error: `${field.label} has invalid check digit` };
        }
      }
      
      if (field.validation.ean) {
        const ean = str.replace(/\D/g, '');
        if (ean.length !== 13) {
          return { valid: false, error: `${field.label} must be a valid EAN` };
        }
        
        // Check digit
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          const n = parseInt(ean[i]);
          sum += i % 2 === 0 ? n : n * 3;
        }
        const check = (10 - (sum % 10)) % 10;
        if (parseInt(ean[12]) !== check) {
          return { valid: false, error: `${field.label} has invalid check digit` };
        }
      }
      
      if (field.validation.isbn) {
        const isbn = str.replace(/[^0-9X]/g, '').toUpperCase();
        if (isbn.length === 10) {
          // ISBN-10
          let sum = 0;
          for (let i = 0; i < 9; i++) {
            sum += parseInt(isbn[i]) * (10 - i);
          }
          const check = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
          sum += check;
          if (sum % 11 !== 0) {
            return { valid: false, error: `${field.label} has invalid check digit` };
          }
        } else if (isbn.length === 13) {
          // ISBN-13
          let sum = 0;
          for (let i = 0; i < 12; i++) {
            const n = parseInt(isbn[i]);
            sum += i % 2 === 0 ? n : n * 3;
          }
          const check = (10 - (sum % 10)) % 10;
          if (parseInt(isbn[12]) !== check) {
            return { valid: false, error: `${field.label} has invalid check digit` };
          }
        } else {
          return { valid: false, error: `${field.label} must be a valid ISBN` };
        }
      }
      
      if (field.validation.issn) {
        const issn = str.replace(/[^0-9X]/g, '').toUpperCase();
        if (issn.length !== 8) {
          return { valid: false, error: `${field.label} must be a valid ISSN` };
        }
        
        let sum = 0;
        for (let i = 0; i < 7; i++) {
          sum += parseInt(issn[i]) * (8 - i);
        }
        const check = issn[7] === 'X' ? 10 : parseInt(issn[7]);
        sum += check;
        if (sum % 11 !== 0) {
          return { valid: false, error: `${field.label} has invalid check digit` };
        }
      }
      
      if (field.validation.doi) {
        const doi = str.toLowerCase();
        if (!doi.startsWith('10.')) {
          return { valid: false, error: `${field.label} must start with 10.` };
        }
      }
      
      if (field.validation.orcid) {
        const orcid = str.replace(/[^0-9X]/g, '').toUpperCase();
        if (orcid.length !== 16) {
          return { valid: false, error: `${field.label} must be a valid ORCID` };
        }
        
        let sum = 0;
        for (let i = 0; i < 15; i++) {
          sum = (sum + parseInt(orcid[i])) * 2;
        }
        const check = (12 - (sum % 11)) % 11;
        const checkDigit = check === 10 ? 'X' : check.toString();
        if (orcid[15] !== checkDigit) {
          return { valid: false, error: `${field.label} has invalid check digit` };
        }
      }
      
      if (field.validation.pubMed) {
        const pubmed = str.replace(/\D/g, '');
        if (pubmed.length === 0) {
          return { valid: false, error: `${field.label} must be a valid PubMed ID` };
        }
      }
      
      if (field.validation.arxiv) {
        const arxiv = str.toLowerCase();
        if (!arxiv.match(/^\d{4}\.\d{4,5}$/)) {
          return { valid: false, error: `${field.label} must be a valid arXiv ID` };
        }
      }
    }
    
    // Date validation
    if (field.type === 'date' || field.type === 'datetime' || field.type === 'time') {
      try {
        const date = parseISO(value);
        if (isNaN(date.getTime())) {
          return { valid: false, error: `${field.label} must be a valid date` };
        }
        
        if (field.validation.minDate) {
          const min = parseISO(field.validation.minDate);
          if (date < min) {
            return { valid: false, error: `${field.label} must be after ${format(min, 'PPP')}` };
          }
        }
        
        if (field.validation.maxDate) {
          const max = parseISO(field.validation.maxDate);
          if (date > max) {
            return { valid: false, error: `${field.label} must be before ${format(max, 'PPP')}` };
          }
        }
      } catch {
        return { valid: false, error: `${field.label} must be a valid date` };
      }
    }
    
    // Array validation
    if (field.type === 'array' || field.type === 'multiselect') {
      if (!Array.isArray(value)) {
        return { valid: false, error: `${field.label} must be an array` };
      }
      
      if (field.validation.minFiles !== undefined && value.length < field.validation.minFiles) {
        return { valid: false, error: `${field.label} must have at least ${field.validation.minFiles} items` };
      }
      
      if (field.validation.maxFiles !== undefined && value.length > field.validation.maxFiles) {
        return { valid: false, error: `${field.label} must have at most ${field.validation.maxFiles} items` };
      }
    }
    
    // File validation
    if (field.type === 'file' || field.type === 'image') {
      if (field.validation.allowedFileTypes && !field.validation.allowedFileTypes.includes(value.type)) {
        return { valid: false, error: `${field.label} must be of type ${field.validation.allowedFileTypes.join(', ')}` };
      }
      
      if (field.validation.maxFileSize && value.size > field.validation.maxFileSize) {
        return { valid: false, error: `${field.label} must be less than ${field.validation.maxFileSize / 1024 / 1024}MB` };
      }
      
      if (field.validation.dimensions && field.type === 'image') {
        // Image dimensions would be checked after loading
      }
    }
    
    // Custom validation
    if (field.validation.custom) {
      try {
        const result = field.validation.custom(value);
        if (!result) {
          return { valid: false, error: field.validation.customMessage || `${field.label} is invalid` };
        }
      } catch (error) {
        return { valid: false, error: `${field.label} validation failed` };
      }
    }
  }
  
  return { valid: true };
};

const getDefaultValue = (field: Field): any => {
  if (field.defaultValue !== undefined) return field.defaultValue;
  
  switch (field.type) {
    case 'number':
    case 'currency':
    case 'percent':
    case 'progress':
      return 0;
    case 'boolean':
      return false;
    case 'date':
      return new Date().toISOString().split('T')[0];
    case 'datetime':
      return new Date().toISOString();
    case 'time':
      return '00:00';
    case 'rating':
      return 0;
    case 'array':
    case 'multiselect':
      return [];
    case 'object':
      return {};
    default:
      return '';
  }
};

// ==================== MAIN COMPONENT ====================

interface ExcelTableMasterProps {
  module: ModuleType;
  entity: string;
  fields: Field[];
  initialRecords: DataRecord[];
  totalCount: number;
  onCreate: (data: Record<string, any>) => Promise<string>;
  onUpdate: (recordId: string, data: Record<string, any>, version: number) => Promise<void>;
  onDelete: (recordId: string) => Promise<void>;
  onBulkUpdate?: (recordIds: string[], data: Partial<Record<string, any>>) => Promise<void>;
  onBulkDelete?: (recordIds: string[]) => Promise<void>;
  onClone?: (recordId: string) => Promise<string>;
  onExport?: (format: 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html' | 'markdown' | 'yaml' | 'toml' | 'sql' | 'graphql') => Promise<Blob>;
  onImport?: (file: File) => Promise<{ success: number; failed: number; errors: any[] }>;
  onLoadMore?: () => Promise<DataRecord[]>;
  hasMore?: boolean;
  enableRealtime?: boolean;
  enableUndo?: boolean;
  enableRedo?: boolean;
  enableComments?: boolean;
  enableAttachments?: boolean;
  enableVersionHistory?: boolean;
  enableAuditLog?: boolean;
  enableStarred?: boolean;
  enableArchived?: boolean;
  enableTags?: boolean;
  enableGrouping?: boolean;
  enablePivot?: boolean;
  enableCharts?: boolean;
  enableKanban?: boolean;
  enableCalendar?: boolean;
  enableGantt?: boolean;
  enableTimeline?: boolean;
  enableMap?: boolean;
  enableGallery?: boolean;
  enableAI?: boolean;
  enablePredictions?: boolean;
  enableWorkflow?: boolean;
  enableAutomation?: boolean;
  enableNotifications?: boolean;
  enableWebhooks?: boolean;
  enableAPI?: boolean;
  enableSDK?: boolean;
  enablePlugins?: boolean;
  enableThemes?: boolean;
  enableShortcuts?: boolean;
  enableTutorials?: boolean;
  enableHelp?: boolean;
  enableSupport?: boolean;
  enableFeedback?: boolean;
  enableAnalytics?: boolean;
  enableReports?: boolean;
  enableDashboards?: boolean;
  enableWidgets?: boolean;
  enableExtensions?: boolean;
  enableMarketplace?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ExcelTableMaster: React.FC<ExcelTableMasterProps> = ({
  module,
  entity,
  fields,
  initialRecords,
  totalCount,
  onCreate,
  onUpdate,
  onDelete,
  onBulkUpdate,
  onBulkDelete,
  onClone,
  onExport,
  onImport,
  onLoadMore,
  hasMore = false,
  enableRealtime = true,
  enableUndo = true,
  enableRedo = true,
  enableComments = true,
  enableAttachments = true,
  enableVersionHistory = true,
  enableAuditLog = true,
  enableStarred = true,
  enableArchived = true,
  enableTags = true,
  enableGrouping = true,
  enablePivot = true,
  enableCharts = true,
  enableKanban = true,
  enableCalendar = true,
  enableGantt = true,
  enableTimeline = true,
  enableMap = true,
  enableGallery = true,
  enableAI = true,
  enablePredictions = true,
  enableWorkflow = true,
  enableAutomation = true,
  enableNotifications = true,
  enableWebhooks = true,
  enableAPI = true,
  enableSDK = true,
  enablePlugins = true,
  enableThemes = true,
  enableShortcuts = true,
  enableTutorials = true,
  enableHelp = true,
  enableSupport = true,
  enableFeedback = true,
  enableAnalytics = true,
  enableReports = true,
  enableDashboards = true,
  enableWidgets = true,
  enableExtensions = true,
  enableMarketplace = true,
  className = '',
  style
}) => {
  // ==================== STATE ====================
  
  // Records state
  const [records, setRecords] = useState<DataRecord[]>(initialRecords);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editedRows, setEditedRows] = useState(new Map<string, any>());
  const [rowErrors, setRowErrors] = useState(new Map<string, any>());
  const [rowWarnings, setRowWarnings] = useState(new Map<string, any>());
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('excel');
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [columnWidth, setColumnWidth] = useState<ColumnWidth>('normal');
  const [rowHeight, setRowHeight] = useState<RowHeight>('normal');
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [statusbarOpen, setStatusbarOpen] = useState(true);
  const [minimapOpen, setMinimapOpen] = useState(false);
  
  // Column state
  const [columns, setColumns] = useState<Column[]>(() => {
    return fields
      .filter(f => f.isEnabled && f.visible)
      .sort((a, b) => a.order - b.order)
      .map((field, index) => ({
        field,
        width: field.style?.width === 'compact' ? 120 : field.style?.width === 'wide' ? 300 : 200,
        visible: true,
        frozen: false,
        index,
        group: field.metadata?.group
      }));
  });
  
  // Filter/Sort/Group state
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  
  // Selection state
  const [activeCell, setActiveCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState<{ row: number; col: number } | null>(null);
  
  // Clipboard state
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  
  // History state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  
  // View presets
  const [viewPresets, setViewPresets] = useState<ViewPreset[]>([
    {
      id: 'default',
      name: 'Default View',
      description: 'Default view with all columns',
      filters: [],
      sorts: [],
      groups: [],
      hiddenColumns: [],
      frozenColumns: [],
      columnWidths: {},
      isDefault: true,
      isSystem: true
    }
  ]);
  const [activePreset, setActivePreset] = useState<string>('default');
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  
  // Activity state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentRecord, setCommentRecord] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentRecord, setAttachmentRecord] = useState<string | null>(null);
  const [attachmentField, setAttachmentField] = useState<string | null>(null);
  
  // Versions state
  const [versions, setVersions] = useState(new Map<string, any>());
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionRecord, setVersionRecord] = useState<string | null>(null);
  
  // Bulk edit state
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkEditField, setBulkEditField] = useState<string | null>(null);
  const [bulkEditValue, setBulkEditValue] = useState<any>(null);
  const [bulkEditOperator, setBulkEditOperator] = useState<'set' | 'add' | 'subtract' | 'multiply' | 'divide' | 'append' | 'prepend' | 'replace' | 'clear' | 'toggle' | 'increment' | 'decrement' | 'merge' | 'diff' | 'intersect' | 'union'>('set');
  
  // Import/Export state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html' | 'markdown' | 'yaml' | 'toml' | 'sql' | 'graphql'>('excel');
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    includeFilters: true,
    includeSorts: true,
    includeGroups: true,
    includeFormulas: true,
    includeComments: true,
    includeAttachments: true,
    includeHistory: false,
    includeMetadata: false,
    includeDeleted: false,
    includeArchived: false,
    includeStarred: false,
    includeTags: false,
    includeCustomFields: true,
    includeSystemFields: false,
    includeTimestamps: true,
    includeAudit: false,
    includePermissions: false,
    includeEncryption: false,
    includeCompression: false,
    includeValidation: false,
    includeHooks: false,
    includeTriggers: false,
    includeWorkflows: false,
    includeAutomations: false,
    includeNotifications: false,
    includeWebhooks: false,
    includeIntegrations: false,
    includeExtensions: false
  });
  
  // Find/Replace state
  const [findReplaceModalOpen, setFindReplaceModalOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findOptions, setFindOptions] = useState({
    matchCase: false,
    matchWholeCell: false,
    matchWord: false,
    searchInFormulas: false,
    searchInComments: false,
    searchInAttachments: false,
    useRegex: false,
    scope: 'sheet' as 'sheet' | 'selection' | 'column' | 'row' | 'cell',
    direction: 'next' as 'next' | 'prev' | 'all',
    preserveCase: false,
    matchDiacritics: false,
    matchKashida: false,
    matchHebrew: false,
    matchArabic: false,
    matchDevanagari: false,
    matchCyrillic: false,
    matchGreek: false,
    matchLatin: false,
    matchEmoji: false,
    matchSymbols: false,
    matchNumbers: false,
    matchLetters: false,
    matchWhitespace: false,
    matchLineBreaks: false,
    matchTabs: false,
    matchNonBreaking: false,
    matchZeroWidth: false,
    matchControl: false,
    matchFormat: false,
    matchVariation: false,
    matchIdeographic: false,
    matchHangul: false,
    matchKatakana: false,
    matchHiragana: false,
    matchBopomofo: false,
    matchHan: false,
    matchYi: false,
    matchLisu: false,
    matchMiao: false,
    matchTangut: false,
    matchNushu: false,
    matchKhitan: false,
    matchJurchen: false,
    matchChakma: false,
    matchSharada: false,
    matchTakri: false,
    matchModi: false,
    matchKhojki: false,
    matchKhudawadi: false,
    matchMahajani: false,
    matchMultani: false,
    matchSoraSompeng: false,
    matchWarangCiti: false,
    matchPauCinHau: false,
    matchBh: false,
    matchSylotiNagri: false,
    matchGurmukhi: false,
    matchGujarati: false,
    matchOriya: false,
    matchTamil: false,
    matchTelugu: false,
    matchKannada: false,
    matchMalayalam: false,
    matchSinhala: false,
    matchThai: false,
    matchLao: false,
    matchTibetan: false,
    matchMyanmar: false,
    matchGeorgian: false,
    matchEthiopic: false,
    matchCherokee: false,
    matchCanadianAboriginal: false,
    matchOgham: false,
    matchRunic: false,
    matchTagalog: false,
    matchHanunoo: false,
    matchBuhid: false,
    matchTagbanwa: false,
    matchKhmer: false,
    matchMongolian: false,
    matchLimbu: false,
    matchTaiLe: false,
    matchNewTaiLue: false,
    matchBuginese: false,
    matchBalinese: false,
    matchSundanese: false,
    matchBatak: false,
    matchLepcha: false,
    matchOlChiki: false,
    matchVai: false,
    matchSaurashtra: false,
    matchKayahLi: false,
    matchRejang: false,
    matchJavanese: false,
    matchCham: false,
    matchTaiViet: false,
    matchMeeteiMayek: false
  });
  
  // Chart state
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'histogram' | 'boxplot' | 'heatmap' | 'treemap' | 'sunburst'>('bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartColumns, setChartColumns] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState({
    title: '',
    xAxis: '',
    yAxis: '',
    groupBy: '',
    aggregate: 'sum' as 'sum' | 'avg' | 'count' | 'min' | 'max',
    colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
    legend: true,
    grid: true,
    labels: false,
    values: false,
    stacked: false,
    horizontal: false,
    animate: true,
    theme: 'light'
  });
  
  // AI state
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [aiLoading, setAILoading] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [aiInsights, setAIInsights] = useState<any[]>([]);
  const [aiPredictions, setAIPredictions] = useState<any[]>([]);
  const [aiAnomalies, setAIAnomalies] = useState<any[]>([]);
  const [aiClusters, setAIClusters] = useState<any[]>([]);
  const [aiForecasts, setAIForecasts] = useState<any[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  
  // Workflow state
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowStates, setWorkflowStates] = useState<any[]>([]);
  const [workflowTransitions, setWorkflowTransitions] = useState<any[]>([]);
  
  // Automation state
  const [automationModalOpen, setAutomationModalOpen] = useState(false);
  const [automations, setAutomations] = useState<any[]>([]);
  const [activeAutomation, setActiveAutomation] = useState<string | null>(null);
  const [automationLogs, setAutomationLogs] = useState<any[]>([]);
  
  // Webhook state
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  
  // Plugin state
  const [pluginModalOpen, setPluginModalOpen] = useState(false);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [activePlugins, setActivePlugins] = useState<string[]>([]);
  
  // Extension state
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [activeExtensions, setActiveExtensions] = useState<string[]>([]);
  
  // Marketplace state
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [marketplaceCategories, setMarketplaceCategories] = useState<string[]>([]);
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  
  // Tutorial state
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [tutorialSkipped, setTutorialSkipped] = useState(false);
  
  // Help state
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpSearch, setHelpSearch] = useState('');
  const [helpTopics, setHelpTopics] = useState<any[]>([]);
  const [helpArticle, setHelpArticle] = useState<any>(null);
  
  // Feedback state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'improvement' | 'other'>('feature');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Support state
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportPriority, setSupportPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [supportCategory, setSupportCategory] = useState<'technical' | 'billing' | 'account' | 'other'>('technical');
  const [supportAttachments, setSupportAttachments] = useState<File[]>([]);
  
  // Analytics state
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [analyticsStartDate, setAnalyticsStartDate] = useState<string>('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState<string>('');
  const [analyticsMetrics, setAnalyticsMetrics] = useState<string[]>(['count', 'sum', 'avg', 'min', 'max']);
  const [analyticsDimensions, setAnalyticsDimensions] = useState<string[]>([]);
  const [analyticsFilters, setAnalyticsFilters] = useState<Filter[]>([]);
  
  // Report state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<any>(null);
  const [reportScheduled, setReportScheduled] = useState(false);
  const [reportSchedule, setReportSchedule] = useState({
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: [] as string[],
    format: 'pdf' as 'pdf' | 'excel' | 'csv' | 'json',
    includeCharts: true,
    includeData: true,
    includeSummary: true,
    includeMetadata: false
  });
  
  // Dashboard state
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [dashboardWidgets, setDashboardWidgets] = useState<any[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<any[]>([]);
  const [dashboardFilters, setDashboardFilters] = useState<Filter[]>([]);
  const [dashboardRefresh, setDashboardRefresh] = useState(0);
  
  // Widget state
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<any>(null);
  
  // Settings state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    // General
    autoSave: true,
    autoSaveDelay: 1000,
    confirmDelete: true,
    confirmBulkActions: true,
    
    // Display
    showRowNumbers: true,
    showColumnHeaders: true,
    showFilters: true,
    showSorts: true,
    showGroups: true,
    showTotals: true,
    showGrandTotals: true,
    showSubtotals: true,
    showAverages: true,
    showCounts: true,
    showMin: true,
    showMax: true,
    showStdDev: true,
    showVariance: true,
    showMedian: true,
    showMode: true,
    showQuartiles: true,
    showPercentiles: true,
    showZScore: true,
    showOutliers: true,
    showTrends: true,
    showForecasts: true,
    showAnomalies: true,
    showCorrelations: true,
    showRegressions: true,
    showClusters: true,
    showSegments: true,
    
    // Business metrics
    showFunnels: true,
    showCohorts: true,
    showRetention: true,
    showChurn: true,
    showLTV: true,
    showROI: true,
    showCAC: true,
    showARPU: true,
    showARPPU: true,
    showMRR: true,
    showARR: true,
    showNPS: true,
    showCSAT: true,
    showCES: true,
    
    // Performance
    enableVirtualization: true,
    enableLazyLoading: true,
    enablePrefetching: true,
    enableCaching: true,
    enableCompression: true,
    enableEncryption: false,
    
    // Notifications
    notifyOnCreate: true,
    notifyOnUpdate: true,
    notifyOnDelete: true,
    notifyOnError: true,
    notifyOnWarning: true,
    notifyOnSuccess: true,
    
    // Accessibility
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    
    // Customization
    customCSS: '',
    customJS: '',
    customTheme: {},
    customIcons: {},
    
    // Advanced
    debugMode: false,
    verboseLogging: false,
    performanceMonitoring: true,
    errorTracking: true,
    analyticsTracking: true,
    
    // Custom metrics
    customMetrics: [] as Array<{
      name: string;
      formula: string;
      format?: string;
    }>
  });
  
  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const activeCellRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ colIndex: number; startX: number; startWidth: number } | null>(null);
  const dragRef = useRef<{ rowIndex: number; startY: number } | null>(null);
  const undoStack = useRef<HistoryState[]>([]);
  const redoStack = useRef<HistoryState[]>([]);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const analyticsTimer = useRef<NodeJS.Timeout | null>(null);
  const performanceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { socket, isConnected } = enableRealtime ? useSocket(module, entity) : { socket: null, isConnected: false };
  const { canCreate, canEdit, canDelete, canEditColumn } = usePermissions(module, entity);
  const { handleVersionConflict } = useConcurrency(module, entity);
  
  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => bodyRef.current,
    estimateSize: () => {
      switch (rowHeight) {
        case 'compact': return 32;
        case 'comfortable': return 48;
        case 'relaxed': return 64;
        default: return 40;
      }
    },
    overscan: 20
  });
  
  const columnVirtualizer = useVirtualizer({
    count: columns.length,
    getScrollElement: () => headerRef.current,
    estimateSize: (index) => columns[index]?.width || 200,
    horizontal: true,
    overscan: 10
  });
  
  // ==================== COMPUTED PROPERTIES ====================
  
  const filteredRecords = useMemo(() => {
    let result = [...records];
    
    // Apply quick filter
    if (quickFilter) {
      const term = quickFilter.toLowerCase();
      result = result.filter(record => {
        return Object.values(record.data).some(value => 
          String(value).toLowerCase().includes(term)
        );
      });
    }
    
    // Apply advanced filters
    if (filters.length > 0) {
      result = result.filter(record => {
        return filters.every(filter => {
          const value = record.data[filter.fieldKey];
          
          switch (filter.operator) {
            case 'equals': return value === filter.value;
            case 'notEquals': return value !== filter.value;
            case 'contains': return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'notContains': return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'startsWith': return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
            case 'endsWith': return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
            case 'gt': return Number(value) > Number(filter.value);
            case 'gte': return Number(value) >= Number(filter.value);
            case 'lt': return Number(value) < Number(filter.value);
            case 'lte': return Number(value) <= Number(filter.value);
            case 'between': return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.value2);
            case 'notBetween': return Number(value) < Number(filter.value) || Number(value) > Number(filter.value2);
            case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
            case 'notIn': return !Array.isArray(filter.value) || !filter.value.includes(value);
            case 'empty': return value === null || value === undefined || value === '';
            case 'notEmpty': return value !== null && value !== undefined && value !== '';
            case 'null': return value === null;
            case 'notNull': return value !== null;
            case 'true': return value === true;
            case 'false': return value === false;
            case 'yesterday': {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              yesterday.setHours(0, 0, 0, 0);
              const tomorrow = new Date(yesterday);
              tomorrow.setDate(tomorrow.getDate() + 1);
              const date = new Date(value);
              return date >= yesterday && date < tomorrow;
            }
            case 'today': {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              const date = new Date(value);
              return date >= today && date < tomorrow;
            }
            case 'tomorrow': {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);
              const dayAfter = new Date(tomorrow);
              dayAfter.setDate(dayAfter.getDate() + 1);
              const date = new Date(value);
              return date >= tomorrow && date < dayAfter;
            }
            case 'lastWeek': {
              const lastWeek = new Date();
              lastWeek.setDate(lastWeek.getDate() - 7);
              lastWeek.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= lastWeek;
            }
            case 'thisWeek': {
              const thisWeek = new Date();
              thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
              thisWeek.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= thisWeek;
            }
            case 'nextWeek': {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
              nextWeek.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= nextWeek;
            }
            case 'lastMonth': {
              const lastMonth = new Date();
              lastMonth.setMonth(lastMonth.getMonth() - 1);
              lastMonth.setDate(1);
              lastMonth.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= lastMonth;
            }
            case 'thisMonth': {
              const thisMonth = new Date();
              thisMonth.setDate(1);
              thisMonth.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= thisMonth;
            }
            case 'nextMonth': {
              const nextMonth = new Date();
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              nextMonth.setDate(1);
              nextMonth.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= nextMonth;
            }
            case 'lastYear': {
              const lastYear = new Date();
              lastYear.setFullYear(lastYear.getFullYear() - 1);
              lastYear.setMonth(0);
              lastYear.setDate(1);
              lastYear.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= lastYear;
            }
            case 'thisYear': {
              const thisYear = new Date();
              thisYear.setMonth(0);
              thisYear.setDate(1);
              thisYear.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= thisYear;
            }
            case 'nextYear': {
              const nextYear = new Date();
              nextYear.setFullYear(nextYear.getFullYear() + 1);
              nextYear.setMonth(0);
              nextYear.setDate(1);
              nextYear.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= nextYear;
            }
            case 'last7Days': {
              const last7Days = new Date();
              last7Days.setDate(last7Days.getDate() - 7);
              last7Days.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= last7Days;
            }
            case 'last30Days': {
              const last30Days = new Date();
              last30Days.setDate(last30Days.getDate() - 30);
              last30Days.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= last30Days;
            }
            case 'last90Days': {
              const last90Days = new Date();
              last90Days.setDate(last90Days.getDate() - 90);
              last90Days.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= last90Days;
            }
            case 'last365Days': {
              const last365Days = new Date();
              last365Days.setDate(last365Days.getDate() - 365);
              last365Days.setHours(0, 0, 0, 0);
              const date = new Date(value);
              return date >= last365Days;
            }
            case 'next7Days': {
              const next7Days = new Date();
              next7Days.setDate(next7Days.getDate() + 7);
              next7Days.setHours(23, 59, 59, 999);
              const date = new Date(value);
              return date <= next7Days;
            }
            case 'next30Days': {
              const next30Days = new Date();
              next30Days.setDate(next30Days.getDate() + 30);
              next30Days.setHours(23, 59, 59, 999);
              const date = new Date(value);
              return date <= next30Days;
            }
            case 'next90Days': {
              const next90Days = new Date();
              next90Days.setDate(next90Days.getDate() + 90);
              next90Days.setHours(23, 59, 59, 999);
              const date = new Date(value);
              return date <= next90Days;
            }
            case 'next365Days': {
              const next365Days = new Date();
              next365Days.setDate(next365Days.getDate() + 365);
              next365Days.setHours(23, 59, 59, 999);
              const date = new Date(value);
              return date <= next365Days;
            }
            default: return true;
          }
        });
      });
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(record => {
        return columns.some(col => {
          const value = record.data[col.field.fieldKey];
          return String(value).toLowerCase().includes(term);
        });
      });
    }
    
    // Apply sorts
    if (sorts.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorts) {
          const aVal = a.data[sort.fieldKey];
          const bVal = b.data[sort.fieldKey];
          
          if (aVal === bVal) continue;
          
          let comparison = 0;
          
          if (sort.type === 'number') {
            comparison = Number(aVal) - Number(bVal);
          } else if (sort.type === 'date') {
            comparison = new Date(aVal).getTime() - new Date(bVal).getTime();
          } else if (sort.type === 'boolean') {
            comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0);
          } else {
            const aStr = String(aVal).toLocaleLowerCase(sort.locale);
            const bStr = String(bVal).toLocaleLowerCase(sort.locale);
            
            if (sort.sensitivity === 'base') {
              comparison = aStr.localeCompare(bStr, sort.locale, { sensitivity: 'base' });
            } else if (sort.sensitivity === 'accent') {
              comparison = aStr.localeCompare(bStr, sort.locale, { sensitivity: 'accent' });
            } else if (sort.sensitivity === 'case') {
              comparison = aStr.localeCompare(bStr, sort.locale, { sensitivity: 'case' });
            } else if (sort.sensitivity === 'variant') {
              comparison = aStr.localeCompare(bStr, sort.locale, { sensitivity: 'variant' });
            } else {
              comparison = aStr.localeCompare(bStr, sort.locale);
            }
          }
          
          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }
    
    return result;
  }, [records, filters, sorts, searchTerm, quickFilter, columns]);
  
  const groupedRecords = useMemo(() => {
    if (groups.length === 0) return { root: filteredRecords };
    
    const groupData: Record<string, any> = {};
    
    const groupRecords = (records: DataRecord[], groupIndex: number): any => {
      const group = groups[groupIndex];
      if (!group) return records;
      
      const grouped: Record<string, DataRecord[]> = {};
      
      records.forEach(record => {
        const value = record.data[group.fieldKey];
        const key = value === null || value === undefined ? 'null' : String(value);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(record);
      });
      
      const result: Record<string, any> = {};
      
      Object.entries(grouped).forEach(([key, items]) => {
        if (groupIndex < groups.length - 1) {
          result[key] = {
            items,
            groups: groupRecords(items, groupIndex + 1)
          };
        } else {
          result[key] = items;
        }
      });
      
      return result;
    };
    
    return groupRecords(filteredRecords, 0);
  }, [filteredRecords, groups]);
  
  const selectedCount = selectedRows.size;
  const filteredCount = filteredRecords.length;
  const totalFiltered = filteredCount;
  
  const hasFilters = filters.length > 0 || searchTerm || quickFilter;
  const hasSorts = sorts.length > 0;
  const hasGroups = groups.length > 0;
  
  const visibleColumns = columns.filter(col => col.visible);
  const frozenColumns = columns.filter(col => col.frozen);
  const scrollableColumns = columns.filter(col => !col.frozen);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  // ==================== WEBSOCKET HANDLERS ====================
  
  useEffect(() => {
    if (!socket) return;
    
    const handleRecordCreated = (data: any) => {
      setRecords(prev => [data, ...prev]);
      toast.success('New record created', { icon: '✨' });
      
      if (settings.notifyOnCreate) {
        new Audio('/sounds/create.mp3').play().catch(() => {});
      }
    };
    
    const handleRecordUpdated = (data: any) => {
      setRecords(prev => prev.map(r => r._id === data._id ? { ...r, ...data } : r));
      toast.success('Record updated', { icon: '🔄' });
      
      if (settings.notifyOnUpdate) {
        new Audio('/sounds/update.mp3').play().catch(() => {});
      }
    };
    
    const handleRecordDeleted = (data: { recordId: string }) => {
      setRecords(prev => prev.filter(r => r._id !== data.recordId));
      setSelectedRows(prev => {
        const next = new Set(prev);
        next.delete(data.recordId);
        return next;
      });
      toast.success('Record deleted', { icon: '🗑️' });
      
      if (settings.notifyOnDelete) {
        new Audio('/sounds/delete.mp3').play().catch(() => {});
      }
    };
    
    const handleBulkUpdate = (data: { recordIds: string[]; data: any }) => {
      setRecords(prev => prev.map(r => 
        data.recordIds.includes(r._id) ? { ...r, data: { ...r.data, ...data.data } } : r
      ));
      toast.success(`Updated ${data.recordIds.length} records`, { icon: '📊' });
    };
    
    const handleConflict = (data: any) => {
      handleVersionConflict(data);
    };
    
    const handleActivity = (activity: Activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 100));
    };
    
    const handleComment = (comment: Comment) => {
      setComments(prev => [comment, ...prev]);
      toast.success(`New comment on record`, { icon: '💬' });
    };
    
    const handleAttachment = (attachment: Attachment) => {
      setAttachments(prev => [attachment, ...prev]);
    };
    
    const handleWorkflowUpdate = (data: any) => {
      setWorkflows(prev => prev.map(w => w.id === data.id ? { ...w, ...data } : w));
      toast.success(`Workflow updated`, { icon: '🔄' });
    };
    
    const handleAutomationTrigger = (data: any) => {
      setAutomationLogs(prev => [data, ...prev]);
      toast.success(`Automation triggered: ${data.name}`, { icon: '🤖' });
    };
    
    const handleWebhookEvent = (data: any) => {
      setWebhookLogs(prev => [data, ...prev]);
    };
    
    const handlePluginEvent = (data: any) => {
      toast.success(`Plugin: ${data.message}`, { icon: '🧩' });
    };
    
    const handleExtensionEvent = (data: any) => {
      toast.success(`Extension: ${data.message}`, { icon: '🔌' });
    };
    
    socket.on('recordCreated', handleRecordCreated);
    socket.on('recordUpdated', handleRecordUpdated);
    socket.on('recordDeleted', handleRecordDeleted);
    socket.on('bulkUpdate', handleBulkUpdate);
    socket.on('versionConflict', handleConflict);
    socket.on('activity', handleActivity);
    socket.on('comment', handleComment);
    socket.on('attachment', handleAttachment);
    socket.on('workflowUpdate', handleWorkflowUpdate);
    socket.on('automationTrigger', handleAutomationTrigger);
    socket.on('webhookEvent', handleWebhookEvent);
    socket.on('pluginEvent', handlePluginEvent);
    socket.on('extensionEvent', handleExtensionEvent);
    
    return () => {
      socket.off('recordCreated', handleRecordCreated);
      socket.off('recordUpdated', handleRecordUpdated);
      socket.off('recordDeleted', handleRecordDeleted);
      socket.off('bulkUpdate', handleBulkUpdate);
      socket.off('versionConflict', handleConflict);
      socket.off('activity', handleActivity);
      socket.off('comment', handleComment);
      socket.off('attachment', handleAttachment);
      socket.off('workflowUpdate', handleWorkflowUpdate);
      socket.off('automationTrigger', handleAutomationTrigger);
      socket.off('webhookEvent', handleWebhookEvent);
      socket.off('pluginEvent', handlePluginEvent);
      socket.off('extensionEvent', handleExtensionEvent);
    };
  }, [socket, handleVersionConflict, settings]);
  
  // ==================== AUTO SAVE ====================
  
  const savePendingChanges = useCallback(async () => {
    if (editedRows.size === 0) return;
    
    const promises: Promise<void>[] = [];
    const errors: string[] = [];
    
    editedRows.forEach((data:any, recordId:any) => {
      const record = records.find(r => r._id === recordId);
      if (record) {
        promises.push(
          onUpdate(recordId, data, record.version).catch(err => {
            errors.push(`${recordId}: ${err.message}`);
          })
        );
      }
    });
    
    try {
      await Promise.all(promises);
      setEditedRows(new Map());
      addToHistory('Auto-saved changes');
      
      if (errors.length === 0) {
        toast.success('All changes saved');
      } else {
        toast.error(`Saved with ${errors.length} errors`);
      }
    } catch (error) {
      toast.error('Failed to save some changes');
    }
  }, [editedRows, records, onUpdate]);
  
  useEffect(() => {
    if (settings.autoSave && editedRows.size > 0) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(savePendingChanges, settings.autoSaveDelay);
    }
    
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [editedRows, settings.autoSave, settings.autoSaveDelay, savePendingChanges]);
  
  // ==================== HISTORY MANAGEMENT ====================
  
  const addToHistory = useCallback((description: string) => {
    if (!enableUndo || !historyEnabled) return;
    
    const state: HistoryState = {
      records: JSON.parse(JSON.stringify(records)),
      selections: Array.from(selectedRows),
      timestamp: Date.now(),
      description
    };
    
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), state];
      return newHistory.slice(-100); // Keep last 100 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [records, selectedRows, historyIndex, enableUndo, historyEnabled]);
  
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    const previousState = history[historyIndex - 1];
    setRecords(previousState.records);
    setSelectedRows(new Set(previousState.selections));
    setHistoryIndex(prev => prev - 1);
    toast.success('Undo successful');
  }, [history, historyIndex, canUndo]);
  
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    const nextState = history[historyIndex + 1];
    setRecords(nextState.records);
    setSelectedRows(new Set(nextState.selections));
    setHistoryIndex(prev => prev + 1);
    toast.success('Redo successful');
  }, [history, historyIndex, canRedo]);
  
  // ==================== KEYBOARD SHORTCUTS ====================
  
  const shortcuts: KeyboardShortcut[] = [
    { key: 'n', ctrl: true, action: 'new-record', description: 'Create new record' },
    { key: 's', ctrl: true, action: 'save', description: 'Save changes' },
    { key: 'z', ctrl: true, action: 'undo', description: 'Undo' },
    { key: 'y', ctrl: true, action: 'redo', description: 'Redo' },
    { key: 'f', ctrl: true, action: 'find', description: 'Find/Replace' },
    { key: 'g', ctrl: true, shift: true, action: 'group', description: 'Group by column' },
    { key: 'h', ctrl: true, shift: true, action: 'hide-column', description: 'Hide column' },
    { key: 'u', ctrl: true, shift: true, action: 'unhide-column', description: 'Unhide column' },
    { key: 'f', ctrl: true, shift: true, action: 'filter', description: 'Toggle filter' },
    { key: 's', ctrl: true, shift: true, action: 'sort', description: 'Toggle sort' },
    { key: 'a', ctrl: true, action: 'select-all', description: 'Select all' },
    { key: 'd', ctrl: true, action: 'duplicate', description: 'Duplicate selected' },
    { key: 'Delete', action: 'delete', description: 'Delete selected' },
    { key: 'Escape', action: 'cancel', description: 'Cancel editing' },
    { key: 'Enter', action: 'edit-cell', description: 'Edit active cell' },
    { key: 'Tab', action: 'next-cell', description: 'Move to next cell' },
    { key: 'Tab', shift: true, action: 'prev-cell', description: 'Move to previous cell' },
    { key: 'ArrowUp', action: 'move-up', description: 'Move up' },
    { key: 'ArrowDown', action: 'move-down', description: 'Move down' },
    { key: 'ArrowLeft', action: 'move-left', description: 'Move left' },
    { key: 'ArrowRight', action: 'move-right', description: 'Move right' },
    { key: 'PageUp', action: 'page-up', description: 'Page up' },
    { key: 'PageDown', action: 'page-down', description: 'Page down' },
    { key: 'Home', action: 'first-row', description: 'Go to first row' },
    { key: 'End', action: 'last-row', description: 'Go to last row' },
    { key: 'Home', ctrl: true, action: 'first-cell', description: 'Go to first cell' },
    { key: 'End', ctrl: true, action: 'last-cell', description: 'Go to last cell' },
    { key: 'c', ctrl: true, action: 'copy', description: 'Copy' },
    { key: 'x', ctrl: true, action: 'cut', description: 'Cut' },
    { key: 'v', ctrl: true, action: 'paste', description: 'Paste' },
    { key: 'p', ctrl: true, action: 'print', description: 'Print' },
    { key: 'e', ctrl: true, action: 'export', description: 'Export' },
    { key: 'i', ctrl: true, action: 'import', description: 'Import' },
    { key: 'b', ctrl: true, action: 'bulk-edit', description: 'Bulk edit' },
    { key: 'k', ctrl: true, action: 'comments', description: 'Comments' },
    { key: 'l', ctrl: true, action: 'attachments', description: 'Attachments' },
    { key: 't', ctrl: true, action: 'tags', description: 'Tags' },
    { key: 'r', ctrl: true, action: 'refresh', description: 'Refresh' },
    { key: '+', ctrl: true, action: 'zoom-in', description: 'Zoom in' },
    { key: '-', ctrl: true, action: 'zoom-out', description: 'Zoom out' },
    { key: '0', ctrl: true, action: 'zoom-reset', description: 'Reset zoom' },
    { key: 'F11', action: 'fullscreen', description: 'Toggle fullscreen' },
    { key: 'F1', action: 'help', description: 'Help' },
    { key: '?', action: 'shortcuts', description: 'Show shortcuts' },
    { key: '.', ctrl: true, action: 'next-tab', description: 'Next tab' },
    { key: ',', ctrl: true, action: 'prev-tab', description: 'Previous tab' },
    { key: 'w', ctrl: true, action: 'close-tab', description: 'Close tab' },
    { key: 't', ctrl: true, shift: true, action: 'reopen-tab', description: 'Reopen closed tab' },
    { key: '1', ctrl: true, action: 'tab-1', description: 'Go to tab 1' },
    { key: '2', ctrl: true, action: 'tab-2', description: 'Go to tab 2' },
    { key: '3', ctrl: true, action: 'tab-3', description: 'Go to tab 3' },
    { key: '4', ctrl: true, action: 'tab-4', description: 'Go to tab 4' },
    { key: '5', ctrl: true, action: 'tab-5', description: 'Go to tab 5' },
    { key: '6', ctrl: true, action: 'tab-6', description: 'Go to tab 6' },
    { key: '7', ctrl: true, action: 'tab-7', description: 'Go to tab 7' },
    { key: '8', ctrl: true, action: 'tab-8', description: 'Go to tab 8' },
    { key: '9', ctrl: true, action: 'tab-9', description: 'Go to tab 9' },
    { key: '0', ctrl: true, shift: true, action: 'tab-10', description: 'Go to tab 10' },
    { key: '[', ctrl: true, action: 'previous-view', description: 'Previous view' },
    { key: ']', ctrl: true, action: 'next-view', description: 'Next view' },
    { key: '\\', ctrl: true, action: 'split-view', description: 'Split view' },
    { key: '-', ctrl: true, shift: true, action: 'zoom-out-more', description: 'Zoom out more' },
    { key: '=', ctrl: true, shift: true, action: 'zoom-in-more', description: 'Zoom in more' },
    { key: '8', ctrl: true, shift: true, action: 'zoom-to-fit', description: 'Zoom to fit' },
    { key: '9', ctrl: true, shift: true, action: 'zoom-to-selection', description: 'Zoom to selection' },
    { key: '0', ctrl: true, shift: true, action: 'zoom-to-actual', description: 'Zoom to actual size' },
    { key: 'F2', action: 'rename', description: 'Rename' },
    { key: 'F3', action: 'find-next', description: 'Find next' },
    { key: 'F4', action: 'repeat-last', description: 'Repeat last action' },
    { key: 'F5', action: 'refresh', description: 'Refresh' },
    { key: 'F6', action: 'next-pane', description: 'Next pane' },
    { key: 'F7', action: 'spell-check', description: 'Spell check' },
    { key: 'F8', action: 'extend-selection', description: 'Extend selection' },
    { key: 'F9', action: 'recalculate', description: 'Recalculate' },
    { key: 'F10', action: 'menu', description: 'Menu' },
    { key: 'F12', action: 'save-as', description: 'Save as' }
  ];
  
  useEffect(() => {
    if (!enableShortcuts) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          setActiveCell(null);
        }
        return;
      }
      
      const shortcut = shortcuts.find(s => {
        if (s.key !== e.key) return false;
        if (s.ctrl && !e.ctrlKey) return false;
        if (s.shift && !e.shiftKey) return false;
        if (s.alt && !e.altKey) return false;
        if (s.meta && !e.metaKey) return false;
        return true;
      });
      
      if (shortcut) {
        e.preventDefault();
        
        switch (shortcut.action) {
          case 'new-record':
            handleCreateBlankRow();
            break;
          case 'save':
            savePendingChanges();
            break;
          case 'undo':
            undo();
            break;
          case 'redo':
            redo();
            break;
          case 'find':
            setFindReplaceModalOpen(true);
            break;
          case 'delete':
            if (selectedCount > 0) handleDeleteSelected();
            break;
          case 'select-all':
            handleSelectAll();
            break;
          case 'copy':
            handleCopy();
            break;
          case 'paste':
            handlePaste();
            break;
          case 'export':
            setExportModalOpen(true);
            break;
          case 'import':
            setImportModalOpen(true);
            break;
          case 'refresh':
            handleRefresh();
            break;
          case 'zoom-in':
            setZoom(z => Math.min(400, z + 10));
            break;
          case 'zoom-out':
            setZoom(z => Math.max(10, z - 10));
            break;
          case 'zoom-reset':
            setZoom(100);
            break;
          case 'zoom-in-more':
            setZoom(z => Math.min(400, z + 25));
            break;
          case 'zoom-out-more':
            setZoom(z => Math.max(10, z - 25));
            break;
          case 'zoom-to-fit':
            handleZoomToFit();
            break;
          case 'zoom-to-actual':
            setZoom(100);
            break;
          case 'fullscreen':
            handleFullscreen();
            break;
          case 'help':
            setHelpModalOpen(true);
            break;
          case 'shortcuts':
            showShortcutsToast();
            break;
          case 'group':
            if (visibleColumns.length > 0) {
              handleAddGroup();
            }
            break;
          case 'filter':
            if (visibleColumns.length > 0) {
              handleAddFilter();
            }
            break;
          case 'sort':
            if (visibleColumns.length > 0) {
              handleAddSort();
            }
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, selectedCount, savePendingChanges, undo, redo, visibleColumns]);
  
  const showShortcutsToast = () => {
    toast.success(
      <div className="max-h-96 overflow-auto">
        <h3 className="font-bold mb-2 text-lg">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 gap-4">
          {shortcuts.map(s => (
            <div key={`${s.key}-${s.ctrl}-${s.shift}-${s.alt}`} className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{s.description}</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {s.ctrl && '⌘'}
                {s.shift && '⇧'}
                {s.alt && '⌥'}
                {s.key}
              </span>
            </div>
          ))}
        </div>
      </div>,
      { duration: 10000 }
    );
  };
  
  // ==================== ROW OPERATIONS ====================
  
  const handleCreateBlankRow = useCallback(async () => {
    if (!canCreate) {
      toast.error('You don\'t have permission to create records');
      return;
    }
    
    try {
      const defaultData: Record<string, any> = {};
      columns.forEach(col => {
        if (!col.field.readOnly) {
          defaultData[col.field.fieldKey] = getDefaultValue(col.field);
        }
      });
      
      const newId = await onCreate(defaultData);
      
      // Scroll to new row
      setTimeout(() => {
        const newRowIndex = records.length;
        rowVirtualizer.scrollToIndex(newRowIndex);
      }, 100);
      
      addToHistory('Created new record');
      toast.success('New record created');
    } catch (error) {
      toast.error('Failed to create record');
    }
  }, [canCreate, columns, onCreate, records.length, rowVirtualizer, addToHistory]);
  
  const handleDuplicateSelected = useCallback(async () => {
    if (!canCreate || selectedCount === 0) {
      toast.error('No records selected to duplicate');
      return;
    }
    
    const promises: Promise<any>[] = [];
    const results = { success: 0, failed: 0 };
    
    selectedRows.forEach(recordId => {
      const record = records.find(r => r._id === recordId);
      if (record && onClone) {
        promises.push(
          onClone(recordId).then(() => results.success++).catch(() => results.failed++)
        );
      } else if (record) {
        const { _id, version, createdAt, updatedAt, ...data } = record;
        promises.push(
          onCreate(data).then(() => results.success++).catch(() => results.failed++)
        );
      }
    });
    
    try {
      await Promise.all(promises);
      setSelectedRows(new Set());
      addToHistory(`Duplicated ${selectedCount} records`);
      toast.success(`Duplicated ${results.success} records, ${results.failed} failed`);
    } catch (error) {
      toast.error('Failed to duplicate some records');
    }
  }, [canCreate, selectedCount, selectedRows, records, onClone, onCreate, addToHistory]);
  
  const handleDeleteSelected = useCallback(async () => {
    if (!canDelete || selectedCount === 0) {
      toast.error('No records selected to delete');
      return;
    }
    
    if (settings.confirmDelete && !confirm(`Are you sure you want to delete ${selectedCount} record(s)?`)) {
      return;
    }
    
    const selectedIds = Array.from(selectedRows);
    
    if (onBulkDelete) {
      try {
        await onBulkDelete(selectedIds);
        setRecords(prev => prev.filter(r => !selectedRows.has(r._id)));
        setSelectedRows(new Set());
        addToHistory(`Deleted ${selectedCount} records`);
        toast.success(`Deleted ${selectedCount} records`);
      } catch (error) {
        toast.error('Failed to delete records');
      }
    } else {
      const promises: Promise<void>[] = [];
      const results = { success: 0, failed: 0 };
      
      selectedIds.forEach(recordId => {
        const promise = onDelete(recordId).then(() => { results.success++; }).catch(() => { results.failed++; });
        promises.push(promise as any);
      });
      
      try {
        await Promise.all(promises);
        setRecords(prev => prev.filter(r => !selectedRows.has(r._id)));
        setSelectedRows(new Set());
        addToHistory(`Deleted ${selectedCount} records`);
        toast.success(`Deleted ${results.success} records, ${results.failed} failed`);
      } catch (error) {
        toast.error('Failed to delete some records');
      }
    }
  }, [canDelete, selectedCount, selectedRows, settings.confirmDelete, onBulkDelete, onDelete, addToHistory]);
  
  const handleToggleStar = useCallback((recordId: string) => {
    setRecords(prev => prev.map(r => 
      r._id === recordId ? { ...r, starred: !r.starred } : r
    ));
    addToHistory('Toggled star');
  }, [addToHistory]);
  
  const handleToggleArchive = useCallback((recordId: string) => {
    setRecords(prev => prev.map(r => 
      r._id === recordId ? { ...r, archived: !r.archived } : r
    ));
    addToHistory('Toggled archive');
  }, [addToHistory]);
  
  const handleToggleLock = useCallback((recordId: string) => {
    setRecords(prev => prev.map(r => 
      r._id === recordId ? { 
        ...r, 
        locked: !r.locked,
        lockedBy: !r.locked ? 'current-user' : undefined,
        lockedAt: !r.locked ? new Date().toISOString() : undefined
      } : r
    ));
    addToHistory('Toggled lock');
  }, [addToHistory]);
  
  const handleSetPriority = useCallback((recordId: string, priority: 'low' | 'medium' | 'high' | 'critical') => {
    setRecords(prev => prev.map(r => 
      r._id === recordId ? { ...r, priority } : r
    ));
    addToHistory(`Set priority to ${priority}`);
  }, [addToHistory]);
  
  // ==================== SELECTION OPERATIONS ====================
  
  const handleSelectAll = useCallback(() => {
    if (selectedCount === filteredCount) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRecords.map(r => r._id)));
    }
  }, [selectedCount, filteredCount, filteredRecords]);
  
  const handleSelectRange = useCallback((startRow: number, endRow: number, startCol: number, endCol: number) => {
    const newSelection = new Set<string>();
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const record = filteredRecords[row];
        if (record) {
          newSelection.add(record._id);
        }
      }
    }
    
    setSelectedRows(newSelection);
  }, [filteredRecords]);
  
  const handleSelectInvert = useCallback(() => {
    const allIds = new Set(filteredRecords.map(r => r._id));
    const newSelection = new Set<string>();
    
    allIds.forEach(id => {
      if (!selectedRows.has(id)) {
        newSelection.add(id);
      }
    });
    
    setSelectedRows(newSelection);
  }, [filteredRecords, selectedRows]);
  
  const handleSelectNone = useCallback(() => {
    setSelectedRows(new Set());
  }, []);
  
  const handleSelectColumn = useCallback((colIndex: number) => {
    const newSelection = new Set(filteredRecords.map(r => r._id));
    setSelectedRows(newSelection);
  }, [filteredRecords]);
  
  const handleMouseDown = useCallback((rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Range select
      if (selectStart) {
        handleSelectRange(
          selectStart.row,
          rowIndex,
          selectStart.col,
          colIndex
        );
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const record = filteredRecords[rowIndex];
      if (record) {
        setSelectedRows(prev => {
          const next = new Set(prev);
          if (next.has(record._id)) {
            next.delete(record._id);
          } else {
            next.add(record._id);
          }
          return next;
        });
      }
    } else {
      setIsSelecting(true);
      setSelectStart({ row: rowIndex, col: colIndex });
      setSelectedRows(new Set([filteredRecords[rowIndex]?._id].filter(Boolean)));
    }
  }, [filteredRecords, selectStart, handleSelectRange]);
  
  const handleMouseMove = useCallback((rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    if (isSelecting && selectStart) {
      handleSelectRange(
        selectStart.row,
        rowIndex,
        selectStart.col,
        colIndex
      );
    }
  }, [isSelecting, selectStart, handleSelectRange]);
  
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);
  
  // ==================== CELL OPERATIONS ====================
  
  const handleCellChange = useCallback((
    recordId: string,
    fieldKey: string,
    value: any,
    recordVersion: number
  ) => {
    const field = columns.find(c => c.field.fieldKey === fieldKey)?.field;
    if (!field) return;
    
    // Validate
    const validation = validateValue(value, field, records.find(r => r._id === recordId)?.data);
    
    setEditedRows((prev: any) => {
      const next = new Map<string, any>(prev);
      const currentData = next.get(recordId) || records.find(r => r._id === recordId)?.data || {};
      next.set(recordId, { ...currentData, [fieldKey]: value });
      return next as any;
    });
    
    if (!validation.valid) {
      setRowErrors((prev: any) => {
        const next = new Map<string, any>(prev);
        const current = next.get(recordId) || {};
        next.set(recordId, { ...current, [fieldKey]: validation.error! });
        return next as any;
      });
    } else {
      setRowErrors((prev: any) => {
        const next = new Map<string, any>(prev);
        const current = next.get(recordId);
        if (current) {
          const { [fieldKey]: _, ...rest } = current as any;
          if (Object.keys(rest).length > 0) {
            next.set(recordId, rest);
          } else {
            next.delete(recordId);
          }
        }
        return next as any;
      });
    }
    
    if (validation.warning) {
      setRowWarnings((prev: any) => {
        const next = new Map<string, any>(prev);
        const current = next.get(recordId) || {};
        next.set(recordId, { ...current, [fieldKey]: validation.warning! });
        return next as any;
      });
    }
    
    // Auto-save handled by useEffect
  }, [columns, records]);
  
  const handleCellBlur = useCallback((recordId: string, fieldKey: string) => {
    // Could trigger immediate save if needed
  }, []);
  
  const handleCellKeyDown = useCallback((
    e: React.KeyboardEvent,
    recordId: string,
    fieldKey: string,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Move to next row
      if (rowIndex < filteredRecords.length - 1) {
        const nextRecord = filteredRecords[rowIndex + 1];
        setActiveCell({ rowId: nextRecord._id, colKey: fieldKey });
      } else if (rowIndex === filteredRecords.length - 1 && canCreate) {
        // Create new row at bottom
        handleCreateBlankRow();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (e.shiftKey) {
        // Move left
        if (colIndex > 0) {
          const prevCol = visibleColumns[colIndex - 1];
          setActiveCell({ rowId: recordId, colKey: prevCol.field.fieldKey });
        }
      } else {
        // Move right
        if (colIndex < visibleColumns.length - 1) {
          const nextCol = visibleColumns[colIndex + 1];
          setActiveCell({ rowId: recordId, colKey: nextCol.field.fieldKey });
        }
      }
    } else if (e.key === 'Escape') {
      setActiveCell(null);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const prevRecord = filteredRecords[rowIndex - 1];
        setActiveCell({ rowId: prevRecord._id, colKey: fieldKey });
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < filteredRecords.length - 1) {
        const nextRecord = filteredRecords[rowIndex + 1];
        setActiveCell({ rowId: nextRecord._id, colKey: fieldKey });
      }
    }
  }, [filteredRecords, visibleColumns, canCreate, handleCreateBlankRow]);
  
  // ==================== CLIPBOARD OPERATIONS ====================
  
  const handleCopy = useCallback(async () => {
    if (selectedCount === 0) {
      toast.error('No records selected to copy');
      return;
    }
    
    const selectedRecords = records.filter(r => selectedRows.has(r._id));
    
    const data = {
      rows: selectedRecords.map(r => r.data),
      columns: visibleColumns.map(c => c.field.fieldKey),
      mimeType: 'application/json' as const
    };
    
    setClipboard(data);
    
    // Also copy to system clipboard
    const csv = selectedRecords.map(r => 
      visibleColumns.map(c => String(r.data[c.field.fieldKey] || '')).join(',')
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(csv);
      toast.success(`Copied ${selectedCount} records to clipboard`);
    } catch (error) {
      toast.success(`Copied ${selectedCount} records internally`);
    }
  }, [selectedCount, selectedRows, records, visibleColumns]);
  
  const handleCut = useCallback(async () => {
    await handleCopy();
    
    // Mark records for deletion after paste
    setClipboard(prev => prev ? { ...prev, cut: true } : null);
    
    // Visual indicator
    setRecords(prev => prev.map(r => 
      selectedRows.has(r._id) ? { ...r, opacity: 0.5 } : r
    ));
  }, [handleCopy, selectedRows]);
  
  const handlePaste = useCallback(async () => {
    if (!canCreate && !canEdit) {
      toast.error('You don\'t have permission to paste');
      return;
    }
    
    try {
      // Try system clipboard first
      const text = await navigator.clipboard.readText();
      
      // Parse CSV
      const rows = text.split('\n').filter(r => r.trim());
      const headers = rows[0].split(',').map(h => h.trim());
      
      const newRecords: Record<string, any>[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const record: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          const col = visibleColumns.find(c => c.field.label === header || c.field.fieldKey === header);
          if (col) {
            record[col.field.fieldKey] = parseValue(values[index], col.field);
          }
        });
        
        newRecords.push(record);
      }
      
      // Create records
      const promises = newRecords.map(data => onCreate(data));
      await Promise.all(promises);
      
      toast.success(`Pasted ${newRecords.length} records`);
      addToHistory(`Pasted ${newRecords.length} records`);
    } catch (error) {
      // Fallback to internal clipboard
      if (clipboard) {
        const promises = clipboard.rows.map(data => onCreate(data));
        await Promise.all(promises);
        toast.success(`Pasted ${clipboard.rows.length} records`);
        addToHistory(`Pasted ${clipboard.rows.length} records`);
        
        // If cut operation, delete original records
        if (clipboard.cut && onBulkDelete) {
          await onBulkDelete(Array.from(selectedRows));
          setRecords(prev => prev.filter(r => !selectedRows.has(r._id)));
          setSelectedRows(new Set());
        }
      }
    }
  }, [canCreate, canEdit, visibleColumns, onCreate, clipboard, selectedRows, onBulkDelete, addToHistory]);
  
  // ==================== COLUMN OPERATIONS ====================
  
  const handleResizeStart = useCallback((colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = {
      colIndex,
      startX: e.clientX,
      startWidth: columns[colIndex].width
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [columns]);
  
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeRef.current) return;
    
    const { colIndex, startX, startWidth } = resizeRef.current;
    const diff = e.clientX - startX;
    const newWidth = Math.max(50, startWidth + diff);
    
    setColumns(prev => prev.map((col, idx) => 
      idx === colIndex ? { ...col, width: newWidth } : col
    ));
  }, []);
  
  const handleResizeEnd = useCallback(() => {
    resizeRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);
  
  const handleAutoFitColumn = useCallback((colIndex: number) => {
    const col = columns[colIndex];
    let maxWidth = col.field.label.length * 10;
    
    records.forEach(record => {
      const value = record.data[col.field.fieldKey];
      const str = String(value || '');
      maxWidth = Math.max(maxWidth, str.length * 8);
    });
    
    setColumns(prev => prev.map((c, idx) => 
      idx === colIndex ? { ...c, width: Math.min(500, Math.max(80, maxWidth)) } : c
    ));
  }, [columns, records]);
  
  const handleAutoFitAllColumns = useCallback(() => {
    columns.forEach((_, idx) => handleAutoFitColumn(idx));
    toast.success('All columns auto-fitted');
  }, [columns, handleAutoFitColumn]);
  
  const handleToggleColumn = useCallback((colKey: string) => {
    setColumns(prev => prev.map(col =>
      col.field.fieldKey === colKey ? { ...col, visible: !col.visible } : col
    ));
    addToHistory('Toggled column visibility');
  }, [addToHistory]);
  
  const handleToggleFreeze = useCallback((colKey: string) => {
    setColumns(prev => prev.map(col =>
      col.field.fieldKey === colKey ? { ...col, frozen: !col.frozen } : col
    ));
    addToHistory('Toggled column freeze');
  }, [addToHistory]);
  
  const handleMoveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const [moved] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, moved);
      return newColumns;
    });
    addToHistory('Moved column');
  }, [addToHistory]);
  
  const handleResetColumns = useCallback(() => {
    setColumns(prev => prev.map(col => ({
      ...col,
      width: col.field.style?.width === 'compact' ? 120 : col.field.style?.width === 'wide' ? 300 : 200,
      visible: true,
      frozen: false
    })));
    addToHistory('Reset columns');
    toast.success('Columns reset to default');
  }, [addToHistory]);
  
  // ==================== ZOOM OPERATIONS ====================
  
  const handleZoomToFit = useCallback(() => {
    if (!tableRef.current) return;
    
    const tableWidth = tableRef.current.clientWidth;
    const totalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
    const scale = (tableWidth / totalWidth) * 100;
    setZoom(Math.min(200, Math.max(50, Math.round(scale))));
  }, [visibleColumns]);
  
  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(400, z + 10));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(10, z - 10));
  }, []);
  
  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, []);
  
  // ==================== FILTER OPERATIONS ====================
  
  const handleAddFilter = useCallback(() => {
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      fieldKey: visibleColumns[0]?.field.fieldKey || '',
      operator: 'equals',
      value: '',
      type: 'text',
      caseSensitive: false,
      useRegex: false
    };
    
    setFilters(prev => [...prev, newFilter]);
  }, [visibleColumns]);
  
  const handleRemoveFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
    addToHistory('Removed filter');
  }, [addToHistory]);
  
  const handleClearFilters = useCallback(() => {
    setFilters([]);
    setSearchTerm('');
    setQuickFilter('');
    addToHistory('Cleared filters');
    toast.success('All filters cleared');
  }, [addToHistory]);
  
  const handleUpdateFilter = useCallback((index: number, updates: Partial<Filter>) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  }, []);
  
  // ==================== SORT OPERATIONS ====================
  
  const handleAddSort = useCallback(() => {
    const newSort: Sort = {
      fieldKey: visibleColumns[0]?.field.fieldKey || '',
      direction: 'asc',
      priority: sorts.length
    };
    
    setSorts(prev => [...prev, newSort]);
  }, [visibleColumns, sorts.length]);
  
  const handleRemoveSort = useCallback((index: number) => {
    setSorts(prev => prev.filter((_, i) => i !== index));
    addToHistory('Removed sort');
  }, [addToHistory]);
  
  const handleClearSorts = useCallback(() => {
    setSorts([]);
    addToHistory('Cleared sorts');
    toast.success('All sorts cleared');
  }, [addToHistory]);
  
  const handleUpdateSort = useCallback((index: number, updates: Partial<Sort>) => {
    setSorts(prev => prev.map((sort, i) => 
      i === index ? { ...sort, ...updates } : sort
    ));
  }, []);
  
  const handleToggleSortDirection = useCallback((index: number) => {
    setSorts(prev => prev.map((sort, i) => 
      i === index ? { 
        ...sort, 
        direction: sort.direction === 'asc' ? 'desc' : 'asc' 
      } : sort
    ));
  }, []);
  
  // ==================== GROUP OPERATIONS ====================
  
  const handleAddGroup = useCallback(() => {
    const newGroup: Group = {
      fieldKey: visibleColumns[0]?.field.fieldKey || '',
      expanded: true,
      level: groups.length
    };
    
    setGroups(prev => [...prev, newGroup]);
  }, [visibleColumns, groups.length]);
  
  const handleRemoveGroup = useCallback((index: number) => {
    setGroups(prev => prev.filter((_, i) => i !== index));
    addToHistory('Removed group');
  }, [addToHistory]);
  
  const handleToggleGroup = useCallback((fieldKey: string) => {
    setGroups(prev => prev.map(g =>
      g.fieldKey === fieldKey ? { ...g, expanded: !g.expanded } : g
    ));
  }, []);
  
  const handleClearGroups = useCallback(() => {
    setGroups([]);
    addToHistory('Cleared groups');
    toast.success('All groups cleared');
  }, [addToHistory]);
  
  const handleExpandAllGroups = useCallback(() => {
    setGroups(prev => prev.map(g => ({ ...g, expanded: true })));
  }, []);
  
  const handleCollapseAllGroups = useCallback(() => {
    setGroups(prev => prev.map(g => ({ ...g, expanded: false })));
  }, []);
  
  // ==================== VIEW PRESET OPERATIONS ====================
  
  const handleSavePreset = useCallback(() => {
    if (!presetName) {
      toast.error('Please enter a name for this preset');
      return;
    }
    
    const newPreset: ViewPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      description: presetDescription,
      filters: [...filters],
      sorts: [...sorts],
      groups: [...groups],
      hiddenColumns: columns.filter(c => !c.visible).map(c => c.field.fieldKey),
      frozenColumns: columns.filter(c => c.frozen).map(c => c.field.fieldKey),
      columnWidths: columns.reduce((acc, col) => ({ ...acc, [col.field.fieldKey]: col.width }), {}),
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      shared: false
    };
    
    setViewPresets(prev => [...prev, newPreset]);
    setPresetModalOpen(false);
    setPresetName('');
    setPresetDescription('');
    toast.success('View preset saved');
  }, [presetName, presetDescription, filters, sorts, groups, columns]);
  
  const handleLoadPreset = useCallback((presetId: string) => {
    const preset = viewPresets.find(p => p.id === presetId);
    if (!preset) return;
    
    setFilters(preset.filters);
    setSorts(preset.sorts);
    setGroups(preset.groups);
    setColumns(prev => prev.map(col => ({
      ...col,
      visible: !preset.hiddenColumns.includes(col.field.fieldKey),
      frozen: preset.frozenColumns.includes(col.field.fieldKey),
      width: preset.columnWidths[col.field.fieldKey] || col.width
    })));
    
    setActivePreset(presetId);
    toast.success(`Loaded preset: ${preset.name}`);
    addToHistory(`Loaded preset: ${preset.name}`);
  }, [viewPresets, addToHistory]);
  
  const handleDeletePreset = useCallback((presetId: string) => {
    setViewPresets(prev => prev.filter(p => p.id !== presetId));
    if (activePreset === presetId) {
      setActivePreset('default');
    }
    toast.success('Preset deleted');
  }, [activePreset]);
  
  const handleSharePreset = useCallback((presetId: string) => {
    const preset = viewPresets.find(p => p.id === presetId);
    if (!preset) return;
    
    // Copy preset to clipboard as JSON
    const presetJson = JSON.stringify(preset, null, 2);
    navigator.clipboard.writeText(presetJson);
    toast.success('Preset copied to clipboard');
  }, [viewPresets]);
  
  // ==================== BULK EDIT ====================
  
  const handleBulkEdit = useCallback(async () => {
    if (selectedCount === 0 || !bulkEditField) return;
    
    const field = columns.find(c => c.field.fieldKey === bulkEditField)?.field;
    if (!field) return;
    
    const selectedIds = Array.from(selectedRows);
    
    if (onBulkUpdate) {
      const updateData: Record<string, any> = {};
      
      if (bulkEditOperator === 'set') {
        updateData[bulkEditField] = bulkEditValue;
        try {
          await onBulkUpdate(selectedIds, updateData);
          toast.success(`Updated ${selectedCount} records`);
          setBulkEditModalOpen(false);
          addToHistory(`Bulk edited ${selectedCount} records`);
        } catch (error) {
          toast.error('Failed to update records');
        }
      } else {
        // Apply operation to each record
        const promises = selectedIds.map(async recordId => {
          const record = records.find(r => r._id === recordId);
          if (!record) return;
          
          let newValue = record.data[bulkEditField];
          const currentValue = newValue;
          
          switch (bulkEditOperator) {
            case 'add':
              newValue = Number(currentValue || 0) + Number(bulkEditValue || 0);
              break;
            case 'subtract':
              newValue = Number(currentValue || 0) - Number(bulkEditValue || 0);
              break;
            case 'multiply':
              newValue = Number(currentValue || 0) * Number(bulkEditValue || 1);
              break;
            case 'divide':
              newValue = Number(currentValue || 0) / Number(bulkEditValue || 1);
              break;
            case 'append':
              newValue = String(currentValue || '') + String(bulkEditValue || '');
              break;
            case 'prepend':
              newValue = String(bulkEditValue || '') + String(currentValue || '');
              break;
            case 'replace':
              newValue = String(bulkEditValue || '');
              break;
            case 'clear':
              newValue = null;
              break;
            case 'toggle':
              newValue = !currentValue;
              break;
            case 'increment':
              newValue = Number(currentValue || 0) + 1;
              break;
            case 'decrement':
              newValue = Number(currentValue || 0) - 1;
              break;
            case 'merge':
              if (Array.isArray(currentValue) && Array.isArray(bulkEditValue)) {
                newValue = [...new Set([...currentValue, ...bulkEditValue])];
              } else if (typeof currentValue === 'object' && typeof bulkEditValue === 'object') {
                newValue = { ...currentValue, ...bulkEditValue };
              }
              break;
            case 'diff':
              if (Array.isArray(currentValue) && Array.isArray(bulkEditValue)) {
                newValue = currentValue.filter(x => !bulkEditValue.includes(x));
              }
              break;
            case 'intersect':
              if (Array.isArray(currentValue) && Array.isArray(bulkEditValue)) {
                newValue = currentValue.filter(x => bulkEditValue.includes(x));
              }
              break;
            case 'union':
              if (Array.isArray(currentValue) && Array.isArray(bulkEditValue)) {
                newValue = [...new Set([...currentValue, ...bulkEditValue])];
              }
              break;
          }
          
          await onUpdate(recordId, { ...record.data, [bulkEditField]: newValue }, record.version);
        });
        
        try {
          await Promise.all(promises);
          toast.success(`Updated ${selectedCount} records`);
          setBulkEditModalOpen(false);
          addToHistory(`Bulk edited ${selectedCount} records`);
        } catch (error) {
          toast.error('Failed to update some records');
        }
      }
    }
  }, [selectedCount, bulkEditField, bulkEditOperator, bulkEditValue, columns, records, onBulkUpdate, onUpdate, addToHistory]);
  
  // ==================== IMPORT/EXPORT ====================
  
  const handleImport = useCallback(async () => {
    if (!importFile) return;
    
    setImportProgress(0);
    
    try {
      const result = await onImport?.(importFile);
      
      if (result) {
        toast.success(`Import completed: ${result.success} records imported, ${result.failed} failed`);
        setImportModalOpen(false);
        setImportFile(null);
        setImportPreview([]);
        setImportProgress(100);
        addToHistory(`Imported ${result.success} records`);
      }
    } catch (error) {
      toast.error('Import failed');
    }
  }, [importFile, onImport, addToHistory]);
  
  const handleExport = useCallback(async () => {
    try {
      const blob = await onExport?.(exportFormat);
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${module}-${entity}-${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setExportModalOpen(false);
        toast.success(`Exported as ${exportFormat.toUpperCase()}`);
        addToHistory(`Exported as ${exportFormat.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('Export failed');
    }
  }, [onExport, exportFormat, module, entity, addToHistory]);
  
  const handleExportPreview = useCallback(() => {
    const data = filteredRecords.map(record => {
      const row: Record<string, any> = {};
      visibleColumns.forEach(col => {
        row[col.field.label] = formatValue(record.data[col.field.fieldKey], col.field);
      });
      return row;
    });
    
    console.log('Export Preview:', data);
    toast.success(`Preview ready: ${data.length} records`);
  }, [filteredRecords, visibleColumns]);
  
  // ==================== FIND/REPLACE ====================
  
  const handleFindNext = useCallback(() => {
    if (!findText) return;
    
    const searchIn = findOptions.scope === 'selection' && selectedCount > 0
      ? records.filter(r => selectedRows.has(r._id))
      : filteredRecords;
    
    let found = false;
    
    for (const record of searchIn) {
      for (const col of visibleColumns) {
        const value = String(record.data[col.field.fieldKey] || '');
        let match = false;
        
        if (findOptions.useRegex) {
          try {
            const regex = new RegExp(findText, findOptions.matchCase ? 'g' : 'gi');
            match = regex.test(value);
          } catch {
            // Invalid regex
          }
        } else if (findOptions.matchWholeCell) {
          match = findOptions.matchCase
            ? value === findText
            : value.toLowerCase() === findText.toLowerCase();
        } else if (findOptions.matchWord) {
          const words = value.split(/\s+/);
          match = words.some(word => 
            findOptions.matchCase
              ? word === findText
              : word.toLowerCase() === findText.toLowerCase()
          );
        } else {
          match = findOptions.matchCase
            ? value.includes(findText)
            : value.toLowerCase().includes(findText.toLowerCase());
        }
        
        if (match) {
          setActiveCell({ rowId: record._id, colKey: col.field.fieldKey });
          
          // Scroll to cell
          const rowIndex = filteredRecords.findIndex(r => r._id === record._id);
          if (rowIndex >= 0) {
            rowVirtualizer.scrollToIndex(rowIndex);
          }
          
          found = true;
          break;
        }
      }
      
      if (found) break;
    }
    
    if (!found) {
      toast.success('No matches found');
    }
  }, [findText, findOptions, selectedCount, selectedRows, records, filteredRecords, visibleColumns, rowVirtualizer]);
  
  const handleReplace = useCallback(() => {
    if (!findText) return;
    
    const searchIn = findOptions.scope === 'selection' && selectedCount > 0
      ? records.filter(r => selectedRows.has(r._id))
      : filteredRecords;
    
    let replaced = 0;
    
    for (const record of searchIn) {
      const newData = { ...record.data };
      let changed = false;
      
      for (const col of visibleColumns) {
        const value = String(record.data[col.field.fieldKey] || '');
        let newValue = value;
        
        if (findOptions.useRegex) {
          try {
            const regex = new RegExp(findText, findOptions.matchCase ? 'g' : 'gi');
            newValue = value.replace(regex, replaceText);
          } catch {
            // Invalid regex
          }
        } else if (findOptions.matchWholeCell) {
          const matches = findOptions.matchCase
            ? value === findText
            : value.toLowerCase() === findText.toLowerCase();
          
          if (matches) {
            newValue = replaceText;
          }
        } else {
          if (findOptions.matchCase) {
            newValue = value.replace(new RegExp(findText, 'g'), replaceText);
          } else {
            newValue = value.replace(new RegExp(findText, 'gi'), replaceText);
          }
        }
        
        if (newValue !== value) {
          newData[col.field.fieldKey] = newValue;
          changed = true;
        }
      }
      
      if (changed) {
        setEditedRows((prev: any) => {
          const next = new Map<string, any>(prev);
          next.set(record._id, newData);
          return next as any;
        });
        replaced++;
      }
    }
    
    toast.success(`Replaced in ${replaced} records`);
    addToHistory(`Replaced in ${replaced} records`);
  }, [findText, replaceText, findOptions, selectedCount, selectedRows, records, filteredRecords, visibleColumns, addToHistory]);
  
  const handleReplaceAll = useCallback(() => {
    handleReplace();
  }, [handleReplace]);
  
  // ==================== REFRESH ====================
  
  const handleRefresh = useCallback(async () => {
    if (onLoadMore) {
      try {
        const newRecords = await onLoadMore();
        setRecords(newRecords);
        toast.success('Data refreshed');
      } catch (error) {
        toast.error('Failed to refresh');
      }
    }
  }, [onLoadMore]);
  
  const handleAutoRefresh = useCallback((interval: number) => {
    if (analyticsTimer.current) {
      clearInterval(analyticsTimer.current);
    }
    
    analyticsTimer.current = setInterval(() => {
      handleRefresh();
    }, interval);
    
    toast.success(`Auto-refresh set to ${interval/1000}s`);
  }, [handleRefresh]);
  
  // ==================== FULLSCREEN ====================
  
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);
  
  // ==================== COMMENTS ====================
  
  const handleAddComment = useCallback(async () => {
    if (!commentRecord || !commentText) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      recordId: commentRecord,
      userId: 'current-user',
      userName: 'Current User',
      content: commentText,
      timestamp: new Date().toISOString(),
      edited: false
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    toast.success('Comment added');
    
    // Emit via socket
    if (socket) {
      socket.emit('comment', newComment);
    }
  }, [commentRecord, commentText, socket]);
  
  const handleEditComment = useCallback((commentId: string, newContent: string) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { 
        ...c, 
        content: newContent, 
        edited: true, 
        editedAt: new Date().toISOString() 
      } : c
    ));
    toast.success('Comment updated');
  }, []);
  
  const handleDeleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast.success('Comment deleted');
  }, []);
  
  // ==================== RENDER HELPERS ====================
  
  const renderCell = (record: DataRecord, col: Column, rowIndex: number, colIndex: number) => {
    const field = col.field;
    const value = record.data[field.fieldKey];
    const editedValue = editedRows.get(record._id)?.[field.fieldKey];
    const displayValue = editedValue !== undefined ? editedValue : value;
    const error = rowErrors.get(record._id)?.[field.fieldKey];
    const warning = rowWarnings.get(record._id)?.[field.fieldKey];
    const isActive = activeCell?.rowId === record._id && activeCell?.colKey === field.fieldKey;
    const isSelected = selectedRows.has(record._id);
    const canEditField = canEdit && canEditColumn(field.fieldKey) && !field.readOnly;
    
    // Apply conditional styles
    let conditionalStyle: React.CSSProperties = {};
    if (col.conditional) {
      for (const cond of col.conditional) {
        if (cond.condition(displayValue)) {
          conditionalStyle = { ...conditionalStyle, ...cond.style };
        }
      }
    }
    
    const style: React.CSSProperties = {
      width: col.width,
      minWidth: col.width,
      maxWidth: col.width,
      textAlign: field.style?.align || 'left',
      fontSize: field.style?.fontSize === 'xs' ? 12 : field.style?.fontSize === 'sm' ? 14 : field.style?.fontSize === 'lg' ? 18 : field.style?.fontSize === 'xl' ? 24 : field.style?.fontSize === '2xl' ? 30 : 14,
      fontWeight: field.style?.fontWeight || 'normal',
      backgroundColor: field.style?.bgColor || (isSelected ? '#EBF5FF' : undefined),
      color: field.style?.textColor,
      whiteSpace: field.style?.wrap ? 'normal' : 'nowrap',
      overflow: 'hidden',
      textOverflow: field.style?.truncate ? 'ellipsis' : 'clip',
      ...conditionalStyle
    };
    
    return (
      <div
        ref={isActive ? activeCellRef : undefined}
        className={`
          relative px-3 py-2 border-r border-b cursor-default
          ${isActive ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
          ${error ? 'bg-red-50' : warning ? 'bg-yellow-50' : ''}
          ${canEditField ? 'hover:bg-blue-50' : ''}
          ${record.locked ? 'opacity-50' : ''}
          ${record.archived ? 'opacity-50 bg-gray-50' : ''}
        `}
        style={style}
        onClick={() => canEditField && !record.locked && setActiveCell({ rowId: record._id, colKey: field.fieldKey })}
        onDoubleClick={() => canEditField && !record.locked && setActiveCell({ rowId: record._id, colKey: field.fieldKey })}
        onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
        onMouseMove={(e) => handleMouseMove(rowIndex, colIndex, e)}
        onMouseUp={handleMouseUp}
      >
        {isActive && canEditField && !record.locked ? (
          <input
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'datetime' ? 'datetime-local' : field.type === 'time' ? 'time' : 'text'}
            value={displayValue ?? ''}
            onChange={(e) => handleCellChange(
              record._id,
              field.fieldKey,
              field.type === 'number' ? Number(e.target.value) : 
              field.type === 'boolean' ? e.target.checked :
              e.target.value,
              record.version
            )}
            onBlur={() => handleCellBlur(record._id, field.fieldKey)}
            onKeyDown={(e) => handleCellKeyDown(e, record._id, field.fieldKey, rowIndex, colIndex)}
            className="w-full h-full outline-none bg-transparent"
            autoFocus
            disabled={record.locked}
          />
        ) : (
          <div className="truncate">
            {formatValue(displayValue, field)}
          </div>
        )}
        
        {error && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center group">
            <span className="text-white text-xs font-bold">!</span>
            <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block w-48 p-2 bg-red-600 text-white text-xs rounded shadow-lg whitespace-normal z-20">
              {error}
            </div>
          </div>
        )}
        
        {warning && !error && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center group">
            <span className="text-white text-xs font-bold">!</span>
            <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block w-48 p-2 bg-yellow-600 text-white text-xs rounded shadow-lg whitespace-normal z-20">
              {warning}
            </div>
          </div>
        )}
        
        {editedRows.has(record._id) && (
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        )}
        
        {record.starred && (
          <div className="absolute top-1 left-1 text-yellow-500">
            <Star className="h-3 w-3 fill-current" />
          </div>
        )}
        
        {record.locked && (
          <div className="absolute top-1 right-1 text-gray-500">
            <Lock className="h-3 w-3" />
          </div>
        )}
        
        {record.priority === 'high' && (
          <div className="absolute bottom-1 right-1 text-orange-500">
            <AlertTriangle className="h-3 w-3" />
          </div>
        )}
        
        {record.priority === 'critical' && (
          <div className="absolute bottom-1 right-1 text-red-500">
            <Zap className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };
  
  const renderGroup = (groupData: any, level: number = 0) => {
    if (Array.isArray(groupData)) {
      return groupData.map((record, index) => renderRow(record, index));
    }
    
    return Object.entries(groupData).map(([key, value]) => {
      const group = groups[level];
      const isExpanded = group?.expanded;
      
      return (
        <div key={key} className="border-l-2 border-gray-200 ml-4">
          <div 
            className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleToggleGroup(group.fieldKey)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            <span className="font-medium">{key}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({(value as any).items?.length || (value as any[]).length} items)
            </span>
          </div>
          {isExpanded && renderGroup(value, level + 1)}
        </div>
      );
    });
  };
  
  const renderRow = (record: DataRecord, rowIndex: number) => {
    const isSelected = selectedRows.has(record._id);
    const isExpanded = expandedRows.has(record._id);
    
    return (
      <div
        key={record._id}
        className={`
          flex border-b
          ${isSelected ? 'bg-blue-50' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          ${record.archived ? 'opacity-50' : ''}
          ${record.locked ? 'bg-gray-100' : ''}
        `}
        style={{
          height: rowHeight === 'compact' ? 32 : rowHeight === 'comfortable' ? 48 : rowHeight === 'relaxed' ? 64 : 40
        }}
      >
        {/* Row number / selection */}
        <div
          className="w-12 flex items-center justify-center border-r bg-gray-50"
          onMouseDown={(e) => handleMouseDown(rowIndex, -1, e)}
          onMouseMove={(e) => handleMouseMove(rowIndex, -1, e)}
          onMouseUp={handleMouseUp}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(prev => new Set([...prev, record._id]));
              } else {
                setSelectedRows(prev => {
                  const next = new Set(prev);
                  next.delete(record._id);
                  return next;
                });
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
        </div>
        
        {/* Cells */}
        {visibleColumns.map((col, colIndex) => (
          <React.Fragment key={col.field.fieldKey}>
            {renderCell(record, col, rowIndex, colIndex)}
          </React.Fragment>
        ))}
        
        {/* Actions */}
        <div className="flex items-center px-2 space-x-1">
          <button
            onClick={() => setExpandedRows(prev => {
              const next = new Set(prev);
              if (next.has(record._id)) {
                next.delete(record._id);
              } else {
                next.add(record._id);
              }
              return next;
            })}
            className="p-1 hover:bg-gray-200 rounded"
            title="Expand row"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {enableStarred && (
            <button
              onClick={() => handleToggleStar(record._id)}
              className={`p-1 hover:bg-gray-200 rounded ${record.starred ? 'text-yellow-500' : 'text-gray-400'}`}
              title={record.starred ? 'Unstar' : 'Star'}
            >
              <Star className="h-4 w-4" fill={record.starred ? 'currentColor' : 'none'} />
            </button>
          )}
          
          {enableComments && (
            <button
              onClick={() => {
                setCommentRecord(record._id);
                setCommentModalOpen(true);
              }}
              className="p-1 hover:bg-gray-200 rounded text-gray-400"
              title="Add comment"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}
          
          {canEdit && !record.locked && (
            <button
              onClick={() => {
                const data = { ...record.data };
                setEditedRows((prev: any) => {
                  const next = new Map<string, any>(prev);
                  next.set(record._id, data);
                  return next as any;
                });
              }}
              className="p-1 hover:bg-gray-200 rounded text-gray-400"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          
          {canDelete && !record.locked && (
            <button
              onClick={() => handleDeleteSelected()}
              className="p-1 hover:bg-gray-200 rounded text-red-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          {!record.locked && (
            <button
              onClick={() => handleToggleLock(record._id)}
              className={`p-1 hover:bg-gray-200 rounded ${record.locked ? 'text-gray-600' : 'text-gray-400'}`}
              title={record.locked ? 'Unlock' : 'Lock'}
            >
              {record.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </button>
          )}
          
          <div className="relative group">
            <button className="p-1 hover:bg-gray-200 rounded text-gray-400">
              <MoreVertical className="h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-20">
              <button
                onClick={() => handleSetPriority(record._id, 'low')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                Low Priority
              </button>
              <button
                onClick={() => handleSetPriority(record._id, 'medium')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                Medium Priority
              </button>
              <button
                onClick={() => handleSetPriority(record._id, 'high')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                High Priority
              </button>
              <button
                onClick={() => handleSetPriority(record._id, 'critical')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                Critical Priority
              </button>
              <hr className="my-1" />
              <button
                onClick={() => handleToggleArchive(record._id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                {record.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button
                onClick={() => onClone?.(record._id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // ==================== RENDER ====================
  
  return (
    <div
      ref={tableRef}
      className={`
        flex flex-col h-full bg-white rounded-lg border shadow-2xl
        ${fullscreen ? 'fixed inset-0 z-50' : ''}
        ${className}
      `}
      style={{ 
        ...style,
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top left',
        transition: 'transform 0.1s ease'
      }}
    >
      {/* Top Toolbar */}
      {toolbarOpen && (
        <div className="border-b bg-gray-50 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateBlankRow}
              disabled={!canCreate}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center"
              title="New Record (Ctrl+N)"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </button>
            
            <button
              onClick={handleDuplicateSelected}
              disabled={selectedCount === 0 || !canCreate}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm flex items-center"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </button>
            
            <button
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0 || !canDelete}
              className="px-3 py-1.5 border rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50 text-sm flex items-center"
              title="Delete (Delete)"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button
              onClick={handleCopy}
              disabled={selectedCount === 0}
              className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              title="Copy (Ctrl+C)"
            >
              <Copy className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleCut}
              disabled={selectedCount === 0}
              className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              title="Cut (Ctrl+X)"
            >
              <Scissors className="h-4 w-4" />
            </button>
            
            <button
              onClick={handlePaste}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Paste (Ctrl+V)"
            >
              <ClipboardPaste className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button
              onClick={() => setBulkEditModalOpen(true)}
              disabled={selectedCount === 0}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm flex items-center"
              title="Bulk Edit (Ctrl+B)"
            >
              <Settings2 className="h-4 w-4 mr-1" />
              Bulk Edit
            </button>
            
            <button
              onClick={() => setFindReplaceModalOpen(true)}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Find/Replace (Ctrl+F)"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={activePreset}
              onChange={(e) => handleLoadPreset(e.target.value)}
              className="px-2 py-1 border rounded-lg text-sm"
            >
              {viewPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} {preset.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setPresetModalOpen(true)}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Save View Preset"
            >
              <Save className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button
              onClick={handleAutoFitAllColumns}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Auto-fit columns"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setColumnWidth('compact')}
              className={`p-1.5 border rounded-lg ${columnWidth === 'compact' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Compact view"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setColumnWidth('normal')}
              className={`p-1.5 border rounded-lg ${columnWidth === 'normal' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Normal view"
            >
              <Square className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setColumnWidth('wide')}
              className={`p-1.5 border rounded-lg ${columnWidth === 'wide' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Wide view"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button
              onClick={handleZoomOut}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Zoom In (Ctrl++)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleZoomReset}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Reset Zoom (Ctrl+0)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleZoomToFit}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Zoom to Fit"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button
              onClick={handleFullscreen}
              className="p-1.5 border rounded-lg hover:bg-gray-100"
              title="Fullscreen (F11)"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setToolbarOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Close toolbar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Secondary Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Filters:</span>
          {filters.length > 0 ? (
            <>
              <span className="text-blue-600">{filters.length} active</span>
              <button
                onClick={handleClearFilters}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Clear all
              </button>
            </>
          ) : (
            <button
              onClick={handleAddFilter}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Add filter
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Sorts:</span>
          {sorts.length > 0 ? (
            <>
              <span className="text-blue-600">{sorts.length} active</span>
              <button
                onClick={handleClearSorts}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Clear all
              </button>
            </>
          ) : (
            <button
              onClick={handleAddSort}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Add sort
            </button>
          )}
        </div>
        
        {enableGrouping && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Groups:</span>
            {groups.length > 0 ? (
              <>
                <span className="text-blue-600">{groups.length} active</span>
                <button
                  onClick={handleClearGroups}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Clear all
                </button>
                <button
                  onClick={handleExpandAllGroups}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Expand all
                </button>
                <button
                  onClick={handleCollapseAllGroups}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Collapse all
                </button>
              </>
            ) : (
              <button
                onClick={handleAddGroup}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                Add group
              </button>
            )}
          </div>
        )}
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search..."
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            className="px-2 py-1 border rounded text-sm w-48"
          />
        </div>
        
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500 ml-1">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleExportPreview()}
            className="p-1 hover:bg-gray-200 rounded"
            title="Preview export"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Import"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Main Table Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Columns</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Close sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {columns.map((col, index) => (
                <div
                  key={col.field.fieldKey}
                  className="flex items-center justify-between p-2 bg-white rounded border hover:shadow-sm"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <span className="text-sm truncate">{col.field.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleColumn(col.field.fieldKey)}
                      className={`p-1 rounded hover:bg-gray-100 ${!col.visible ? 'text-gray-400' : ''}`}
                      title={col.visible ? 'Hide column' : 'Show column'}
                    >
                      {col.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => handleToggleFreeze(col.field.fieldKey)}
                      className={`p-1 rounded hover:bg-gray-100 ${col.frozen ? 'text-blue-600' : ''}`}
                      title={col.frozen ? 'Unfreeze column' : 'Freeze column'}
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleAutoFitColumn(index)}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Auto-fit column"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleResetColumns}
                className="w-full mt-4 px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Reset Columns
              </button>
            </div>
          </div>
        )}
        
        {/* Table */}
        <div className="flex-1 overflow-auto" ref={bodyRef}>
          <div
            ref={headerRef}
            className="flex bg-gray-100 border-b sticky top-0 z-10"
          >
            {/* Empty corner */}
            {sidebarOpen ? (
              <div className="w-64 border-r bg-gray-100" />
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-8 flex items-center justify-center border-r bg-gray-100 hover:bg-gray-200"
                title="Open sidebar"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            )}
            
            <div className="w-12 border-r bg-gray-100" />
            
            {/* Column headers */}
            {visibleColumns.map((col, index) => (
              <div
                key={col.field.fieldKey}
                className="relative px-3 py-2 border-r font-medium text-sm select-none group"
                style={{ width: col.width, minWidth: col.width }}
              >
                <div className="flex items-center justify-between">
                  <span>{col.field.label}</span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleAddFilter()}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Add filter"
                    >
                      <Filter className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleAddSort()}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Add sort"
                    >
                      <ChevronsUpDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleSelectColumn(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Select column"
                    >
                      <Square className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                {/* Resize handle */}
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleResizeStart(index, e)}
                />
              </div>
            ))}
            
            {/* Actions header */}
            <div className="w-32 px-3 py-2 font-medium text-sm border-r bg-gray-100">
              Actions
            </div>
          </div>
          
          <div style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map(virtualRow => (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                {renderRow(filteredRecords[virtualRow.index], virtualRow.index)}
                
                {/* Expanded row content */}
                {expandedRows.has(filteredRecords[virtualRow.index]?._id) && (
                  <div className="flex border-b bg-gray-50 p-4">
                    <div className="w-12" />
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-4">
                        {visibleColumns.map(col => (
                          <div key={col.field.fieldKey} className="border rounded p-2">
                            <span className="text-xs text-gray-500">{col.field.label}</span>
                            <p className="text-sm font-medium mt-1">
                              {formatValue(filteredRecords[virtualRow.index].data[col.field.fieldKey], col.field)}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {enableComments && comments.filter(c => c.recordId === filteredRecords[virtualRow.index]._id).length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Comments</h4>
                          <div className="space-y-2">
                            {comments
                              .filter(c => c.recordId === filteredRecords[virtualRow.index]._id)
                              .map(comment => (
                                <div key={comment.id} className="bg-white rounded border p-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{comment.userName}</span>
                                    <span className="text-xs text-gray-500">
                                      {format(parseISO(comment.timestamp), 'PPp')}
                                      {comment.edited && ' (edited)'}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-gray-600">{comment.content}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Attachments */}
                      {enableAttachments && attachments.filter(a => a.recordId === filteredRecords[virtualRow.index]._id).length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Attachments</h4>
                          <div className="space-y-2">
                            {attachments
                              .filter(a => a.recordId === filteredRecords[virtualRow.index]._id)
                              .map(attachment => (
                                <div key={attachment.id} className="bg-white rounded border p-2 text-sm flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{attachment.fileName}</span>
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({(attachment.fileSize / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Metadata */}
                      <div className="mt-4 text-xs text-gray-500">
                        <div>Created: {format(parseISO(filteredRecords[virtualRow.index].createdAt), 'PPp')}</div>
                        <div>Updated: {format(parseISO(filteredRecords[virtualRow.index].updatedAt), 'PPp')}</div>
                        <div>Version: {filteredRecords[virtualRow.index].version}</div>
                        {filteredRecords[virtualRow.index].tags && (
                          <div className="mt-2">
                            {filteredRecords[virtualRow.index].tags?.map(tag => (
                              <span key={tag} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      {statusbarOpen && (
        <div className="border-t bg-gray-50 p-2 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{filteredCount} records</span>
            <span>{selectedCount} selected</span>
            {editedRows.size > 0 && (
              <span className="text-blue-600">{editedRows.size} unsaved changes</span>
            )}
            {rowErrors.size > 0 && (
              <span className="text-red-600">{rowErrors.size} errors</span>
            )}
            {rowWarnings.size > 0 && (
              <span className="text-yellow-600">{rowWarnings.size} warnings</span>
            )}
            {filters.length > 0 && (
              <span className="text-purple-600">{filters.length} filters</span>
            )}
            {sorts.length > 0 && (
              <span className="text-indigo-600">{sorts.length} sorts</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Zoom: {zoom}%</span>
            <span>Version: {records[0]?.version || 1}</span>
            <span>Last updated: {records[0]?.updatedAt ? formatDistanceToNow(parseISO(records[0].updatedAt), { addSuffix: true }) : 'Never'}</span>
            <span>Memory: {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || '?'} MB</span>
          </div>
        </div>
      )}
      
      {/* ==================== MODALS ==================== */}
      
      {/* View Preset Modal */}
      {presetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Save View Preset</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., My Custom View"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setPresetModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Edit Modal */}
      {bulkEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Bulk Edit {selectedCount} Records</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Field</label>
                <select
                  value={bulkEditField || ''}
                  onChange={(e) => setBulkEditField(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select field...</option>
                  {visibleColumns.map(col => (
                    <option key={col.field.fieldKey} value={col.field.fieldKey}>
                      {col.field.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Operation</label>
                <select
                  value={bulkEditOperator}
                  onChange={(e) => setBulkEditOperator(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="set">Set to value</option>
                  <option value="add">Add value</option>
                  <option value="subtract">Subtract value</option>
                  <option value="multiply">Multiply by value</option>
                  <option value="divide">Divide by value</option>
                  <option value="append">Append text</option>
                  <option value="prepend">Prepend text</option>
                  <option value="replace">Replace all</option>
                  <option value="clear">Clear value</option>
                  <option value="toggle">Toggle boolean</option>
                  <option value="increment">Increment number</option>
                  <option value="decrement">Decrement number</option>
                  <option value="merge">Merge arrays/objects</option>
                  <option value="diff">Array difference</option>
                  <option value="intersect">Array intersection</option>
                  <option value="union">Array union</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <input
                  type="text"
                  value={bulkEditValue || ''}
                  onChange={(e) => setBulkEditValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setBulkEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply to {selectedCount} Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Find/Replace Modal */}
      {findReplaceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Find and Replace</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Find</label>
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Replace with</label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={findOptions.matchCase}
                    onChange={(e) => setFindOptions({ ...findOptions, matchCase: e.target.checked })}
                  />
                  <span className="text-sm">Match case</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={findOptions.matchWholeCell}
                    onChange={(e) => setFindOptions({ ...findOptions, matchWholeCell: e.target.checked })}
                  />
                  <span className="text-sm">Match whole cell</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={findOptions.matchWord}
                    onChange={(e) => setFindOptions({ ...findOptions, matchWord: e.target.checked })}
                  />
                  <span className="text-sm">Match whole word</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={findOptions.useRegex}
                    onChange={(e) => setFindOptions({ ...findOptions, useRegex: e.target.checked })}
                  />
                  <span className="text-sm">Use regular expression</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={findOptions.preserveCase}
                    onChange={(e) => setFindOptions({ ...findOptions, preserveCase: e.target.checked })}
                  />
                  <span className="text-sm">Preserve case</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Scope</label>
                  <select
                    value={findOptions.scope}
                    onChange={(e) => setFindOptions({ ...findOptions, scope: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="sheet">Entire sheet</option>
                    <option value="selection">Selected records</option>
                    <option value="column">Current column</option>
                    <option value="row">Current row</option>
                    <option value="cell">Current cell</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Direction</label>
                  <select
                    value={findOptions.direction}
                    onChange={(e) => setFindOptions({ ...findOptions, direction: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="next">Next</option>
                    <option value="prev">Previous</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setFindReplaceModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFindNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Find Next
                </button>
                <button
                  onClick={handleReplaceAll}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Import Data</h3>
            
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setImportFile(file);
                }}
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <input
                  id="import-file"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv,.json,.xml"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {importFile ? importFile.name : 'Drop file here or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports Excel (.xlsx, .xls), CSV, JSON, XML
                </p>
              </div>
              
              {importProgress > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {importProgress}% complete
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Export Data</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="xml">XML (.xml)</option>
                  <option value="html">HTML (.html)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="yaml">YAML (.yaml)</option>
                  <option value="toml">TOML (.toml)</option>
                  <option value="sql">SQL (.sql)</option>
                  <option value="graphql">GraphQL (.graphql)</option>
                </select>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeHeaders}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeHeaders: e.target.checked })}
                  />
                  <span className="text-sm">Include headers</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFilters}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeFilters: e.target.checked })}
                  />
                  <span className="text-sm">Apply current filters</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSorts}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeSorts: e.target.checked })}
                  />
                  <span className="text-sm">Apply current sorts</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeGroups}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeGroups: e.target.checked })}
                  />
                  <span className="text-sm">Include groups</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFormulas}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeFormulas: e.target.checked })}
                  />
                  <span className="text-sm">Include formulas</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeComments}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeComments: e.target.checked })}
                  />
                  <span className="text-sm">Include comments</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAttachments}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeAttachments: e.target.checked })}
                  />
                  <span className="text-sm">Include attachments</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                  />
                  <span className="text-sm">Include metadata</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDeleted}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeDeleted: e.target.checked })}
                  />
                  <span className="text-sm">Include deleted records</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportPreview}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Preview
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments Modal */}
      {commentModalOpen && commentRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Add Comment</h3>
            
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3 py-2 border rounded h-32"
              placeholder="Write your comment..."
              autoFocus
            />
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setCommentModalOpen(false);
                  setCommentRecord(null);
                  setCommentText('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-2xl p-6 shadow-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Help & Documentation</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help..."
                  value={helpSearch}
                  onChange={(e) => setHelpSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Getting Started</h4>
                  <p className="text-sm text-gray-500 mt-1">Learn the basics of using the Excel table</p>
                </div>
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Keyboard Shortcuts</h4>
                  <p className="text-sm text-gray-500 mt-1">All available keyboard shortcuts</p>
                </div>
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Data Entry</h4>
                  <p className="text-sm text-gray-500 mt-1">How to enter and edit data efficiently</p>
                </div>
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Filters & Sorting</h4>
                  <p className="text-sm text-gray-500 mt-1">Organize your data with filters and sorts</p>
                </div>
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Import/Export</h4>
                  <p className="text-sm text-gray-500 mt-1">Import and export data in various formats</p>
                </div>
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Advanced Features</h4>
                  <p className="text-sm text-gray-500 mt-1">Pivot tables, charts, and more</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Send Feedback</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="improvement">Improvement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFeedbackRating(rating)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        feedbackRating >= rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3 py-2 border rounded h-32"
                  placeholder="Tell us what you think..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Feedback sent! Thank you');
                    setFeedbackModalOpen(false);
                    setFeedbackSubmitted(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Support Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Contact Support</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="account">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={supportPriority}
                  onChange={(e) => setSupportPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded h-32"
                  placeholder="Describe your issue..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Attachments</label>
                <div className="border-2 border-dashed rounded p-4 text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">Drop files or click to upload</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setSupportModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Support ticket created');
                    setSupportModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export all utility functions
export { formatValue, parseValue, validateValue, getDefaultValue };