"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Calendar,
  Building,
  UserCheck,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmployeeFiltersProps {
  filters: {
    search: string;
    department: string;
    status: string;
    paymentStatus: string;
    role?: string;
    dateRange?: string;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  showRoleFilter?: boolean;
  showDateFilter?: boolean;
  compact?: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  showRoleFilter = false,
  showDateFilter = false,
  compact = false,
}) => {
  const departments = [
    "All Departments",
    "hr",
    "finance",
    "sales",
    "marketing",
    "it",
    "engineering",
    "operations",
    "admin",
    "support",
  ];

  const statuses = ["All Status", "active", "inactive", "terminated"];
  const paymentStatuses = ["All Payment", "paid", "unpaid", "pending"];
  const roles = ["All Roles", "employee", "hr", "admin"];
  const dateRanges = [
    "All Time",
    "Today",
    "This Week",
    "This Month",
    "Last Month",
    "This Year",
  ];

  const hasActiveFilters =
    filters.search ||
    filters.department !== "All Departments" ||
    filters.status !== "All Status" ||
    filters.paymentStatus !== "All Payment" ||
    (showRoleFilter && filters.role !== "All Roles") ||
    (showDateFilter && filters.dateRange !== "All Time");

  const getFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.department !== "All Departments") count++;
    if (filters.status !== "All Status") count++;
    if (filters.paymentStatus !== "All Payment") count++;
    if (showRoleFilter && filters.role !== "All Roles") count++;
    if (showDateFilter && filters.dateRange !== "All Time") count++;
    return count;
  };

  const activeFilterCount = getFilterCount();

  // Department color mapping
  const getDepartmentColor = (dept: string) => {
    const colorMap: Record<string, string> = {
      hr: "purple",
      finance: "blue",
      sales: "green",
      marketing: "pink",
      it: "indigo",
      engineering: "orange",
      operations: "teal",
      admin: "gray",
      support: "cyan",
    };
    return colorMap[dept] || "gray";
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-gray-50/50 to-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                className="pl-10 bg-white/70 backdrop-blur-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2 hover:shadow-sm transition-all"
            >
              <X className="h-4 w-4" />
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-50/50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            Filters{" "}
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50/50"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <Input
              placeholder="Search by name, roll no, mobile..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className={cn(
                "pl-10 bg-white/80 backdrop-blur-sm transition-all",
                "border-gray-300 hover:border-blue-400 focus:border-blue-500",
                "focus:ring-2 focus:ring-blue-500/20",
                "placeholder:text-gray-400",
              )}
            />
          </div>

          {/* Department */}
          <div className="group">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
              <label className="text-xs font-medium text-gray-600">
                Department
              </label>
            </div>
            <Select
              value={filters.department}
              onValueChange={(value) =>
                onFilterChange({ ...filters, department: value })
              }
            >
              <SelectTrigger
                className={cn(
                  "bg-white/80 backdrop-blur-sm transition-all",
                  "border-gray-300 hover:border-purple-400 focus:border-purple-500",
                  "focus:ring-2 focus:ring-purple-500/20",
                  "data-[state=open]:border-purple-500",
                )}
              >
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl">
                {departments.map((dept) => (
                  <SelectItem
                    key={dept}
                    value={dept}
                    className="hover:bg-purple-50/50 focus:bg-purple-50/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {dept === "All Departments" ? (
                        <span className="text-gray-600">{dept}</span>
                      ) : (
                        <>
                          <div
                            className={`h-2 w-2 rounded-full bg-${getDepartmentColor(dept)}-500`}
                          ></div>
                          <span className="capitalize">{dept}</span>
                        </>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="group">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
              <label className="text-xs font-medium text-gray-600">
                Status
              </label>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                onFilterChange({ ...filters, status: value })
              }
            >
              <SelectTrigger
                className={cn(
                  "bg-white/80 backdrop-blur-sm transition-all",
                  "border-gray-300 hover:border-green-400 focus:border-green-500",
                  "focus:ring-2 focus:ring-green-500/20",
                  "data-[state=open]:border-green-500",
                )}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl">
                {statuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="hover:bg-green-50/50 focus:bg-green-50/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {status === "All Status" ? (
                        <span className="text-gray-600">{status}</span>
                      ) : (
                        <>
                          <div
                            className={`h-2 w-2 rounded-full ${status === "active" ? "bg-green-500" : status === "inactive" ? "bg-gray-400" : "bg-red-500"}`}
                          ></div>
                          <span className="capitalize">{status}</span>
                        </>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="group">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
              <label className="text-xs font-medium text-gray-600">
                Payment Status
              </label>
            </div>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) =>
                onFilterChange({ ...filters, paymentStatus: value })
              }
            >
              <SelectTrigger
                className={cn(
                  "bg-white/80 backdrop-blur-sm transition-all",
                  "border-gray-300 hover:border-amber-400 focus:border-amber-500",
                  "focus:ring-2 focus:ring-amber-500/20",
                  "data-[state=open]:border-amber-500",
                )}
              >
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl">
                {paymentStatuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="hover:bg-amber-50/50 focus:bg-amber-50/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {status === "All Payment" ? (
                        <span className="text-gray-600">{status}</span>
                      ) : (
                        <>
                          <div
                            className={`h-2 w-2 rounded-full ${status === "paid" ? "bg-green-500" : status === "unpaid" ? "bg-red-500" : "bg-yellow-500"}`}
                          ></div>
                          <span className="capitalize">{status}</span>
                        </>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Filters Row - Conditional */}
        {(showRoleFilter || showDateFilter) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200/50">
            {/* Role Filter - Conditional */}
            {showRoleFilter && (
              <div className="group">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  <label className="text-xs font-medium text-gray-600">
                    Role
                  </label>
                </div>
                <Select
                  value={filters.role || "All Roles"}
                  onValueChange={(value) =>
                    onFilterChange({ ...filters, role: value })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "bg-white/80 backdrop-blur-sm transition-all",
                      "border-gray-300 hover:border-indigo-400 focus:border-indigo-500",
                      "focus:ring-2 focus:ring-indigo-500/20",
                      "data-[state=open]:border-indigo-500",
                    )}
                  >
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl">
                    {roles.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="hover:bg-indigo-50/50 focus:bg-indigo-50/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {role === "All Roles" ? (
                            <span className="text-gray-600">{role}</span>
                          ) : (
                            <>
                              <div
                                className={`h-2 w-2 rounded-full ${role === "admin" ? "bg-red-500" : role === "hr" ? "bg-purple-500" : "bg-blue-500"}`}
                              ></div>
                              <span className="capitalize">{role}</span>
                            </>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter - Conditional */}
            {showDateFilter && (
              <div className="group">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  <label className="text-xs font-medium text-gray-600">
                    Date Range
                  </label>
                </div>
                <Select
                  value={filters.dateRange || "All Time"}
                  onValueChange={(value) =>
                    onFilterChange({ ...filters, dateRange: value })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "bg-white/80 backdrop-blur-sm transition-all",
                      "border-gray-300 hover:border-teal-400 focus:border-teal-500",
                      "focus:ring-2 focus:ring-teal-500/20",
                      "data-[state=open]:border-teal-500",
                    )}
                  >
                    <SelectValue placeholder="Select Date Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl">
                    {dateRanges.map((range) => (
                      <SelectItem
                        key={range}
                        value={range}
                        className="hover:bg-teal-50/50 focus:bg-teal-50/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {range === "All Time" ? (
                            <span className="text-gray-600">{range}</span>
                          ) : (
                            <>
                              <Calendar className="h-3 w-3 text-teal-500" />
                              <span>{range}</span>
                            </>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-6 pt-4 border-t border-gray-200/50">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-500 mr-2 flex items-center">
                Active filters:
              </span>

              {/* Search Filter */}
              {filters.search && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 text-xs font-medium border border-blue-200/50">
                  <Search className="h-3 w-3 mr-1.5" />
                  Search: "{filters.search}"
                  <button
                    onClick={() => onFilterChange({ ...filters, search: "" })}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Department Filter */}
              {filters.department !== "All Departments" && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-100/80 backdrop-blur-sm text-purple-700 text-xs font-medium border border-purple-200/50">
                  <Building className="h-3 w-3 mr-1.5" />
                  Dept: {filters.department}
                  <button
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        department: "All Departments",
                      })
                    }
                    className="ml-2 text-purple-500 hover:text-purple-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Status Filter */}
              {filters.status !== "All Status" && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100/80 backdrop-blur-sm text-green-700 text-xs font-medium border border-green-200/50">
                  <UserCheck className="h-3 w-3 mr-1.5" />
                  Status: {filters.status}
                  <button
                    onClick={() =>
                      onFilterChange({ ...filters, status: "All Status" })
                    }
                    className="ml-2 text-green-500 hover:text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Payment Status Filter */}
              {filters.paymentStatus !== "All Payment" && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100/80 backdrop-blur-sm text-amber-700 text-xs font-medium border border-amber-200/50">
                  <Filter className="h-3 w-3 mr-1.5" />
                  Payment: {filters.paymentStatus}
                  <button
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        paymentStatus: "All Payment",
                      })
                    }
                    className="ml-2 text-amber-500 hover:text-amber-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Role Filter */}
              {showRoleFilter &&
                filters.role &&
                filters.role !== "All Roles" && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-100/80 backdrop-blur-sm text-indigo-700 text-xs font-medium border border-indigo-200/50">
                    <User className="h-3 w-3 mr-1.5" />
                    Role: {filters.role}
                    <button
                      onClick={() =>
                        onFilterChange({ ...filters, role: "All Roles" })
                      }
                      className="ml-2 text-indigo-500 hover:text-indigo-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

              {/* Date Range Filter */}
              {showDateFilter &&
                filters.dateRange &&
                filters.dateRange !== "All Time" && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-100/80 backdrop-blur-sm text-teal-700 text-xs font-medium border border-teal-200/50">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    Period: {filters.dateRange}
                    <button
                      onClick={() =>
                        onFilterChange({ ...filters, dateRange: "All Time" })
                      }
                      className="ml-2 text-teal-500 hover:text-teal-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
            </div>

            {/* Clear All Button */}
            <div className="flex justify-end mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50/50 border-gray-300 hover:border-red-300"
              >
                <X className="h-3.5 w-3.5" />
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
