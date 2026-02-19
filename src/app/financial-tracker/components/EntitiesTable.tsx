// src/app/admin/financial-tracker/entities/components/EntitiesTable.tsx
'use client';

import React, { useState } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle
} from 'lucide-react';

// ✅ Define complete Entity interface that matches API response
interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  branchId?: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EntitiesTableProps {
  entities: Entity[];
  isLoading: boolean;
  onEdit: (entity: Entity) => void;
  onView: (entity: Entity) => void;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export default function EntitiesTable({
  entities,
  isLoading,
  onEdit,
  onView,
  onToggle,
  onDelete
}: EntitiesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading entities...</p>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="text-gray-400 text-5xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No entities found</h3>
        <p className="text-gray-500">Get started by creating your first entity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-4 py-3"></th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entities.map((entity) => (
            <React.Fragment key={entity._id}>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRow(entity._id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {expandedRows.has(entity._id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className={`p-1.5 rounded-lg mr-2 ${
                      entity.module === 're' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {entity.module === 're' ? (
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{entity.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    entity.module === 're' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {entity.module.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {entity.entityKey}
                  </code>
                </td>
                <td className="px-4 py-3">
                  {entity.enableApproval ? (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approval Workflow
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {entity.isEnabled ? (
                    <span className="inline-flex items-center text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">
                      <Power className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                      <PowerOff className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(entity.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(entity)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(entity)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggle(entity._id, entity.isEnabled)}
                      className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                      title={entity.isEnabled ? 'Deactivate' : 'Activate'}
                    >
                      {entity.isEnabled ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </button>
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
                        <button
                          onClick={() => onDelete(entity._id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Entity
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              {expandedRows.has(entity._id) && (
                <tr className="bg-gray-50">
                  <td colSpan={8} className="px-12 py-4">
                    <div className="text-sm">
                      {entity.description && (
                        <p className="text-gray-600 mb-3">{entity.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="font-medium w-20">Created:</span>
                            <span>{new Date(entity.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-20">By:</span>
                            <span>{entity.createdBy?.fullName} ({entity.createdBy?.email})</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="font-medium w-20">Updated:</span>
                            <span>{new Date(entity.updatedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-20">By:</span>
                            <span>{entity.updatedBy?.fullName} ({entity.updatedBy?.email})</span>
                          </div>
                        </div>
                        {entity.branchId && (
                          <div className="col-span-2">
                            <span className="font-medium">Branch ID:</span> {entity.branchId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}