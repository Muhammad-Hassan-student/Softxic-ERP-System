'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  FolderTree,
  Palette,
  Type,
  AlignLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
// ✅ Token utility function
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};
interface Category {
  _id: string;
  module: 're' | 'expense';
  entity: string;
  name: string;
  description?: string;
  type: 'income' | 'expense' | 'both';
  isActive: boolean;
  isSystem: boolean;
  color: string;
  icon?: string;
  parentCategory?: Category;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 're' | 'expense'>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    module: 're' as 're' | 'expense',
    entity: 'dealer',
    name: '',
    description: '',
    type: 'both' as 'income' | 'expense' | 'both',
    color: '#3B82F6',
    icon: '',
    isActive: true
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
       const token = getToken();

      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module', selectedModule);
      if (selectedEntity !== 'all') params.append('entity', selectedEntity);
      if (!showInactive) params.append('active', 'true');

      const response = await fetch(`/financial-tracker/api/financial-tracker/categories?${params.toString()}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedModule, selectedEntity, showInactive]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/financial-tracker/api/financial-tracker/categories/${editingCategory._id}`
        : '/financial-tracker/api/financial-tracker/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save category');
      }

      toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      setIsModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    if (category.isSystem) {
      toast.error('System categories cannot be deleted');
      return;
    }
    const token = getToken();

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/categories/${category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to delete category');

      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (category: Category) => {
    try {
      const token = getToken();

      const response = await fetch(`/financial-tracker/api/financial-tracker/categories/${category._id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to toggle category');

      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to toggle category');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      module: 're',
      entity: 'dealer',
      name: '',
      description: '',
      type: 'both',
      color: '#3B82F6',
      icon: '',
      isActive: true
    });
  };

  // Edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      module: category.module,
      entity: category.entity,
      name: category.name,
      description: category.description || '',
      type: category.type,
      color: category.color,
      icon: category.icon || '',
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Entity options
  const entityOptions = {
    re: ['dealer', 'fhh-client', 'cp-client', 'builder', 'project'],
    expense: ['dealer', 'fhh-client', 'cp-client', 'office', 'project', 'all']
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage categories for RE and Expense modules</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Category
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Entities</option>
          {selectedModule === 'all' ? (
            <>
              <option value="dealer">Dealer</option>
              <option value="fhh-client">FHH Client</option>
              <option value="cp-client">CP Client</option>
              <option value="builder">Builder</option>
              <option value="project">Project</option>
              <option value="office">Office</option>
            </>
          ) : (
            entityOptions[selectedModule as 're' | 'expense'].map(entity => (
              <option key={entity} value={entity}>
                {entity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))
          )}
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
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                !category.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      <FolderTree className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {category.module.toUpperCase()} • {category.entity}
                      </p>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
                      <button
                        onClick={() => handleEdit(category)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2 text-gray-500" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(category)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      >
                        {category.isActive ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2 text-gray-500" />
                            Activate
                          </>
                        )}
                      </button>
                      {!category.isSystem && (
                        <button
                          onClick={() => handleDelete(category)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {category.description && (
                  <p className="mt-2 text-sm text-gray-600">{category.description}</p>
                )}

                <div className="mt-3 flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.type === 'income' ? 'bg-green-100 text-green-800' :
                    category.type === 'expense' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {category.type}
                  </span>
                  {category.isSystem && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      System
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Last updated: {new Date(category.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No categories found. Create your first category!
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module
                  </label>
                  <select
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value as 're' | 'expense' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="re">RE Module</option>
                    <option value="expense">Expense Module</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity
                  </label>
                  <select
                    value={formData.entity}
                    onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {entityOptions[formData.module].map(entity => (
                      <option key={entity} value={entity}>
                        {entity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Type className="h-4 w-4 inline mr-1" />
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Office Rent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlignLeft className="h-4 w-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="both">Both (Income & Expense)</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expense Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Palette className="h-4 w-4 inline mr-1" />
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 px-1 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}