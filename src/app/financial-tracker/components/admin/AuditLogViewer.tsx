'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  action: string;
  module: string;
  entity: string;
  recordId?: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface AuditLogsViewerProps {
  module?: string;
  entity?: string;
  recordId?: string;
}

export const AuditLogsViewer: React.FC<AuditLogsViewerProps> = ({
  module,
  entity,
  recordId
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, module, entity, recordId, filters]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (module) params.append('module', module);
      if (entity) params.append('entity', entity);
      if (recordId) params.append('recordId', recordId);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/financial-tracker/audit-logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'UPDATE': return <Edit3 className="h-4 w-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'APPROVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECT': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'LOGIN': return <User className="h-4 w-4 text-purple-600" />;
      case 'LOGOUT': return <User className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'APPROVE': return 'bg-green-100 text-green-800';
      case 'REJECT': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (module) params.append('module', module);
      if (entity) params.append('entity', entity);
      if (recordId) params.append('recordId', recordId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/financial-tracker/audit-logs/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to export logs');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Audit Logs</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportLogs}
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <button
            onClick={fetchLogs}
            className="p-1 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-5 gap-3">
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm"
            placeholder="End Date"
          />

          <input
            type="text"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm"
            placeholder="User ID"
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No audit logs found</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {log.userId?.fullName || 'System'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.module} / {log.entity}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(log.timestamp), 'PPpp')}
                      {log.ipAddress && ` • IP: ${log.ipAddress}`}
                    </div>

                    {/* Changes */}
                    {log.changes && log.changes.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {expandedLog === log._id ? 'Hide changes' : 'View changes'}
                        </button>
                        
                        {expandedLog === log._id && (
                          <div className="mt-2 bg-gray-50 p-2 rounded space-y-1">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{change.field}:</span>{' '}
                                <span className="text-gray-500 line-through mr-2">
                                  {JSON.stringify(change.oldValue)}
                                </span>
                                <span className="text-green-600">
                                  {JSON.stringify(change.newValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Record ID */}
                    {log.recordId && (
                      <div className="mt-1 text-xs text-gray-400">
                        Record: {log.recordId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t flex justify-between items-center">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};