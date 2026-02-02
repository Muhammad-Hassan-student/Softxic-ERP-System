"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  UserX,
  User,
  Printer,
  Shield,
  Star,
  Award,
  FileText,
  Download,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock4,
  CalendarDays,
  Calendar,
  Bell,
  TrendingUp,
  Building,
  Wallet,
  Banknote,
  GraduationCap,
  MapPin,
  Briefcase,
  UserCircle,
  Loader2,
  FilterX,
  Users,
  UserPlus,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Send,
  History,
  ShieldAlert,
  Calculator,
  Receipt,
  IndianRupee,
  Upload,
  Key,
  Camera,
  Percent,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

// ========== TYPES ==========
interface Employee {
  id: string;
  rollNo: string;
  fullName: string;
  profilePhoto?: string;
  cnic: string;
  mobile: string;
  jobTitle: string;
  department: string;
  salary: number;
  incentive: number;
  taxAmount: number;
  status: "active" | "inactive" | "terminated" | "on-leave";
  dateOfJoining: string;
  createdAt: string;
  role: "employee" | "hr" | "admin" | "manager";
  email?: string;
  fatherName?: string;
  address?: string;
  timing?: string;
  qualification?: {
    academic: string;
    other: string;
  };
  password?: string;
  lastPaymentDate?: string;
  totalEarnings?: number;
  attendance?: {
    present: number;
    absent: number;
    late: number;
  };
  performance?: number;
  leavesTaken?: number;
  remainingLeaves?: number;
}

// ========== FILTER COMPONENT ==========
interface EmployeeFiltersProps {
  filters: {
    search: string;
    department: string;
    status: string;
    paymentStatus: string;
    role?: string;
    dateRange?: string;
    sortBy?: string;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  showRoleFilter?: boolean;
  showDateFilter?: boolean;
  showSortFilter?: boolean;
  compact?: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  showRoleFilter = true,
  showDateFilter = true,
  showSortFilter = true,
  compact = false,
}) => {
  const departments = [
    "All Departments",
    "HR",
    "Finance",
    "Sales",
    "Marketing",
    "IT",
    "Engineering",
    "Operations",
    "Admin",
    "Support",
    "Management",
  ];

  const statuses = [
    "All Status",
    "active",
    "inactive",
    "terminated",
    "on-leave",
  ];
  const paymentStatuses = [
    "All Payment",
    "paid",
    "pending",
    "overdue",
    "processing",
  ];
  const roles = ["All Roles", "employee", "hr", "admin", "manager"];
  const dateRanges = [
    "All Time",
    "Today",
    "This Week",
    "This Month",
    "Last Month",
    "This Year",
    "Last 30 Days",
    "Last Quarter",
  ];

  const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "salary-desc", label: "Salary (High-Low)" },
    { value: "salary-asc", label: "Salary (Low-High)" },
    { value: "date-desc", label: "Joining Date (Newest)" },
    { value: "date-asc", label: "Joining Date (Oldest)" },
    { value: "performance-desc", label: "Performance (High-Low)" },
    { value: "department", label: "Department" },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.department !== "All Departments" ||
    filters.status !== "All Status" ||
    filters.paymentStatus !== "All Payment" ||
    (showRoleFilter && filters.role !== "All Roles") ||
    (showDateFilter && filters.dateRange !== "All Time") ||
    filters.sortBy;

  const getFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.department !== "All Departments") count++;
    if (filters.status !== "All Status") count++;
    if (filters.paymentStatus !== "All Payment") count++;
    if (showRoleFilter && filters.role !== "All Roles") count++;
    if (showDateFilter && filters.dateRange !== "All Time") count++;
    if (filters.sortBy) count++;
    return count;
  };

  const activeFilterCount = getFilterCount();

  const getDepartmentColor = (dept: string) => {
    const colorMap: Record<string, string> = {
      hr: "bg-purple-500",
      finance: "bg-blue-500",
      sales: "bg-green-500",
      marketing: "bg-pink-500",
      it: "bg-indigo-500",
      engineering: "bg-orange-500",
      operations: "bg-teal-500",
      admin: "bg-gray-500",
      support: "bg-cyan-500",
      management: "bg-red-500",
    };
    return colorMap[dept.toLowerCase()] || "bg-gray-500";
  };

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) =>
                  onFilterChange({ ...filters, search: e.target.value })
                }
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <FilterX className="h-4 w-4" />
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters & Sorting
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-blue-600 hover:bg-blue-700 text-white">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <FilterX className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Name, Roll No, Mobile..."
                value={filters.search}
                onChange={(e) =>
                  onFilterChange({ ...filters, search: e.target.value })
                }
                className="pl-10 border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="h-3.5 w-3.5" />
              Department
            </label>
            <Select
              value={filters.department}
              onValueChange={(value) =>
                onFilterChange({ ...filters, department: value })
              }
            >
              <SelectTrigger className="border-gray-300 hover:border-blue-400">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem
                    key={dept}
                    value={dept}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {dept !== "All Departments" && (
                        <div
                          className={`h-2 w-2 rounded-full ${getDepartmentColor(dept)}`}
                        />
                      )}
                      <span>{dept}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5" />
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                onFilterChange({ ...filters, status: value })
              }
            >
              <SelectTrigger className="border-gray-300 hover:border-green-400">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 capitalize">
                      {status === "active" && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      {status === "inactive" && (
                        <XCircle className="h-3 w-3 text-gray-500" />
                      )}
                      {status === "terminated" && (
                        <UserX className="h-3 w-3 text-red-500" />
                      )}
                      {status === "on-leave" && (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>{status}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5" />
              Payment Status
            </label>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) =>
                onFilterChange({ ...filters, paymentStatus: value })
              }
            >
              <SelectTrigger className="border-gray-300 hover:border-amber-400">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 capitalize">
                      {status === "paid" && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      {status === "pending" && (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                      {status === "overdue" && (
                        <Clock4 className="h-3 w-3 text-red-500" />
                      )}
                      {status === "processing" && (
                        <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                      )}
                      <span>{status}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          {/* Role */}
          {showRoleFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Role
              </label>
              <Select
                value={filters.role || "All Roles"}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, role: value })
                }
              >
                <SelectTrigger className="border-gray-300 hover:border-purple-400">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 capitalize">
                        {role === "admin" && (
                          <ShieldAlert className="h-3 w-3 text-red-500" />
                        )}
                        {role === "hr" && (
                          <UserCircle className="h-3 w-3 text-purple-500" />
                        )}
                        {role === "manager" && (
                          <Award className="h-3 w-3 text-blue-500" />
                        )}
                        {role === "employee" && (
                          <User className="h-3 w-3 text-green-500" />
                        )}
                        <span>{role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          {showDateFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Date Range
              </label>
              <Select
                value={filters.dateRange || "All Time"}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, dateRange: value })
                }
              >
                <SelectTrigger className="border-gray-300 hover:border-teal-400">
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem
                      key={range}
                      value={range}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-teal-500" />
                        <span>{range}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sort By */}
          {showSortFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort By
              </label>
              <Select
                value={filters.sortBy || ""}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, sortBy: value })
                }
              >
                <SelectTrigger className="border-gray-300 hover:border-indigo-400">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-3 w-3 text-indigo-500" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-600">
                Active filters:
              </span>

              {filters.search && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <Search className="h-3 w-3" />"{filters.search}"
                  <button
                    onClick={() => onFilterChange({ ...filters, search: "" })}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.department !== "All Departments" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <Building className="h-3 w-3" />
                  {filters.department}
                  <button
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        department: "All Departments",
                      })
                    }
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.status !== "All Status" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {filters.status === "active" && (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {filters.status === "inactive" && (
                    <XCircle className="h-3 w-3" />
                  )}
                  {filters.status}
                  <button
                    onClick={() =>
                      onFilterChange({ ...filters, status: "All Status" })
                    }
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.sortBy && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {
                    sortOptions.find((opt) => opt.value === filters.sortBy)
                      ?.label
                  }
                  <button
                    onClick={() => onFilterChange({ ...filters, sortBy: "" })}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== EMPLOYEE TABLE COMPONENT ==========
interface EmployeeTableProps {
  employees: Employee[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onPayment: (employee: Employee) => void;
  onTerminate: (employee: Employee) => void;
  onViewProfile: (employee: Employee) => void;
  onPrint?: (employee: Employee) => void;
  onExport?: (employee: Employee) => void;
  onQuickPay?: (employee: Employee) => void;
  onSendEmail?: (employee: Employee) => void;
  onSendNotification?: (employee: Employee) => void;
  onViewAttendance?: (employee: Employee) => void;
  onViewLeaves?: (employee: Employee) => void;
  viewMode?: "all" | "hr" | "employee" | "payment";
  loading?: boolean;
  showBulkActions?: boolean;
  onBulkSelect?: (ids: string[]) => void;
  selectedEmployees?: string[];
  onBulkPayment?: () => void;
  onBulkExport?: () => void;
  hasActiveFilters?: boolean | string;
  onResetFilters?: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  total,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onPayment,
  onTerminate,
  onViewProfile,
  onPrint,
  onExport,
  onQuickPay,
  onSendEmail,
  onSendNotification,
  onViewAttendance,
  onViewLeaves,
  viewMode = "all",
  loading = false,
  showBulkActions = true,
  onBulkSelect,
  selectedEmployees = [],
  onBulkPayment,
  onBulkExport,
  hasActiveFilters = false,
  onResetFilters,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<string[]>(selectedEmployees);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    if (onBulkSelect) {
      onBulkSelect(selectedRows);
    }
  }, [selectedRows, onBulkSelect]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === employees.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(employees.map((emp) => emp.id));
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color:
          "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        icon: CheckCircle,
        text: "Active",
      },
      inactive: {
        color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
        icon: XCircle,
        text: "Inactive",
      },
      terminated: {
        color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        icon: UserX,
        text: "Terminated",
      },
      "on-leave": {
        color:
          "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        icon: AlertCircle,
        text: "On Leave",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.color} border px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit transition-colors`}
      >
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const getPaymentStatusBadge = (employee: Employee) => {
    const lastPayment = employee.lastPaymentDate;
    const now = new Date();
    const lastPaymentDate = lastPayment ? new Date(lastPayment) : null;

    if (!lastPaymentDate) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 px-3 py-1.5">
          <AlertCircle className="h-3 w-3 mr-1.5" />
          Never Paid
        </Badge>
      );
    }

    const daysSincePayment = Math.floor(
      (now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSincePayment <= 30) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 px-3 py-1.5">
          <CheckCircle className="h-3 w-3 mr-1.5" />
          Paid
        </Badge>
      );
    } else if (daysSincePayment <= 60) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 px-3 py-1.5">
          <Clock4 className="h-3 w-3 mr-1.5" />
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 px-3 py-1.5">
          <AlertCircle className="h-3 w-3 mr-1.5" />
          Overdue
        </Badge>
      );
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      hr: "bg-gradient-to-r from-purple-500 to-pink-500",
      finance: "bg-gradient-to-r from-blue-500 to-cyan-500",
      sales: "bg-gradient-to-r from-green-500 to-emerald-500",
      marketing: "bg-gradient-to-r from-pink-500 to-rose-500",
      it: "bg-gradient-to-r from-indigo-500 to-violet-500",
      engineering: "bg-gradient-to-r from-orange-500 to-amber-500",
      operations: "bg-gradient-to-r from-teal-500 to-emerald-500",
      admin: "bg-gradient-to-r from-gray-600 to-gray-800",
      support: "bg-gradient-to-r from-cyan-500 to-blue-500",
      management: "bg-gradient-to-r from-red-500 to-orange-500",
    };
    return (
      colors[department.toLowerCase()] ||
      "bg-gradient-to-r from-gray-500 to-gray-700"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPerformanceColor = (score: number | undefined) => {
    if (!score) return "text-gray-400";
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceText = (score: number | undefined) => {
    if (!score) return "N/A";
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Needs Improvement";
  };

  const renderDetailedView = (employee: Employee) => {
    if (!expandedRows.has(employee.id)) return null;

    const netSalary = employee.salary + employee.incentive - employee.taxAmount;
    const attendanceTotal =
      (employee.attendance?.present || 0) +
      (employee.attendance?.absent || 0) +
      (employee.attendance?.late || 0);
    const attendancePercentage =
      attendanceTotal > 0
        ? ((employee.attendance?.present || 0) / attendanceTotal) * 100
        : 0;

    return (
      <tr className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
        <td
          colSpan={showBulkActions ? 12 : 11}
          className="p-0 border-t border-blue-100"
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information Card */}
              <Card className="border border-blue-100 shadow-sm">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
                    <UserCircle className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Father Name:</span>
                    <span className="font-medium text-gray-900">
                      {employee.fatherName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CNIC:</span>
                    <span className="font-mono text-gray-900">
                      {employee.cnic}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-blue-700 truncate max-w-[180px]">
                      {employee.email || "N/A"}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-gray-600 block mb-2">Address:</span>
                    <p className="font-medium text-gray-900 text-sm bg-gray-50 p-3 rounded-lg border">
                      {employee.address || "Address not provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details Card */}
              <Card className="border border-purple-100 shadow-sm">
                <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-purple-100/50">
                  <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
                    <Briefcase className="h-4 w-4" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Timing:</span>
                    <span className="font-medium text-gray-900">
                      {employee.timing || "9:00 AM - 5:00 PM"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Joining Date:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(employee.dateOfJoining)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium text-gray-900">
                      {Math.floor(
                        (new Date().getTime() -
                          new Date(employee.dateOfJoining).getTime()) /
                          (1000 * 60 * 60 * 24 * 30.44),
                      )}{" "}
                      months
                    </span>
                  </div>
                  {employee.qualification && (
                    <div className="mt-4">
                      <span className="text-gray-600 block mb-2">
                        Qualification:
                      </span>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {employee.qualification.academic}
                        </p>
                        {employee.qualification.other && (
                          <p className="text-xs text-gray-600">
                            {employee.qualification.other}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics Card */}
              <Card className="border border-green-100 shadow-sm">
                <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-green-100/50">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                    <TrendingUp className="h-4 w-4" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Attendance */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Attendance:</span>
                      <span
                        className={`font-semibold ${attendancePercentage >= 90 ? "text-green-600" : attendancePercentage >= 75 ? "text-blue-600" : attendancePercentage >= 60 ? "text-yellow-600" : "text-red-600"}`}
                      >
                        {employee.attendance?.present || 0}/{attendanceTotal}{" "}
                        days
                      </span>
                    </div>
                    <Progress value={attendancePercentage} className="h-2" />
                  </div>

                  {/* Leaves */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Leaves Taken:</span>
                    <span className="font-medium text-gray-900">
                      {employee.leavesTaken || 0} days
                    </span>
                  </div>

                  {/* Performance */}
                  {employee.performance !== undefined && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Performance:</span>
                        <span
                          className={`font-semibold ${getPerformanceColor(employee.performance)}`}
                        >
                          {employee.performance}%
                        </span>
                      </div>
                      <Progress value={employee.performance} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {getPerformanceText(employee.performance)}
                      </p>
                    </div>
                  )}

                  {/* Last Payment */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-600">Last Payment:</span>
                    <span className="font-medium text-blue-700">
                      {employee.lastPaymentDate
                        ? formatDate(employee.lastPaymentDate)
                        : "Never"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
              {onQuickPay && (
                <Button
                  size="sm"
                  onClick={() => onQuickPay(employee)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  Quick Pay
                </Button>
              )}
              {onSendEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendEmail(employee)}
                  className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
              )}
              {onSendNotification && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendNotification(employee)}
                  className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Bell className="h-4 w-4" />
                  Send Notification
                </Button>
              )}
              {onViewAttendance && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewAttendance(employee)}
                  className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <CalendarDays className="h-4 w-4" />
                  View Attendance
                </Button>
              )}
              {onViewLeaves && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewLeaves(employee)}
                  className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Calendar className="h-4 w-4" />
                  View Leaves
                </Button>
              )}
              {onPrint && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPrint(employee)}
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4" />
                  Print Details
                </Button>
              )}
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(employee)}
                  className="flex items-center gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {showBulkActions && (
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
                <TableHead>
                  <Skeleton className="h-4 w-8" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-28" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {viewMode === "payment" && (
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                )}
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {showBulkActions && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  {viewMode === "payment" && (
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Bulk Actions Bar */}
      {showBulkActions && selectedRows.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              {selectedRows.length} employee{selectedRows.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkPayment && (
              <Button
                size="sm"
                onClick={onBulkPayment}
                className="bg-white text-blue-700 hover:bg-white/90 border-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Bulk Payment
              </Button>
            )}
            {onSendEmail && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Bulk email feature coming soon!")}
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Selected
              </Button>
            )}
            {onBulkExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={onBulkExport}
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedRows([])}
              className="text-white hover:bg-white/20"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table Header with Filter Status */}
      {hasActiveFilters && onResetFilters && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-200 p-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">Filters are active</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetFilters}
            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 h-8"
          >
            <FilterX className="h-3.5 w-3.5 mr-1.5" />
            Reset Filters
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              {showBulkActions && (
                <TableHead className="text-white w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === employees.length &&
                      employees.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-white/30 bg-white/20 checked:bg-white checked:text-blue-600 focus:ring-white/50"
                  />
                </TableHead>
              )}
              <TableHead className="text-white font-semibold w-12">#</TableHead>
              <TableHead className="text-white font-semibold min-w-[220px]">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-blue-100"
                >
                  Employee Details
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </TableHead>
              <TableHead className="text-white font-semibold">
                Department & Role
              </TableHead>
              <TableHead className="text-white font-semibold">
                Job Title
              </TableHead>
              <TableHead className="text-white font-semibold">
                <button
                  onClick={() => handleSort("salary")}
                  className="flex items-center gap-1 hover:text-blue-100"
                >
                  Salary
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </TableHead>
              <TableHead className="text-white font-semibold">Status</TableHead>
              {viewMode === "payment" && (
                <TableHead className="text-white font-semibold">
                  Payment Status
                </TableHead>
              )}
              <TableHead className="text-white font-semibold">
                Performance
              </TableHead>
              <TableHead className="text-white font-semibold">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 hover:text-blue-100"
                >
                  Joining Date
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </TableHead>
              <TableHead className="text-white font-semibold text-right min-w-[140px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => {
              const netSalary =
                employee.salary + employee.incentive - employee.taxAmount;

              return (
                <React.Fragment key={employee.id}>
                  <TableRow
                    className={cn(
                      "transition-all duration-200 hover:bg-blue-50/30",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                      expandedRows.has(employee.id) && "bg-blue-50/50",
                      selectedRows.includes(employee.id) && "bg-blue-100/30",
                    )}
                    onMouseEnter={() => setHoveredRow(employee.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {showBulkActions && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(employee.id)}
                          onChange={() => toggleRowSelection(employee.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                        {(currentPage - 1) * 10 + index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 border-white shadow">
                            <AvatarImage
                              src={employee.profilePhoto}
                              className="object-cover"
                            />
                            <AvatarFallback
                              className={cn(
                                "text-white font-bold",
                                employee.role === "admin"
                                  ? "bg-gradient-to-br from-red-500 to-red-600"
                                  : employee.role === "hr"
                                    ? "bg-gradient-to-br from-purple-500 to-purple-600"
                                    : employee.role === "manager"
                                      ? "bg-gradient-to-br from-orange-500 to-amber-600"
                                      : "bg-gradient-to-br from-blue-500 to-blue-600",
                              )}
                            >
                              {employee.fullName?.charAt(0).toUpperCase() ||
                                "E"}
                            </AvatarFallback>
                          </Avatar>
                          {employee.role === "hr" && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center">
                              <Shield className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                          {employee.role === "admin" && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-sm flex items-center justify-center">
                              <Award className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                          {employee.role === "manager" && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 border-2 border-white shadow-sm flex items-center justify-center">
                              <Star className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 hover:text-blue-700 cursor-default">
                              {employee.fullName}
                            </p>
                            {employee.role === "hr" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Shield className="h-3 w-3 text-purple-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>HR Staff</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {employee.role === "admin" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Award className="h-3 w-3 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Administrator</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            ID: {employee.rollNo || "N/A"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-600">
                              {employee.mobile}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Badge
                          className={cn(
                            "text-white px-3 py-1 rounded-full w-fit shadow-sm",
                            getDepartmentColor(employee.department),
                          )}
                        >
                          {employee.department}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="font-medium capitalize text-gray-700">
                            {employee.role}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-800">
                          {employee.jobTitle}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(netSalary)}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          {employee.incentive > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5"
                                  >
                                    +{formatCurrency(employee.incentive)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Incentive/Bonus</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {employee.taxAmount > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-700 border-red-200 px-2 py-0.5"
                                  >
                                    -{formatCurrency(employee.taxAmount)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Tax Deduction</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(employee.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => toggleRowExpansion(employee.id)}
                        >
                          {expandedRows.has(employee.id) ? (
                            <>
                              <ChevronLeft className="h-3 w-3 mr-1" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    {viewMode === "payment" && (
                      <TableCell>{getPaymentStatusBadge(employee)}</TableCell>
                    )}
                    <TableCell>
                      {employee.performance !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Progress
                              value={employee.performance}
                              className={cn(
                                "h-2",
                                employee.performance >= 90 &&
                                  "bg-green-100 [&>div]:bg-green-500",
                                employee.performance >= 70 &&
                                  employee.performance < 90 &&
                                  "bg-blue-100 [&>div]:bg-blue-500",
                                employee.performance >= 50 &&
                                  employee.performance < 70 &&
                                  "bg-yellow-100 [&>div]:bg-yellow-500",
                                employee.performance < 50 &&
                                  "bg-red-100 [&>div]:bg-red-500",
                              )}
                            />
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span
                                  className={cn(
                                    "font-medium text-sm",
                                    getPerformanceColor(employee.performance),
                                  )}
                                >
                                  {employee.performance}%
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {getPerformanceText(employee.performance)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {formatDate(employee.dateOfJoining)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.floor(
                            (new Date().getTime() -
                              new Date(employee.dateOfJoining).getTime()) /
                              (1000 * 60 * 60 * 24 * 30.44),
                          )}{" "}
                          months ago
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-700"
                                onClick={() => {
                                  toggleRowExpansion(employee.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Edit Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-green-100 hover:text-green-700"
                                onClick={() => onEdit(employee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Employee</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Payment Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-purple-100 hover:text-purple-700"
                                onClick={() => onPayment(employee)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Make Payment</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-gray-800 dark:hover:bg-gray-700"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 bg-gray-900 border-gray-800 shadow-xl"
                          >
                            <DropdownMenuLabel className="text-gray-300 font-medium">
                              Actions for {employee.fullName}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />

                            <DropdownMenuItem
                              onClick={() => onViewProfile(employee)}
                              className="text-gray-300 hover:text-white hover:bg-gray-800 focus:text-white focus:bg-gray-800"
                            >
                              <UserCircle className="h-4 w-4 mr-2 text-blue-400" />
                              View Full Profile
                            </DropdownMenuItem>

                            {onViewAttendance && (
                              <DropdownMenuItem
                                onClick={() => onViewAttendance(employee)}
                                className="text-gray-300 hover:text-white hover:bg-gray-800 focus:text-white focus:bg-gray-800"
                              >
                                <CalendarDays className="h-4 w-4 mr-2 text-green-400" />
                                View Attendance
                              </DropdownMenuItem>
                            )}

                            {onViewLeaves && (
                              <DropdownMenuItem
                                onClick={() => onViewLeaves(employee)}
                                className="text-gray-300 hover:text-white hover:bg-gray-800 focus:text-white focus:bg-gray-800"
                              >
                                <Calendar className="h-4 w-4 mr-2 text-yellow-400" />
                                View Leaves
                              </DropdownMenuItem>
                            )}

                            {onSendEmail && (
                              <DropdownMenuItem
                                onClick={() => onSendEmail(employee)}
                                className="text-gray-300 hover:text-white hover:bg-gray-800 focus:text-white focus:bg-gray-800"
                              >
                                <Mail className="h-4 w-4 mr-2 text-purple-400" />
                                Send Email
                              </DropdownMenuItem>
                            )}

                            {onSendNotification && (
                              <DropdownMenuItem
                                onClick={() => onSendNotification(employee)}
                                className="text-gray-300 hover:text-white hover:bg-gray-800 focus:text-white focus:bg-gray-800"
                              >
                                <Bell className="h-4 w-4 mr-2 text-orange-400" />
                                Send Notification
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-gray-700" />

                            {onPrint && (
                              <DropdownMenuItem
                                onClick={() => onPrint(employee)}
                                className="text-gray-300 hover:text-white hover:bg-gray-800 focus:text-white focus:bg-gray-800"
                              >
                                <Printer className="h-4 w-4 mr-2 text-gray-400" />
                                Print Details
                              </DropdownMenuItem>
                            )}

                            {onExport && (
                              <DropdownMenuItem
                                onClick={() => onExport(employee)}
                                className="text-gray-300 hover:text-white hover:bg-gray-800 focus:text-white focus:bg-gray-800"
                              >
                                <Download className="h-4 w-4 mr-2 text-gray-400" />
                                Export Data
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-gray-700" />

                            {employee.status !== "terminated" ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-950 focus:text-red-300 focus:bg-red-950"
                                  >
                                    <UserX className="h-4 w-4 mr-2 text-red-400" />
                                    Terminate Employee
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gray-900 border-gray-800">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-gray-200">
                                      Terminate Employee
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      Are you sure you want to terminate{" "}
                                      <span className="font-medium text-gray-300">
                                        {employee.fullName}
                                      </span>
                                      ? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onTerminate(employee)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Terminate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  toast.success(
                                    "Employee reactivated successfully!",
                                  );
                                }}
                                className="text-green-400 hover:text-green-300 hover:bg-green-950 focus:text-green-300 focus:bg-green-950"
                              >
                                <User className="h-4 w-4 mr-2 text-green-400" />
                                Reactivate Employee
                              </DropdownMenuItem>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950 focus:text-red-300 focus:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-900 border-gray-800">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-gray-200">
                                    Delete Employee
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    This action cannot be undone. This will
                                    permanently delete{" "}
                                    <span className="font-medium text-gray-300">
                                      {employee.fullName}
                                    </span>
                                    's record from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(employee.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Detailed View Row */}
                  {renderDetailedView(employee)}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {employees.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-gray-50 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold">{employees.length}</span> of{" "}
            <span className="font-semibold">{total}</span> employees
            {totalPages > 1 && (
              <span className="ml-2 text-gray-500">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 hidden sm:inline-flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "h-8 w-8 p-0 sm:w-10",
                    currentPage === pageNum &&
                      "bg-blue-600 text-white hover:bg-blue-700",
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 hidden sm:inline-flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {employees.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No employees found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            {hasActiveFilters
              ? "Try adjusting your search filters or clear filters to see all employees."
              : "Add your first employee to get started with employee management."}
          </p>
          <div className="flex gap-3 justify-center">
            {hasActiveFilters && onResetFilters && (
              <Button
                variant="outline"
                onClick={onResetFilters}
                className="border-gray-300 hover:border-gray-400"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            )}
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== MAIN EMPLOYEE MANAGEMENT PAGE ==========
export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [viewMode, setViewMode] = useState<
    "all" | "hr" | "employee" | "payment"
  >("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    department: "All Departments",
    status: "All Status",
    paymentStatus: "All Payment",
    role: "All Roles",
    dateRange: "All Time",
    sortBy: "",
  });

  // Mock data initialization
  useEffect(() => {
    const loadEmployees = () => {
      const mockEmployees: Employee[] = Array.from({ length: 50 }, (_, i) => {
        const departments = [
          "HR",
          "Finance",
          "Sales",
          "Marketing",
          "IT",
          "Engineering",
          "Operations",
          "Admin",
          "Support",
          "Management",
        ];
        const roles = ["employee", "hr", "admin", "manager"];
        const statuses = ["active", "inactive", "terminated", "on-leave"];

        return {
          id: `EMP${String(i + 1).padStart(4, "0")}`,
          rollNo: `ROLL${String(i + 1).padStart(3, "0")}`,
          fullName: `Employee ${i + 1} ${["Khan", "Ali", "Ahmed", "Raza", "Hassan"][i % 5]}`,
          cnic: `42101-${String(Math.floor(Math.random() * 10000000)).padStart(7, "0")}-${String(Math.floor(Math.random() * 10))}`,
          mobile: `03${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
          jobTitle: [
            "Software Engineer",
            "HR Manager",
            "Sales Executive",
            "Accountant",
            "Marketing Specialist",
            "Project Manager",
            "System Administrator",
            "Business Analyst",
            "Customer Support",
            "Operations Manager",
          ][i % 10],
          department: departments[i % departments.length],
          salary: Math.floor(Math.random() * 100000) + 50000,
          incentive: Math.floor(Math.random() * 20000),
          taxAmount: Math.floor(Math.random() * 15000),
          status: statuses[i % statuses.length] as any,
          dateOfJoining: new Date(
            Date.now() - Math.random() * 10000000000,
          ).toISOString(),
          createdAt: new Date().toISOString(),
          role: roles[i % roles.length] as any,
          email: `employee${i + 1}@company.com`,
          fatherName: `Father ${i + 1}`,
          address: `House #${i + 1}, Street ${i + 1}, City`,
          timing: [
            "9:00 AM - 5:00 PM",
            "10:00 AM - 6:00 PM",
            "8:00 AM - 4:00 PM",
          ][i % 3],
          qualification: {
            academic: ["Bachelor's Degree", "Master's Degree", "PhD"][i % 3],
            other: [
              "Certified Professional",
              "Technical Certification",
              "Diploma",
            ][i % 3],
          },
          lastPaymentDate: new Date(
            Date.now() - Math.random() * 3000000000,
          ).toISOString(),
          totalEarnings: Math.floor(Math.random() * 1000000) + 500000,
          attendance: {
            present: Math.floor(Math.random() * 22) + 18,
            absent: Math.floor(Math.random() * 5),
            late: Math.floor(Math.random() * 3),
          },
          performance: Math.floor(Math.random() * 40) + 60,
          leavesTaken: Math.floor(Math.random() * 10),
          remainingLeaves: 20 - Math.floor(Math.random() * 10),
        };
      });

      setEmployees(mockEmployees);
      setTotalEmployees(mockEmployees.length);
      setTotalPages(Math.ceil(mockEmployees.length / 10));
      setLoading(false);
    };

    setTimeout(loadEmployees, 1000);
  }, []);

  // Filter employees
  const filteredEmployees = React.useMemo(() => {
    let result = [...employees];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(searchTerm) ||
          emp.rollNo.toLowerCase().includes(searchTerm) ||
          emp.mobile.includes(searchTerm) ||
          emp.email?.toLowerCase().includes(searchTerm),
      );
    }

    // Apply department filter
    if (filters.department !== "All Departments") {
      result = result.filter((emp) => emp.department === filters.department);
    }

    // Apply status filter
    if (filters.status !== "All Status") {
      result = result.filter((emp) => emp.status === filters.status);
    }

    // Apply role filter
    if (filters.role !== "All Roles") {
      result = result.filter((emp) => emp.role === filters.role);
    }

    // Apply view mode filter
    if (viewMode !== "all") {
      result = result.filter((emp) => emp.role === viewMode);
    }

    // Apply sorting
    if (filters.sortBy) {
      const [key, direction] = filters.sortBy.split("-");
      result.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (key) {
          case "name":
            aValue = a.fullName;
            bValue = b.fullName;
            break;
          case "salary":
            aValue = a.salary + a.incentive - a.taxAmount;
            bValue = b.salary + b.incentive - b.taxAmount;
            break;
          case "date":
            aValue = new Date(a.dateOfJoining).getTime();
            bValue = new Date(b.dateOfJoining).getTime();
            break;
          case "performance":
            aValue = a.performance || 0;
            bValue = b.performance || 0;
            break;
          case "department":
            aValue = a.department;
            bValue = b.department;
            break;
          default:
            return 0;
        }

        if (direction === "desc") {
          [aValue, bValue] = [bValue, aValue];
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return result.slice(startIndex, endIndex);
  }, [employees, filters, viewMode, currentPage]);

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.search ||
      filters.department !== "All Departments" ||
      filters.status !== "All Status" ||
      filters.paymentStatus !== "All Payment" ||
      filters.role !== "All Roles" ||
      filters.dateRange !== "All Time" ||
      filters.sortBy
    );
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      department: "All Departments",
      status: "All Status",
      paymentStatus: "All Payment",
      role: "All Roles",
      dateRange: "All Time",
      sortBy: "",
    });
    setCurrentPage(1);
  };

  // Event handlers
  const handleEdit = (employee: Employee) => {
    toast.success(`Editing ${employee.fullName}`, {
      icon: "✏️",
    });
  };

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    toast.success("Employee deleted successfully", {
      icon: "🗑️",
    });
  };

  const handlePayment = (employee: Employee) => {
    toast.success(`Payment dialog for ${employee.fullName}`, {
      icon: "💳",
    });
  };

  const handleTerminate = (employee: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employee.id ? { ...emp, status: "terminated" } : emp,
      ),
    );
    toast.success(`${employee.fullName} has been terminated`, {
      icon: "👋",
    });
  };

  const handleViewProfile = (employee: Employee) => {
    toast.success(`Opening profile for ${employee.fullName}`, {
      icon: "👤",
    });
  };

  const handlePrint = (employee: Employee) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Employee Details - ${employee.fullName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; }
              .header { text-align: center; margin-bottom: 40px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .info-item { margin-bottom: 15px; }
              .label { font-weight: bold; color: #555; }
              .signature-area { margin-top: 100px; }
              .signature-line { width: 300px; border-top: 2px solid #000; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>EMPLOYEE DETAILS REPORT</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="info-grid">
              <div>
                <div class="info-item"><span class="label">Name:</span> ${employee.fullName}</div>
                <div class="info-item"><span class="label">Roll No:</span> ${employee.rollNo}</div>
                <div class="info-item"><span class="label">Department:</span> ${employee.department}</div>
                <div class="info-item"><span class="label">Job Title:</span> ${employee.jobTitle}</div>
              </div>
              <div>
                <div class="info-item"><span class="label">Salary:</span> PKR ${employee.salary.toLocaleString()}</div>
                <div class="info-item"><span class="label">Status:</span> ${employee.status}</div>
                <div class="info-item"><span class="label">Joining Date:</span> ${new Date(employee.dateOfJoining).toLocaleDateString()}</div>
                <div class="info-item"><span class="label">Contact:</span> ${employee.mobile}</div>
              </div>
            </div>
            <div class="signature-area">
              <p>Authorized Signature:</p>
              <div class="signature-line"></div>
              <p>Date: ___________________</p>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExport = (employee: Employee) => {
    const data = [
      ["Employee ID", employee.rollNo],
      ["Full Name", employee.fullName],
      ["Department", employee.department],
      ["Job Title", employee.jobTitle],
      ["Salary", `PKR ${employee.salary.toLocaleString()}`],
      ["Status", employee.status],
      ["Joining Date", new Date(employee.dateOfJoining).toLocaleDateString()],
    ];

    const csvContent = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee_${employee.rollNo}_details.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Employee data exported successfully!", {
      icon: "📥",
    });
  };

  const handleBulkPayment = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select employees first");
      return;
    }
    toast.success(
      `Processing bulk payment for ${selectedRows.length} employees`,
      {
        icon: "💳",
      },
    );
  };

  const handleBulkExport = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select employees first");
      return;
    }
    toast.success(`Exporting data for ${selectedRows.length} employees`, {
      icon: "📊",
    });
  };

  const handleQuickPay = (employee: Employee) => {
    toast.success(`Quick payment for ${employee.fullName}`, {
      icon: "⚡",
    });
  };

  const handleSendEmail = (employee: Employee) => {
    toast.success(`Email dialog for ${employee.fullName} would open here`, {
      icon: "📧",
    });
  };

  const handleSendNotification = (employee: Employee) => {
    toast.success(`Notification sent to ${employee.fullName}`, {
      icon: "🔔",
    });
  };

  const handleViewAttendance = (employee: Employee) => {
    toast.success(`Opening attendance for ${employee.fullName}`, {
      icon: "📅",
    });
  };

  const handleViewLeaves = (employee: Employee) => {
    toast.success(`Opening leave record for ${employee.fullName}`, {
      icon: "🏖️",
    });
  };

  // Statistics
  const totalActive = employees.filter((e) => e.status === "active").length;
  const totalHR = employees.filter((e) => e.role === "hr").length;
  const totalManagers = employees.filter((e) => e.role === "manager").length;
  const totalRegular = employees.filter((e) => e.role === "employee").length;
  const totalOnLeave = employees.filter((e) => e.status === "on-leave").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Employee Management
            </h1>
            <p className="text-gray-600">
              Manage all employees, HR staff, and track performance
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Refresh data
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
                toast.success("Data refreshed!");
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                toast.success("Add employee dialog would open here");
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border border-blue-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalEmployees}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-700">
                    {totalActive}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">HR Staff</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {totalHR}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {totalManagers}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-yellow-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Leave</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {totalOnLeave}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Tabs */}
        <Tabs
          defaultValue="all"
          onValueChange={(value: any) => {
            setViewMode(value);
            setCurrentPage(1);
          }}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
            >
              <Users className="h-4 w-4 mr-2" />
              All Employees
            </TabsTrigger>
            <TabsTrigger
              value="hr"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-md"
            >
              <Shield className="h-4 w-4 mr-2" />
              HR Staff
            </TabsTrigger>
            <TabsTrigger
              value="employee"
              className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm rounded-md"
            >
              <User className="h-4 w-4 mr-2" />
              Regular Employees
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm rounded-md"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payment View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6">
          <EmployeeFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            showRoleFilter={true}
            showDateFilter={true}
            showSortFilter={true}
            compact={false}
          />
        </div>
      )}

      {/* Employee Table */}
      <EmployeeTable
        employees={filteredEmployees}
        total={totalEmployees}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPayment={handlePayment}
        onTerminate={handleTerminate}
        onViewProfile={handleViewProfile}
        onPrint={handlePrint}
        onExport={handleExport}
        onQuickPay={handleQuickPay}
        onSendEmail={handleSendEmail}
        onSendNotification={handleSendNotification}
        onViewAttendance={handleViewAttendance}
        onViewLeaves={handleViewLeaves}
        viewMode={viewMode}
        loading={loading}
        showBulkActions={true}
        onBulkSelect={setSelectedRows}
        selectedEmployees={selectedRows}
        onBulkPayment={handleBulkPayment}
        onBulkExport={handleBulkExport}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Custom Toast Styling */}
      <style jsx global>{`
        .toast-success {
          background: linear-gradient(
            135deg,
            #10b981 0%,
            #059669 100%
          ) !important;
          color: white !important;
          border-radius: 10px !important;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3) !important;
        }
        .toast-error {
          background: linear-gradient(
            135deg,
            #ef4444 0%,
            #dc2626 100%
          ) !important;
          color: white !important;
          border-radius: 10px !important;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3) !important;
        }
        .toast-info {
          background: linear-gradient(
            135deg,
            #3b82f6 0%,
            #1d4ed8 100%
          ) !important;
          color: white !important;
          border-radius: 10px !important;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
