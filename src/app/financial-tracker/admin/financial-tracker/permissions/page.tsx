// src/app/admin/financial-tracker/permissions/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield,
  Users,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  DollarSign,
  CreditCard,
  Building2,
  Home,
  Briefcase,
  Package,
  Copy,
  LayoutDashboard,
  FolderTree,
  Grid3x3,
  Layers,
  Menu,
  MoreVertical,
  Download,
  Upload,
  Printer,
  Plus,
  X,
  Tag,
  Bookmark,
  Flag,
  Bell,
  Clock,
  User,
  Settings,
  Sliders,
  ArrowUpDown,
  CheckSquare,
  Square,
  ChevronsUpDown,
  GripVertical,
  Pencil,
  FileDown,
  FileUp,
  EyeIcon,
  EyeOffIcon,
  Power,
  PowerOff,
  ToggleLeft,
  ToggleRight,
  ListFilter,
  ListChecks,
  ListTodo,
  ListTree,
  ListOrdered,
  Sparkles,
  Zap,
  Star,
  Globe,
  Award,
  Code,
  Database,
  Key,
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
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  EyeOff,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Box,
  Package as PackageIcon,
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
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  ToggleLeft as ToggleLeftIcon,
  ToggleRight as ToggleRightIcon,
  History,
  GitCompare,
  Diff,
  FileDiff,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Columns,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Split,
  Combine,
  Share2,
  Eye as ViewIcon,
  PenTool,
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
  List,
  Grid,
  Table,
  Compass,
  Target,
  Crosshair,
  PieChart as PieChartIcon,
  LineChart,
  AreaChart,
  BarChart,
  ScatterChart,
  Radar,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  CloudMoon,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Ruler,
  Weight,
  Scale,
  Clock as ClockIcon,
  Timer as TimerIcon,
  Square as SquareIcon,
  Brain,
  Rocket,
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  Network as NetworkIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Eye as EyeIcon2,
  EyeOff as EyeOffIcon2,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  Users as UsersIcon,
  UsersRound,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UserRoundPlus,
  UserRoundMinus,
  UserRoundCog,
  UserSearch,
  UserRoundSearch,
  Users2,
  Users2Icon,
  UserSquare,
  UserSquare2,
  UserCircle,
  UserCircle2,
  WifiHigh,
  WifiLow,
  WifiZero,
  WifiOff as WifiOffIcon,
  Satellite,
  Radio,
  RadioTower,
  Antenna,
  Wifi as WifiIcon,
  LayoutTemplate,
  CopyCheck,
  FileStack,
  FileClock,
  Activity as ActivityIcon,
  UsersRound as UsersRoundIcon,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldHalf,
  ShieldPlus,
  ShieldMinus,
  SaveAll,
  Database as DatabaseIcon,
  HardDrive as HDIcon,
  Server as ServerIcon,
  Cloud as CloudIcon,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  CloudCog,
  CloudUpload,
  CloudDownload,
  HardDriveUpload,
  HardDriveDownload,
  MemoryStick,
  Fan,
  ThermometerSun,
  GaugeCircle,
  Receipt,
  ReceiptEuro,

  ReceiptSwissFranc,
  ReceiptRussianRuble,
  ReceiptText,
  ReceiptIndianRupee,
  ReceiptCent,
  Receipt as ReceiptNaira,
  Receipt as ReceiptBangladeshiTaka,
  Receipt as ReceiptThaiBaht,
  Receipt as ReceiptMalaysianRinggit,
  Receipt as ReceiptIndonesianRupiah,
  Receipt as ReceiptPhilippinePeso,
  Receipt as ReceiptSingaporeDollar,
  Receipt as ReceiptHongKongDollar,
  Receipt as ReceiptKoreanWon,
  Receipt as ReceiptTaiwanDollar,
  Receipt as ReceiptVietnameseDong,
  Receipt as ReceiptPakistaniRupee,
  Receipt as ReceiptSriLankanRupee,
  Receipt as ReceiptNepaleseRupee,
  Receipt as ReceiptMauritianRupee,
  Receipt as ReceiptSeychelloisRupee,
  Receipt as ReceiptMaldivianRufiyaa,
  Receipt as ReceiptAfghanAfghani,
  Receipt as ReceiptIranianRial,
  Receipt as ReceiptIraqiDinar,
  Receipt as ReceiptJordanianDinar,
  Receipt as ReceiptKuwaitiDinar,
  Receipt as ReceiptLibyanDinar,
  Receipt as ReceiptSyrianPound,
  Receipt as ReceiptYemeniRial,
  Receipt as ReceiptEgyptianPound,
  Receipt as ReceiptSudanesePound
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSocket } from "@/app/financial-tracker/hooks/useSocket";

// ✅ Token utility
const getToken = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : "";
};

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
  lastActive?: string;
  source: "erp" | "module";
  module?: "re" | "expense" | "both";
  isActive?: boolean;
  createdAt?: string;
}

interface Permission {
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  scope: "own" | "all" | "department";
  columns: Record<
    string,
    {
      view: boolean;
      edit: boolean;
    }
  >;
}

interface UserPermissions {
  [userId: string]: {
    re: Record<string, Permission>;
    expense: Record<string, Permission>;
  };
}

interface Entity {
  _id: string;
  module: "re" | "expense";
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  icon?: string;
  color?: string;
  createdAt?: string;
}

interface CustomField {
  _id: string;
  fieldKey: string;
  label: string;
  type: string;
  options?: string[];
  isSystem: boolean;
  isEnabled: boolean;
  required: boolean;
  order: number;
  createdAt?: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "BULK_UPDATE";
  entity: string;
  changes: any;
  timestamp: string;
  user?: {
    fullName: string;
    email: string;
  };
}

interface PermissionTemplate {
  _id: string;
  name: string;
  description: string;
  permissions: UserPermissions[string];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Permission summary for quick view
interface PermissionSummary {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userSource: string;
  totalAccess: number;
  totalCreate: number;
  totalEdit: number;
  totalDelete: number;
  totalColumns: number;
  hasPermissions: boolean;
  permissionScore: number;
  entities: {
    [entityId: string]: {
      name: string;
      access: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      scope: string;
    };
  };
}

// View modes
type ViewMode = "entities" | "fields" | "summary" | "timeline" | "matrix" | "templates";

// User source filter
type UserSource = "all" | "erp" | "module";

// Sort options
type SortOption =
  | "name"
  | "email"
  | "role"
  | "source"
  | "created"
  | "permissions"
  | "score";
type SortDirection = "asc" | "desc";

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [customFields, setCustomFields] = useState<
    Record<string, CustomField[]>
  >({});
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [permissionSummaries, setPermissionSummaries] = useState<
    Record<string, PermissionSummary>
  >({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [permissionTemplates, setPermissionTemplates] = useState<PermissionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [compareUser, setCompareUser] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<"re" | "expense">("re");
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [userSource, setUserSource] = useState<UserSource>("all");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSaving, setIsSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [liveSyncStatus, setLiveSyncStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const [bulkProgress, setBulkProgress] = useState<{ total: number; completed: number; failed: number } | null>(null);
  const [lastSavedPermissions, setLastSavedPermissions] = useState<UserPermissions>({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    erpUsers: 0,
    moduleUsers: 0,
    totalEntities: 0,
    totalFields: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalPermissions: 0,
    usersWithPermissions: 0,
    usersWithoutPermissions: 0,
  });

  // Initialize socket connection
  const { socket, isConnected, error: socketError, joinRoom, leaveRoom, emit } = useSocket('admin', 'permissions');

  // Update live sync status
  useEffect(() => {
    if (isConnected) {
      setLiveSyncStatus('connected');
    } else if (socketError) {
      setLiveSyncStatus('disconnected');
    } else {
      setLiveSyncStatus('connecting');
    }
  }, [isConnected, socketError]);

  // Listen for real-time permission updates
  useEffect(() => {
    if (!socket) return;

    // Join admin room for permission updates
    joinRoom('admin', 'permissions');

    // Listen for permission updates
    socket.on('permission:updated', (data: { userId: string, permissions: UserPermissions[string], timestamp: string }) => {
      console.log('🔔 Permission update received:', data);
      
      // Update permissions state
      setPermissions(prev => {
        const newPermissions = {
          ...prev,
          [data.userId]: data.permissions
        };
        
        // Update last saved permissions for this user
        setLastSavedPermissions(prevSaved => ({
          ...prevSaved,
          [data.userId]: data.permissions
        }));
        
        return newPermissions;
      });

      // Update summary for this user
      const user = users.find((u) => u._id === data.userId);
      if (user) {
        setPermissionSummaries(prev => ({
          ...prev,
          [data.userId]: createPermissionSummary(user, data.permissions)
        }));
      }

      // Show notification
      toast.success(`Permissions updated for ${users.find(u => u._id === data.userId)?.fullName || 'user'}`, {
        icon: '🔄',
        duration: 3000
      });

      // Update last synced time
      setLastUpdated(new Date());
    });

    // Listen for bulk updates
    socket.on('permission:bulk-updated', (data: { userIds: string[], timestamp: string }) => {
      console.log('🔔 Bulk permission update received:', data);
      
      // Refresh all affected users
      data.userIds.forEach(userId => {
        fetchUserPermissions(userId, true);
      });

      toast.success(`Bulk permissions updated for ${data.userIds.length} users`, {
        icon: '🔄',
        duration: 3000
      });
    });

    // Listen for permission matrix updates
    socket.on('permission:matrix-updated', () => {
      console.log('🔔 Permission matrix update received');
      fetchAllData(true);
    });

    return () => {
      leaveRoom('admin', 'permissions');
      socket.off('permission:updated');
      socket.off('permission:bulk-updated');
      socket.off('permission:matrix-updated');
    };
  }, [socket, users]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();

    // Auto refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAllData(true);
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  // Auto refresh when dependencies change
  useEffect(() => {
    if (selectedUser && autoRefresh) {
      fetchUserPermissions(selectedUser);
    }
  }, [selectedUser, autoRefresh]);

  const fetchAllData = async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);

      await Promise.all([
        fetchUsers(silent),
        fetchEntities(silent),
        fetchActivityLogs(silent),
        fetchPermissionTemplates(silent),
      ]);

      setLastUpdated(new Date());

      if (!silent) {
        toast.success("Data refreshed successfully");
      }
    } catch (error) {
      if (!silent) toast.error("Failed to load data");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Fetch permission templates
  const fetchPermissionTemplates = async (silent: boolean = false) => {
    try {
      const response = await fetch(
        "/financial-tracker/api/financial-tracker/admin/permission-templates",
        {
          headers: { Authorization: getToken() },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setPermissionTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching permission templates:", error);
    }
  };

  // Create permission template from current user's permissions
  const createPermissionTemplate = async () => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

    if (!templateFormData.name) {
      toast.error("Template name is required");
      return;
    }

    try {
      setIsSaving(true);

      const templatePermissions = permissions[selectedUser] || { re: {}, expense: {} };

      const response = await fetch(
        "/financial-tracker/api/financial-tracker/admin/permission-templates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify({
            name: templateFormData.name,
            description: templateFormData.description,
            permissions: templatePermissions,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to create template");

      toast.success("Permission template created successfully");
      setIsTemplateModalOpen(false);
      setTemplateFormData({ name: "", description: "" });
      fetchPermissionTemplates();
    } catch (error) {
      toast.error("Failed to create template");
    } finally {
      setIsSaving(false);
    }
  };

  // Apply template to user
  const applyTemplateToUser = async (templateId: string, userId: string) => {
    const template = permissionTemplates.find(t => t._id === templateId);
    if (!template) return;

    if (!confirm(`Apply template "${template.name}" to ${users.find(u => u._id === userId)?.fullName}?`)) return;

    // Update local state
    setPermissions(prev => ({
      ...prev,
      [userId]: template.permissions
    }));

    // Update summary
    const user = users.find((u) => u._id === userId);
    if (user) {
      setPermissionSummaries(prev => ({
        ...prev,
        [userId]: createPermissionSummary(user, template.permissions)
      }));
    }

    toast.success(`Template "${template.name}" applied`);

    // Auto-save to database
    await savePermissions(userId);
  };

  // Apply template to selected users (bulk)
  const applyTemplateToSelected = async () => {
    if (selectedUsers.length === 0) return;
    
    const template = permissionTemplates.find(t => t._id === selectedTemplate);
    if (!template) {
      toast.error("Please select a template");
      return;
    }

    if (!confirm(`Apply template "${template.name}" to ${selectedUsers.length} users?`)) return;

    setBulkProgress({ total: selectedUsers.length, completed: 0, failed: 0 });

    for (let i = 0; i < selectedUsers.length; i++) {
      const userId = selectedUsers[i];
      try {
        // Update local state
        setPermissions(prev => ({
          ...prev,
          [userId]: template.permissions
        }));

        const user = users.find((u) => u._id === userId);
        if (user) {
          setPermissionSummaries(prev => ({
            ...prev,
            [userId]: createPermissionSummary(user, template.permissions)
          }));
        }

        // Auto-save to database
        await savePermissions(userId);

        setBulkProgress(prev => ({ ...prev!, completed: prev!.completed + 1 }));
      } catch (error) {
        setBulkProgress(prev => ({ ...prev!, failed: prev!.failed + 1 }));
      }
    }

    toast.success(`Template applied to ${selectedUsers.length} users`);
    setBulkProgress(null);
    setBulkMode(false);
    setSelectedUsers([]);
  };

  // Fetch users from both ERP and Module
  const fetchUsers = async (silent: boolean = false) => {
    try {
      // Fetch ERP users
      const erpResponse = await fetch(
        "/financial-tracker/api/financial-tracker/admin/users",
        {
          headers: { Authorization: getToken() },
        },
      );

      // Fetch Module users
      const moduleResponse = await fetch(
        "/financial-tracker/api/financial-tracker/module-users",
        {
          headers: { Authorization: getToken() },
        },
      );

      const erpUsers = erpResponse.ok
        ? (await erpResponse.json()).users || []
        : [];
      const moduleUsers = moduleResponse.ok
        ? (await moduleResponse.json()).users || []
        : [];

      // Combine users with source identifier
      const allUsers: User[] = [
        ...erpUsers.map((u: any) => ({ ...u, source: "erp" as const })),
        ...moduleUsers.map((u: any) => ({ ...u, source: "module" as const })),
      ];

      // Sort users
      const sortedUsers = sortUsers(allUsers, sortBy, sortDirection);
      setUsers(sortedUsers);

      const activeUsers = allUsers.filter((u) => u.isActive !== false).length;

      // Fetch permissions for each user
      const perms: UserPermissions = {};
      const summaries: Record<string, PermissionSummary> = {};

      let usersWithPerms = 0;

      for (const user of allUsers) {
        const permResponse = await fetch(
          `/financial-tracker/api/financial-tracker/admin/users/${user._id}/permissions`,
          {
            headers: { Authorization: getToken() },
          },
        );
        if (permResponse.ok) {
          const permData = await permResponse.json();
          perms[user._id] = permData.permissions || { re: {}, expense: {} };

          // Create permission summary
          summaries[user._id] = createPermissionSummary(
            user,
            perms[user._id],
          );

          // Count users with any permissions
          const userPerms = perms[user._id]?.[selectedModule] || {};
          if (Object.keys(userPerms).length > 0) {
            usersWithPerms++;
          }
        }
      }

      setPermissions(perms);
      setLastSavedPermissions(perms); // Store last saved state
      setPermissionSummaries(summaries);

      // Calculate total permissions
      const totalPerms = Object.values(perms).reduce((acc, userPerms) => {
        const modulePerms = userPerms[selectedModule] || {};
        return acc + Object.keys(modulePerms).length;
      }, 0);

      setStats((prev) => ({
        ...prev,
        totalUsers: allUsers.length,
        erpUsers: erpUsers.length,
        moduleUsers: moduleUsers.length,
        activeUsers,
        inactiveUsers: allUsers.length - activeUsers,
        totalPermissions: totalPerms,
        usersWithPermissions: usersWithPerms,
        usersWithoutPermissions: allUsers.length - usersWithPerms,
      }));

      if (allUsers.length > 0 && !selectedUser) {
        setSelectedUser(allUsers[0]._id);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      if (!silent) toast.error("Failed to load users");
    }
  };

  // ✅ FIXED: Create permission summary for a user with proper typing
  const createPermissionSummary = (
    user: User,
    userPerms: UserPermissions[string],
  ): PermissionSummary => {
    const modulePerms = userPerms?.[selectedModule] || {};

    let totalAccess = 0;
    let totalCreate = 0;
    let totalEdit = 0;
    let totalDelete = 0;
    let totalColumns = 0;
    const entitiesSummary: {
      [entityId: string]: {
        name: string;
        access: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
        scope: string;
      };
    } = {};

    Object.entries(modulePerms).forEach(([entityId, perm]: [string, any]) => {
      const entity = entities.find((e: Entity) => e._id === entityId);

      if (perm.access) totalAccess++;
      if (perm.create) totalCreate++;
      if (perm.edit) totalEdit++;
      if (perm.delete) totalDelete++;

      if (perm.columns) {
        totalColumns += Object.keys(perm.columns).length;
      }

      entitiesSummary[entityId] = {
        name: entity?.name || entityId,
        access: perm.access || false,
        create: perm.create || false,
        edit: perm.edit || false,
        delete: perm.delete || false,
        scope: perm.scope || "own",
      };
    });

    // Calculate permission score for ranking
    const permissionScore = 
      totalAccess * 5 + 
      totalCreate * 3 + 
      totalEdit * 2 + 
      totalDelete * 2 + 
      totalColumns;

    return {
      userId: user._id,
      userName: user.fullName,
      userEmail: user.email,
      userRole: user.role,
      userSource: user.source,
      totalAccess,
      totalCreate,
      totalEdit,
      totalDelete,
      totalColumns,
      hasPermissions: totalAccess > 0 || totalCreate > 0 || totalEdit > 0 || totalDelete > 0,
      permissionScore,
      entities: entitiesSummary,
    };
  };

  // Fetch entities from database
  const fetchEntities = async (silent: boolean = false) => {
    try {
      const response = await fetch(
        "/financial-tracker/api/financial-tracker/entities?includeDisabled=true",
        {
          headers: { Authorization: getToken() },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch entities");

      const data = await response.json();
      setEntities(data.entities || []);
      setStats((prev) => ({
        ...prev,
        totalEntities: data.entities?.length || 0,
      }));

      // Fetch custom fields for each entity
      const fields: Record<string, CustomField[]> = {};
      for (const entity of data.entities || []) {
        const fieldResponse = await fetch(
          `/financial-tracker/api/financial-tracker/fields?module=${entity.module}&entityId=${entity._id}&includeDisabled=true`,
          { headers: { Authorization: getToken() } },
        );
        if (fieldResponse.ok) {
          const fieldData = await fieldResponse.json();
          fields[`${entity.module}-${entity._id}`] = fieldData.fields || [];
        }
      }
      setCustomFields(fields);

      const totalFields = Object.values(fields).reduce(
        (acc, curr) => acc + curr.length,
        0,
      );
      setStats((prev) => ({ ...prev, totalFields }));
    } catch (error) {
      console.error("Error fetching entities:", error);
      if (!silent) toast.error("Failed to fetch entities");
    }
  };

  // Fetch activity logs
  const fetchActivityLogs = async (silent: boolean = false) => {
    try {
      const response = await fetch(
        "/financial-tracker/api/financial-tracker/admin/activity-logs?entity=permissions",
        {
          headers: { Authorization: getToken() },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  // Fetch permissions for a specific user
  const fetchUserPermissions = async (
    userId: string,
    silent: boolean = false,
  ) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/admin/users/${userId}/permissions`,
        {
          headers: { Authorization: getToken() },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setPermissions((prev) => ({
          ...prev,
          [userId]: data.permissions || { re: {}, expense: {} },
        }));

        // Update summary
        const user = users.find((u) => u._id === userId);
        if (user) {
          setPermissionSummaries((prev) => ({
            ...prev,
            [userId]: createPermissionSummary(user, data.permissions),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    }
  };

  // Sort users
  const sortUsers = (
    users: User[],
    by: SortOption,
    direction: SortDirection,
  ) => {
    return [...users].sort((a, b) => {
      let comparison = 0;
      switch (by) {
        case "name":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = (a.role || "").localeCompare(b.role || "");
          break;
        case "source":
          comparison = a.source.localeCompare(b.source);
          break;
        case "created":
          comparison =
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime();
          break;
        case "permissions":
          const aPerms = permissionSummaries[a._id]?.totalAccess || 0;
          const bPerms = permissionSummaries[b._id]?.totalAccess || 0;
          comparison = aPerms - bPerms;
          break;
        case "score":
          const aScore = permissionSummaries[a._id]?.permissionScore || 0;
          const bScore = permissionSummaries[b._id]?.permissionScore || 0;
          comparison = aScore - bScore;
          break;
      }
      return direction === "asc" ? comparison : -comparison;
    });
  };

  // Get entities for selected module
  const filteredEntities = useMemo(() => {
    return entities.filter((e) => e.module === selectedModule && e.isEnabled);
  }, [entities, selectedModule]);

  // Get fields for a specific entity
  const getEntityFields = useCallback(
    (entityId: string) => {
      return customFields[`${selectedModule}-${entityId}`] || [];
    },
    [customFields, selectedModule],
  );

  // Update permission
  const updatePermission = useCallback(
    (
      userId: string,
      module: "re" | "expense",
      entity: string,
      field: keyof Permission,
      value: any,
    ) => {
      // Mark as pending
      setPendingChanges(prev => {
        const newMap = new Map(prev);
        newMap.set(`${userId}-${entity}-${String(field)}`, true);
        return newMap;
      });

      setPermissions((prev) => {
        const currentUserPerms = prev[userId]?.[module]?.[entity] || {
          access: false,
          create: false,
          edit: false,
          delete: false,
          scope: "own",
          columns: {},
        };

        return {
          ...prev,
          [userId]: {
            ...prev[userId],
            [module]: {
              ...prev[userId]?.[module],
              [entity]: {
                ...currentUserPerms,
                [field]: value,
              },
            },
          },
        };
      });

      // Update summary
      const user = users.find((u) => u._id === userId);
      if (user) {
        setPermissionSummaries((prev) => ({
          ...prev,
          [userId]: createPermissionSummary(user, permissions[userId]),
        }));
      }

      // Clear pending after update
      setTimeout(() => {
        setPendingChanges(prev => {
          const newMap = new Map(prev);
          newMap.delete(`${userId}-${entity}-${String(field)}`);
          return newMap;
        });
      }, 1000);
    },
    [users, permissions],
  );

  // Update column permission
  const updateColumnPermission = useCallback(
    (
      userId: string,
      module: "re" | "expense",
      entity: string,
      column: string,
      type: "view" | "edit",
      value: boolean,
    ) => {
      // Mark as pending
      setPendingChanges(prev => {
        const newMap = new Map(prev);
        newMap.set(`${userId}-${entity}-${column}-${type}`, true);
        return newMap;
      });

      setPermissions((prev) => {
        const currentUserPerms = prev[userId]?.[module]?.[entity] || {
          access: false,
          create: false,
          edit: false,
          delete: false,
          scope: "own",
          columns: {},
        };

        const currentColumnPerms = currentUserPerms.columns[column] || {
          view: true,
          edit: false,
        };

        return {
          ...prev,
          [userId]: {
            ...prev[userId],
            [module]: {
              ...prev[userId]?.[module],
              [entity]: {
                ...currentUserPerms,
                columns: {
                  ...currentUserPerms.columns,
                  [column]: {
                    ...currentColumnPerms,
                    [type]: value,
                  },
                },
              },
            },
          },
        };
      });

      // Update summary
      const user = users.find((u) => u._id === userId);
      if (user) {
        setPermissionSummaries((prev) => ({
          ...prev,
          [userId]: createPermissionSummary(user, permissions[userId]),
        }));
      }

      // Clear pending after update
      setTimeout(() => {
        setPendingChanges(prev => {
          const newMap = new Map(prev);
          newMap.delete(`${userId}-${entity}-${column}-${type}`);
          return newMap;
        });
      }, 1000);
    },
    [users, permissions],
  );

  // Toggle all columns for an entity
  const toggleAllColumns = useCallback(
    (
      userId: string,
      module: "re" | "expense",
      entity: string,
      type: "view" | "edit",
      value: boolean,
    ) => {
      const entityObj = entities.find((e) => e._id === entity);
      if (!entityObj) return;

      const fields = getEntityFields(entity);

      // System columns (basic fields)
      const systemColumns = ["name", "createdAt", "updatedAt", "createdBy"];
      systemColumns.forEach((col) => {
        updateColumnPermission(userId, module, entity, col, type, value);
      });

      // Custom fields
      fields.forEach((field) => {
        updateColumnPermission(
          userId,
          module,
          entity,
          field.fieldKey,
          type,
          value,
        );
      });
    },
    [entities, getEntityFields, updateColumnPermission],
  );

  // ✅ FIXED: Save permissions to database with persistence
  const savePermissions = async (userId: string) => {
    try {
      setIsSaving(true);

      const response = await fetch(
        `/financial-tracker/api/financial-tracker/admin/users/${userId}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify({ permissions: permissions[userId] }),
        },
      );

      if (!response.ok) throw new Error("Failed to save permissions");

      // Update last saved permissions
      setLastSavedPermissions(prev => ({
        ...prev,
        [userId]: permissions[userId]
      }));

      // Emit live update via socket
      if (socket && isConnected) {
        emit('permission:updated', {
          userId,
          permissions: permissions[userId],
          timestamp: new Date().toISOString()
        });
      }

      toast.success("Permissions saved successfully");
      fetchActivityLogs(); // Refresh activity logs

      // Update last saved timestamp
      setLastUpdated(new Date());

      return true;
    } catch (error) {
      toast.error("Failed to save permissions");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ FIXED: Bulk save permissions with proper persistence
  const bulkSavePermissions = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setIsSaving(true);
      setBulkProgress({ total: selectedUsers.length, completed: 0, failed: 0 });

      let successCount = 0;
      let failCount = 0;

      for (const userId of selectedUsers) {
        try {
          const response = await fetch(
            `/financial-tracker/api/financial-tracker/admin/users/${userId}/permissions`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: getToken(),
              },
              body: JSON.stringify({ permissions: permissions[userId] }),
            },
          );

          if (response.ok) {
            successCount++;
            setLastSavedPermissions(prev => ({
              ...prev,
              [userId]: permissions[userId]
            }));
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
        setBulkProgress(prev => ({ ...prev!, completed: prev!.completed + 1 }));
      }

      // Emit bulk update via socket
      if (socket && isConnected) {
        emit('permission:bulk-updated', {
          userIds: selectedUsers,
          timestamp: new Date().toISOString()
        });
      }

      toast.success(`Permissions saved: ${successCount} successful, ${failCount} failed`);

      setTimeout(() => {
        setBulkMode(false);
        setSelectedUsers([]);
        setBulkProgress(null);
      }, 2000);

      fetchActivityLogs();
      setLastUpdated(new Date());
    } catch (error) {
      toast.error("Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy permissions from another user
  const copyPermissions = async (
    sourceUserId: string,
    targetUserId: string,
  ) => {
    if (!confirm("Copy permissions from selected user?")) return;

    setPermissions((prev) => ({
      ...prev,
      [targetUserId]: JSON.parse(JSON.stringify(prev[sourceUserId])),
    }));

    // Update summary
    const user = users.find((u) => u._id === targetUserId);
    if (user) {
      setPermissionSummaries((prev) => ({
        ...prev,
        [targetUserId]: createPermissionSummary(
          user,
          permissions[sourceUserId],
        ),
      }));
    }

    toast.success("Permissions copied");
  };

  // Export permissions
  const exportPermissions = async () => {
    try {
      const data =
        exportFormat === "json"
          ? JSON.stringify(permissions, null, 2)
          : convertToCSV(permissions);

      const blob = new Blob([data], {
        type: exportFormat === "json" ? "application/json" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `permissions-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Permissions exported successfully");
    } catch (error) {
      toast.error("Failed to export permissions");
    }
  };

  // Import permissions
  const importPermissions = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            const imported = JSON.parse(content);

            // Validate imported data
            if (typeof imported === "object") {
              setPermissions((prev) => ({
                ...prev,
                ...imported,
              }));
              toast.success("Permissions imported successfully");
            } else {
              toast.error("Invalid import file format");
            }
          } catch (error) {
            toast.error("Failed to import permissions");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Convert permissions to CSV
  const convertToCSV = (perms: UserPermissions): string => {
    const rows: string[] = [
      "User ID,User Name,Module,Entity,Access,Create,Edit,Delete,Scope",
    ];

    Object.entries(perms).forEach(([userId, userPerms]) => {
      const user = users.find((u) => u._id === userId);
      const userName = user?.fullName || userId;

      Object.entries(userPerms).forEach(([module, modulePerms]) => {
        Object.entries(modulePerms).forEach(([entity, perm]) => {
          rows.push(
            `${userId},${userName},${module},${entity},${perm.access},${perm.create},${perm.edit},${perm.delete},${perm.scope}`,
          );
        });
      });
    });

    return rows.join("\n");
  };

  // Filter users by search and source
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSource = userSource === "all" || user.source === userSource;

      return matchesSearch && matchesSource;
    });

    return sortUsers(filtered, sortBy, sortDirection);
  }, [
    users,
    searchTerm,
    userSource,
    sortBy,
    sortDirection,
    permissionSummaries,
  ]);

  // Get users with permissions (for summary view)
  const usersWithPermissions = useMemo(() => {
    return filteredUsers.filter(u => permissionSummaries[u._id]?.hasPermissions);
  }, [filteredUsers, permissionSummaries]);

  const usersWithoutPermissions = useMemo(() => {
    return filteredUsers.filter(u => !permissionSummaries[u._id]?.hasPermissions);
  }, [filteredUsers, permissionSummaries]);

  // Toggle entity expansion
  const toggleEntity = (entity: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(entity)) {
        next.delete(entity);
      } else {
        next.add(entity);
      }
      return next;
    });
  };

  // Expand all entities
  const expandAll = () => {
    setExpandedEntities(new Set(filteredEntities.map((e) => e._id)));
  };

  // Collapse all entities
  const collapseAll = () => {
    setExpandedEntities(new Set());
  };

  // Check if user has unsaved changes
  const hasUnsavedChanges = (userId: string): boolean => {
    return JSON.stringify(permissions[userId]) !== JSON.stringify(lastSavedPermissions[userId]);
  };

  // Get current user permissions
  const currentUserPerms = selectedUser
    ? permissions[selectedUser]?.[selectedModule] || {}
    : {};
  const compareUserPerms = compareUser
    ? permissions[compareUser]?.[selectedModule] || {}
    : {};
  const selectedUserObj = users.find((u) => u._id === selectedUser);
  const compareUserObj = users.find((u) => u._id === compareUser);
  const selectedUserSummary = selectedUser
    ? permissionSummaries[selectedUser]
    : null;
  const selectedUserHasUnsaved = selectedUser ? hasUnsavedChanges(selectedUser) : false;

  // Calculate permission stats
  const permissionStats = useMemo(() => {
    let totalAccess = 0;
    let totalCreate = 0;
    let totalEdit = 0;
    let totalDelete = 0;
    let totalColumns = 0;

    Object.values(permissions).forEach((userPerms) => {
      Object.values(userPerms).forEach((modulePerms) => {
        Object.values(modulePerms).forEach((perm) => {
          if (perm.access) totalAccess++;
          if (perm.create) totalCreate++;
          if (perm.edit) totalEdit++;
          if (perm.delete) totalDelete++;
          totalColumns += Object.keys(perm.columns || {}).length;
        });
      });
    });

    return { totalAccess, totalCreate, totalEdit, totalDelete, totalColumns };
  }, [permissions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading permissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      {/* Enterprise Header - Compact Design */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-30"></div>
                <div className="relative p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Permission Management
                </h1>
                <p className="text-xs text-slate-500 flex items-center">
                  <span className="w-1 h-1 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                  ERP & Module users
                </p>
              </div>
            </div>

            {/* Live Sync Status - Compact */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-full">
              {liveSyncStatus === 'connected' ? (
                <>
                  <WifiIcon className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] text-green-600 font-medium">Live</span>
                </>
              ) : liveSyncStatus === 'connecting' ? (
                <>
                  <RadioTower className="h-3 w-3 text-yellow-500 animate-pulse" />
                  <span className="text-[10px] text-yellow-600 font-medium">Connecting</span>
                </>
              ) : (
                <>
                  <WifiOffIcon className="h-3 w-3 text-red-500" />
                  <span className="text-[10px] text-red-600 font-medium">Offline</span>
                </>
              )}
            </div>

            {/* Desktop Stats - Compact */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="p-0.5 bg-blue-100 rounded">
                    <Users className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-[10px] text-slate-500">Total</span>
                    <span className="text-xs font-bold text-blue-600">{stats.totalUsers}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="p-0.5 bg-emerald-100 rounded">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-[10px] text-slate-500">With</span>
                    <span className="text-xs font-bold text-emerald-600">{stats.usersWithPermissions}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="p-0.5 bg-amber-100 rounded">
                    <ShieldX className="h-3 w-3 text-amber-600" />
                  </div>
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-[10px] text-slate-500">Without</span>
                    <span className="text-xs font-bold text-amber-600">{stats.usersWithoutPermissions}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="p-0.5 bg-purple-100 rounded">
                    <LayoutTemplate className="h-3 w-3 text-purple-600" />
                  </div>
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-[10px] text-slate-500">Templates</span>
                    <span className="text-xs font-bold text-purple-600">{permissionTemplates.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm"
            >
              <Menu className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Search and Filters - Compact Grid */}
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-2">
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <select
                value={userSource}
                onChange={(e) => setUserSource(e.target.value as UserSource)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="all">All Users</option>
                <option value="erp">ERP Users</option>
                <option value="module">Module Users</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-2 py-1.5 text-xs border-r border-slate-200 focus:outline-none bg-white text-slate-700"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="source">Source</option>
                  <option value="permissions">Permissions</option>
                  <option value="score">Score</option>
                </select>
                <button
                  onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
                  className="px-1.5 py-1.5 hover:bg-slate-50"
                >
                  <ArrowUpDown className={`h-3 w-3 text-slate-500 transition-transform ${
                    sortDirection === "desc" ? "rotate-180" : ""
                  }`} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setSelectedModule("re")}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium transition-all ${
                      selectedModule === "re"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    RE
                  </button>
                  <button
                    onClick={() => setSelectedModule("expense")}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium transition-all ${
                      selectedModule === "expense"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    EXP
                  </button>
                </div>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setViewMode("summary")}
                    className={`flex-1 px-1.5 py-1.5 text-[10px] font-medium transition-all ${
                      viewMode === "summary"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setViewMode("entities")}
                    className={`flex-1 px-1.5 py-1.5 text-[10px] font-medium transition-all ${
                      viewMode === "entities"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Entities
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`flex-1 px-2 py-1.5 border rounded-lg transition-all text-xs ${
                    bulkMode
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <Users className="h-3 w-3 inline mr-1" />
                  {bulkMode ? "Bulk On" : "Bulk"}
                </button>
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-purple-50 bg-white shadow-sm"
                  title="Templates"
                >
                  <LayoutTemplate className="h-3.5 w-3.5 text-purple-500" />
                </button>
                <button
                  onClick={expandAll}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white shadow-sm"
                  title="Expand All"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => setShowPermissionMatrix(true)}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white shadow-sm"
                  title="Matrix"
                >
                  <Grid3x3 className="h-3.5 w-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => fetchAllData()}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white shadow-sm"
                  title="Refresh"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Last Updated Indicator - Compact */}
          <div className="mt-2 flex items-center justify-end text-[10px] text-slate-400">
            <Clock className="h-2.5 w-2.5 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-medium ${
                autoRefresh
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {autoRefresh ? "Auto ON" : "Auto OFF"}
            </button>
          </div>

          {/* Mobile Filters Panel */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden mt-3 space-y-3 p-3 bg-white rounded-lg border border-slate-200 shadow-lg animate-slideDown">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 flex items-center">
                  <Filter className="h-3 w-3 mr-1 text-blue-600" />
                  Quick Filters
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-1">User Source</label>
                <select
                  value={userSource}
                  onChange={(e) => setUserSource(e.target.value as UserSource)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="all">All Users</option>
                  <option value="erp">ERP Users</option>
                  <option value="module">Module Users</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-1">Module</label>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setSelectedModule("re")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium ${
                      selectedModule === "re"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    RE
                  </button>
                  <button
                    onClick={() => setSelectedModule("expense")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium ${
                      selectedModule === "expense"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-1">View</label>
                <div className="grid grid-cols-5 gap-1">
                  <button
                    onClick={() => setViewMode("summary")}
                    className={`p-1.5 border rounded text-[10px] font-medium ${
                      viewMode === "summary"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Sum
                  </button>
                  <button
                    onClick={() => setViewMode("entities")}
                    className={`p-1.5 border rounded text-[10px] font-medium ${
                      viewMode === "entities"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Ent
                  </button>
                  <button
                    onClick={() => setViewMode("fields")}
                    className={`p-1.5 border rounded text-[10px] font-medium ${
                      viewMode === "fields"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Fld
                  </button>
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`p-1.5 border rounded text-[10px] font-medium ${
                      viewMode === "timeline"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Time
                  </button>
                  <button
                    onClick={() => setViewMode("templates")}
                    className={`p-1.5 border rounded text-[10px] font-medium ${
                      viewMode === "templates"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Temp
                  </button>
                </div>
              </div>

              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`w-full p-2 border rounded-lg text-xs font-medium ${
                  bulkMode
                    ? "bg-blue-600 text-white border-blue-400"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                <Users className="h-3 w-3 inline mr-1" />
                {bulkMode ? "Disable Bulk" : "Enable Bulk"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Permission Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-scaleIn border border-slate-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-4 py-3 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <LayoutTemplate className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-white">
                    Permission Templates
                  </h2>
                </div>
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Create Template Form */}
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-xs font-medium text-slate-900 mb-2">Create from Current User</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Template Name"
                    value={templateFormData.name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-purple-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={templateFormData.description}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                    rows={2}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={createPermissionTemplate}
                    disabled={isSaving || !templateFormData.name || !selectedUser}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3 inline mr-1" />
                    Create Template
                  </button>
                </div>
              </div>

              {/* Templates List */}
              <h3 className="text-xs font-medium text-slate-900 mb-2">Existing Templates</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {permissionTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="p-2 border border-slate-200 rounded-lg hover:border-purple-300 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedTemplate(template._id);
                      if (selectedUser) {
                        applyTemplateToUser(template._id, selectedUser);
                        setIsTemplateModalOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <LayoutTemplate className="h-3.5 w-3.5 text-purple-600" />
                        <h4 className="text-xs font-medium text-slate-900">{template.name}</h4>
                      </div>
                      {selectedTemplate === template._id && (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      )}
                    </div>
                    {template.description && (
                      <p className="text-[10px] text-slate-500 mb-1">{template.description}</p>
                    )}
                    <div className="flex items-center space-x-1 text-[8px] text-slate-400">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Modal */}
      {showPermissionMatrix && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto animate-scaleIn border border-slate-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-4 py-3 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <Grid3x3 className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-white">
                    Permission Matrix
                  </h2>
                </div>
                <button
                  onClick={() => setShowPermissionMatrix(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase">User</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase">Source</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-600 uppercase">Status</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-600 uppercase">Access</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-600 uppercase">Create</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-600 uppercase">Edit</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-600 uppercase">Delete</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-600 uppercase">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.slice(0, 15).map((user) => {
                      const summary = permissionSummaries[user._id];
                      return (
                        <tr key={user._id} className="hover:bg-slate-50">
                          <td className="px-3 py-2">
                            <div className="font-medium text-slate-900 text-xs">{user.fullName}</div>
                            <div className="text-[8px] text-slate-500">{user.email}</div>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 text-[8px] rounded-full ${
                              user.source === "erp" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              {user.source}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {summary?.hasPermissions ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                            )}
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-medium text-blue-600">
                            {summary?.totalAccess || 0}
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-medium text-green-600">
                            {summary?.totalCreate || 0}
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-medium text-amber-600">
                            {summary?.totalEdit || 0}
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-medium text-red-600">
                            {summary?.totalDelete || 0}
                          </td>
                          <td className="px-3 py-2 text-center text-xs font-bold text-purple-600">
                            {summary?.permissionScore || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as "json" | "csv")}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <button
                  onClick={exportPermissions}
                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs hover:from-blue-700 hover:to-blue-800 shadow-sm flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* User List */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                  Users ({filteredUsers.length})
                </h3>
                {compareUser && (
                  <button
                    onClick={() => setCompareUser(null)}
                    className="text-[10px] text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredUsers.map((user) => {
                const isSelected = selectedUser === user._id;
                const isCompared = compareUser === user._id;
                const summary = permissionSummaries[user._id];
                const hasUnsaved = hasUnsavedChanges(user._id);

                return (
                  <div
                    key={user._id}
                    className={`p-3 cursor-pointer hover:bg-slate-50 transition-all ${
                      isSelected ? "bg-blue-50 border-l-2 border-blue-600" : ""
                    } ${isCompared ? "bg-purple-50 border-l-2 border-purple-600" : ""} ${
                      bulkMode ? "flex items-start space-x-2" : ""
                    } ${hasUnsaved ? "bg-amber-50/30" : ""}`}
                    onClick={() => {
                      if (bulkMode) return;
                      if (isSelected && !isCompared && selectedUser) {
                        setCompareUser(user._id);
                      } else {
                        setSelectedUser(user._id);
                        setCompareUser(null);
                      }
                    }}
                  >
                    {bulkMode && (
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                          }
                        }}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <h3 className="text-xs font-semibold text-slate-900 truncate">
                              {user.fullName}
                            </h3>
                            <span className={`px-1 py-0.5 text-[8px] rounded-full ${
                              user.source === "erp" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              {user.source === "erp" ? "ERP" : "MOD"}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                        </div>
                        {!bulkMode && (isSelected || isCompared) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              savePermissions(user._id);
                            }}
                            disabled={isSaving || !hasUnsaved}
                            className={`p-1 rounded transition-colors ${
                              hasUnsaved
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-slate-300"
                            }`}
                            title={hasUnsaved ? "Save changes" : "No unsaved changes"}
                          >
                            <Save className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Permission Badges */}
                      {summary && (
                        <div className="flex items-center mt-1 space-x-1 flex-wrap gap-y-1">
                          {summary.hasPermissions ? (
                            <>
                              <span className="px-1 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] rounded-full flex items-center">
                                <CheckCircle className="h-2 w-2 mr-0.5" />
                                Has
                              </span>
                              {summary.totalAccess > 0 && (
                                <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-[8px] rounded-full">
                                  A:{summary.totalAccess}
                                </span>
                              )}
                              {summary.totalCreate > 0 && (
                                <span className="px-1 py-0.5 bg-green-100 text-green-700 text-[8px] rounded-full">
                                  C:{summary.totalCreate}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="px-1 py-0.5 bg-slate-100 text-slate-600 text-[8px] rounded-full flex items-center">
                              <XCircle className="h-2 w-2 mr-0.5" />
                              No Permissions
                            </span>
                          )}
                          {hasUnsaved && (
                            <span className="px-1 py-0.5 bg-amber-100 text-amber-700 text-[8px] rounded-full">
                              Unsaved
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center mt-1 space-x-1">
                        <span className="text-[8px] bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full capitalize border border-slate-200">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-9">
            {!bulkMode && !selectedUser ? (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md ring-2 ring-white">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
                  Select a User
                </h3>
                <p className="text-xs text-slate-500">
                  Choose a user from the list to manage their permissions
                </p>
              </div>
            ) : bulkMode ? (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
                <Users className="h-10 w-10 mx-auto text-blue-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">Bulk Mode</h3>
                <p className="text-xs text-slate-500 mb-3">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
                </p>
                {bulkProgress ? (
                  <div className="space-y-2 max-w-xs mx-auto">
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${(bulkProgress.completed / bulkProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      {bulkProgress.completed}/{bulkProgress.total}
                      {bulkProgress.failed > 0 && ` (${bulkProgress.failed} failed)`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-xs mx-auto">
                    <div className="bg-slate-50 p-3 rounded-lg text-left">
                      <h4 className="text-xs font-medium text-slate-700 mb-2">Bulk Actions</h4>
                      <div className="space-y-2">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                        >
                          <option value="">Select template</option>
                          {permissionTemplates.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={applyTemplateToSelected}
                          disabled={!selectedTemplate}
                          className="w-full px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 disabled:opacity-50"
                        >
                          <LayoutTemplate className="h-3 w-3 inline mr-1" />
                          Apply Template
                        </button>
                        <button
                          onClick={bulkSavePermissions}
                          disabled={isSaving}
                          className="w-full px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-xs hover:from-green-700 hover:to-green-800 shadow-sm font-medium"
                        >
                          <Save className="h-3 w-3 inline mr-1" />
                          Save All ({selectedUsers.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* User Info Header */}
                <div className="mb-4 bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {selectedUserObj?.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">
                            {selectedUserObj?.fullName}
                          </h2>
                          <span className={`px-2 py-0.5 text-[9px] rounded-full ${
                            selectedUserObj?.source === "erp" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {selectedUserObj?.source === "erp" ? "ERP" : "Module"}
                          </span>
                          {selectedUserSummary?.hasPermissions ? (
                            <span className="px-2 py-0.5 text-[9px] bg-emerald-100 text-emerald-700 rounded-full flex items-center">
                              <CheckCircle className="h-2 w-2 mr-0.5" />
                              Has Permissions
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] bg-slate-100 text-slate-600 rounded-full flex items-center">
                              <XCircle className="h-2 w-2 mr-0.5" />
                              No Permissions
                            </span>
                          )}
                          {selectedUserHasUnsaved && (
                            <span className="px-2 py-0.5 text-[9px] bg-amber-100 text-amber-700 rounded-full">
                              Unsaved Changes
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {selectedUserObj?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => savePermissions(selectedUser)}
                        disabled={isSaving || !selectedUserHasUnsaved}
                        className={`px-3 py-1.5 text-xs rounded-lg flex items-center transition-all ${
                          selectedUserHasUnsaved
                            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm hover:from-green-700 hover:to-green-800"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={exportPermissions}
                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                        title="Export"
                      >
                        <Download className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[8px] text-slate-500">Access</p>
                      <p className="text-xs font-bold text-blue-600">
                        {selectedUserSummary?.totalAccess || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[8px] text-slate-500">Create</p>
                      <p className="text-xs font-bold text-green-600">
                        {selectedUserSummary?.totalCreate || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[8px] text-slate-500">Edit</p>
                      <p className="text-xs font-bold text-amber-600">
                        {selectedUserSummary?.totalEdit || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[8px] text-slate-500">Delete</p>
                      <p className="text-xs font-bold text-red-600">
                        {selectedUserSummary?.totalDelete || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[8px] text-slate-500">Score</p>
                      <p className="text-xs font-bold text-purple-600">
                        {selectedUserSummary?.permissionScore || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Mode Content */}
                {viewMode === "summary" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Permission Stats */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                      <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center">
                        <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                        Permission Statistics
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs text-slate-600">Access Grants</span>
                          <span className="text-sm font-bold text-blue-600">{permissionStats.totalAccess}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs text-slate-600">Create Permissions</span>
                          <span className="text-sm font-bold text-green-600">{permissionStats.totalCreate}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs text-slate-600">Edit Permissions</span>
                          <span className="text-sm font-bold text-amber-600">{permissionStats.totalEdit}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs text-slate-600">Delete Permissions</span>
                          <span className="text-sm font-bold text-red-600">{permissionStats.totalDelete}</span>
                        </div>
                      </div>
                    </div>

                    {/* User Distribution */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                      <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center">
                        <PieChart className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                        User Distribution
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">ERP Users</span>
                            <span className="text-xs font-medium text-slate-900">{stats.erpUsers}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-emerald-500 h-1.5 rounded-full" 
                              style={{ width: `${(stats.erpUsers / stats.totalUsers) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">Module Users</span>
                            <span className="text-xs font-medium text-slate-900">{stats.moduleUsers}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-purple-500 h-1.5 rounded-full" 
                              style={{ width: `${(stats.moduleUsers / stats.totalUsers) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">With Permissions</span>
                            <span className="text-xs font-medium text-slate-900">{stats.usersWithPermissions}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-500 h-1.5 rounded-full" 
                              style={{ width: `${(stats.usersWithPermissions / stats.totalUsers) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Permission Holders */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                      <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center">
                        <Award className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                        Top Permission Holders
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-500">User</th>
                              <th className="px-3 py-2 text-center text-[10px] font-medium text-slate-500">Access</th>
                              <th className="px-3 py-2 text-center text-[10px] font-medium text-slate-500">Create</th>
                              <th className="px-3 py-2 text-center text-[10px] font-medium text-slate-500">Edit</th>
                              <th className="px-3 py-2 text-center text-[10px] font-medium text-slate-500">Delete</th>
                              <th className="px-3 py-2 text-center text-[10px] font-medium text-slate-500">Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {users
                              .filter(u => permissionSummaries[u._id]?.hasPermissions)
                              .sort((a, b) => (permissionSummaries[b._id]?.permissionScore || 0) - (permissionSummaries[a._id]?.permissionScore || 0))
                              .slice(0, 5)
                              .map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-slate-900 text-xs">{user.fullName}</div>
                                    <div className="text-[8px] text-slate-500">{user.email}</div>
                                  </td>
                                  <td className="px-3 py-2 text-center text-xs text-blue-600">
                                    {permissionSummaries[user._id]?.totalAccess || 0}
                                  </td>
                                  <td className="px-3 py-2 text-center text-xs text-green-600">
                                    {permissionSummaries[user._id]?.totalCreate || 0}
                                  </td>
                                  <td className="px-3 py-2 text-center text-xs text-amber-600">
                                    {permissionSummaries[user._id]?.totalEdit || 0}
                                  </td>
                                  <td className="px-3 py-2 text-center text-xs text-red-600">
                                    {permissionSummaries[user._id]?.totalDelete || 0}
                                  </td>
                                  <td className="px-3 py-2 text-center text-xs font-bold text-purple-600">
                                    {permissionSummaries[user._id]?.permissionScore || 0}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "entities" && (
                  <div className="space-y-3">
                    {filteredEntities.map((entity) => {
                      const entityPerms = currentUserPerms[entity._id] || {
                        access: false,
                        create: false,
                        edit: false,
                        delete: false,
                        scope: "own",
                        columns: {},
                      };
                      const isExpanded = expandedEntities.has(entity._id);
                      const fields = getEntityFields(entity._id);
                      const hasUnsavedEntity = hasUnsavedChanges(selectedUser);

                      return (
                        <div
                          key={entity._id}
                          className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all ${
                            hasUnsavedEntity ? 'border-amber-300' : ''
                          }`}
                        >
                          {/* Entity Header */}
                          <div
                            className="bg-gradient-to-r from-slate-50 to-white px-4 py-2.5 flex items-center justify-between cursor-pointer hover:from-slate-100"
                            onClick={() => toggleEntity(entity._id)}
                          >
                            <div className="flex items-center space-x-3">
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                              )}
                              <div className="p-1.5 bg-blue-100 rounded-lg border border-blue-200">
                                <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold text-slate-900">
                                  {entity.name}
                                </h3>
                                <p className="text-[9px] text-slate-500">{entity.entityKey}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 text-xs">
                                <input
                                  type="checkbox"
                                  checked={entityPerms.access}
                                  onChange={(e) => {
                                    updatePermission(
                                      selectedUser,
                                      selectedModule,
                                      entity._id,
                                      "access",
                                      e.target.checked,
                                    );
                                  }}
                                  className="h-3 w-3 rounded border-slate-300 text-blue-600"
                                />
                                <span className="text-[9px] font-medium text-slate-700">Access</span>
                              </label>
                            </div>
                          </div>

                          {/* Permission Details */}
                          {isExpanded && entityPerms.access && (
                            <div className="p-4 border-t border-slate-200">
                              {/* CRUD Permissions */}
                              <div className="mb-4">
                                <h4 className="text-[9px] font-semibold text-slate-700 mb-2">Record Permissions</h4>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    { key: "create", label: "Create", color: "green" },
                                    { key: "edit", label: "Edit", color: "blue" },
                                    { key: "delete", label: "Delete", color: "red" },
                                  ].map(({ key, label, color }) => (
                                    <label key={key} className="flex items-center space-x-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-${color}-300">
                                      <input
                                        type="checkbox"
                                        checked={entityPerms[key as keyof Permission] as boolean}
                                        onChange={(e) => updatePermission(
                                          selectedUser,
                                          selectedModule,
                                          entity._id,
                                          key as keyof Permission,
                                          e.target.checked,
                                        )}
                                        className="h-3 w-3 rounded border-slate-300 text-${color}-600"
                                      />
                                      <span className="text-[8px] font-medium text-slate-700">{label}</span>
                                    </label>
                                  ))}
                                  <select
                                    value={entityPerms.scope}
                                    onChange={(e) => updatePermission(
                                      selectedUser,
                                      selectedModule,
                                      entity._id,
                                      "scope",
                                      e.target.value as "own" | "all" | "department",
                                    )}
                                    className="col-span-1 px-1.5 py-1 text-[8px] border border-slate-200 rounded-lg bg-white"
                                  >
                                    <option value="own">Own</option>
                                    <option value="all">All</option>
                                  </select>
                                </div>
                              </div>

                              {/* Column Permissions */}
                              <div>
                                <h4 className="text-[9px] font-semibold text-slate-700 mb-2">Column Permissions</h4>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-slate-50">
                                      <tr>
                                        <th className="px-3 py-1.5 text-left text-[8px] font-medium text-slate-600">Column</th>
                                        <th className="px-3 py-1.5 text-center text-[8px] font-medium text-slate-600">View</th>
                                        <th className="px-3 py-1.5 text-center text-[8px] font-medium text-slate-600">Edit</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {["name", "createdAt", "updatedAt"].map((col) => {
                                        const columnPerms = entityPerms.columns?.[col] || { view: true, edit: false };
                                        return (
                                          <tr key={col} className="hover:bg-slate-50">
                                            <td className="px-3 py-1.5 text-[9px] text-slate-900 capitalize">
                                              {col.replace(/([A-Z])/g, " $1").trim()}
                                            </td>
                                            <td className="px-3 py-1.5 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.view}
                                                onChange={(e) => updateColumnPermission(
                                                  selectedUser,
                                                  selectedModule,
                                                  entity._id,
                                                  col,
                                                  "view",
                                                  e.target.checked,
                                                )}
                                                className="h-3 w-3 rounded border-slate-300 text-blue-600"
                                              />
                                            </td>
                                            <td className="px-3 py-1.5 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.edit}
                                                onChange={(e) => updateColumnPermission(
                                                  selectedUser,
                                                  selectedModule,
                                                  entity._id,
                                                  col,
                                                  "edit",
                                                  e.target.checked,
                                                )}
                                                disabled={!columnPerms.view}
                                                className="h-3 w-3 rounded border-slate-300 text-green-600 disabled:opacity-50"
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === "templates" && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center">
                      <LayoutTemplate className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                      Apply Template
                    </h3>
                    <div className="space-y-3">
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                      >
                        <option value="">Select a template</option>
                        {permissionTemplates.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                      {selectedTemplate && (
                        <button
                          onClick={() => applyTemplateToUser(selectedTemplate, selectedUser)}
                          className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs hover:from-purple-700 hover:to-purple-800"
                        >
                          <CopyCheck className="h-3 w-3 inline mr-1" />
                          Apply Template
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slideDown { animation: slideDown 0.15s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.15s ease-out; }
      `}</style>
    </div>
  );
}