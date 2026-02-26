// src/app/admin/financial-tracker/records/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Bell,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import RecordsTable from '@/app/financial-tracker/components/RecordsTable';
import RecordFilters from '@/app/financial-tracker/components/RecordFilters';
import RecordStats from '@/app/financial-tracker/components/ReocrdStats';
import ViewRecordModal from '@/app/financial-tracker/components/RecordViewModal';
import { ExportButton } from '@/app/financial-tracker/components/shared/ExportButton';
import { ConnectionStatus } from '@/app/financial-tracker/components/shared/ConnectionStatus';

// ✅ Token utility function
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};

// ✅ Logout function
const handleLogout = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  window.location.href = '/login';
};

// ✅ Define the record type that matches the API response
interface FinancialRecord {
  _id: string;
  module: 're' | 'expense';
  entity: string;
  data: Record<string, any>;
  version: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  updatedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface Filters {
  module?: 're' | 'expense' | 'all';
  entity?: string;
  status?: 'all' | 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
}

export default function AdminRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<Filters>({
    module: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Navigation handler
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Fetch records
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/admin-record-page/login');
        return;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters.module && filters.module !== 'all') {
        params.append('module', filters.module);
      }
      if (filters.entity && filters.entity !== 'all') {
        params.append('entity', filters.entity);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.createdBy) {
        params.append('createdBy', filters.createdBy);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`/api/financial-tracker/records?${params.toString()}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error('Failed to fetch records');
      }
      
      const data = await response.json();
      setRecords(data.records || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      toast.error('Failed to load records');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/financial-tracker/notifications?limit=5', {
        headers: {
          'Authorization': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = getToken();
      await fetch(`/api/financial-tracker/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': token
        }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchNotifications();
  }, [page, limit, filters.module, filters.entity, filters.status, filters.createdBy, filters.dateFrom, filters.dateTo, filters.search]);

  // Handle view record
  const handleViewRecord = (record: FinancialRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  // Handle delete record
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/financial-tracker/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to delete record');
      
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      
      if (filters.module && filters.module !== 'all') {
        params.append('module', filters.module);
      }
      if (filters.entity && filters.entity !== 'all') {
        params.append('entity', filters.entity);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      const response = await fetch(`/api/financial-tracker/records/export?${params.toString()}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `records-export-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Records exported successfully');
    } catch (error) {
      toast.error('Failed to export records');
    }
  };

  // Calculate stats
  const stats = {
    total: totalCount,
    re: records.filter(r => r.module === 're').length,
    expense: records.filter(r => r.module === 'expense').length,
    draft: records.filter(r => r.status === 'draft').length,
    submitted: records.filter(r => r.status === 'submitted').length,
    approved: records.filter(r => r.status === 'approved').length,
    rejected: records.filter(r => r.status === 'rejected').length,
    users: new Set(records.map(r => r.createdBy?._id)).size
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Records Management</h1>
              <ConnectionStatus module="admin" entity="records" />
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={fetchRecords}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-gray-500" />
              </button>

              {/* Export Dropdown */}
              <ExportButton
                onExport={handleExport}
                formats={['excel', 'csv', 'pdf']}
                size="md"
                variant="outline"
              />

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border rounded-lg hover:bg-gray-50 ${
                  showFilters ? 'bg-blue-50 text-blue-600' : ''
                }`}
                title="Toggle Filters"
              >
                <Filter className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Bell className="h-5 w-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 border-b cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              {notification.type === 'success' && (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              )}
                              {notification.type === 'warning' && (
                                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                              )}
                              {notification.type === 'error' && (
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              )}
                              {(!notification.type || notification.type === 'info') && (
                                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t">
                      <button 
                        onClick={() => handleNavigate('/admin/financial-tracker/notifications')}
                        className="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-1 border rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-20">
                  <button 
                    onClick={() => router.push('/admin/profile')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => router.push('/admin/settings')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <RecordStats stats={stats} />
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <RecordFilters
          filters={filters}
          onFilterChange={setFilters}
          onApply={() => {
            setPage(1);
            fetchRecords();
          }}
          onClear={() => {
            setFilters({ module: 'all', status: 'all' });
            setPage(1);
            fetchRecords();
          }}
        />
      )}

      {/* Main Content */}
      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records by ID, amount, description..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  fetchRecords();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Records Table */}
        <RecordsTable
          records={records}
          isLoading={isLoading}
          onView={handleViewRecord}
          onDelete={handleDeleteRecord}
          page={page}
          totalPages={Math.ceil(totalCount / limit)}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
        />
      </div>

      {/* View Record Modal */}
      {isViewModalOpen && selectedRecord && (
        <ViewRecordModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
        />
      )}
    </div>
  );
}