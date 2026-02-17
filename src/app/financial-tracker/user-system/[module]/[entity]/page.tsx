'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Table as TableIcon,
  Calendar,
  PieChart,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  CreditCard,
  Building2,
  Home,
  Briefcase,
  Package,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Settings,
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePermissions } from '@/app/financial-tracker/hooks/usePermission'; // Fixed import path
import { useRecords } from '@/app/financial-tracker/hooks/useRecord'; // Fixed import path
import { useFields } from '@/app/financial-tracker/hooks/useField'; // Fixed import path
import { useSocket } from '@/app/financial-tracker/hooks/useSocket'; // Fixed import path

// Entity Display Names
const ENTITY_DISPLAY: Record<string, { name: string; icon: any; color: string }> = {
  dealer: { name: 'Dealers', icon: Users, color: 'blue' },
  'fhh-client': { name: 'FHH Clients', icon: Users, color: 'green' },
  'cp-client': { name: 'CP Clients', icon: Users, color: 'purple' },
  builder: { name: 'Builders', icon: Building2, color: 'orange' },
  project: { name: 'Projects', icon: Package, color: 'pink' },
  office: { name: 'Office', icon: Home, color: 'indigo' },
  all: { name: 'All Records', icon: LayoutDashboard, color: 'gray' }
};

// Module Colors
const MODULE_COLORS = {
  re: 'blue',
  expense: 'red'
};

export default function UserEntityPage() {
  const params = useParams();
  const module = params.module as 're' | 'expense';
  const entity = params.entity as string;
  
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Get permissions for this user
  const {
    canAccess,
    canCreate,
    canEdit,
    canDelete,
    canViewColumn,
    canEditColumn,
    canEditRecord,
    canDeleteRecord,
    isLoading: permLoading,
    scope
  } = usePermissions(module, entity);

  // Get dynamic fields for this entity
  const {
    fields,
    visibleFields,
    isLoading: fieldsLoading
  } = useFields(module, entity);

  // Get records with real-time updates
  const {
    records,
    totalCount,
    isLoading: recordsLoading,
    createRecord,
    updateRecord,
    deleteRecord,
    submitForApproval,
    approveRecord,
    rejectRecord,
    hasMore,
    loadMore,
    refreshRecords
  } = useRecords(module, entity);

  // Socket connection for real-time
  const { isConnected } = useSocket(module, entity);

  // Check access
  useEffect(() => {
    if (!permLoading && !canAccess) {
      toast.error('You do not have access to this module');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  }, [permLoading, canAccess]);

  // Handle create new record
  const handleCreate = async () => {
    if (!canCreate) {
      toast.error('You do not have permission to create records');
      return;
    }

    // Open create modal
    // This would open a form modal with dynamic fields
    console.log('Open create modal');
  };

  // Handle edit record
  const handleEdit = async (record: any) => {
    if (!canEditRecord(record.createdBy)) {
      toast.error('You do not have permission to edit this record');
      return;
    }

    // Open edit modal
    console.log('Open edit modal for:', record._id);
  };

  // Handle delete record
  const handleDelete = async (record: any) => {
    if (!canDeleteRecord(record.createdBy)) {
      toast.error('You do not have permission to delete this record');
      return;
    }

    if (confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(record._id);
    }
  };

  // Handle submit for approval
  const handleSubmitForApproval = async (recordId: string) => {
    await submitForApproval(recordId);
  };

  // Format cell value based on field type
  const formatCellValue = (field: any, value: any) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400">-</span>;
    }

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return new Intl.NumberFormat().format(value);
      case 'checkbox':
        return value ? '✓' : '✗';
      case 'file':
      case 'image':
        return value ? (
          <a href={value} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
            View File
          </a>
        ) : '-';
      default:
        return value;
    }
  };

  // Loading state
  if (permLoading || fieldsLoading || recordsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No access
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view this module</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const EntityIcon = ENTITY_DISPLAY[entity]?.icon || LayoutDashboard;
  const entityColor = ENTITY_DISPLAY[entity]?.color || MODULE_COLORS[module];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb and Title */}
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <span className="capitalize">{module} Module</span>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-gray-900 font-medium capitalize">
                  {ENTITY_DISPLAY[entity]?.name || entity}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-${entityColor}-100 text-${entityColor}-600 mr-3`}>
                  <EntityIcon className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {ENTITY_DISPLAY[entity]?.name || entity}
                </h1>
                
                {/* Connection Status */}
                <div className="ml-4 flex items-center">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-500 ml-1">
                    {isConnected ? 'Live' : 'Connecting...'}
                  </span>
                </div>

                {/* Scope Badge */}
                {scope === 'own' && (
                  <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Your Records Only
                  </span>
                )}
                {scope === 'department' && (
                  <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Department Records
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Refresh */}
              <button
                onClick={refreshRecords}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-gray-500" />
              </button>

              {/* Export */}
              <button
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Export"
              >
                <Download className="h-5 w-5 text-gray-500" />
              </button>

              {/* Create Button */}
              {canCreate && (
                <button
                  onClick={handleCreate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New
                </button>
              )}
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  viewMode === 'table'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Table View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Card View
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  showFilters
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
              <div className="grid grid-cols-4 gap-4">
                {visibleFields.slice(0, 4).map((field: any) => (
                  <div key={field._id}>
                    <label className="block text-xs text-gray-500 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      placeholder={`Filter by ${field.label}`}
                      className="w-full px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded">
                  Clear
                </button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {module === 're' ? 'PKR 2.5M' : 'PKR 850K'}
                </p>
              </div>
              <div className={`p-3 bg-${entityColor}-100 rounded-lg`}>
                <DollarSign className={`h-5 w-5 text-${entityColor}-600`} />
              </div>
            </div>
          </div>
        </div>

        {/* Records Display */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Select All Checkbox */}
                    {canDelete && (
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRecords.length === records.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecords(records.map((r: any) => r._id));
                            } else {
                              setSelectedRecords([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600"
                        />
                      </th>
                    )}
                    
                    {/* Dynamic Headers based on visible fields */}
                    {visibleFields.map((field: any) => (
                      <th
                        key={field._id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {field.label}
                      </th>
                    ))}
                    
                    {/* Status Column */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    
                    {/* Actions Column */}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record: any) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      {/* Select Checkbox */}
                      {canDelete && canDeleteRecord(record.createdBy) && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRecords.includes(record._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRecords([...selectedRecords, record._id]);
                              } else {
                                setSelectedRecords(selectedRecords.filter(id => id !== record._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600"
                          />
                        </td>
                      )}
                      
                      {/* Dynamic Cells based on visible fields */}
                      {visibleFields.map((field: any) => (
                        <td key={field._id} className="px-4 py-3 text-sm text-gray-900">
                          {formatCellValue(field, record.data[field.fieldKey])}
                        </td>
                      ))}
                      
                      {/* Status Cell */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'approved' ? 'bg-green-100 text-green-800' :
                          record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          record.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      
                      {/* Actions Cell */}
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View Button - Always visible */}
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Button - Based on permission */}
                          {canEdit && canEditRecord(record.createdBy) && (
                            <button
                              onClick={() => handleEdit(record)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete Button - Based on permission */}
                          {canDelete && canDeleteRecord(record.createdBy) && (
                            <button
                              onClick={() => handleDelete(record)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Submit for Approval - For draft records */}
                          {record.status === 'draft' && canEditRecord(record.createdBy) && (
                            <button
                              onClick={() => handleSubmitForApproval(record._id)}
                              className="p-1 text-yellow-600 hover:text-yellow-800"
                              title="Submit for Approval"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                          )}

                          {/* More Actions Dropdown */}
                          <div className="relative group">
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
                              {/* Additional actions based on permissions */}
                              {record.status === 'submitted' && canEdit && (
                                <>
                                  <button
                                    onClick={() => approveRecord(record._id)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const comment = prompt('Enter rejection reason:');
                                      if (comment) rejectRecord(record._id, comment);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                                  >
                                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                View History
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={visibleFields.length + 3} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                          <p className="text-gray-500 mb-4">Get started by creating your first record</p>
                          {canCreate && (
                            <button
                              onClick={handleCreate}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Record
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="px-6 py-4 border-t text-center">
                <button
                  onClick={loadMore}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        ) : (
          // Card View
          <div className="grid grid-cols-3 gap-4">
            {records.map((record: any) => (
              <div key={record._id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${entityColor}-100 text-${entityColor}-600 mr-3`}>
                      <EntityIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {record.data[visibleFields[0]?.fieldKey] || 'Untitled'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Created {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'approved' ? 'bg-green-100 text-green-800' :
                    record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    record.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </div>

                {/* Display first 3 visible fields */}
                <div className="space-y-2 mb-3">
                  {visibleFields.slice(1, 4).map((field: any) => (
                    <div key={field._id} className="flex justify-between text-sm">
                      <span className="text-gray-500">{field.label}:</span>
                      <span className="text-gray-900 font-medium">
                        {formatCellValue(field, record.data[field.fieldKey])}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  {canEdit && canEditRecord(record.createdBy) && (
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && canDeleteRecord(record.createdBy) && (
                    <button className="p-1 text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}