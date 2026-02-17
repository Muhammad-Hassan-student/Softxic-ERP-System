'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Palette,
  Type,
  AlignLeft,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Download,
  Grid3x3,
  Tag,
  Layers,
  DollarSign,
  CreditCard,
  Building2,
  Users,
  Briefcase,
  Package,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  createdBy?: {
    fullName: string;
  };
  updatedBy?: {
    fullName: string;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 're' | 'expense'>(
    (searchParams.get('module') as any) || 'all'
  );
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['re', 'expense']));
  
  const [formData, setFormData] = useState({
    module: 're' as 're' | 'expense',
    entity: 'dealer',
    name: '',
    description: '',
    type: 'both' as 'income' | 'expense' | 'both',
    color: '#3B82F6',
    icon: 'Tag',
    isActive: true
  });

  // Entity options mapping
  const entityOptions = {
    re: [
      { value: 'dealer', label: 'Dealer', icon: Users },
      { value: 'fhh-client', label: 'FHH Client', icon: Users },
      { value: 'cp-client', label: 'CP Client', icon: Users },
      { value: 'builder', label: 'Builder', icon: Briefcase },
      { value: 'project', label: 'Project', icon: Package }
    ],
    expense: [
      { value: 'dealer', label: 'Dealer', icon: Users },
      { value: 'fhh-client', label: 'FHH Client', icon: Users },
      { value: 'cp-client', label: 'CP Client', icon: Users },
      { value: 'office', label: 'Office', icon: Building2 },
      { value: 'project', label: 'Project', icon: Package },
      { value: 'all', label: 'All Entities', icon: Grid3x3 }
    ]
  };

  // Icon options
  const iconOptions = [
    { value: 'Tag', label: 'Tag', icon: Tag },
    { value: 'DollarSign', label: 'Dollar', icon: DollarSign },
    { value: 'CreditCard', label: 'Credit Card', icon: CreditCard },
    { value: 'Building2', label: 'Building', icon: Building2 },
    { value: 'Users', label: 'Users', icon: Users },
    { value: 'Package', label: 'Package', icon: Package },
    { value: 'Home', label: 'Home', icon: Home },
    { value: 'Briefcase', label: 'Briefcase', icon: Briefcase },
    { value: 'Layers', label: 'Layers', icon: Layers }
  ];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module', selectedModule);
      if (selectedEntity !== 'all') params.append('entity', selectedEntity);
      if (!showInactive) params.append('active', 'true');

      const response = await fetch(`/api/financial-tracker/categories?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
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
        ? `/api/financial-tracker/categories/${editingCategory._id}`
        : '/api/financial-tracker/categories';
      
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

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const response = await fetch(`/api/financial-tracker/categories/${category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
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
      const response = await fetch(`/api/financial-tracker/categories/${category._id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
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

  // Group categories by module and entity
  const groupedCategories = filteredCategories.reduce((acc, cat) => {
    if (!acc[cat.module]) {
      acc[cat.module] = {};
    }
    if (!acc[cat.module][cat.entity]) {
      acc[cat.module][cat.entity] = [];
    }
    acc[cat.module][cat.entity].push(cat);
    return acc;
  }, {} as Record<string, Record<string, Category[]>>);

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  // Export categories
  const exportCategories = async () => {
    try {
      const response = await fetch('/api/financial-tracker/categories/export', {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Categories exported successfully');
    } catch (error) {
      toast.error('Failed to export categories');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage categories for RE and Expense modules</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCategories}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2 text-gray-500" />
            Export
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories by name, entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value as any);
                setSelectedEntity('all');
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modules</option>
              <option value="re">RE Module</option>
              <option value="expense">Expense Module</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Entities</option>
              {selectedModule !== 'all' ? (
                entityOptions[selectedModule].map(entity => (
                  <option key={entity.value} value={entity.value}>
                    {entity.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="dealer">Dealer</option>
                  <option value="fhh-client">FHH Client</option>
                  <option value="cp-client">CP Client</option>
                  <option value="builder">Builder</option>
                  <option value="project">Project</option>
                  <option value="office">Office</option>
                </>
              )}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show inactive</span>
            </label>
            
            <div className="flex border rounded-lg ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Layers className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={fetchCategories}
              className="p-2 border rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="space-y-6">
          {Object.entries(groupedCategories).map(([module, entities]) => (
            <div key={module} className="bg-white rounded-lg border overflow-hidden">
              {/* Module Header */}
              <div 
                className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                onClick={() => toggleGroup(module)}
              >
                <div className="flex items-center space-x-3">
                  {expandedGroups.has(module) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900 uppercase">
                    {module === 're' ? 'RE Module' : 'Expense Module'}
                  </h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {Object.values(entities).reduce((acc, cats) => acc + cats.length, 0)} categories
                  </span>
                </div>
              </div>

              {/* Entity Groups */}
              {expandedGroups.has(module) && (
                <div className="p-6 space-y-6">
                  {Object.entries(entities).map(([entity, cats]) => (
                    <div key={entity}>
                      <h3 className="text-md font-medium text-gray-700 mb-3 capitalize flex items-center">
                        {entity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        <span className="ml-2 text-xs text-gray-500">({cats.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cats.map((category) => (
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
                                    {category.icon === 'Tag' && <Tag className="h-5 w-5" />}
                                    {category.icon === 'DollarSign' && <DollarSign className="h-5 w-5" />}
                                    {category.icon === 'CreditCard' && <CreditCard className="h-5 w-5" />}
                                    {category.icon === 'Building2' && <Building2 className="h-5 w-5" />}
                                    {category.icon === 'Users' && <Users className="h-5 w-5" />}
                                    {category.icon === 'Package' && <Package className="h-5 w-5" />}
                                    {category.icon === 'Home' && <Home className="h-5 w-5" />}
                                    {category.icon === 'Briefcase' && <Briefcase className="h-5 w-5" />}
                                    {category.icon === 'Layers' && <Layers className="h-5 w-5" />}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                    <p className="text-xs text-gray-500">
                                      {category.entity}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Actions Dropdown */}
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
                                          <EyeOff className="h-4 w-4 mr-2 text-orange-500" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="h-4 w-4 mr-2 text-green-500" />
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
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                  {category.description}
                                </p>
                              )}

                              <div className="mt-3 flex items-center flex-wrap gap-2">
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

                              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                                {category.updatedBy && (
                                  <span>by {category.updatedBy.fullName}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <FolderTree className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first category</p>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </button>
            </div>
          )}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500">{category.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 uppercase">
                    {category.module}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {category.entity.replace('-', ' ')}
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
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    {!category.isSystem && (
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Module and Entity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, module: 're', entity: 'dealer' });
                      }}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        formData.module === 're'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <DollarSign className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs">RE Module</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, module: 'expense', entity: 'office' });
                      }}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        formData.module === 'expense'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs">Expense Module</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity *
                  </label>
                  <select
                    value={formData.entity}
                    onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {entityOptions[formData.module].map(entity => {
                      const Icon = entity.icon;
                      return (
                        <option key={entity.value} value={entity.value}>
                          {entity.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Type className="h-4 w-4 inline mr-1" />
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Office Rent, Commission, Salary"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlignLeft className="h-4 w-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional description of this category"
                />
              </div>

              {/* Type and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`p-2 border rounded-lg text-center text-sm transition-colors ${
                        formData.type === 'income'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`p-2 border rounded-lg text-center text-sm transition-colors ${
                        formData.type === 'expense'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'both' })}
                      className={`p-2 border rounded-lg text-center text-sm transition-colors ${
                        formData.type === 'both'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Both
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="h-4 w-4 inline mr-1" />
                    Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {iconOptions.map(icon => {
                    const Icon = icon.icon;
                    return (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: icon.value })}
                        className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                          formData.icon === icon.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs">{icon.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
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