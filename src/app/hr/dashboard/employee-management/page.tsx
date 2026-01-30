'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeTable } from '@/components/employee-management/EmployeeTable';
import { EmployeeForm } from '@/components/employee-management/EmployeeForm';
import { PaymentDialog } from '@/components/employee-management/PaymentDialog';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api-request';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
  status: 'active' | 'inactive' | 'terminated';
  dateOfJoining: string;
  createdAt: string;
}

export default function HREmployeeManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    status: 'all',
    paymentStatus: 'all',
  });

  // Fetch employees
  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.department !== 'all' && { department: filters.department }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
      });

      const response = await apiRequest(`/api/employees?${params}`);
      
      if (response.success) {
        setEmployees(response.data);
        setTotal(response.pagination!.total);
        setTotalPages(response.pagination!.totalPages);
        setCurrentPage(response.pagination!.page);
      } else {
        toast.error(response.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDelete = async (id: string) => {
    toast.error('HR cannot delete employees. Please contact admin.');
  };

  const handlePayment = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPaymentDialog(true);
  };

  const handleTerminate = async (employee: Employee) => {
    toast.error('HR cannot terminate employees. Please contact admin.');
  };

  const handleViewProfile = (employee: Employee) => {
    router.push(`/hr/profile/${employee.id}`);
  };

  const handleExport = async () => {
    try {
      const response = await apiRequest('/api/employees/export', {
        method: 'GET',
      });

      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Employee data exported successfully');
      }
    } catch (error) {
      console.error('Error exporting employees:', error);
      toast.error('Failed to export employees');
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage employee details and payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fetchEmployees(currentPage)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setShowEmployeeForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

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
          />
        </CardContent>
      </Card>

      {/* Employee Form Dialog (HR limited version) */}
      {showEmployeeForm && (
        <EmployeeForm
          employee={selectedEmployee}
          isHR={true}
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