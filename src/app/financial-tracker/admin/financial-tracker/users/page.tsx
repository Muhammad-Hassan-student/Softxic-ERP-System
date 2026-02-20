'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MoreVertical,
  Shield,
  Key,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ✅ Token utility function
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};
interface ERPUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  designation?: string;
  mobile?: string;
  profilePhoto?: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

interface UserPermission {
  userId: string;
  permissions: {
    re: Record<string, any>;
    expense: Record<string, any>;
  };
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ERPUser[]>([]);
  const [permissions, setPermissions] = useState<Map<string, UserPermission>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch users from ERP core
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/financial-tracker/api/financial-tracker/admin/users', {
        headers: {
          'Authorization': getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      
      // Fetch permissions for each user
      const permissionsMap = new Map();
      for (const user of data.users) {
        const permResponse = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${user._id}/permissions`, {
          headers: {
            'Authorization': getToken()
          }
        });
        if (permResponse.ok) {
          const permData = await permResponse.json();
          permissionsMap.set(user._id, permData);
        }
      }
      setPermissions(permissionsMap);
      
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle all users
  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  // Handle user status toggle
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to toggle status');
      
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // Generate credentials for user
  const generateCredentials = async (userId: string) => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/admin/users/${userId}/generate-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to generate credentials');
      
      const data = await response.json();
      
      // Show credentials in a modal or copy to clipboard
      toast.success(
        <div className="p-2">
          <p className="font-bold">Credentials Generated</p>
          <p className="text-sm">Username: {data.username}</p>
          <p className="text-sm">Password: {data.password}</p>
          <button 
            onClick={() => navigator.clipboard.writeText(`Username: ${data.username}\nPassword: ${data.password}`)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
          >
            Copy to Clipboard
          </button>
        </div>,
        { duration: 10000 }
      );
    } catch (error) {
      toast.error('Failed to generate credentials');
    }
  };

  // Export users list
  const exportUsers = async () => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/admin/users/export', {
        headers: {
          'Authorization': getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to export users');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, permissions, and access control</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportUsers}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5 mr-2 text-gray-500" />
            Export
          </button>
          <button
            onClick={() => router.push('/admin/financial-tracker/users/create')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                showFilters ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={fetchUsers}
              className="p-2 border rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const userPerms = permissions.get(user._id);
                const hasReAccess = userPerms?.permissions?.re && Object.keys(userPerms.permissions.re).length > 0;
                const hasExpenseAccess = userPerms?.permissions?.expense && Object.keys(userPerms.permissions.expense).length > 0;

                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUser(user._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
                              alt={user.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">
                        {user.role}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.department || 'No Department'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.designation || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.mobile && (
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {user.mobile}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {hasReAccess && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            RE
                          </span>
                        )}
                        {hasExpenseAccess && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Expense
                          </span>
                        )}
                        {!hasReAccess && !hasExpenseAccess && (
                          <span className="text-xs text-gray-400">No access</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/admin/financial-tracker/users/${user._id}`)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit Permissions"
                        >
                          <Shield className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => generateCredentials(user._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Generate Credentials"
                        >
                          <Key className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user._id, user.status)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <EyeOff className="h-4 w-4 text-orange-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-lg px-4 py-3 flex items-center space-x-4">
          <span className="text-sm">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-gray-700"></div>
          <button
            onClick={() => {
              // Apply bulk permission update
              router.push(`/admin/financial-tracker/users/bulk-permissions?ids=${selectedUsers.join(',')}`);
            }}
            className="text-sm hover:text-blue-400"
          >
            Update Permissions
          </button>
          <button
            onClick={() => {
              // Bulk activate/deactivate
              const action = confirm('Activate or deactivate selected users?') ? 'toggle' : null;
              if (action) {
                // Handle bulk toggle
              }
            }}
            className="text-sm hover:text-blue-400"
          >
            Toggle Status
          </button>
          <button
            onClick={() => setSelectedUsers([])}
            className="text-sm hover:text-gray-300"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}