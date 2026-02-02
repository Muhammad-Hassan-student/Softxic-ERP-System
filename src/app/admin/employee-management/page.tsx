"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchGet, fetchDelete, fetchPut } from "@/lib/fetch-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  EmployeeFilters,
  EmployeeTable,
} from "@/components/employee-management/EmployeeTable";
import { EmployeeForm } from "@/components/employee-management/EmployeeForm";
import { PaymentDialog } from "@/components/employee-management/PaymentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Users,
  UserPlus,
  Download,
  RefreshCw,
  Filter,
  FilterX,
  CreditCard,
  Mail,
  Bell,
  CalendarDays,
  Printer,
  Eye,
  Edit,
  UserX,
  Trash2,
  CheckCircle,
  Shield,
  Award,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  IndianRupee,
  FileSpreadsheet,
  Send,
  History,
  User,
  Plus,
  Search,
  TrendingDown,
  FileText,
} from "lucide-react";

// Types
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
  terminationReason?: string;
}

export default function EmployeeManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  // Enhanced filters state
  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    status: "all",
    role: "all",
    sortBy: "",
    salaryMin: "",
    salaryMax: "",
  });

  // Departments for filter
  const departments = [
    { value: "all", label: "All Departments" },
    { value: "HR", label: "HR" },
    { value: "Finance", label: "Finance" },
    { value: "Sales", label: "Sales" },
    { value: "Marketing", label: "Marketing" },
    { value: "IT", label: "IT" },
    { value: "Engineering", label: "Engineering" },
    { value: "Operations", label: "Operations" },
    { value: "Admin", label: "Admin" },
    { value: "Support", label: "Support" },
    { value: "Management", label: "Management" },
  ];

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "terminated", label: "Terminated" },
    { value: "on-leave", label: "On Leave" },
  ];

  // Role options
  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "employee", label: "Employee" },
    { value: "hr", label: "HR Staff" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to continue");
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch employees from API
  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.search && { search: filters.search }),
        ...(filters.department !== "all" && { department: filters.department }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.role !== "all" && { role: filters.role }),
        ...(filters.sortBy && { sort: filters.sortBy }),
        ...(filters.salaryMin && { salary_min: filters.salaryMin }),
        ...(filters.salaryMax && { salary_max: filters.salaryMax }),
        ...(viewMode !== "all" && viewMode !== "payment" && { role: viewMode }),
      });

      const url = `/api/employees?${params.toString()}`;
      const response = await fetchGet<Employee[]>(url);

      if (response.success) {
        setEmployees(response.data || []);
        setTotalEmployees(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.page || 1);
      } else {
        console.error("Fetch failed:", response.message);
        toast.error(response.message || "Failed to fetch employees");

        // Fallback to mock data if API fails
        loadMockEmployees();
      }
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast.error(error.message || "Failed to fetch employees");
      loadMockEmployees();
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const loadMockEmployees = () => {
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
  };

  // Initial load
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchEmployees(currentPage);
    }
  }, [authLoading, isAuthenticated]);

  // Filter employees on filter changes
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchEmployees(1);
    }
  }, [filters, viewMode]);

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.search ||
      filters.department !== "all" ||
      filters.status !== "all" ||
      filters.role !== "all" ||
      filters.sortBy ||
      filters.salaryMin ||
      filters.salaryMax
    );
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      department: "all",
      status: "all",
      role: "all",
      sortBy: "",
      salaryMin: "",
      salaryMax: "",
    });
    setCurrentPage(1);
  };

  // Event handlers
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

  const handleExport = async (employee?: Employee) => {
    try {
      if (employee) {
        // Single employee export
        const data = [
          ["Employee ID", employee.rollNo],
          ["Full Name", employee.fullName],
          ["Department", employee.department],
          ["Job Title", employee.jobTitle],
          ["Salary", `PKR ${employee.salary.toLocaleString()}`],
          ["Status", employee.status],
          [
            "Joining Date",
            new Date(employee.dateOfJoining).toLocaleDateString(),
          ],
          ["Mobile", employee.mobile],
          ["Email", employee.email || ""],
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

        toast.success("Employee data exported successfully!");
      } else {
        // Bulk export
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

          toast.success("All employee data exported successfully");
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to export employees");
        }
      }
    } catch (error: any) {
      console.error("Error exporting:", error);
      toast.error(error.message || "Failed to export data");
    }
  };

  const handleBulkPayment = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select employees first");
      return;
    }
    toast.success(
      `Processing bulk payment for ${selectedRows.length} employees`,
    );
  };

  const handleBulkExport = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select employees first");
      return;
    }
    handleExport();
  };

  const handleQuickPay = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPaymentDialog(true);
  };

  const handleSendEmail = (employee: Employee) => {
    const subject = encodeURIComponent("Important Update");
    const body = encodeURIComponent(`Dear ${employee.fullName},\n\n`);
    window.location.href = `mailto:${employee.email}?subject=${subject}&body=${body}`;
    toast.success(`Email opened for ${employee.fullName}`);
  };

  const handleSendNotification = (employee: Employee) => {
    toast.success(`Notification sent to ${employee.fullName}`);
  };

  const handleViewAttendance = (employee: Employee) => {
    router.push(`/admin/attendance?employeeId=${employee.id}`);
  };

  const handleViewLeaves = (employee: Employee) => {
    router.push(`/admin/leaves?employeeId=${employee.id}`);
  };

  // Statistics
  const totalActive = employees.filter((e) => e.status === "active").length;
  const totalHR = employees.filter((e) => e.role === "hr").length;
  const totalManagers = employees.filter((e) => e.role === "manager").length;
  const totalAdmins = employees.filter((e) => e.role === "admin").length;
  const totalRegular = employees.filter((e) => e.role === "employee").length;
  const totalOnLeave = employees.filter((e) => e.status === "on-leave").length;
  const totalTerminated = employees.filter(
    (e) => e.status === "terminated",
  ).length;

  // Loading state
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
            {user && (
              <div className="flex items-center gap-4 mt-2">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  Total: {totalEmployees} employees
                </span>
              </div>
            )}
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
              onClick={() => fetchEmployees(currentPage)}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport()}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Button
              onClick={() => {
                setSelectedEmployee(null);
                setShowEmployeeForm(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalEmployees}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">All employees</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-700">
                    {totalActive}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    {totalEmployees > 0
                      ? ((totalActive / totalEmployees) * 100).toFixed(1)
                      : "0"}
                    % active
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">HR Staff</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {totalHR}
                  </p>
                  <p className="text-xs text-purple-500 mt-1">HR team</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {totalManagers}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">Leadership</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-yellow-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Leave</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {totalOnLeave}
                  </p>
                  <p className="text-xs text-yellow-500 mt-1">Currently away</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-red-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminated</p>
                  <p className="text-2xl font-bold text-red-700">
                    {totalTerminated}
                  </p>
                  <p className="text-xs text-red-500 mt-1">Inactive</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-red-600" />
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
          <TabsList className="grid grid-cols-5 w-full max-w-3xl bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
            >
              <Users className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger
              value="hr"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-md"
            >
              <Shield className="h-4 w-4 mr-2" />
              HR
            </TabsTrigger>
            <TabsTrigger
              value="employee"
              className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm rounded-md"
            >
              <User className="h-4 w-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm rounded-md"
            >
              <Award className="h-4 w-4 mr-2" />
              Admins
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm rounded-md"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, roll no, mobile..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Department Filter */}
              <Select
                value={filters.department}
                onValueChange={(value) =>
                  handleFilterChange("department", value)
                }
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
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
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

              {/* Role Filter */}
              <Select
                value={filters.role}
                onValueChange={(value) => handleFilterChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Salary Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Salary Range (PKR)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) =>
                      handleFilterChange("salaryMin", e.target.value)
                    }
                    className="w-full"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) =>
                      handleFilterChange("salaryMax", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="salary-asc">
                      Salary (Low to High)
                    </SelectItem>
                    <SelectItem value="salary-desc">
                      Salary (High to Low)
                    </SelectItem>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className="flex-1 flex items-center gap-2"
                >
                  <FilterX className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filters.search && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Search: "{filters.search}"
                    <button
                      onClick={() => handleFilterChange("search", "")}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.department !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Dept:{" "}
                    {
                      departments.find((d) => d.value === filters.department)
                        ?.label
                    }
                    <button
                      onClick={() => handleFilterChange("department", "all")}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.status !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Status:{" "}
                    {
                      statusOptions.find((s) => s.value === filters.status)
                        ?.label
                    }
                    <button
                      onClick={() => handleFilterChange("status", "all")}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.role !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Role:{" "}
                    {roleOptions.find((r) => r.value === filters.role)?.label}
                    <button
                      onClick={() => handleFilterChange("role", "all")}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {(filters.salaryMin || filters.salaryMax) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Salary: {filters.salaryMin || "0"} -{" "}
                    {filters.salaryMax || "∞"}
                    <button
                      onClick={() => {
                        handleFilterChange("salaryMin", "");
                        handleFilterChange("salaryMax", "");
                      }}
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
      )}

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        total={totalEmployees}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          fetchEmployees(page);
        }}
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
            {hasActiveFilters
              ? "Try adjusting your filters or search term"
              : "Get started by adding your first employee"}
          </p>
          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setShowEmployeeForm(true);
            }}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Add Employee
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
