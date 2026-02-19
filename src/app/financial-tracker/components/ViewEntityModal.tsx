// src/app/admin/financial-tracker/entities/components/ViewEntityModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, CheckCircle, XCircle, Power, PowerOff, DollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  branchId?: string;
  createdBy: { fullName: string; email: string };
  updatedBy: { fullName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface ViewEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity;
}

interface ActivityLog {
  _id: string;
  userId: { fullName: string; email: string };
  action: string;
  changes?: Array<{ field: string; oldValue: any; newValue: any }>;
  timestamp: string;
}

export default function ViewEntityModal({
  isOpen,
  onClose,
  entity
}: ViewEntityModalProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && entity) {
      fetchActivities();
    }
  }, [isOpen, entity]);

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/financial-tracker/activity-logs?entity=entities&recordId=${entity._id}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Entity Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  entity.module === 're' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {entity.module === 're' ? (
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{entity.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{entity.entityKey}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {entity.isEnabled ? (
                  <span className="flex items-center text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                    <Power className="h-3 w-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">
                    <PowerOff className="h-3 w-3 mr-1" />
                    Inactive
                  </span>
                )}
                {entity.enableApproval && (
                  <span className="flex items-center text-purple-600 text-sm bg-purple-50 px-2 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approval
                  </span>
                )}
              </div>
            </div>

            {entity.description && (
              <p className="text-gray-700 border-t pt-3">{entity.description}</p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <User className="h-4 w-4 mr-1" />
                Created By
              </div>
              <p className="font-medium">{entity.createdBy?.fullName || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{entity.createdBy?.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(entity.createdAt), 'PPP p')}
              </p>
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <User className="h-4 w-4 mr-1" />
                Last Updated By
              </div>
              <p className="font-medium">{entity.updatedBy?.fullName || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{entity.updatedBy?.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(entity.updatedAt), 'PPP p')}
              </p>
            </div>

            {entity.branchId && (
              <div className="border rounded-lg p-3 col-span-2">
                <div className="text-sm text-gray-500 mb-1">Branch ID</div>
                <p className="font-mono text-sm">{entity.branchId}</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
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
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{log.userId?.fullName || 'System'}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(log.timestamp), 'PPp')}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 capitalize">{log.action.toLowerCase()}</p>
                    {log.changes?.map((change, i) => (
                      <div key={i} className="mt-1 text-xs text-gray-500">
                        Changed {change.field} from{' '}
                        <span className="line-through">{JSON.stringify(change.oldValue)}</span>{' '}
                        to <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
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