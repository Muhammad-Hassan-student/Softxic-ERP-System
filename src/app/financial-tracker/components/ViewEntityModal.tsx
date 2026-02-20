// src/app/admin/financial-tracker/entities/components/ViewEntityModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, User, Calendar, Clock, CheckCircle, XCircle, 
  Power, PowerOff, DollarSign, CreditCard, Eye,
  Activity, History, Tag, Mail
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  useEffect(() => {
    if (isOpen && entity && activeTab === 'activity') {
      fetchActivities();
    }
  }, [isOpen, entity, activeTab]);

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/activity-logs?entity=entities&recordId=${entity._id}&limit=20`, {
        headers: {
          'Authorization': token
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Entity Details</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Tag className="h-4 w-4 inline mr-2" />
                Details
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                Activity History
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'details' ? (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        entity.module === 're' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {entity.module === 're' ? (
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        ) : (
                          <CreditCard className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{entity.name}</h3>
                        <div className="flex items-center mt-1">
                          <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                            {entity.entityKey}
                          </code>
                          {entity.branchId && (
                            <span className="ml-2 text-xs text-gray-500">
                              Branch: {entity.branchId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entity.isEnabled ? (
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          <Power className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          <PowerOff className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                      {entity.enableApproval && (
                        <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approval
                        </span>
                      )}
                    </div>
                  </div>

                  {entity.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600">{entity.description}</p>
                    </div>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="h-4 w-4 mr-1" />
                      Created By
                    </div>
                    <p className="font-medium text-gray-900">{entity.createdBy?.fullName || 'Unknown'}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3 mr-1" />
                      {entity.createdBy?.email}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(entity.createdAt), 'PPP')}
                      <Clock className="h-3 w-3 ml-2 mr-1" />
                      {format(new Date(entity.createdAt), 'p')}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="h-4 w-4 mr-1" />
                      Last Updated By
                    </div>
                    <p className="font-medium text-gray-900">{entity.updatedBy?.fullName || 'Unknown'}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3 mr-1" />
                      {entity.updatedBy?.email}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(entity.updatedAt), 'PPP')}
                      <Clock className="h-3 w-3 ml-2 mr-1" />
                      {format(new Date(entity.updatedAt), 'p')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Activity Timeline */
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Recent Activities</h3>
                  {activities.length > 0 && (
                    <span className="text-xs text-gray-500">{activities.length} events</span>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-3">Loading activities...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {activities.map((log, index) => (
                      <div
                        key={log._id}
                        className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-0"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-white border-2 border-purple-500"></div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {log.userId?.fullName || 'System'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(log.timestamp), 'PPp')}
                              </span>
                            </div>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {log.action}
                            </span>
                          </div>
                          
                          {log.changes && log.changes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {log.changes.map((change, i) => (
                                <div key={i} className="text-xs bg-white rounded p-2">
                                  <span className="font-medium text-gray-700">{change.field}:</span>{' '}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}