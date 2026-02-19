// src/app/financial-tracker/components/user/ViewRecordModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, Clock, CheckCircle, XCircle, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ViewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: 're' | 'expense';
  entity: string;
  record: any;
  fields: any[];
}

export const ViewRecordModal: React.FC<ViewRecordModalProps> = ({
  isOpen,
  onClose,
  module,
  entity,
  record,
  fields
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && record?._id) {
      fetchHistory();
    }
  }, [isOpen, record]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`/api/financial-tracker/activity-logs?recordId=${record._id}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setHistory(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError('Could not load activity history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center"><XCircle className="h-3 w-3 mr-1" /> Rejected</span>;
      case 'submitted':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center"><Clock className="h-3 w-3 mr-1" /> Submitted</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center"><FileText className="h-3 w-3 mr-1" /> Draft</span>;
    }
  };

  const formatFieldValue = (field: any, value: any): React.ReactNode => {
    if (value === undefined || value === null || value === '') return <span className="text-gray-400">-</span>;
    
    switch (field.type) {
      case 'date':
        return format(new Date(value), 'PPP');
      case 'number':
        return value.toLocaleString();
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'file':
      case 'image':
        return value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            <FileText className="h-3 w-3 mr-1" />
            View File
          </a>
        ) : '-';
      default:
        return value.toString();
    }
  };

  const visibleFields = fields
    .filter(f => f.visible)
    .sort((a, b) => a.order - b.order);

  const entityName = entity.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {entityName} Details
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Metadata */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center space-x-3">
              {getStatusBadge(record.status)}
              <span className="text-xs text-gray-500">
                Version: {record.version || 1}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {record.createdAt ? format(new Date(record.createdAt), 'PPP') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Dynamic Fields */}
          {visibleFields.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {visibleFields.map((field) => (
                <div key={field._id} className="border rounded-lg p-3">
                  <label className="text-xs text-gray-500">{field.label}</label>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {formatFieldValue(field, record.data?.[field.fieldKey])}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No fields configured for this entity
            </div>
          )}

          {/* Activity History */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Activity History</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : error ? (
              <p className="text-sm text-red-600 text-center py-4">{error}</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No activity recorded</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {history.map((log: any) => (
                  <div key={log._id} className="text-sm border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{log.userId?.fullName || 'System'}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {log.timestamp ? format(new Date(log.timestamp), 'PPp') : 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 capitalize">{log.action?.toLowerCase()}</p>
                    {log.changes?.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {log.changes.map((c: any, i: number) => (
                          <div key={i}>• Changed {c.field}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Created/Updated Info */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created By:</span>{' '}
              {record.createdBy?.fullName || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Updated By:</span>{' '}
              {record.updatedBy?.fullName || 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};