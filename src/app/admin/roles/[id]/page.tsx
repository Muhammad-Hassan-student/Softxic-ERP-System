'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  FileText,
  BarChart3,
  CreditCard,
  Package,
  Settings
} from 'lucide-react';
import { Role } from '@/types/role';
import { MODULES_CONFIG } from '@/types/role';
import toast from 'react-hot-toast';

const moduleIcons: Record<string, React.ReactNode> = {
  dashboard: <BarChart3 className="h-4 w-4" />,
  employee_management: <Users className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  payroll: <FileText className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  attendance: <Calendar className="h-4 w-4" />,
  inventory: <Package className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
};

export default function RoleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRole();
  }, [params.id]);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/roles/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch role');
      
      const data = await response.json();
      if (data.success) {
        setRole(data.data);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
     toast.error('Failed to load role details')
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!role) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Role not found</h3>
          <p className="text-gray-600 mt-2">The role you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/roles')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Get permissions by category
  const permissionsByCategory = MODULES_CONFIG.reduce((acc, module) => {
    const permission = role.permissions.find(p => p.module === module.id);
    if (permission && permission.view) {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push({ ...module, permission });
    }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/roles')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                {role.name}
              </h2>
              <p className="text-gray-600">{role.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={role.isActive ? "default" : "secondary"}>
              {role.isActive ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
            
            <Badge variant={role.isDefault ? "default" : "outline"}>
              {role.isDefault ? 'Default Role' : 'Custom Role'}
            </Badge>

            <Button
              onClick={() => router.push(`/admin/roles/${role._id}/edit`)}
              disabled={role.isDefault}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Role
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Modules Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {role.permissions.filter(p => p.view).length}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                out of {MODULES_CONFIG.length} modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Created On
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {new Date(role.createdAt).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(role.createdAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {new Date(role.updatedAt).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(role.updatedAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Module Permissions</CardTitle>
            <CardDescription>
              Detailed view of what this role can access and perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(permissionsByCategory).map(([category, modules]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold mb-4 capitalize">
                  {category} Modules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map(({ id, name, description, permission }) => (
                    <div key={id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 rounded">
                            {moduleIcons[id] || <Shield className="h-4 w-4" />}
                          </div>
                          <h4 className="font-medium">{name}</h4>
                        </div>
                        <Badge variant="outline">
                          {Object.values(permission).filter(v => v === true).length} permissions
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {permission.view && (
                            <Badge variant="secondary" className="text-xs">
                              View
                            </Badge>
                          )}
                          {permission.create && (
                            <Badge variant="secondary" className="text-xs">
                              Create
                            </Badge>
                          )}
                          {permission.edit && (
                            <Badge variant="secondary" className="text-xs">
                              Edit
                            </Badge>
                          )}
                          {permission.delete && (
                            <Badge variant="secondary" className="text-xs">
                              Delete
                            </Badge>
                          )}
                          {permission.export && (
                            <Badge variant="secondary" className="text-xs">
                              Export
                            </Badge>
                          )}
                          {permission.approve && (
                            <Badge variant="secondary" className="text-xs">
                              Approve
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(permissionsByCategory).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No module permissions assigned to this role.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}