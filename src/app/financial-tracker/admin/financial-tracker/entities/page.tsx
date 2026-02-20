// src/app/admin/financial-tracker/entities/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Grid3x3,
  List,
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Home,
  Briefcase,
  DollarSign,
  CreditCard,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import EntitiesTable from '@/app/financial-tracker/components/EntitiesTable';
import CreateEntityModal from '@/app/financial-tracker/components/CreateEntityModal';
import EditEntityModal from '@/app/financial-tracker/components/EditEntityModal';
import ViewEntityModal from '@/app/financial-tracker/components/ViewEntityModal';
import EntityStats from '@/app/financial-tracker/components/EntityStats';
import { ExportButton } from '@/app/financial-tracker/components/shared/ExportButton';
import { ConnectionStatus } from '@/app/financial-tracker/components/shared/ConnectionStatus';

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

const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 're' | 'expense'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Fetch entities
  const fetchEntities = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module', selectedModule);
      
      const token = getToken();
      console.log(token)
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities?${params.toString()}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to fetch entities');
      
      const data = await response.json();
      
      // Filter inactive if needed
      let filtered = data.entities;
      if (!showInactive) {
        filtered = filtered.filter((e: Entity) => e.isEnabled);
      }
      
      setEntities(filtered);
    } catch (error) {
      toast.error('Failed to load entities');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [selectedModule, showInactive]);

  // Handle create
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  // Handle edit
  const handleEdit = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsEditModalOpen(true);
  };

  // Handle view
  const handleView = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsViewModalOpen(true);
  };

  // Handle toggle status
  const handleToggleStatus = async (entityId: string, currentStatus: boolean) => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entityId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to toggle entity');
      
      toast.success(`Entity ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchEntities();
    } catch (error) {
      toast.error('Failed to toggle entity');
    }
  };

  // Handle delete
  const handleDelete = async (entityId: string) => {
    if (!confirm('Are you sure you want to delete this entity? This action cannot be undone.')) return;

    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to delete entity');
      
      toast.success('Entity deleted successfully');
      fetchEntities();
    } catch (error) {
      toast.error('Failed to delete entity');
    }
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module', selectedModule);
      
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/export?${params.toString()}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `entities-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Entities exported successfully');
    } catch (error) {
      toast.error('Failed to export entities');
    }
  };

  // Filter entities by search
  const filteredEntities = entities.filter(entity => 
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.entityKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: entities.length,
    re: entities.filter(e => e.module === 're').length,
    expense: entities.filter(e => e.module === 'expense').length,
    approval: entities.filter(e => e.enableApproval).length,
    disabled: entities.filter(e => !e.isEnabled).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Entity Management</h1>
              <p className="text-gray-600 mt-1">Configure and manage system entities</p>
            </div>
            <div className="flex items-center space-x-3">
              <ConnectionStatus module="admin" entity="entities" />
              <button
                onClick={fetchEntities}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-gray-500" />
              </button>
              <ExportButton
                onExport={handleExport}
                formats={['excel', 'csv', 'pdf']}
                size="md"
                variant="outline"
              />
              <button
                onClick={handleCreate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Entity
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Modules</option>
                <option value="re">RE Module</option>
                <option value="expense">Expense Module</option>
              </select>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show inactive</span>
              </label>

              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <EntityStats stats={stats} />

        {/* Entities Display */}
        {viewMode === 'table' ? (
          <EntitiesTable
            entities={filteredEntities}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onToggle={handleToggleStatus}
            onDelete={handleDelete}
          />
        ) : (
          // Card View
          <div className="grid grid-cols-3 gap-4">
            {filteredEntities.map((entity) => {
              const Icon = entity.module === 're' ? DollarSign : CreditCard;
              const color = entity.module === 're' ? 'blue' : 'green';

              return (
                <div
                  key={entity._id}
                  className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all ${
                    !entity.isEnabled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{entity.name}</h3>
                          <p className="text-xs text-gray-500 font-mono">{entity.entityKey}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleView(entity)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(entity)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit   className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {entity.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{entity.description}</p>
                    )}

                    <div className="mt-3 flex items-center space-x-2">
                      {entity.enableApproval && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Approval
                        </span>
                      )}
                      {!entity.isEnabled && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
                      Updated {new Date(entity.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateEntityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchEntities}
        />
      )}

      {isEditModalOpen && selectedEntity && (
        <EditEntityModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEntity(null);
          }}
          entity={selectedEntity}
          onSuccess={fetchEntities}
        />
      )}

      {isViewModalOpen && selectedEntity && (
        <ViewEntityModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedEntity(null);
          }}
          entity={selectedEntity}
        />
      )}
    </div>
  );
}