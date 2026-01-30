'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  UserX,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmployeeFilters } from './EmployeeFilter';
import { useAuth } from '@/context/AuthContext';

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
}) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    status: 'all',
    paymentStatus: 'all',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'terminated':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDepartmentBadge = (department: string) => {
    const colors: Record<string, string> = {
      hr: 'bg-purple-100 text-purple-800',
      finance: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      marketing: 'bg-pink-100 text-pink-800',
      it: 'bg-indigo-100 text-indigo-800',
      operations: 'bg-orange-100 text-orange-800',
      admin: 'bg-gray-100 text-gray-800',
      support: 'bg-teal-100 text-teal-800',
    };
    return (
      <Badge className={colors[department] || 'bg-gray-100 text-gray-800'}>
        {department.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Filters */}
      <div className="p-6 border-b">
        <EmployeeFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({
            search: '',
            department: 'all',
            status: 'all',
            paymentStatus: 'all',
          })}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow 
                key={employee.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewProfile(employee)}
              >
                <TableCell className="font-medium">
                  {(currentPage - 1) * 10 + index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employee.profilePhoto} />
                      <AvatarFallback>
                        {employee.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.fullName}</p>
                      <p className="text-sm text-gray-500">{employee.rollNo}</p>
                      <p className="text-xs text-gray-400">{employee.mobile}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getDepartmentBadge(employee.department)}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{employee.jobTitle}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold">{formatCurrency(employee.salary)}</p>
                    {employee.incentive > 0 && (
                      <p className="text-xs text-green-600">
                        +{formatCurrency(employee.incentive)} incentive
                      </p>
                    )}
                    {employee.taxAmount > 0 && (
                      <p className="text-xs text-red-600">
                        -{formatCurrency(employee.taxAmount)} tax
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(employee.status)}
                </TableCell>
                <TableCell>
                  {formatDate(employee.dateOfJoining)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewProfile(employee)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(employee)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPayment(employee)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Make Payment
                      </DropdownMenuItem>
                      {user?.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          {employee.status !== 'terminated' ? (
                            <DropdownMenuItem 
                              onClick={() => onTerminate(employee)}
                              className="text-red-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Terminate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => {/* Reactivate logic */}}
                              className="text-green-600"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => onDelete(employee.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-gray-700">
          Showing {employees.length} of {total} employees
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
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
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
    </div>
  );
};