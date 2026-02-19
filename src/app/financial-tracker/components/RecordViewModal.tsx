// src/app/admin/financial-tracker/records/components/ViewRecordModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, CheckCircle, XCircle, FileText, DollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

// ✅ Renamed from Record to FinancialRecord
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
}

interface ActivityLog {
  _id: string;
  userId: { fullName: string; email: string };
  action: string;
  changes?: Array<{ field: string; oldValue: any; newValue: any }>;
  timestamp: string;
}

interface ViewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FinancialRecord;  // ✅ Updated type name
}

export default function ViewRecordModal({ isOpen, onClose, record }: ViewRecordModalProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      fetchActivities();
    }
  }, [isOpen, record]);

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/financial-tracker/activity-logs?recordId=${record._id}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"><CheckCircle className="h-3 w-3 mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"><XCircle className="h-3 w-3 mr-1" /> Rejected</span>;
      case 'submitted':
        return <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"><Clock className="h-3 w-3 mr-1" /> Submitted</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"><FileText className="h-3 w-3 mr-1" /> Draft</span>;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Record Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                record.module === 're' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {record.module === 're' ? (
                  <DollarSign className="h-5 w-5 text-blue-600" />
                ) : (
                  <CreditCard className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {record.entity.replace('-', ' ')} Record
                </h3>
                <p className="text-sm text-gray-500 font-mono">{record._id}</p>
              </div>
            </div>
            {getStatusBadge(record.status)}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Created By</p>
                <p className="text-sm font-medium">{record.createdBy?.fullName || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{record.createdBy?.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm font-medium">{format(new Date(record.createdAt), 'PPP')}</p>
                <p className="text-xs text-gray-500">{format(new Date(record.createdAt), 'p')}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Last Updated By</p>
                <p className="text-sm font-medium">{record.updatedBy?.fullName || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{record.updatedBy?.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Updated At</p>
                <p className="text-sm font-medium">{format(new Date(record.updatedAt), 'PPP')}</p>
                <p className="text-xs text-gray-500">{format(new Date(record.updatedAt), 'p')}</p>
              </div>
            </div>
          </div>

          {/* Data Fields */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Record Data</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(record.data || {}).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-3">
                  <label className="text-xs text-gray-500">{key}</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                    {formatValue(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity History */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Activity History</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No activity recorded</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {activities.map((log) => (
                  <div key={log._id} className="text-sm border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.userId?.fullName || 'System'}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(log.timestamp), 'PPp')}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 capitalize">{log.action.toLowerCase()}</p>
                    {log.changes?.map((change, i) => (
                      <div key={i} className="mt-1 text-xs text-gray-500">
                        Changed {change.field} from{' '}
                        <span className="line-through">{formatValue(change.oldValue)}</span>{' '}
                        to <span className="text-green-600">{formatValue(change.newValue)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}