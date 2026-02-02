"use client";

import React, { useState } from "react";
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
  Camera,
  Key,
  Building,
  Banknote,
  Wallet,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";

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
  status: "active" | "inactive" | "terminated";
  dateOfJoining: string;
  createdAt: string;
  role: "employee" | "hr" | "admin";
  email?: string;
  fatherName?: string;
  address?: string;
  timing?: string;
  qualification?: {
    academic: string;
    other: string;
  };
  password?: string; // For admin view only
}

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
  onViewDetails?: (employee: Employee) => void; // NEW: Detailed view
  viewMode?: "all" | "hr" | "employee";
  loading?: boolean;
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
  onViewDetails,
  viewMode = "all",
  loading = false,
}) => {
  const { user } = useAuth();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Toggle row expansion for detailed view
  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500/20 to-green-400/10 text-green-700 border border-green-300/50 shadow-sm px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gradient-to-r from-gray-500/20 to-gray-400/10 text-gray-700 border border-gray-300/50 shadow-sm px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
            Inactive
          </Badge>
        );
      case "terminated":
        return (
          <Badge className="bg-gradient-to-r from-red-500/20 to-red-400/10 text-red-700 border border-red-300/50 shadow-sm px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
            Terminated
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      hr: "bg-gradient-to-r from-purple-500 to-pink-500",
      finance: "bg-gradient-to-r from-blue-500 to-cyan-500",
      sales: "bg-gradient-to-r from-green-500 to-emerald-500",
      marketing: "bg-gradient-to-r from-pink-500 to-rose-500",
      it: "bg-gradient-to-r from-indigo-500 to-violet-500",
      support: "bg-gradient-to-r from-teal-500 to-emerald-500",
      operations: "bg-gradient-to-r from-yellow-500 to-orange-500",
      admin: "bg-gradient-to-r from-gray-700 to-gray-900",
    };
    return colors[department] || "bg-gradient-to-r from-gray-500 to-gray-700";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRowClassName = (index: number) => {
    return cn(
      "transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white",
      index % 2 === 0
        ? "bg-gradient-to-r from-white to-gray-50/30"
        : "bg-gradient-to-r from-gray-50/50 to-white",
      "border-b border-gray-100/50",
    );
  };

  const getSalaryClass = (salary: number) => {
    if (salary > 100000) return "font-bold text-green-700";
    if (salary > 50000) return "font-semibold text-blue-700";
    return "text-gray-800";
  };

  // Detailed View Component
  const renderDetailedView = (employee: Employee) => {
    if (!expandedRows.has(employee.id)) return null;

    return (
      <tr>
        <td colSpan={8} className="p-0">
          <div className="bg-gradient-to-r from-blue-50/30 to-white border-t border-blue-100/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Father:</span>
                    <span className="font-medium">
                      {employee.fatherName || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">
                      {employee.address || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Qualification:</span>
                    <span className="font-medium">
                      {employee.qualification?.academic || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Timing:</span>
                    <span className="font-medium">
                      {employee.timing || "9:00 AM - 5:00 PM"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">
                      {formatDate(employee.dateOfJoining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Financial Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Basic Salary:</span>
                    <span className="font-medium">
                      {formatCurrency(employee.salary)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Incentive:</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(employee.incentive)}
                    </span>
                  </div>
                  {employee.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax Deduction:</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(employee.taxAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-semibold text-gray-700">
                      Net Salary:
                    </span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(
                        employee.salary +
                          employee.incentive -
                          employee.taxAmount,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              {user?.role === "admin" && employee.password && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            employee.password || "",
                          );
                          toast.success("Password copied to clipboard");
                        }}
                      >
                        <Key className="h-4 w-4" />
                        Show Password
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Password: {employee.password}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => onViewProfile(employee)}
              >
                <Eye className="h-4 w-4" />
                Full Profile
              </Button>
              {onPrint && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => onPrint(employee)}
                >
                  <Printer className="h-4 w-4" />
                  Print
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
              <TableRow className="bg-gradient-to-r from-blue-50 to-gray-50">
                {[...Array(8)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-32" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className={getRowClassName(i)}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700">
              <TableHead className="text-white font-semibold w-12">#</TableHead>
              <TableHead className="text-white font-semibold">
                Employee
              </TableHead>
              <TableHead className="text-white font-semibold">
                Department & Role
              </TableHead>
              <TableHead className="text-white font-semibold">
                Job Title
              </TableHead>
              <TableHead className="text-white font-semibold">Salary</TableHead>
              <TableHead className="text-white font-semibold">Status</TableHead>
              <TableHead className="text-white font-semibold">
                Joining Date
              </TableHead>
              <TableHead className="text-white font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <React.Fragment key={employee.id}>
                <TableRow
                  className={cn(
                    getRowClassName(index),
                    expandedRows.has(employee.id) && "bg-blue-50/30",
                  )}
                  onMouseEnter={() => setHoveredRow(employee.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                        {(currentPage - 1) * 10 + index + 1}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-lg">
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
                                  : "bg-gradient-to-br from-blue-500 to-blue-600",
                            )}
                          >
                            {employee.fullName?.charAt(0) || "U"}
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
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {employee.fullName}
                          </p>
                          {employee.role === "hr" && (
                            <Star className="h-3 w-3 text-purple-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {employee.rollNo || "No Roll No"}
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
                          "text-white px-3 py-1 rounded-full w-fit",
                          getDepartmentColor(employee.department),
                        )}
                      >
                        {employee.department.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium capitalize">
                          {employee.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-800">
                        {employee.jobTitle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p
                        className={cn(
                          "text-lg font-bold",
                          getSalaryClass(employee.salary),
                        )}
                      >
                        {formatCurrency(
                          employee.salary +
                            employee.incentive -
                            employee.taxAmount,
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          +{formatCurrency(employee.incentive)}
                        </Badge>
                        {employee.taxAmount > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            -{formatCurrency(employee.taxAmount)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(employee.status)}
                      {user?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => toggleRowExpansion(employee.id)}
                        >
                          {expandedRows.has(employee.id)
                            ? "Hide Details"
                            : "View Details"}
                        </Button>
                      )}
                    </div>
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
                            (1000 * 60 * 60 * 24 * 30),
                        )}{" "}
                        months ago
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Quick View Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                if (onViewDetails) {
                                  onViewDetails(employee);
                                } else {
                                  toggleRowExpansion(employee.id);
                                }
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
                      {(user?.role === "admin" ||
                        (user?.role === "hr" &&
                          employee.role === "employee")) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
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
                      )}

                      {/* Payment Button */}
                      {(user?.role === "admin" || user?.role === "hr") && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700"
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
                      )}

                      {/* More Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => onViewProfile(employee)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Profile
                          </DropdownMenuItem>

                          {onPrint && (
                            <DropdownMenuItem onClick={() => onPrint(employee)}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Details
                            </DropdownMenuItem>
                          )}

                          {onExport && (
                            <DropdownMenuItem
                              onClick={() => onExport(employee)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                          )}

                          {(user?.role === "admin" ||
                            (user?.role === "hr" &&
                              employee.role === "employee")) && (
                            <DropdownMenuItem onClick={() => onEdit(employee)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                          )}

                          {(user?.role === "admin" || user?.role === "hr") && (
                            <DropdownMenuItem
                              onClick={() => onPayment(employee)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Process Payment
                            </DropdownMenuItem>
                          )}

                          {user?.role === "admin" && (
                            <>
                              <DropdownMenuSeparator />
                              {employee.status !== "terminated" ? (
                                <DropdownMenuItem
                                  onClick={() => onTerminate(employee)}
                                  className="text-red-600"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Terminate Employee
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Reactivate logic
                                  }}
                                  className="text-green-600"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  Reactivate Employee
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => onDelete(employee.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Detailed View Row */}
                {renderDetailedView(employee)}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {employees.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t bg-gradient-to-r from-gray-50 to-white">
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
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
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
                    "w-8 h-8 p-0",
                    currentPage === pageNum && "bg-blue-600 text-white",
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
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {employees.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No employees found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or add a new employee.
          </p>
        </div>
      )}
    </div>
  );
};
