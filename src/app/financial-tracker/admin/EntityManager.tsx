'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Search, 
  ChevronDown, ChevronRight, Save, X, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EntityManagerProps {
  module: 're' | 'expense';
}

const EntityManager: React.FC<EntityManagerProps> = ({ module }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    entityKey: '',
    name: '',
    description: '',
    isEnabled: true,
    enableApproval: false
  });

  useEffect(() => {
    fetchEntities();
  }, [module, showInactive]);

  const fetchEntities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/entities?module=${module}${!showInactive ? '&active=true' : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch entities');
      
      const data = await response.json();
      setEntities(data.entities);
    } catch (error) {
      toast.error('Failed to load entities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingEntity 
        ? `/financial-tracker/api/financial-tracker/entities/${editingEntity._id}`
        : '/financial-tracker/api/financial-tracker/entities';
      
      const method = editingEntity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({
          ...formData,
          module
        })
      });

      if (!response.ok) throw new Error('Failed to save entity');

      toast.success(editingEntity ? 'Entity updated' : 'Entity created');
      setIsModalOpen(false);
      setEditingEntity(null);
      resetForm();
      fetchEntities();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleEntity = async (entityId: string, isEnabled: boolean) => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entityId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to toggle entity');

      toast.success(`Entity ${isEnabled ? 'deactivated' : 'activated'}`);
      fetchEntities();
    } catch (error) {
      toast.error('Failed to toggle entity');
    }
  };

  const handleDelete = async (entityId: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;

    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete entity');

      toast.success('Entity deleted');
      fetchEntities();
    } catch (error) {
      toast.error('Failed to delete entity');
    }
  };

  const resetForm = () => {
    setFormData({
      entityKey: '',
      name: '',
      description: '',
      isEnabled: true,
      enableApproval: false
    });
  };

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

  const filteredEntities = entities.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.entityKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {module === 're' ? 'RE Module' : 'Expense Module'} Entities
        </h2>
        <button
          onClick={() => {
            setEditingEntity(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Entity
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 w-full border rounded-lg text-sm"
          />
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-600">Show inactive</span>
        </label>
      </div>

      {/* Entity List */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No entities found
        </div>
      ) : (
        <div className="divide-y">
          {filteredEntities.map((entity) => (
            <div key={entity._id} className="hover:bg-gray-50">
              {/* Entity Row */}
              <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
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
                  <div>
                    <h3 className="font-medium text-gray-900">{entity.name}</h3>
                    <p className="text-xs text-gray-500">{entity.entityKey}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {!entity.isEnabled && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      Inactive
                    </span>
                  )}
                  {entity.enableApproval && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                      Approval
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleToggleEntity(entity._id, entity.isEnabled)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {entity.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingEntity(entity);
                      setFormData({
                        entityKey: entity.entityKey,
                        name: entity.name,
                        description: entity.description || '',
                        isEnabled: entity.isEnabled,
                        enableApproval: entity.enableApproval
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(entity._id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRows.has(entity._id) && (
                <div className="px-12 py-3 bg-gray-50 border-t text-sm">
                  {entity.description && (
                    <p className="text-gray-600 mb-2">{entity.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(entity.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>{' '}
                      {new Date(entity.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingEntity ? 'Edit Entity' : 'Create New Entity'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Key *
                </label>
                <input
                  type="text"
                  value={formData.entityKey}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    entityKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') 
                  })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  placeholder="e.g., dealer, client"
                  required
                  pattern="[a-z0-9-]+"
                  disabled={!!editingEntity}
                />
                <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Dealers"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Enable entity</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.enableApproval}
                    onChange={(e) => setFormData({ ...formData, enableApproval: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Enable approval workflow</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntity(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingEntity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityManager;