"use client";

import React, { useState, useEffect } from "react";

import {
  EmployeeFilters,
  EmployeeTable,
} from "@/components/employee-management/EmployeeTable";
import { PaymentDialog } from "@/components/employee-management/PaymentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
}
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
  const router = useRouter();

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
