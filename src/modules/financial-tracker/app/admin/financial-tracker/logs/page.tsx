'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useActivityLog } from '@/modules/financial-tracker/hooks/useActivityLog';

export default function LogsPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const {
    logs,
    totalCount,
    isLoading,
    filters,
    setFilters,
    loadMore,
    hasMore,
    refreshLogs,
    exportLogs
  } = useActivityLog({
    module: selectedModule !== 'all' ? selectedModule : undefined,
    action: selectedAction !== 'all' ? selectedAction : undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'UPDATE': return <Edit3 className="h-4 w-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'APPROVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECT': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">Track all system activities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={refreshLogs}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="grid grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Modules</option>
              <option value="re">RE Module</option>
              <option value="expense">Expense Module</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  module: selectedModule !== 'all' ? selectedModule : undefined,
                  action: selectedAction !== 'all' ? selectedAction : undefined,
                  startDate: startDate ? new Date(startDate) : undefined,
                  endDate: endDate ? new Date(endDate) : undefined
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Loading logs...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No activity logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.userId?.fullName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{log.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className="ml-2 text-sm text-gray-900">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 capitalize">{log.module}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{log.entity}</td>
                  <td className="px-6 py-3">
                    {log.changes && log.changes.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {log.changes.map((c, i) => (
                          <div key={i}>
                            {c.field}: {JSON.stringify(c.oldValue)} → {JSON.stringify(c.newValue)}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{log.ipAddress || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Load More */}
        {hasMore && (
          <div className="px-6 py-4 border-t text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}