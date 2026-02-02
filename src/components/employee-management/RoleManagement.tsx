"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Plus,
  Search,
  Filter,
  Lock,
  Unlock,
  Copy,
  Save,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/api-request";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Define the permission interface
interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
  approve?: boolean;
}

// Create the role schema - FIXED: Remove .optional() for booleans
const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
  permissions: z.array(
    z.object({
      module: z.string(),
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
      export: z.boolean(),
      approve: z.boolean(),
    }),
  ),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

// Infer the type from schema
type RoleFormData = z.infer<typeof roleSchema>;

// Define the Role interface
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault: boolean;
  isActive: boolean;
  userCount?: number;
  createdAt: string;
}

// Module definitions
const MODULES = [
  { id: "dashboard", label: "Dashboard", description: "Main dashboard access" },
  {
    id: "employee_management",
    label: "Employee Management",
    description: "Manage employees and HR staff",
  },
  { id: "payments", label: "Payments", description: "Process salary payments" },
  { id: "payroll", label: "Payroll", description: "Payroll management" },
  { id: "reports", label: "Reports", description: "View and generate reports" },
  {
    id: "attendance",
    label: "Attendance",
    description: "Manage attendance records",
  },
  {
    id: "leaves",
    label: "Leaves",
    description: "Leave management and approval",
  },
  {
    id: "tax",
    label: "Tax Management",
    description: "Tax calculations and deductions",
  },
  { id: "inventory", label: "Inventory", description: "Inventory management" },
  { id: "vendors", label: "Vendors", description: "Vendor management" },
  { id: "invoices", label: "Invoices", description: "Invoice management" },
  {
    id: "complaints",
    label: "Complaints",
    description: "Complaint management",
  },
  {
    id: "credit_debit",
    label: "Credit/Debit",
    description: "Credit and debit management",
  },
  {
    id: "role_management",
    label: "Role Management",
    description: "Manage user roles and permissions",
  },
  {
    id: "user_management",
    label: "User Management",
    description: "Manage system users",
  },
  { id: "settings", label: "Settings", description: "System settings" },
];

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Define default values with proper typing
  const defaultValues: RoleFormData = {
    name: "",
    description: "",
    permissions: MODULES.map((module) => ({
      module: module.id,
      view: false,
      create: false,
      edit: false,
      delete: false,
      export: false,
      approve: false,
    })),
    isDefault: false,
    isActive: true,
  };

  // FIXED: Use proper resolver configuration
  const formMethods = useForm<RoleFormData>({
    resolver: async (data, context, options) => {
      // Use the zodResolver but with proper type handling
      const zodResolverInstance = zodResolver(roleSchema);
      return zodResolverInstance(data, context, options);
    },
    defaultValues,
  });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/api/roles");
      if (response.success) {
        setRoles(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (data: RoleFormData) => {
    try {
      setLoading(true);
      const endpoint = selectedRole
        ? `/api/roles/${selectedRole.id}`
        : "/api/roles";

      const method = selectedRole ? "PUT" : "POST";

      const response = await apiRequest(endpoint, {
        method,
        body: data,
      });

      if (response.success) {
        toast.success(
          selectedRole
            ? "Role updated successfully"
            : "Role created successfully",
        );
        setShowDialog(false);
        setSelectedRole(null);
        formMethods.reset(defaultValues);
        fetchRoles();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await apiRequest(`/api/roles/${id}`, {
        method: "DELETE",
      });

      if (response.success) {
        toast.success("Role deleted successfully");
        fetchRoles();
      } else {
        toast.error(response.message || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    }
  };

  const handleDuplicate = (role: Role) => {
    setSelectedRole(null);

    // Create duplicate data with proper typing
    const duplicateData: RoleFormData = {
      name: `${role.name} Copy`,
      description: role.description || "",
      permissions: role.permissions.map((perm) => ({
        module: perm.module,
        view: perm.view,
        create: perm.create || false,
        edit: perm.edit || false,
        delete: perm.delete || false,
        export: perm.export || false,
        approve: perm.approve || false,
      })),
      isDefault: false,
      isActive: true,
    };

    formMethods.reset(duplicateData);
    setShowDialog(true);
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getPermissionBadge = (permission: Permission) => {
    const permissions = [];
    if (permission.view) permissions.push("View");
    if (permission.create) permissions.push("Create");
    if (permission.edit) permissions.push("Edit");
    if (permission.delete) permissions.push("Delete");
    if (permission.export) permissions.push("Export");
    if (permission.approve) permissions.push("Approve");

    return permissions.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {permissions.map((p) => (
          <Badge key={p} variant="secondary" className="text-xs">
            {p}
          </Badge>
        ))}
      </div>
    ) : (
      <span className="text-gray-400 text-sm">No permissions</span>
    );
  };

  const updatePermission = (
    moduleId: string,
    field: keyof Permission,
    value: boolean,
  ) => {
    const currentPermissions = formMethods.getValues("permissions");
    const updatedPermissions = currentPermissions.map((perm) =>
      perm.module === moduleId ? { ...perm, [field]: value } : perm,
    );
    formMethods.setValue("permissions", updatedPermissions);
  };

  // Handle editing a role
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);

    // Convert role data to form data
    const formData: RoleFormData = {
      name: role.name,
      description: role.description || "",
      permissions: role.permissions.map((perm) => ({
        module: perm.module,
        view: perm.view,
        create: perm.create || false,
        edit: perm.edit || false,
        delete: perm.delete || false,
        export: perm.export || false,
        approve: perm.approve || false,
      })),
      isDefault: role.isDefault,
      isActive: role.isActive,
    };

    formMethods.reset(formData);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchRoles}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedRole(null);
                  formMethods.reset(defaultValues);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedRole ? "Edit Role" : "Create New Role"}
                </DialogTitle>
              </DialogHeader>

              <Form {...formMethods}>
                <form
                  onSubmit={formMethods.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={formMethods.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Accounts Manager"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formMethods.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={selectedRole?.isDefault}
                            />
                          </FormControl>
                          <FormLabel>Default Role for New Users</FormLabel>
                          {selectedRole?.isDefault && (
                            <Badge className="ml-2">System Default</Badge>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={formMethods.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Role description..."
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-lg font-semibold">
                      Permissions
                    </FormLabel>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure what this role can access and do
                    </p>

                    <div className="space-y-4">
                      {MODULES.map((module) => {
                        const permissions = formMethods.watch("permissions");
                        const permission = permissions.find(
                          (p) => p.module === module.id,
                        ) || {
                          module: module.id,
                          view: false,
                          create: false,
                          edit: false,
                          delete: false,
                          export: false,
                          approve: false,
                        };

                        return (
                          <Card key={module.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold">
                                    {module.label}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {module.description}
                                  </p>
                                </div>
                                <Switch
                                  checked={permission.view}
                                  onCheckedChange={(checked) => {
                                    updatePermission(
                                      module.id,
                                      "view",
                                      checked,
                                    );
                                    if (!checked) {
                                      updatePermission(
                                        module.id,
                                        "create",
                                        false,
                                      );
                                      updatePermission(
                                        module.id,
                                        "edit",
                                        false,
                                      );
                                      updatePermission(
                                        module.id,
                                        "delete",
                                        false,
                                      );
                                    }
                                  }}
                                />
                              </div>

                              {permission.view && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`${module.id}-create`}
                                      checked={permission.create}
                                      onCheckedChange={(checked) =>
                                        updatePermission(
                                          module.id,
                                          "create",
                                          checked,
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${module.id}-create`}
                                      className="text-sm"
                                    >
                                      Create
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`${module.id}-edit`}
                                      checked={permission.edit}
                                      onCheckedChange={(checked) =>
                                        updatePermission(
                                          module.id,
                                          "edit",
                                          checked,
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${module.id}-edit`}
                                      className="text-sm"
                                    >
                                      Edit
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`${module.id}-delete`}
                                      checked={permission.delete}
                                      onCheckedChange={(checked) =>
                                        updatePermission(
                                          module.id,
                                          "delete",
                                          checked,
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${module.id}-delete`}
                                      className="text-sm"
                                    >
                                      Delete
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`${module.id}-export`}
                                      checked={permission.export || false}
                                      onCheckedChange={(checked) =>
                                        updatePermission(
                                          module.id,
                                          "export",
                                          checked,
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${module.id}-export`}
                                      className="text-sm"
                                    >
                                      Export
                                    </label>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDialog(false);
                        setSelectedRole(null);
                        formMethods.reset(defaultValues);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading
                        ? "Saving..."
                        : selectedRole
                          ? "Update Role"
                          : "Create Role"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            role.isDefault
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{role.name}</p>
                          {role.isDefault && (
                            <Badge variant="outline" className="mt-1">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-600 text-sm">
                        {role.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {role.userCount || 0}
                        </span>
                        <span className="text-gray-500 text-sm">users</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {getPermissionBadge(
                          role.permissions.find(
                            (p) => p.module === "employee_management",
                          ) || {
                            module: "employee_management",
                            view: false,
                            create: false,
                            edit: false,
                            delete: false,
                            export: false,
                            approve: false,
                          },
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {role.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          <X className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRole(role)}
                          disabled={role.isDefault}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(role)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(role.id)}
                          disabled={role.isDefault}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRoles.length === 0 && !loading && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No roles found
              </h3>
              <p className="text-gray-600">
                Create your first role to get started.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading roles...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
