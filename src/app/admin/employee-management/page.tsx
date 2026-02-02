"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeForm } from "@/components/employee-management/EmployeeForm";
import { PaymentDialog } from "@/components/employee-management/PaymentDialog";
import { useAuth } from "@/context/AuthContext";
import { fetchGet, fetchDelete, fetchPut } from "@/lib/fetch-utils";
import {
  Plus,
  Download,
  RefreshCw,
  Search,
  Users,
  Eye,
  Printer,
  FilterX,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmployeeTable } from "@/components/employee-management/EmployeeTable";

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
}

export default function AdminEmployeeManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"all" | "hr" | "employee">("all");

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  // Simple filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Departments for filter
  const departments = [
    { value: "all", label: "All Departments" },
    { value: "hr", label: "HR" },
    { value: "finance", label: "Finance" },
    { value: "sales", label: "Sales" },
    { value: "marketing", label: "Marketing" },
    { value: "it", label: "IT" },
    { value: "support", label: "Support" },
    { value: "operations", label: "Operations" },
    { value: "admin", label: "Admin" },
  ];

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "terminated", label: "Terminated" },
  ];

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("Please login to continue");
        router.push("/login");
        return;
      }

      if (user?.role !== "admin") {
        toast.error("Access denied. Admin only.");
        router.push(`/${user?.role}/dashboard`);
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch employees with direct fetch
  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        role: viewMode === "all" ? "all" : viewMode,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDept !== "all" && { department: selectedDept }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
      });

      const url = `/api/employees?${params.toString()}`;
      console.log("🔍 Fetching employees:", url);

      const response = await fetchGet<Employee[]>(url);

      if (response.success) {
        setEmployees(response.data || []);
        setTotal(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.page || 1);

        console.log(`✅ Fetched ${response.data?.length || 0} employees`);
      } else {
        console.error("❌ Fetch failed:", response.message);
        toast.error(response.message || "Failed to fetch employees");
      }
    } catch (error: any) {
      console.error("❌ Error fetching employees:", error);
      toast.error(error.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchEmployees(currentPage);
    }
  }, [
    currentPage,
    viewMode,
    searchTerm,
    selectedDept,
    selectedStatus,
    authLoading,
    isAuthenticated,
    user,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetchDelete(`/api/employees/${id}`);

      if (response.success) {
        toast.success("Employee deleted successfully");
        fetchEmployees(currentPage);
      } else {
        toast.error(response.message || "Failed to delete employee");
      }
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast.error(error.message || "Failed to delete employee");
    }
  };

  const handlePayment = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPaymentDialog(true);
  };

  const handleTerminate = async (employee: Employee) => {
    const reason = prompt("Enter termination reason:");
    if (!reason) return;

    try {
      const response = await fetchPut(`/api/employees/${employee.id}`, {
        status: "terminated",
        terminationReason: reason,
      });

      if (response.success) {
        toast.success("Employee terminated successfully");
        fetchEmployees(currentPage);
      } else {
        toast.error(response.message || "Failed to terminate employee");
      }
    } catch (error: any) {
      console.error("Error terminating employee:", error);
      toast.error(error.message || "Failed to terminate employee");
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/employees/export", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Employee data exported successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to export employees");
      }
    } catch (error: any) {
      console.error("Error exporting employees:", error);
      toast.error(error.message || "Failed to export employees");
    }
  };

  const handleViewProfile = (employee: Employee) => {
    router.push(`/admin/profile/${employee.id}`);
  };

  const handlePrint = (employee: Employee) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Employee Details - ${employee.fullName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .employee-info { margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; color: #555; }
              .value { margin-left: 10px; }
              .signature-section { margin-top: 50px; }
              .signature-line { width: 300px; border-top: 1px solid #000; margin-top: 50px; }
              .stamp-area { width: 150px; height: 100px; border: 2px dashed #ccc; margin-top: 30px; }
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">ENTERPRISE ERP SYSTEM</div>
              <div>Employee Details Report</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="employee-info">
              <h2>Employee Information</h2>
              <div class="section">
                <span class="label">Name:</span>
                <span class="value">${employee.fullName}</span>
              </div>
              <div class="section">
                <span class="label">Roll No:</span>
                <span class="value">${employee.rollNo || "N/A"}</span>
              </div>
              <div class="section">
                <span class="label">Role:</span>
                <span class="value">${employee.role.toUpperCase()}</span>
              </div>
              <div class="section">
                <span class="label">Department:</span>
                <span class="value">${employee.department}</span>
              </div>
              <div class="section">
                <span class="label">Job Title:</span>
                <span class="value">${employee.jobTitle}</span>
              </div>
              <div class="section">
                <span class="label">Status:</span>
                <span class="value">${employee.status}</span>
              </div>
              <div class="section">
                <span class="label">Joining Date:</span>
                <span class="value">${new Date(employee.dateOfJoining).toLocaleDateString()}</span>
              </div>
              <div class="section">
                <span class="label">Salary:</span>
                <span class="value">PKR ${employee.salary?.toLocaleString() || "0"}</span>
              </div>
            </div>
            
            <div class="signature-section">
              <div>Authorized Signature</div>
              <div class="signature-line"></div>
              <div style="margin-top: 10px; font-size: 12px;">Date: ___________________</div>
              
              <div style="margin-top: 40px;">
                <div>Official Stamp</div>
                <div class="stamp-area"></div>
              </div>
            </div>
            
            <div class="no-print" style="margin-top: 50px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print This Page
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close Window
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDept("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const hrEmployees = employees.filter((e) => e.role === "hr").length;
  const regularEmployees = employees.filter(
    (e) => e.role === "employee",
  ).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all employees and HR staff
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Role:{" "}
              <span className="font-semibold text-blue-600">
                {user.role.toUpperCase()}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fetchEmployees(currentPage)}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setShowEmployeeForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add {viewMode === "hr" ? "HR Staff" : "Employee"}
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6">
        <Tabs
          defaultValue="all"
          onValueChange={(value: any) => {
            setViewMode(value);
            setCurrentPage(1);
          }}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              All ({totalEmployees})
            </TabsTrigger>
            <TabsTrigger
              value="hr"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              HR Staff ({hrEmployees})
            </TabsTrigger>
            <TabsTrigger
              value="employee"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Employees ({regularEmployees})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter Section - SIMPLE */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, roll no, mobile..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Department Filter */}
            <Select
              value={selectedDept}
              onValueChange={(value) => {
                setSelectedDept(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={
                searchTerm === "" &&
                selectedDept === "all" &&
                selectedStatus === "all"
              }
              className="flex items-center gap-2"
            >
              <FilterX className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>

          {/* Active Filters Badges */}
          {(searchTerm ||
            selectedDept !== "all" ||
            selectedStatus !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedDept !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Dept:{" "}
                  {departments.find((d) => d.value === selectedDept)?.label}
                  <button
                    onClick={() => setSelectedDept("all")}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status:{" "}
                  {statusOptions.find((s) => s.value === selectedStatus)?.label}
                  <button
                    onClick={() => setSelectedStatus("all")}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold mt-1">{totalEmployees}</p>
                <p className="text-xs text-gray-400 mt-1">All roles</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold mt-1">{activeEmployees}</p>
                <p className="text-xs text-green-500 mt-1">
                  {totalEmployees > 0
                    ? ((activeEmployees / totalEmployees) * 100).toFixed(1)
                    : "0"}
                  % active
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">HR Staff</p>
                <p className="text-2xl font-bold mt-1">{hrEmployees}</p>
                <p className="text-xs text-purple-500 mt-1">
                  {viewMode === "all" ? "HR team members" : "HR view only"}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold mt-1">
                  {
                    employees.filter((e) => {
                      const joinDate = new Date(e.dateOfJoining);
                      const now = new Date();
                      return (
                        joinDate.getMonth() === now.getMonth() &&
                        joinDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">New joins</p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardContent className="p-0">
          <EmployeeTable
            employees={employees}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPayment={handlePayment}
            onTerminate={handleTerminate}
            onViewProfile={handleViewProfile}
            onPrint={handlePrint}
            viewMode={viewMode}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Empty State */}
      {!loading && employees.length === 0 && (
        <div className="mt-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {viewMode !== "all" ? viewMode : ""} employees found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {searchTerm || selectedDept !== "all" || selectedStatus !== "all"
              ? "Try adjusting your filters or search term"
              : "Get started by adding your first employee/HR"}
          </p>
          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setShowEmployeeForm(true);
            }}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Add {viewMode === "hr" ? "HR Staff" : "Employee"}
          </Button>
        </div>
      )}

      {/* Employee Form Dialog */}
      {showEmployeeForm && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => {
            setShowEmployeeForm(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            setShowEmployeeForm(false);
            setSelectedEmployee(null);
            fetchEmployees(currentPage);
          }}
        />
      )}

      {/* Payment Dialog */}
      {showPaymentDialog && selectedEmployee && (
        <PaymentDialog
          employee={selectedEmployee}
          onClose={() => {
            setShowPaymentDialog(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            setShowPaymentDialog(false);
            setSelectedEmployee(null);
            fetchEmployees(currentPage);
          }}
        />
      )}
    </div>
  );
}
