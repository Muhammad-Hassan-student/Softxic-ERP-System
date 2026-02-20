'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  DollarSign,
  CreditCard,
  Shield,
  Key,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModuleUser {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  module: 're' | 'expense';
  entities: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
// ✅ Token utility function
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};
export default function ModuleUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ModuleUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 're' | 'expense'>('all');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedModule, showInactive]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module', selectedModule);
      if (!showInactive) params.append('active', 'true');

      const response = await fetch(`/financial-tracker/api/financial-tracker/module-users?${params.toString()}`, {
        headers: {
          'Authorization':  getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/module-users/${userId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to toggle status');
      
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;

    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/module-users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getToken()
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Users</h1>
          <p className="text-gray-600 mt-1">Users with access to specific modules</p>
        </div>
        <button
          onClick={() => router.push('/admin/financial-tracker/module-users/create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Module User
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
            />
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Modules</option>
            <option value="re">RE Module</option>
            <option value="expense">Expense Module</option>
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-600">Show inactive</span>
          </label>
          <button
            onClick={fetchUsers}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entities</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                      user.module === 're' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.module === 're' ? (
                        <DollarSign className="h-3 w-3 mr-1" />
                      ) : (
                        <CreditCard className="h-3 w-3 mr-1" />
                      )}
                      {user.module.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.entities.slice(0, 2).map((entity) => (
                        <span key={entity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {entity}
                        </span>
                      ))}
                      {user.entities.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{user.entities.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/admin/financial-tracker/module-users/${user._id}/edit`)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}