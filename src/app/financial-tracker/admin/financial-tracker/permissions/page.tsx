// src/app/admin/financial-tracker/permissions/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
   LayoutTemplate     ,
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
  ShieldMinus
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
  permissions: {
    re: Record<string, Permission>;
    expense: Record<string, Permission>;
  };
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
    permissions: { re: {}, expense: {} }
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
    socket.on('permission:updated', (data: { userId: string, permissions: any, timestamp: string }) => {
      console.log('🔔 Permission update received:', data);
      
      // Update permissions state
      setPermissions(prev => ({
        ...prev,
        [data.userId]: data.permissions
      }));

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

  // Create permission template
  const createPermissionTemplate = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(
        "/financial-tracker/api/financial-tracker/admin/permission-templates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify(templateFormData),
        },
      );

      if (!response.ok) throw new Error("Failed to create template");

      toast.success("Permission template created successfully");
      setIsTemplateModalOpen(false);
      setTemplateFormData({ name: "", description: "", permissions: { re: {}, expense: {} } });
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

        setBulkProgress(prev => ({ ...prev!, completed: prev!.completed + 1 }));
      } catch (error) {
        setBulkProgress(prev => ({ ...prev!, failed: prev!.failed + 1 }));
      }
    }

    toast.success(`Template applied to ${selectedUsers.length} users`);
    setBulkProgress(null);
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
            permData.permissions,
          );

          // Count users with any permissions
          const userPerms = permData.permissions?.[selectedModule] || {};
          if (Object.keys(userPerms).length > 0) {
            usersWithPerms++;
          }
        }
      }

      setPermissions(perms);
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
    userPerms: any,
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
      // ✅ FIXED: Properly find entity by ID
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

      // Calculate total fields
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

  // Save permissions for a user with live sync
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
    } catch (error) {
      toast.error("Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk save permissions with live sync (using new bulk API)
  const bulkSavePermissions = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setIsSaving(true);
      setBulkProgress({ total: selectedUsers.length, completed: 0, failed: 0 });

      const response = await fetch(
        "/financial-tracker/api/financial-tracker/admin/users/bulk-permissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify({
            userIds: selectedUsers,
            permissions: permissions[selectedUsers[0]], // Use first user's permissions as template
            operation: "replace"
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to save permissions");

      const data = await response.json();

      // Emit bulk update via socket
      if (socket && isConnected) {
        emit('permission:bulk-updated', {
          userIds: selectedUsers,
          timestamp: new Date().toISOString()
        });
      }

      setBulkProgress({ 
        total: selectedUsers.length, 
        completed: data.results.success.length, 
        failed: data.results.failed.length 
      });

      toast.success(`Permissions saved: ${data.results.success.length} successful, ${data.results.failed.length} failed`);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-200">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading permissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Enterprise Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Permission Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                  Manage permissions for ERP & Module users
                </p>
              </div>
            </div>

            {/* Live Sync Status */}
            <div className="hidden lg:flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full">
              {liveSyncStatus === 'connected' ? (
                <>
                  <WifiIcon className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Live Sync Active</span>
                </>
              ) : liveSyncStatus === 'connecting' ? (
                <>
                  <RadioTower className="h-4 w-4 text-yellow-500 animate-pulse" />
                  <span className="text-xs text-yellow-600 font-medium">Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOffIcon className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-600 font-medium">Offline</span>
                </>
              )}
            </div>

            {/* Desktop Stats */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Users</span>
                    <span className="text-xl font-bold text-blue-600 block leading-5">
                      {stats.totalUsers}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Active</span>
                    <span className="text-xl font-bold text-green-600 block leading-5">
                      {stats.activeUsers}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">With Permissions</span>
                    <span className="text-xl font-bold text-emerald-600 block leading-5">
                      {stats.usersWithPermissions}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <ShieldX className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Without Permissions</span>
                    <span className="text-xl font-bold text-amber-600 block leading-5">
                      {stats.usersWithoutPermissions}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <LayoutTemplate className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Templates</span>
                    <span className="text-xl font-bold text-purple-600 block leading-5">
                      {permissionTemplates.length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Entities</span>
                    <span className="text-xl font-bold text-indigo-600 block leading-5">
                      {stats.totalEntities}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Source
              </label>
              <select
                value={userSource}
                onChange={(e) => setUserSource(e.target.value as UserSource)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium"
              >
                <option value="all">All Users</option>
                <option value="erp">ERP Users</option>
                <option value="module">Module Users</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-sm">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-3 py-3 text-sm border-r-2 border-gray-200 focus:outline-none bg-white text-gray-700"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="source">Source</option>
                  <option value="created">Created</option>
                  <option value="permissions">Permissions Count</option>
                  <option value="score">Permission Score</option>
                </select>
                <button
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc",
                    )
                  }
                  className="px-3 py-3 hover:bg-gray-50 transition-colors"
                >
                  <ArrowUpDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      sortDirection === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Module & View
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-sm">
                  <button
                    onClick={() => setSelectedModule("re")}
                    className={`flex-1 px-3 py-3 text-sm font-medium transition-all ${
                      selectedModule === "re"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    RE
                  </button>
                  <button
                    onClick={() => setSelectedModule("expense")}
                    className={`flex-1 px-3 py-3 text-sm font-medium transition-all ${
                      selectedModule === "expense"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    EXP
                  </button>
                </div>
                <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-sm">
                  <button
                    onClick={() => setViewMode("entities")}
                    className={`flex-1 px-2 py-3 text-xs font-medium transition-all ${
                      viewMode === "entities"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Entities
                  </button>
                  <button
                    onClick={() => setViewMode("fields")}
                    className={`flex-1 px-2 py-3 text-xs font-medium transition-all ${
                      viewMode === "fields"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Fields
                  </button>
                  <button
                    onClick={() => setViewMode("summary")}
                    className={`flex-1 px-2 py-3 text-xs font-medium transition-all ${
                      viewMode === "summary"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`flex-1 px-2 py-3 text-xs font-medium transition-all ${
                      viewMode === "timeline"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Timeline
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                &nbsp;
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`flex-1 px-3 py-3 border-2 rounded-xl transition-all text-sm ${
                    bulkMode
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400 shadow-lg shadow-blue-500/25"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-1" />
                  {bulkMode ? "Bulk On" : "Bulk"}
                </button>
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-purple-50 bg-white shadow-sm"
                  title="Permission Templates"
                >
                  <LayoutTemplate className="h-5 w-5 text-purple-500" />
                </button>
                <button
                  onClick={expandAll}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white shadow-sm"
                  title="Expand All"
                >
                  <Maximize2 className="h-5 w-5 text-gray-500" />
                </button>
                <button
                  onClick={collapseAll}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white shadow-sm"
                  title="Collapse All"
                >
                  <Minimize2 className="h-5 w-5 text-gray-500" />
                </button>
                <button
                  onClick={() => setShowPermissionMatrix(!showPermissionMatrix)}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white shadow-sm"
                  title="Permission Matrix"
                >
                  <Grid3x3 className="h-5 w-5 text-gray-500" />
                </button>
                <button
                  onClick={() => fetchAllData()}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white shadow-sm"
                  title="Refresh"
                >
                  <RefreshCw className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Last Updated Indicator */}
          <div className="mt-2 flex items-center justify-end text-xs text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`ml-2 px-2 py-1 rounded-lg text-xs ${
                autoRefresh
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </button>
          </div>

          {/* Mobile Filters Panel */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden mt-4 space-y-4 p-4 bg-white rounded-xl border-2 border-gray-200 shadow-lg animate-slideDown">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-blue-600" />
                  Quick Filters
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Source
                </label>
                <select
                  value={userSource}
                  onChange={(e) => setUserSource(e.target.value as UserSource)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-gray-700"
                >
                  <option value="all">All Users</option>
                  <option value="erp">ERP Users</option>
                  <option value="module">Module Users</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module
                </label>
                <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-200">
                  <button
                    onClick={() => setSelectedModule("re")}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                      selectedModule === "re"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    RE
                  </button>
                  <button
                    onClick={() => setSelectedModule("expense")}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                      selectedModule === "expense"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => setViewMode("entities")}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === "entities"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Entities
                  </button>
                  <button
                    onClick={() => setViewMode("fields")}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === "fields"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Fields
                  </button>
                  <button
                    onClick={() => setViewMode("summary")}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === "summary"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === "timeline"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setViewMode("templates")}
                    className={`p-2 border-2 rounded-xl text-xs font-medium ${
                      viewMode === "templates"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Templates
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={expandAll}
                  className="flex-1 p-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white text-sm"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="flex-1 p-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white text-sm"
                >
                  Collapse All
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Auto-refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${
                    autoRefresh
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {autoRefresh ? "ON" : "OFF"}
                </button>
              </div>

              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`w-full p-3 border-2 rounded-xl font-medium ${
                  bulkMode
                    ? "bg-blue-600 text-white border-blue-400"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                {bulkMode ? "Disable Bulk Mode" : "Enable Bulk Mode"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Permission Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border-2 border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-xl p-2">
                    <LayoutTemplate className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Permission Templates
                  </h2>
                </div>
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Create Template Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Create New Template</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Template Name"
                    value={templateFormData.name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                  />
                  <textarea
                    placeholder="Description"
                    value={templateFormData.description}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                  />
                  <button
                    onClick={createPermissionTemplate}
                    disabled={isSaving || !templateFormData.name}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Create Template
                  </button>
                </div>
              </div>

              {/* Templates List */}
              <h3 className="font-medium text-gray-900 mb-3">Existing Templates</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {permissionTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all cursor-pointer"
                    onClick={() => setSelectedTemplate(template._id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <LayoutTemplate className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                      </div>
                      {selectedTemplate === template._id && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bulk Apply */}
              {bulkMode && selectedUsers.length > 0 && selectedTemplate && (
                <div className="mt-6 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={applyTemplateToSelected}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all"
                  >
                    <CopyCheck className="h-4 w-4 inline mr-2" />
                    Apply Template to {selectedUsers.length} Selected Users
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Modal */}
      {showPermissionMatrix && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-scaleIn border-2 border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-xl p-2">
                    <Grid3x3 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Permission Matrix
                  </h2>
                </div>
                <button
                  onClick={() => setShowPermissionMatrix(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Role
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Has Permissions
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase"
                        colSpan={4}
                      >
                        Permissions
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Score
                      </th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                        Access
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                        Create
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                        Edit
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                        Delete
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                        Columns
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200">
                    {filteredUsers.slice(0, 20).map((user) => {
                      const summary = permissionSummaries[user._id];

                      return (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.source === "erp"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {user.source}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                            {user.role}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {summary?.hasPermissions ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-blue-600">
                              {summary?.totalAccess || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-green-600">
                              {summary?.totalCreate || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-amber-600">
                              {summary?.totalEdit || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-red-600">
                              {summary?.totalDelete || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-purple-600">
                              {summary?.totalColumns || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-bold text-indigo-600">
                              {summary?.permissionScore || 0}
                            </span>
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
                  onChange={(e) =>
                    setExportFormat(e.target.value as "json" | "csv")
                  }
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <button
                  onClick={exportPermissions}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Matrix
                </button>
                <button
                  onClick={importPermissions}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/25 flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User List */}
          <div className="lg:col-span-3 bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
            <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Users ({filteredUsers.length})
                </h3>
                {compareUser && (
                  <button
                    onClick={() => setCompareUser(null)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear Compare
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y-2 divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredUsers.map((user) => {
                const isSelected = selectedUser === user._id;
                const isCompared = compareUser === user._id;
                const summary = permissionSummaries[user._id];
                const hasPending = pendingChanges.has(`${user._id}-any`);

                return (
                  <div
                    key={user._id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                      isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""
                    } ${isCompared ? "bg-purple-50 border-l-4 border-purple-600" : ""} ${
                      bulkMode ? "flex items-start space-x-3" : ""
                    } ${hasPending ? "opacity-50" : ""}`}
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
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== user._id),
                            );
                          }
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {user.fullName}
                            </h3>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                user.source === "erp"
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-purple-100 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {user.source === "erp" ? "ERP" : "Module"}
                            </span>
                            {user.source === "module" && user.module && (
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  user.module === "re"
                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {user.module === "re" ? "RE" : "Expense"}
                              </span>
                            )}
                            {user.isActive === false && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        {!bulkMode && (isSelected || isCompared) && (
                          <button
                            onClick={() => savePermissions(user._id)}
                            disabled={isSaving || hasPending}
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Permission Summary Badges - Shows who has permissions */}
                      {summary && (
                        <div className="flex items-center mt-2 space-x-2">
                          {summary.hasPermissions ? (
                            <>
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Has Permissions
                              </span>
                              {summary.totalAccess > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  Access: {summary.totalAccess}
                                </span>
                              )}
                              {summary.totalCreate > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Create: {summary.totalCreate}
                                </span>
                              )}
                              {summary.totalEdit > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  Edit: {summary.totalEdit}
                                </span>
                              )}
                              {summary.totalDelete > 0 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                  Delete: {summary.totalDelete}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              No Permissions
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-medium capitalize border border-blue-300">
                          {user.role}
                        </span>
                        {user.department && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                            {user.department}
                          </span>
                        )}
                      </div>
                      {user.lastActive && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last active:{" "}
                          {new Date(user.lastActive).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-9">
            {!bulkMode && !selectedUser ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 ring-4 ring-white">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                  Select a User
                </h3>
                <p className="text-gray-500 text-lg">
                  Choose a user from the list to manage their permissions
                </p>
              </div>
            ) : bulkMode ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-12 text-center">
                <Users className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Bulk Mode Selected
                </h3>
                <p className="text-gray-500 text-lg mb-4">
                  {selectedUsers.length} user
                  {selectedUsers.length !== 1 ? "s" : ""} selected
                </p>
                {bulkProgress ? (
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(bulkProgress.completed / bulkProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Completed: {bulkProgress.completed} / {bulkProgress.total}
                      {bulkProgress.failed > 0 && ` (${bulkProgress.failed} failed)`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-xl text-left">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Bulk Actions
                      </h4>
                      <div className="space-y-3">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                        >
                          <option value="">Select a template</option>
                          {permissionTemplates.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={applyTemplateToSelected}
                          disabled={!selectedTemplate}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          <LayoutTemplate className="h-4 w-4 inline mr-2" />
                          Apply Template
                        </button>
                        <button
                          onClick={bulkSavePermissions}
                          disabled={isSaving}
                          className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/25 font-medium"
                        >
                          <Save className="h-4 w-4 inline mr-2" />
                          Save All Changes ({selectedUsers.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* User Info Header */}
                <div className="mb-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {selectedUserObj?.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedUserObj?.fullName}
                          </h2>
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${
                              selectedUserObj?.source === "erp"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-purple-100 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {selectedUserObj?.source === "erp"
                              ? "ERP User"
                              : "Module User"}
                          </span>
                          {selectedUserSummary?.hasPermissions ? (
                            <span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Has Permissions
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200 flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              No Permissions
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500">
                          {selectedUserObj?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {compareUser && compareUserObj && (
                        <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-xl border-2 border-purple-200">
                          <GitCompare className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-700">
                            Comparing with {compareUserObj.fullName}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const sourceId = prompt(
                            "Enter user ID to copy permissions from:",
                          );
                          if (
                            sourceId &&
                            users.find((u) => u._id === sourceId)
                          ) {
                            copyPermissions(sourceId, selectedUser);
                          } else if (sourceId) {
                            toast.error("User not found");
                          }
                        }}
                        className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:border-blue-300 hover:shadow-md"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy from User
                      </button>
                      <button
                        onClick={exportPermissions}
                        className="p-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                        title="Export"
                      >
                        <Download className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Permission Summary Cards */}
                  <div className="mt-4 grid grid-cols-5 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Access</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedUserSummary?.totalAccess || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Create</p>
                      <p className="text-lg font-bold text-green-600">
                        {selectedUserSummary?.totalCreate || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Edit</p>
                      <p className="text-lg font-bold text-amber-600">
                        {selectedUserSummary?.totalEdit || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Delete</p>
                      <p className="text-lg font-bold text-red-600">
                        {selectedUserSummary?.totalDelete || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Score</p>
                      <p className="text-lg font-bold text-purple-600">
                        {selectedUserSummary?.permissionScore || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Mode Content */}
                {viewMode === "entities" && (
                  <div className="space-y-4">
                    {filteredEntities.map((entity) => {
                      const entityPerms = currentUserPerms[entity._id] || {
                        access: false,
                        create: false,
                        edit: false,
                        delete: false,
                        scope: "own",
                        columns: {},
                      };

                      const compareEntityPerms = compareUser
                        ? compareUserPerms[entity._id] || null
                        : null;
                      const isExpanded = expandedEntities.has(entity._id);
                      const fields = getEntityFields(entity._id);
                      const hasPendingChanges = pendingChanges.has(`${selectedUser}-${entity._id}`);

                      return (
                        <div
                          key={entity._id}
                          className={`bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all ${
                            hasPendingChanges ? 'opacity-70' : ''
                          }`}
                        >
                          {/* Entity Header */}
                          <div
                            className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 flex items-center justify-between cursor-pointer hover:from-gray-100 transition-all"
                            onClick={() => toggleEntity(entity._id)}
                          >
                            <div className="flex items-center space-x-4">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                              )}
                              <div className="p-2.5 bg-blue-100 rounded-xl border-2 border-blue-200">
                                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {entity.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {entity.entityKey}
                                </p>
                              </div>
                              {compareEntityPerms && (
                                <div className="flex items-center space-x-1 ml-4">
                                  <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                    {compareEntityPerms.access
                                      ? "Has Access"
                                      : "No Access"}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all">
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
                                    if (!e.target.checked) {
                                      updatePermission(
                                        selectedUser,
                                        selectedModule,
                                        entity._id,
                                        "create",
                                        false,
                                      );
                                      updatePermission(
                                        selectedUser,
                                        selectedModule,
                                        entity._id,
                                        "edit",
                                        false,
                                      );
                                      updatePermission(
                                        selectedUser,
                                        selectedModule,
                                        entity._id,
                                        "delete",
                                        false,
                                      );
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Enable Access
                                </span>
                              </label>
                              {compareEntityPerms && (
                                <div
                                  className={`px-3 py-2 rounded-xl text-xs font-medium ${
                                    JSON.stringify(entityPerms) ===
                                    JSON.stringify(compareEntityPerms)
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {JSON.stringify(entityPerms) ===
                                  JSON.stringify(compareEntityPerms)
                                    ? "Match"
                                    : "Different"}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Permission Details */}
                          {isExpanded && entityPerms.access && (
                            <div className="p-6 space-y-6 border-t-2 border-gray-200">
                              {/* CRUD Permissions */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                                  Record Permissions
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                  {[
                                    {
                                      key: "create",
                                      label: "Create",
                                      icon: Plus,
                                      color: "green",
                                    },
                                    {
                                      key: "edit",
                                      label: "Edit",
                                      icon: Edit3,
                                      color: "blue",
                                    },
                                    {
                                      key: "delete",
                                      label: "Delete",
                                      icon: Trash2,
                                      color: "red",
                                    },
                                  ].map(({ key, label, icon: Icon, color }) => (
                                    <label
                                      key={key}
                                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-${color}-300 transition-all"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          entityPerms[
                                            key as keyof Permission
                                          ] as boolean
                                        }
                                        onChange={(e) =>
                                          updatePermission(
                                            selectedUser,
                                            selectedModule,
                                            entity._id,
                                            key as keyof Permission,
                                            e.target.checked,
                                          )
                                        }
                                        className="w-5 h-5 rounded border-gray-300 text-${color}-600 focus:ring-${color}-500"
                                      />
                                      <Icon
                                        className={`h-4 w-4 text-${color}-600`}
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        {label}
                                      </span>
                                    </label>
                                  ))}
                                  <div className="col-span-2">
                                    <select
                                      value={entityPerms.scope}
                                      onChange={(e) =>
                                        updatePermission(
                                          selectedUser,
                                          selectedModule,
                                          entity._id,
                                          "scope",
                                          e.target.value as
                                            | "own"
                                            | "all"
                                            | "department",
                                        )
                                      }
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
                                    >
                                      <option value="own">
                                        Own Records Only
                                      </option>
                                      <option value="department">
                                        Department Records
                                      </option>
                                      <option value="all">All Records</option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Column Permissions */}
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                                    <Eye className="h-4 w-4 mr-2 text-purple-600" />
                                    Column Permissions
                                  </h4>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() =>
                                        toggleAllColumns(
                                          selectedUser,
                                          selectedModule,
                                          entity._id,
                                          "view",
                                          true,
                                        )
                                      }
                                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                      View All
                                    </button>
                                    <button
                                      onClick={() =>
                                        toggleAllColumns(
                                          selectedUser,
                                          selectedModule,
                                          entity._id,
                                          "view",
                                          false,
                                        )
                                      }
                                      className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                      Hide All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                      onClick={() =>
                                        toggleAllColumns(
                                          selectedUser,
                                          selectedModule,
                                          entity._id,
                                          "edit",
                                          true,
                                        )
                                      }
                                      className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                    >
                                      Edit All
                                    </button>
                                    <button
                                      onClick={() =>
                                        toggleAllColumns(
                                          selectedUser,
                                          selectedModule,
                                          entity._id,
                                          "edit",
                                          false,
                                        )
                                      }
                                      className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                      Read Only All
                                    </button>
                                  </div>
                                </div>

                                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                  <table className="min-w-full divide-y-2 divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-white">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                          Column
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                          <Eye className="h-4 w-4 inline mr-1" />
                                          View
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                          <Edit3 className="h-4 w-4 inline mr-1" />
                                          Edit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                          Type
                                        </th>
                                        {compareUser && (
                                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Compare
                                          </th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-gray-200 bg-white">
                                      {/* System Columns */}
                                      {[
                                        "name",
                                        "createdAt",
                                        "updatedAt",
                                        "createdBy",
                                      ].map((col) => {
                                        const columnPerms = entityPerms
                                          .columns?.[col] || {
                                          view: true,
                                          edit: false,
                                        };
                                        const isPending = pendingChanges.has(`${selectedUser}-${entity._id}-${col}`);

                                        const compareColumnPerms =
                                          compareEntityPerms?.columns?.[col];

                                        return (
                                          <tr
                                            key={col}
                                            className={`hover:bg-gray-50 transition-colors ${isPending ? 'bg-yellow-50' : ''}`}
                                          >
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900 capitalize">
                                              {col
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}
                                              {isPending && (
                                                <span className="ml-2 text-xs text-yellow-600">(syncing...)</span>
                                              )}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.view}
                                                onChange={(e) =>
                                                  updateColumnPermission(
                                                    selectedUser,
                                                    selectedModule,
                                                    entity._id,
                                                    col,
                                                    "view",
                                                    e.target.checked,
                                                  )
                                                }
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                              />
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.edit}
                                                onChange={(e) =>
                                                  updateColumnPermission(
                                                    selectedUser,
                                                    selectedModule,
                                                    entity._id,
                                                    col,
                                                    "edit",
                                                    e.target.checked,
                                                  )
                                                }
                                                disabled={!columnPerms.view}
                                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                              />
                                            </td>
                                            <td className="px-6 py-3">
                                              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                                System
                                              </span>
                                            </td>
                                            {compareUser && (
                                              <td className="px-6 py-3 text-center">
                                                {compareColumnPerms ? (
                                                  <div className="flex items-center justify-center space-x-1">
                                                    <input
                                                      type="checkbox"
                                                      checked={
                                                        compareColumnPerms.view
                                                      }
                                                      readOnly
                                                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                                    />
                                                    <input
                                                      type="checkbox"
                                                      checked={
                                                        compareColumnPerms.edit
                                                      }
                                                      readOnly
                                                      className="w-4 h-4 rounded border-gray-300 text-green-600"
                                                    />
                                                  </div>
                                                ) : (
                                                  <span className="text-xs text-gray-400">
                                                    —
                                                  </span>
                                                )}
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      })}

                                      {/* Custom Fields */}
                                      {fields.map((field) => {
                                        const columnPerms = entityPerms
                                          .columns?.[field.fieldKey] || {
                                          view: true,
                                          edit: false,
                                        };
                                        const isPending = pendingChanges.has(`${selectedUser}-${entity._id}-${field.fieldKey}`);

                                        const compareColumnPerms =
                                          compareEntityPerms?.columns?.[
                                            field.fieldKey
                                          ];

                                        return (
                                          <tr
                                            key={field._id}
                                            className={`hover:bg-purple-50 transition-colors ${isPending ? 'bg-yellow-50' : ''}`}
                                          >
                                            <td className="px-6 py-3">
                                              <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                  {field.label}
                                                </span>
                                                {field.required && (
                                                  <span className="text-xs text-red-500">
                                                    *
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-xs text-gray-500 font-mono">
                                                {field.fieldKey}
                                              </p>
                                              {isPending && (
                                                <span className="text-xs text-yellow-600">syncing...</span>
                                              )}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.view}
                                                onChange={(e) =>
                                                  updateColumnPermission(
                                                    selectedUser,
                                                    selectedModule,
                                                    entity._id,
                                                    field.fieldKey,
                                                    "view",
                                                    e.target.checked,
                                                  )
                                                }
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                              />
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <input
                                                type="checkbox"
                                                checked={columnPerms.edit}
                                                onChange={(e) =>
                                                  updateColumnPermission(
                                                    selectedUser,
                                                    selectedModule,
                                                    entity._id,
                                                    field.fieldKey,
                                                    "edit",
                                                    e.target.checked,
                                                  )
                                                }
                                                disabled={!columnPerms.view}
                                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                              />
                                            </td>
                                            <td className="px-6 py-3">
                                              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-200">
                                                {field.type}
                                              </span>
                                            </td>
                                            {compareUser && (
                                              <td className="px-6 py-3 text-center">
                                                {compareColumnPerms ? (
                                                  <div className="flex items-center justify-center space-x-1">
                                                    <input
                                                      type="checkbox"
                                                      checked={
                                                        compareColumnPerms.view
                                                      }
                                                      readOnly
                                                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                                    />
                                                    <input
                                                      type="checkbox"
                                                      checked={
                                                        compareColumnPerms.edit
                                                      }
                                                      readOnly
                                                      className="w-4 h-4 rounded border-gray-300 text-green-600"
                                                    />
                                                  </div>
                                                ) : (
                                                  <span className="text-xs text-gray-400">
                                                    —
                                                  </span>
                                                )}
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* No Access Message */}
                          {isExpanded && !entityPerms.access && (
                            <div className="p-8 text-center bg-gray-50 rounded-b-2xl">
                              <Lock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                              <p className="text-gray-500 font-medium">
                                Access is disabled for this entity
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                Enable access to configure permissions
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === "fields" && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Field Permissions Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEntities.map((entity) => {
                        const fields = getEntityFields(entity._id);
                        const entityPerms = currentUserPerms[entity._id] || {
                          columns: {},
                        };
                        const compareEntityPerms = compareUser
                          ? compareUserPerms[entity._id] || null
                          : null;

                        return (
                          <div
                            key={entity._id}
                            className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {entity.name}
                              </h4>
                              {compareEntityPerms && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    JSON.stringify(entityPerms.columns) ===
                                    JSON.stringify(compareEntityPerms.columns)
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {JSON.stringify(entityPerms.columns) ===
                                  JSON.stringify(compareEntityPerms.columns)
                                    ? "Match"
                                    : "Diff"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                              {fields.length} custom fields
                            </p>
                            <div className="space-y-2">
                              {fields.slice(0, 5).map((field) => (
                                <div
                                  key={field._id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-gray-600 truncate max-w-[150px]">
                                    {field.label}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {entityPerms.columns?.[field.fieldKey]
                                      ?.view ? (
                                      <Eye className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <EyeOff className="h-4 w-4 text-gray-300" />
                                    )}
                                    {entityPerms.columns?.[field.fieldKey]
                                      ?.edit ? (
                                      <Edit3 className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <Edit3 className="h-4 w-4 text-gray-300" />
                                    )}
                                    {compareEntityPerms &&
                                      compareEntityPerms.columns?.[
                                        field.fieldKey
                                      ] && (
                                        <div className="flex items-center space-x-1 ml-1">
                                          <span className="text-xs text-purple-600">
                                            vs
                                          </span>
                                          <Eye
                                            className={`h-3 w-3 ${
                                              compareEntityPerms.columns[
                                                field.fieldKey
                                              ].view
                                                ? "text-green-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                          <Edit3
                                            className={`h-3 w-3 ${
                                              compareEntityPerms.columns[
                                                field.fieldKey
                                              ].edit
                                                ? "text-blue-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ))}
                              {fields.length > 5 && (
                                <p className="text-xs text-gray-400">
                                  +{fields.length - 5} more fields
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {viewMode === "summary" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Permission Stats */}
                    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                        Permission Statistics
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-700">
                            Total Access Grants
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {permissionStats.totalAccess}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-700">
                            Total Create Permissions
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            {permissionStats.totalCreate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-700">
                            Total Edit Permissions
                          </span>
                          <span className="text-xl font-bold text-amber-600">
                            {permissionStats.totalEdit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-700">
                            Total Delete Permissions
                          </span>
                          <span className="text-xl font-bold text-red-600">
                            {permissionStats.totalDelete}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-700">
                            Total Column Permissions
                          </span>
                          <span className="text-xl font-bold text-purple-600">
                            {permissionStats.totalColumns}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-700">
                            Users with Permissions
                          </span>
                          <span className="text-xl font-bold text-indigo-600">
                            {stats.usersWithPermissions}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Distribution */}
                    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                        User Distribution
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              ERP Users
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {stats.erpUsers}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{
                                width: `${stats.totalUsers > 0 ? (stats.erpUsers / stats.totalUsers) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              Module Users
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {stats.moduleUsers}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{
                                width: `${stats.totalUsers > 0 ? (stats.moduleUsers / stats.totalUsers) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              Active Users
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {stats.activeUsers}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              Users with Permissions
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {stats.usersWithPermissions}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{
                                width: `${stats.totalUsers > 0 ? (stats.usersWithPermissions / stats.totalUsers) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Permission Holders */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-amber-600" />
                        Top Permission Holders
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                User
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                                Access
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                                Create
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                                Edit
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                                Delete
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                                Columns
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                                Score
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {users
                              .map((user) => {
                                const summary = permissionSummaries[user._id];
                                return { ...user, summary, score: summary?.permissionScore || 0 };
                              })
                              .filter(
                                (u) => u.summary && u.summary.hasPermissions,
                              )
                              .sort((a, b) => b.score - a.score)
                              .slice(0, 5)
                              .map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">
                                    <div className="font-medium text-gray-900">
                                      {user.fullName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {user.email}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {user.summary?.totalAccess || 0}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {user.summary?.totalCreate || 0}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {user.summary?.totalEdit || 0}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {user.summary?.totalDelete || 0}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {user.summary?.totalColumns || 0}
                                  </td>
                                  <td className="px-4 py-2 text-center font-bold text-purple-600">
                                    {user.score}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "timeline" && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <History className="h-5 w-5 mr-2 text-blue-600" />
                      Permission Activity Timeline
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {activityLogs.length > 0 ? (
                        activityLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl"
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                log.action === "CREATE"
                                  ? "bg-green-100"
                                  : log.action === "UPDATE"
                                    ? "bg-blue-100"
                                    : log.action === "BULK_UPDATE"
                                      ? "bg-purple-100"
                                      : "bg-red-100"
                              }`}
                            >
                              {log.action === "CREATE" ? (
                                <Plus className="h-4 w-4 text-green-600" />
                              ) : log.action === "UPDATE" ? (
                                <Edit3 className="h-4 w-4 text-blue-600" />
                              ) : log.action === "BULK_UPDATE" ? (
                                <Users className="h-4 w-4 text-purple-600" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">
                                  {log.userName}
                                </span>{" "}
                                {log.action.toLowerCase()}d permissions for{" "}
                                <span className="font-medium">
                                  {log.entity}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          No activity logs found
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {viewMode === "templates" && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <LayoutTemplate className="h-5 w-5 mr-2 text-purple-600" />
                      Apply Template to User
                    </h3>
                    <div className="space-y-4">
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                      >
                        <option value="">Select a template</option>
                        {permissionTemplates.map(t => (
                          <option key={t._id} value={t._id}>{t.name} - {t.description}</option>
                        ))}
                      </select>
                      {selectedTemplate && (
                        <button
                          onClick={() => {
                            if (selectedTemplate && selectedUser) {
                              applyTemplateToUser(selectedTemplate, selectedUser);
                            }
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                        >
                          <CopyCheck className="h-4 w-4 inline mr-2" />
                          Apply Template to Current User
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

      {/* ✅ Fixed: Added missing closing tag for style jsx */}
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