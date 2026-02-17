'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Grid3x3,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Type,
  Hash,
  Calendar,
  ListChecks,
  FileText,
  Image,
  CheckSquare,
  CircleDot,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  XCircle,
  AlertCircle,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Upload,
  Download,
  Filter,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Field {
  _id: string;
  module: 're' | 'expense';
  entityId: string;
  entityName?: string;
  fieldKey: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'image' | 'checkbox' | 'radio';
  isSystem: boolean;
  isEnabled: boolean;
  required: boolean;
  readOnly: boolean;
  visible: boolean;
  order: number;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    regex?: string;
    allowedFileTypes?: string[];
    maxFileSize?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
}

// Sortable Field Item Component
const SortableFieldItem = ({ field, onEdit, onToggle, onDelete, index, totalItems, onMove }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'select': return <ListChecks className="h-4 w-4" />;
      case 'textarea': return <FileText className="h-4 w-4" />;
      case 'file': return <Upload className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'checkbox': return <CheckSquare className="h-4 w-4" />;
      case 'radio': return <CircleDot className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 ${!field.isEnabled ? 'opacity-60' : ''} ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-move text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Field Icon */}
          <div className={`p-2 rounded-lg ${
            field.type === 'text' ? 'bg-blue-100 text-blue-600' :
            field.type === 'number' ? 'bg-green-100 text-green-600' :
            field.type === 'date' ? 'bg-purple-100 text-purple-600' :
            field.type === 'select' ? 'bg-yellow-100 text-yellow-600' :
            field.type === 'textarea' ? 'bg-orange-100 text-orange-600' :
            field.type === 'file' ? 'bg-indigo-100 text-indigo-600' :
            field.type === 'image' ? 'bg-pink-100 text-pink-600' :
            field.type === 'checkbox' ? 'bg-teal-100 text-teal-600' :
            field.type === 'radio' ? 'bg-cyan-100 text-cyan-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getTypeIcon(field.type)}
          </div>

          {/* Field Details */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{field.label}</h4>
              {field.required && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Required</span>
              )}
              {field.readOnly && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">Read Only</span>
              )}
              {field.isSystem && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">System</span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="font-mono text-xs">{field.fieldKey}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{field.type}</span>
              {field.options && field.options.length > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <span>{field.options.length} options</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Move Up/Down */}
          <div className="flex border rounded-lg">
            <button
              onClick={() => onMove(field._id, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onMove(field._id, 'down')}
              disabled={index === totalItems - 1}
              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border-l"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          {/* Toggle Active */}
          <button
            onClick={() => onToggle(field._id)}
            className={`p-1 rounded-lg ${
              field.isEnabled 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            {field.isEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(field)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit className="h-4 w-4" />
          </button>

          {/* Delete */}
          {!field.isSystem && (
            <button
              onClick={() => onDelete(field)}
              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Validation Rules */}
      {field.validation && (
        <div className="mt-3 ml-12 flex flex-wrap gap-2">
          {field.validation.min !== undefined && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
              Min: {field.validation.min}
            </span>
          )}
          {field.validation.max !== undefined && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
              Max: {field.validation.max}
            </span>
          )}
          {field.validation.regex && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-mono">
              Regex: {field.validation.regex}
            </span>
          )}
          {field.validation.allowedFileTypes && field.validation.allowedFileTypes.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
              {field.validation.allowedFileTypes.join(', ')}
            </span>
          )}
          {field.validation.maxFileSize && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
              Max: {field.validation.maxFileSize / 1024 / 1024}MB
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function FieldsPage() {
  const searchParams = useSearchParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>(
    (searchParams.get('module') as any) || 're'
  );
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'preview'>('fields');

  const [formData, setFormData] = useState({
    module: 're' as 're' | 'expense',
    entityId: '',
    fieldKey: '',
    label: '',
    type: 'text' as Field['type'],
    required: false,
    readOnly: false,
    visible: true,
    isEnabled: true,
    defaultValue: '',
    options: [''] as string[],
    validation: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      regex: '',
      allowedFileTypes: [] as string[],
      maxFileSize: undefined as number | undefined
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch entities
  const fetchEntities = async () => {
    try {
      const response = await fetch(`/api/financial-tracker/entities?module=${selectedModule}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities);
        if (data.entities.length > 0 && !selectedEntity) {
          setSelectedEntity(data.entities[0]._id);
          setFormData(prev => ({ ...prev, entityId: data.entities[0]._id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error);
      toast.error('Failed to load entities');
    }
  };

  // Fetch fields
  const fetchFields = async () => {
    if (!selectedEntity) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/financial-tracker/fields?module=${selectedModule}&entityId=${selectedEntity}${!showInactive ? '&active=true' : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch fields');
      
      const data = await response.json();
      setFields(data.fields.sort((a: Field, b: Field) => a.order - b.order));
    } catch (error) {
      toast.error('Failed to load fields');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [selectedModule]);

  useEffect(() => {
    if (selectedEntity) {
      fetchFields();
    }
  }, [selectedEntity, showInactive]);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f._id === active.id);
      const newIndex = fields.findIndex((f) => f._id === over?.id);

      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);

      // Update order in database
      try {
        const fieldOrders = newFields.map((field, index) => ({
          fieldId: field._id,
          order: index
        }));

        const response = await fetch('/api/financial-tracker/fields/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          },
          body: JSON.stringify({
            entityId: selectedEntity,
            fieldOrders
          })
        });

        if (!response.ok) throw new Error('Failed to save order');
      } catch (error) {
        toast.error('Failed to save field order');
        fetchFields(); // Revert on error
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validate field key format
    if (!/^[a-z0-9-]+$/.test(formData.fieldKey)) {
      toast.error('Field key can only contain lowercase letters, numbers, and hyphens');
      setIsSaving(false);
      return;
    }

    // Filter out empty options
    const filteredOptions = formData.options?.filter(opt => opt.trim() !== '') || [];

    // Validate options for select/radio
    if ((formData.type === 'select' || formData.type === 'radio') && filteredOptions.length === 0) {
      toast.error('Please add at least one option');
      setIsSaving(false);
      return;
    }

    try {
      const url = editingField 
        ? `/api/financial-tracker/fields/${editingField._id}`
        : '/api/financial-tracker/fields';
      
      const method = editingField ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({
          ...formData,
          options: filteredOptions.length > 0 ? filteredOptions : undefined,
          validation: {
            ...formData.validation,
            regex: formData.validation.regex || undefined,
            allowedFileTypes: formData.validation.allowedFileTypes?.filter(t => t) || undefined,
            maxFileSize: formData.validation.maxFileSize || undefined
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save field');
      }

      toast.success(editingField ? 'Field updated successfully' : 'Field created successfully');
      setIsModalOpen(false);
      setEditingField(null);
      resetForm();
      fetchFields();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle field
  const handleToggleField = async (fieldId: string) => {
    try {
      const response = await fetch(`/api/financial-tracker/fields/${fieldId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to toggle field');

      toast.success('Field toggled successfully');
      fetchFields();
    } catch (error) {
      toast.error('Failed to toggle field');
    }
  };

  // Handle delete field
  const handleDeleteField = async (field: Field) => {
    if (field.isSystem) {
      toast.error('System fields cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${field.label}"?`)) return;

    try {
      const response = await fetch(`/api/financial-tracker/fields/${field._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete field');

      toast.success('Field deleted successfully');
      fetchFields();
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  // Handle move field
  const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f._id === fieldId);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === fields.length - 1)
    ) return;

    const newFields = [...fields];
    const temp = newFields[index];
    if (direction === 'up') {
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;
    } else {
      newFields[index] = newFields[index + 1];
      newFields[index + 1] = temp;
    }

    setFields(newFields);

    // Update order in database
    try {
      const fieldOrders = newFields.map((field, idx) => ({
        fieldId: field._id,
        order: idx
      }));

      await fetch('/api/financial-tracker/fields/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({
          entityId: selectedEntity,
          fieldOrders
        })
      });
    } catch (error) {
      toast.error('Failed to save field order');
      fetchFields(); // Revert on error
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      module: selectedModule,
      entityId: selectedEntity,
      fieldKey: '',
      label: '',
      type: 'text',
      required: false,
      readOnly: false,
      visible: true,
      isEnabled: true,
      defaultValue: '',
      options: [''],
      validation: {
        min: undefined,
        max: undefined,
        regex: '',
        allowedFileTypes: [],
        maxFileSize: undefined
      }
    });
  };

  // Edit field
  const handleEdit = (field: Field) => {
    setEditingField(field);
    setFormData({
      module: field.module,
      entityId: field.entityId,
      fieldKey: field.fieldKey,
      label: field.label,
      type: field.type,
      required: field.required,
      readOnly: field.readOnly,
      visible: field.visible,
      isEnabled: field.isEnabled,
      defaultValue: field.defaultValue || '',
      options: field.options && field.options.length > 0 ? field.options : [''],
      validation: {
        min: field.validation?.min,
        max: field.validation?.max,
        regex: field.validation?.regex || '',
        allowedFileTypes: field.validation?.allowedFileTypes || [],
        maxFileSize: field.validation?.maxFileSize
      }
    });
    setIsModalOpen(true);
  };

  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  // Add option
  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  // Remove option
  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  // Filter fields
  const filteredFields = fields.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.fieldKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dynamic Fields</h1>
          <p className="text-gray-600 mt-1">Configure custom fields for each entity</p>
        </div>
        <button
          onClick={() => {
            setEditingField(null);
            resetForm();
            setIsModalOpen(true);
          }}
          disabled={!selectedEntity}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </button>
      </div>

      {/* Module and Entity Selection */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setSelectedModule('re');
                  setSelectedEntity('');
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  selectedModule === 're'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                RE Module
              </button>
              <button
                onClick={() => {
                  setSelectedModule('expense');
                  setSelectedEntity('');
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  selectedModule === 'expense'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Expense Module
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setFormData(prev => ({ ...prev, entityId: e.target.value }));
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Entity</option>
              {entities.map(entity => (
                <option key={entity._id} value={entity._id}>
                  {entity.name} ({entity.entityKey})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show inactive</span>
            </label>
            
            <button
              onClick={fetchFields}
              className="p-2 border rounded-lg hover:bg-gray-50 ml-auto"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {selectedEntity && (
        <div className="mb-4 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'fields'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers className="h-4 w-4 inline mr-2" />
              Fields ({filteredFields.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Preview
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!selectedEntity ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Grid3x3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Entity</h3>
          <p className="text-gray-500">Choose a module and entity to manage its fields</p>
        </div>
      ) : activeTab === 'fields' ? (
        // Fields List
        isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading fields...</span>
          </div>
        ) : filteredFields.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Grid3x3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fields found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first custom field</p>
            <button
              onClick={() => {
                setEditingField(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredFields.map(f => f._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredFields.map((field, index) => (
                  <SortableFieldItem
                    key={field._id}
                    field={field}
                    index={index}
                    totalItems={filteredFields.length}
                    onEdit={handleEdit}
                    onToggle={handleToggleField}
                    onDelete={handleDeleteField}
                    onMove={handleMoveField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      ) : (
        // Preview Mode
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Form Preview</h3>
          <div className="space-y-4">
            {filteredFields.filter(f => f.visible).map((field) => (
              <div key={field._id} className="border-b pb-4 last:border-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.label}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    disabled
                  />
                )}
                
                {field.type === 'number' && (
                  <input
                    type="number"
                    placeholder={field.label}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    disabled
                  />
                )}
                
                {field.type === 'date' && (
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    disabled
                  />
                )}
                
                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    placeholder={field.label}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    disabled
                  />
                )}
                
                {field.type === 'select' && (
                  <select className="w-full px-3 py-2 border rounded-lg bg-gray-50" disabled>
                    <option>Select an option</option>
                    {field.options?.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'checkbox' && (
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span className="text-sm text-gray-600">Checkbox option</span>
                  </div>
                )}
                
                {field.type === 'radio' && (
                  <div className="space-y-1">
                    {field.options?.map(opt => (
                      <div key={opt} className="flex items-center">
                        <input type="radio" name="preview" className="mr-2" disabled />
                        <span className="text-sm text-gray-600">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {field.type === 'file' && (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center bg-gray-50">
                    <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  </div>
                )}
                
                {field.type === 'image' && (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center bg-gray-50">
                    <Image className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                  </div>
                )}

                {field.validation && (
                  <p className="text-xs text-gray-500 mt-1">
                    {field.validation.min !== undefined && `Min: ${field.validation.min} `}
                    {field.validation.max !== undefined && `Max: ${field.validation.max} `}
                    {field.validation.regex && 'Pattern required '}
                    {field.validation.allowedFileTypes && `Allowed: ${field.validation.allowedFileTypes.join(', ')}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingField ? 'Edit Field' : 'Create New Field'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingField(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Key *
                  </label>
                  <input
                    type="text"
                    value={formData.fieldKey}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      fieldKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') 
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g., office-rent"
                    required
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Office Rent"
                    required
                  />
                </div>
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Type *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { type: 'text', label: 'Text', icon: Type },
                    { type: 'number', label: 'Number', icon: Hash },
                    { type: 'date', label: 'Date', icon: Calendar },
                    { type: 'select', label: 'Select', icon: ListChecks },
                    { type: 'textarea', label: 'Textarea', icon: FileText },
                    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
                    { type: 'radio', label: 'Radio', icon: CircleDot },
                    { type: 'file', label: 'File', icon: Upload },
                    { type: 'image', label: 'Image', icon: Image }
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type as Field['type'] })}
                      className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                        formData.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options for Select/Radio */}
              {(formData.type === 'select' || formData.type === 'radio') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options *
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          disabled={formData.options.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Default Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Value
                </label>
                <input
                  type="text"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional default value"
                />
              </div>

              {/* Validation Rules */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Validation Rules</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {(formData.type === 'number' || formData.type === 'text') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum {formData.type === 'number' ? 'Value' : 'Length'}
                        </label>
                        <input
                          type="number"
                          value={formData.validation.min || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              min: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          })}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Min"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum {formData.type === 'number' ? 'Value' : 'Length'}
                        </label>
                        <input
                          type="number"
                          value={formData.validation.max || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              max: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          })}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Max"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'text' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regex Pattern
                      </label>
                      <input
                        type="text"
                        value={formData.validation.regex || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          validation: { ...formData.validation, regex: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg font-mono"
                        placeholder="^[A-Z0-9]+$"
                      />
                      <p className="text-xs text-gray-500 mt-1">Regular expression for validation</p>
                    </div>
                  )}

                  {(formData.type === 'file' || formData.type === 'image') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max File Size (MB)
                        </label>
                        <input
                          type="number"
                          value={formData.validation.maxFileSize ? formData.validation.maxFileSize / 1024 / 1024 : ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              maxFileSize: e.target.value ? parseInt(e.target.value) * 1024 * 1024 : undefined
                            }
                          })}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="e.g., 5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Allowed File Types
                        </label>
                        <input
                          type="text"
                          value={formData.validation.allowedFileTypes?.join(', ') || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              allowedFileTypes: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                            }
                          })}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="jpg, png, pdf"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated list (e.g., jpg, png, pdf)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Required field</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.readOnly}
                      onChange={(e) => setFormData({ ...formData, readOnly: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Read only</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Visible in forms</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingField(null);
                    resetForm();
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingField ? 'Update Field' : 'Create Field'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}