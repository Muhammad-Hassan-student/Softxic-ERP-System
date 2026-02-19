// src/app/admin/financial-tracker/records/components/RecordsTable.tsx
'use client';

import React, { useState } from 'react';
import {
  Eye,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  CreditCard,
  User
} from 'lucide-react';

// ✅ MATCH the interface from page.tsx exactly
interface FinancialRecord {
  _id: string;
  module: 're' | 'expense';
  entity: string;
  data: Record<string, any>;
  version: number;           // ✅ Added
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  updatedBy: {                // ✅ Added
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;          // ✅ Added
  isDeleted: boolean;         // ✅ Added
}

interface RecordsTableProps {
  records: FinancialRecord[];
  isLoading: boolean;
  onView: (record: FinancialRecord) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export default function RecordsTable({
  records,
  isLoading,
  onView,
  onDelete,
  page,
  totalPages,
  onPageChange,
  limit,
  onLimitChange
}: RecordsTableProps) {
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
        <p className="text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <React.Fragment key={record._id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRow(record._id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${
                        expandedRows.has(record._id) ? 'rotate-90' : ''
                      }`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {record._id.slice(-8)}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      record.module === 're' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {record.module === 're' ? (
                        <DollarSign className="h-3 w-3 mr-1" />
                      ) : (
                        <CreditCard className="h-3 w-3 mr-1" />
                      )}
                      {record.module.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                    {record.entity.replace('-', ' ')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    PKR {record.data?.amount?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.data?.categoryName || record.data?.category || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-medium">
                          {record.createdBy?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {record.createdBy?.fullName || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onView(record)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <div className="relative group">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
                          <button
                            onClick={() => onDelete(record._id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Record
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(record._id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={10} className="px-12 py-4">
                      <div className="text-sm">
                        <h4 className="font-medium text-gray-900 mb-2">All Data</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(record.data || {}).map(([key, value]) => (
                            <div key={key} className="border rounded p-2">
                              <span className="text-xs text-gray-500">{key}</span>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatValue(value)}
                              </p>
                            </div>
                          ))}
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

      {/* Pagination */}
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}