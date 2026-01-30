'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Check,
  X,
  Save,
  Loader2,
  Lock
} from 'lucide-react';
import { Role, Permission, ModuleType, MODULES_CONFIG } from '@/types/role';
import {toast} from 'react-hot-toast'

interface RoleFormProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function RoleForm({ role, open, onOpenChange, onSuccess }: RoleFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    permissions: [] as Permission[],
  });
  const [searchModule, setSearchModule] = useState('');

  // Initialize form with role data
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        isActive: role.isActive,
        permissions: role.permissions,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        isActive: true,
        permissions: MODULES_CONFIG.map(module => ({
          module: module.id,
          view: false,
          create: false,
          edit: false,
          delete: false,
          export: false,
          approve: false,
        })),
      });
    }
  }, [role, open]);

  // Filter modules based on search
  const filteredModules = MODULES_CONFIG.filter(module =>
    module.name.toLowerCase().includes(searchModule.toLowerCase()) ||
    module.description.toLowerCase().includes(searchModule.toLowerCase())
  );

  // Group modules by category
  const modulesByCategory = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof MODULES_CONFIG>);

  // Update permission
  const updatePermission = (moduleId: ModuleType, field: keyof Permission, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(permission =>
        permission.module === moduleId
          ? { ...permission, [field]: value }
          : permission
      ),
    }));
  };

  // Select all permissions for a module
  const selectAllForModule = (moduleId: ModuleType, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(permission =>
        permission.module === moduleId
          ? {
              ...permission,
              view: selected,
              create: selected,
              edit: selected,
              delete: selected,
              export: selected,
              approve: selected,
            }
          : permission
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Role name is required')
      return;
    }

    setLoading(true);
    try {
      const url = role ? `/api/roles/${role._id}` : '/api/roles';
      const method = role ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save role');
      }

      toast.success( role ? 'Role updated successfully' : 'Role created successfully')

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error(error.message || 'Failed to save role')
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {role ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription>
            {role 
              ? 'Update role details and permissions'
              : 'Define a new role with specific permissions'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., HR Manager"
                  disabled={role?.isDefault}
                />
                {role?.isDefault && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Default role name cannot be changed
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="text-sm">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                    disabled={role?.isDefault}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role's responsibilities..."
                rows={2}
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Permissions</h3>
              
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search modules..."
                  value={searchModule}
                  onChange={(e) => setSearchModule(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all">All Modules</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              {Object.entries(modulesByCategory).map(([category, modules]) => (
                <TabsContent key={category} value={category === 'all' ? 'all' : category}>
                  <div className="space-y-4">
                    {modules.map((module) => {
                      const permission = formData.permissions.find(p => p.module === module.id) || {
                        module: module.id,
                        view: false,
                        create: false,
                        edit: false,
                        delete: false,
                        export: false,
                        approve: false,
                      };

                      const allSelected = permission.view && permission.create && 
                                         permission.edit && permission.delete;

                      return (
                        <div key={module.id} className="border rounded-lg p-4 space-y-4">
                          {/* Module Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{module.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {module.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {module.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => selectAllForModule(module.id, !allSelected)}
                              >
                                {allSelected ? (
                                  <>
                                    <X className="h-3 w-3 mr-1" />
                                    Deselect All
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Select All
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Permission Checkboxes */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Checkbox
                                  checked={permission.view}
                                  onCheckedChange={(checked) =>
                                    updatePermission(module.id, 'view', checked as boolean)
                                  }
                                />
                                <span>View</span>
                              </Label>
                              <p className="text-xs text-gray-500">Can view data</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Checkbox
                                  checked={permission.create}
                                  onCheckedChange={(checked) =>
                                    updatePermission(module.id, 'create', checked as boolean)
                                  }
                                  disabled={!permission.view}
                                />
                                <span>Create</span>
                              </Label>
                              <p className="text-xs text-gray-500">Can create new entries</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Checkbox
                                  checked={permission.edit}
                                  onCheckedChange={(checked) =>
                                    updatePermission(module.id, 'edit', checked as boolean)
                                  }
                                  disabled={!permission.view}
                                />
                                <span>Edit</span>
                              </Label>
                              <p className="text-xs text-gray-500">Can edit existing entries</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Checkbox
                                  checked={permission.delete}
                                  onCheckedChange={(checked) =>
                                    updatePermission(module.id, 'delete', checked as boolean)
                                  }
                                  disabled={!permission.view}
                                />
                                <span>Delete</span>
                              </Label>
                              <p className="text-xs text-gray-500">Can delete entries</p>
                            </div>

                            {/* Additional permissions for specific modules */}
                            {(module.id === 'reports' || module.id === 'payments' || module.id === 'payroll') && (
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Checkbox
                                    checked={permission.export || false}
                                    onCheckedChange={(checked) =>
                                      updatePermission(module.id, 'export', checked as boolean)
                                    }
                                    disabled={!permission.view}
                                  />
                                  <span>Export</span>
                                </Label>
                                <p className="text-xs text-gray-500">Can export data</p>
                              </div>
                            )}

                            {module.id === 'leaves' && (
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Checkbox
                                    checked={permission.approve || false}
                                    onCheckedChange={(checked) =>
                                      updatePermission(module.id, 'approve', checked as boolean)
                                    }
                                    disabled={!permission.view}
                                  />
                                  <span>Approve</span>
                                </Label>
                                <p className="text-xs text-gray-500">Can approve requests</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {role ? 'Update Role' : 'Create Role'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}