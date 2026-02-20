// src/app/user-system/[module]/[entity]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Table as TableIcon,
  Calendar,
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
  RefreshCw,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';



// ✅ IMPORT ALL REQUIRED COMPONENTS
import ExcelTable from '@/app/financial-tracker/components/user/ExcelTable';
import { CreateRecordModal } from '@/app/financial-tracker/components/user/CreateRecordModal';
import { EditRecordModal } from '@/app/financial-tracker/components/user/EditRecordModal';
import { ViewRecordModal } from '@/app/financial-tracker/components/user/ViewRecordModal';
import { BulkImportModal } from '@/app/financial-tracker/components/user/BulkImportModal';
import { ConnectionStatus } from '@/app/financial-tracker/components/shared/ConnectionStatus';
import { ExportButton } from '@/app/financial-tracker/components/shared/ExportButton';

// ✅ IMPORT HOOKS
import { usePermissions } from '@/app/financial-tracker/hooks/usePermission';
import { useRecords } from '@/app/financial-tracker/hooks/useRecord';
import { useFields } from '@/app/financial-tracker/hooks/useField';
import { useSocket } from '@/app/financial-tracker/hooks/useSocket';

// ✅ IMPORT TYPES
import { IRecord } from '@/app/financial-tracker/models/record.model';
import { ICustomField } from '@/app/financial-tracker/models/custom-field.model';

// ✅ UTILITY FUNCTION TO GET TOKEN
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};

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

// ✅ CONVERTER FUNCTION: Hook record (plain object) to Model record (with Map)
const convertToModelRecord = (record: any, module: string, entity: string): IRecord => {
  // Convert plain object to Map
  const dataMap = new Map<string, any>();
  if (record.data) {
    Object.entries(record.data).forEach(([key, value]) => {
      dataMap.set(key, value);
    });
  }

  return {
    _id: record._id,
    data: dataMap,
    version: record.version || 1,
    status: record.status || 'draft',
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    isDeleted: record.isDeleted || false,
    module: record.module || module,
    entity: record.entity || entity,
  } as unknown as IRecord;
};

// ✅ CONVERTER FUNCTION: Array of hook records to model records
const convertToModelRecords = (records: any[], module: string, entity: string): IRecord[] => {
  return records.map(record => convertToModelRecord(record, module, entity));
};

// ✅ CONVERTER FUNCTION: Field from hook to ICustomField
const convertToCustomField = (field: any): ICustomField => {
  return {
    _id: field._id,
    module: field.module,
    entityId: field.entityId,
    fieldKey: field.fieldKey,
    label: field.label,
    type: field.type,
    isSystem: field.isSystem || false,
    isEnabled: field.isEnabled !== false,
    required: field.required || false,
    readOnly: field.readOnly || false,
    visible: field.visible !== false,
    order: field.order || 0,
    defaultValue: field.defaultValue,
    options: field.options,
    validation: field.validation,
    createdBy: field.createdBy,
  } as unknown as ICustomField;
};

// ✅ CONVERTER FUNCTION: Array of fields to ICustomField[]
const convertToCustomFields = (fields: any[]): ICustomField[] => {
  return fields.map(convertToCustomField);
};

export default function UserEntityPage() {
  const params = useParams();
  const module = params.module as 're' | 'expense';
  const entity = params.entity as string;
  
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  // ✅ Get permissions for this user
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

  // ✅ Get dynamic fields for this entity
  const {
    fields: hookFields,
    visibleFields: hookVisibleFields,
    isLoading: fieldsLoading,
    refreshFields
  } = useFields(module, entity);

  // ✅ Get records with real-time updates
  const {
    records: hookRecords,
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

  // ✅ Socket connection for real-time
  const { isConnected } = useSocket(module, entity);

  // ✅ CONVERT HOOK DATA TO MODEL TYPES
  const fields = React.useMemo(() => convertToCustomFields(hookFields), [hookFields]);
  const visibleFields = React.useMemo(() => convertToCustomFields(hookVisibleFields), [hookVisibleFields]);
  const modelRecords = React.useMemo(() => 
    convertToModelRecords(hookRecords, module, entity), [hookRecords, module, entity]
  );

  // Check access
  useEffect(() => {
    if (!permLoading && !canAccess) {
      toast.error('You do not have access to this module');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  }, [permLoading, canAccess]);

  // Handle create new record
  const handleCreate = () => {
    if (!canCreate) {
      toast.error('You do not have permission to create records');
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Handle edit record
  const handleEditClick = (record: any) => {
    if (!canEditRecord(record.createdBy)) {
      toast.error('You do not have permission to edit this record');
      return;
    }
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  // Handle view record
  const handleViewClick = (record: any) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  // Handle import
  const handleImportClick = () => {
    setIsImportModalOpen(true);
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

  // Handle approve
  const handleApprove = async (recordId: string) => {
    await approveRecord(recordId);
  };

  // Handle reject
  const handleReject = async (recordId: string) => {
    const comment = prompt('Enter rejection reason:');
    if (comment) {
      await rejectRecord(recordId, comment);
    }
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      params.append('module', module);
      params.append('entity', entity);
      if (searchTerm) params.append('search', searchTerm);
      
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/records/export?${params.toString()}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${module}-${entity}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  // Format cell value based on field type
  const formatCellValue = useCallback((field: ICustomField, value: any) => {
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
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            View File
          </a>
        ) : '-';
      default:
        return value;
    }
  }, []);

  // Apply filters
  const filteredHookRecords = React.useMemo(() => {
    return hookRecords.filter((record: any) => {
      if (!searchTerm) return true;
      
      return hookVisibleFields.some(field => {
        const value = record.data?.[field.fieldKey];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [hookRecords, hookVisibleFields, searchTerm]);

  // Convert filtered records to model type
  const filteredModelRecords = React.useMemo(() => 
    convertToModelRecords(filteredHookRecords, module, entity), 
    [filteredHookRecords, module, entity]
  );

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
                
                {/* ✅ Connection Status Component */}
                <div className="ml-4">
                  <ConnectionStatus module={module} entity={entity} />
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

              {/* Import */}
              <button
                onClick={handleImportClick}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Bulk Import"
              >
                <Upload className="h-5 w-5 text-gray-500" />
              </button>

              {/* ✅ Export Button Component */}
              <ExportButton
                onExport={handleExport}
                formats={['excel', 'csv', 'pdf']}
                size="md"
                variant="outline"
              />

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
              <div className="grid grid-cols-4 gap-4">
                {visibleFields.slice(0, 4).map((field) => (
                  <div key={field._id.toString()}>
                    <label className="block text-xs text-gray-500 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      placeholder={`Filter by ${field.label}`}
                      value={filters[field.fieldKey] || ''}
                      onChange={(e) => setFilters({ ...filters, [field.fieldKey]: e.target.value })}
                      className="w-full px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button 
                  onClick={() => setFilters({})}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
                >
                  Clear
                </button>
                <button 
                  onClick={() => {
                    // Apply filters logic here
                    toast.success('Filters applied');
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
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
                <p className="text-2xl font-bold text-yellow-600">
                  {hookRecords.filter((r: any) => r.status === 'submitted').length}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {hookRecords.filter((r: any) => r.status === 'approved').length}
                </p>
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
                  PKR {hookRecords.reduce((sum: number, r: any) => sum + (Number(r.data?.amount) || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className={`p-3 bg-${entityColor}-100 rounded-lg`}>
                <DollarSign className={`h-5 w-5 text-${entityColor}-600`} />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ EXCEL TABLE COMPONENT - WITH CONVERTED TYPES */}
        {viewMode === 'table' ? (
          <ExcelTable
            module={module}
            entity={entity}
            fields={visibleFields}
            initialRecords={filteredModelRecords}
            totalCount={filteredModelRecords.length}
            onSave={updateRecord}
            onCreate={createRecord}
            onDelete={deleteRecord}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        ) : (
          // Card View
          <div className="grid grid-cols-3 gap-4">
            {filteredHookRecords.map((record: any) => (
              <div key={record._id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${entityColor}-100 text-${entityColor}-600 mr-3`}>
                      <EntityIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {record.data?.[visibleFields[0]?.fieldKey] || 'Untitled'}
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
                  {visibleFields.slice(1, 4).map((field) => (
                    <div key={field._id.toString()} className="flex justify-between text-sm">
                      <span className="text-gray-500">{field.label}:</span>
                      <span className="text-gray-900 font-medium">
                        {formatCellValue(field, record.data?.[field.fieldKey])}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                  <button 
                    onClick={() => handleViewClick(record)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {canEdit && canEditRecord(record.createdBy) && (
                    <button 
                      onClick={() => handleEditClick(record)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && canDeleteRecord(record.createdBy) && (
                    <button 
                      onClick={() => handleDelete(record)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ CREATE MODAL */}
      {isCreateModalOpen && (
        <CreateRecordModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          module={module}
          entity={entity}
          onSuccess={refreshRecords}
        />
      )}

      {/* ✅ EDIT MODAL */}
      {isEditModalOpen && selectedRecord && (
        <EditRecordModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          module={module}
          entity={entity}
          record={selectedRecord}
          onSuccess={refreshRecords}
        />
      )}

      {/* ✅ VIEW MODAL */}
      {isViewModalOpen && selectedRecord && (
        <ViewRecordModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRecord(null);
          }}
          module={module}
          entity={entity}
          record={selectedRecord}
          fields={hookFields}
        />
      )}

      {/* ✅ IMPORT MODAL */}
      {isImportModalOpen && (
        <BulkImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          module={module}
          entity={entity}
          onSuccess={refreshRecords}
        />
      )}
    </div>
  );
}