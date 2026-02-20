// src/app/admin/financial-tracker/categories/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Sparkles,
  Tag,
  DollarSign,
  CreditCard,
  Grid3x3,
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  Star,
  Zap,
  Shield,
  Globe
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
  createdBy?: { fullName: string; email: string };
  updatedBy?: { fullName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 're' | 'expense'>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({ total: 0, active: 0, system: 0, income: 0, expense: 0 });

  const [formData, setFormData] = useState({
    module: 're' as 're' | 'expense',
    entity: '',
    name: '',
    description: '',
    type: 'both' as 'income' | 'expense' | 'both',
    color: '#3B82F6',
    icon: 'Tag',
    isActive: true
  });

  // ✅ Fetch entities from database
  const fetchEntities = async () => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities`, {
        headers: { 'Authorization': token}
      });
      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities || []);
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error);
    }
  };

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const token = getToken();

      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module', selectedModule);
      if (selectedEntity !== 'all') params.append('entity', selectedEntity);
      if (!showInactive) params.append('active', 'true');

      const response = await fetch(`/financial-tracker/api/financial-tracker/categories?${params.toString()}`, {
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.categories || []);
      
      // Update stats
      const cats = data.categories || [];
      setStats({
        total: cats.length,
        active: cats.filter((c: Category) => c.isActive).length,
        system: cats.filter((c: Category) => c.isSystem).length,
        income: cats.filter((c: Category) => c.type === 'income').length,
        expense: cats.filter((c: Category) => c.type === 'expense').length
      });
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
    fetchCategories();
  }, [selectedModule, selectedEntity, showInactive]);

  // ✅ Get filtered entity options based on selected module
  const getEntityOptions = () => {
    if (selectedModule === 'all') {
      return entities;
    }
    return entities.filter(e => e.module === selectedModule);
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entity) {
      toast.error('Please select an entity');
      return;
    }

    try {
      const token = getToken();
      const url = editingCategory 
        ? `/financial-tracker/api/financial-tracker/categories/${editingCategory._id}`
        : '/financial-tracker/api/financial-tracker/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
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

  // ✅ Handle delete
  const handleDelete = async (category: Category) => {
    if (category.isSystem) {
      toast.error('System categories cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/categories/${category._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to delete category');

      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // ✅ Handle toggle active
  const handleToggleActive = async (category: Category) => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/categories/${category._id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': token }
      });

      if (!response.ok) throw new Error('Failed to toggle category');

      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to toggle category');
    }
  };

  // ✅ Handle duplicate
  const handleDuplicate = (category: Category) => {
    setFormData({
      module: category.module,
      entity: category.entity,
      name: `${category.name} (Copy)`,
      description: category.description || '',
      type: category.type,
      color: category.color,
      icon: category.icon || 'Tag',
      isActive: category.isActive
    });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // ✅ Handle export
 const handleExport = async () => {
  try {
    const token = getToken();
    const params = new URLSearchParams();
    if (selectedModule !== 'all') params.append('module', selectedModule);
    if (selectedEntity !== 'all') params.append('entity', selectedEntity);

    const response = await fetch(`/financial-tracker/api/financial-tracker/categories/export?${params.toString()}`, {
      headers: { 'Authorization': token }
    });

    if (!response.ok) throw new Error('Export failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Categories exported successfully');
  } catch (error) {
    toast.error('Failed to export categories');
  }
};

  // Reset form
  const resetForm = () => {
    setFormData({
      module: 're',
      entity: '',
      name: '',
      description: '',
      type: 'both',
      color: '#3B82F6',
      icon: 'Tag',
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
      icon: category.icon || 'Tag',
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get entity display name
  const getEntityName = (entityKey: string) => {
    const entity = entities.find(e => e.entityKey === entityKey);
    return entity?.name || entityKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg shadow-purple-500/25">
                <FolderTree className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Category Management
                </h1>
                <p className="text-gray-600 mt-0.5">Manage categories for RE and Expense modules</p>
              </div>
            </div>

            {/* Stats Badges */}
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                <span className="text-blue-600 font-medium">{stats.total}</span>
                <span className="text-gray-500 ml-1">Total</span>
              </div>
              <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-sm">
                <span className="text-green-600 font-medium">{stats.active}</span>
                <span className="text-gray-500 ml-1">Active</span>
              </div>
              <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-sm">
                <span className="text-purple-600 font-medium">{stats.system}</span>
                <span className="text-gray-500 ml-1">System</span>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                <span className="text-emerald-600 font-medium">{stats.income}</span>
                <span className="text-gray-500 ml-1">Income</span>
              </div>
              <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-sm">
                <span className="text-red-600 font-medium">{stats.expense}</span>
                <span className="text-gray-500 ml-1">Expense</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, description, entity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value as any);
                  setSelectedEntity('all');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
              >
                <option value="all">All Modules</option>
                <option value="re">RE Module</option>
                <option value="expense">Expense Module</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
              >
                <option value="all">All Entities</option>
                {getEntityOptions().map(entity => (
                  <option key={entity._id} value={entity.entityKey}>
                    {entity.name} ({entity.entityKey})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 bg-white px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 shadow-sm flex-1">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Show inactive</span>
                </label>

                <div className="flex border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    title="Grid view"
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 border-l border-gray-300 ${viewMode === 'list' ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    title="List view"
                  >
                    <Layers className="h-5 w-5" />
                  </button>
                </div>

               <button
  onClick={handleExport}
  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
>
  <Download className="h-4 w-4 mr-2 text-gray-500" />
  Export
</button>

                <button
                  onClick={fetchCategories}
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 bg-white shadow-sm"
                  title="Refresh"
                >
                  <RefreshCw className="h-5 w-5 text-gray-500" />
                </button>

                <button
                  onClick={() => {
                    setEditingCategory(null);
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/25 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Category
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-xl p-16 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No Categories Found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first category</p>
            <button
              onClick={() => {
                setEditingCategory(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/25 font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Category
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className={`group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-200 ${
                  !category.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        <FolderTree className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            category.module === 're' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {category.module.toUpperCase()}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="text-xs text-gray-500">{getEntityName(category.entity)}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 hidden group-focus-within:block z-20">
                        <div className="py-1">
                          <button
                            onClick={() => handleEdit(category)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-3 text-purple-600" />
                            Edit Category
                          </button>
                          <button
                            onClick={() => handleDuplicate(category)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center transition-colors"
                          >
                            <Copy className="h-4 w-4 mr-3 text-blue-600" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleToggleActive(category)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center transition-colors"
                          >
                            {category.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-3 text-orange-600" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-3 text-green-600" />
                                Activate
                              </>
                            )}
                          </button>
                          {!category.isSystem && (
                            <button
                              onClick={() => handleDelete(category)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-3 text-red-600" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {category.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-xl">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      category.type === 'income' ? 'bg-green-100 text-green-800 border border-green-200' :
                      category.type === 'expense' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {category.type}
                    </span>
                    {category.isSystem && (
                      <span className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200 font-medium flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        System
                      </span>
                    )}
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-400">
                      <span>Updated {new Date(category.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {category.updatedBy && (
                      <span className="text-gray-400 truncate max-w-[120px]" title={category.updatedBy.email}>
                        by {category.updatedBy.fullName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl border shadow-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          <FolderTree className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-gray-500">{category.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.module === 're' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {category.module.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getEntityName(category.entity)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.type === 'income' ? 'bg-green-100 text-green-800' :
                        category.type === 'expense' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {category.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {category.isActive ? (
                        <span className="flex items-center text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-gray-500">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(category)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(category)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {!category.isSystem && (
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-xl p-2">
                    {editingCategory ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Module Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, module: 're', entity: '' })}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                      formData.module === 're'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className={`h-6 w-6 mb-1 ${
                      formData.module === 're' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.module === 're' ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      RE Module
                    </span>
                    {formData.module === 're' && (
                      <CheckCircle className="h-4 w-4 text-blue-600 absolute top-2 right-2" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, module: 'expense', entity: '' })}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                      formData.module === 'expense'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className={`h-6 w-6 mb-1 ${
                      formData.module === 'expense' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.module === 'expense' ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      Expense Module
                    </span>
                    {formData.module === 'expense' && (
                      <CheckCircle className="h-4 w-4 text-green-600 absolute top-2 right-2" />
                    )}
                  </button>
                </div>
              </div>

              {/* Entity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Entity</option>
                  {entities
                    .filter(e => e.module === formData.module)
                    .map(entity => (
                      <option key={entity._id} value={entity.entityKey}>
                        {entity.name} ({entity.entityKey})
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Type className="h-4 w-4 inline mr-1 text-gray-500" />
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Office Rent, Commission, Salary"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlignLeft className="h-4 w-4 inline mr-1 text-gray-500" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Optional description of this category"
                />
              </div>

              {/* Type and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="both">Both (Income & Expense)</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expense Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Palette className="h-4 w-4 inline mr-1 text-gray-500" />
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg shadow-purple-500/25 flex items-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}