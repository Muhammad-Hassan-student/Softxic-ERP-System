// src/app/admin/financial-tracker/fields/fields-content.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Save,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  AlertCircle,
  Type,
  Hash,
  Calendar,
  ListChecks,
  FileText,
  Image as ImageIcon,
  CheckSquare,
  CircleDot,
  Upload,
  RefreshCw,
  Download,
  Grid3x3,
  Layers,
  FolderTree,
  DollarSign,
  CreditCard,
  Search,
  Filter,
  Sparkles,
  Shield,
  Lock,
  Unlock,
  Copy,
  Globe,
  Zap,
  Star
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

// ✅ Token utility
const getToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : '';
};

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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { fullName: string; email: string };
  updatedBy?: { fullName: string; email: string };
}

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
}

// ✅ Beautiful Sortable Field Item
const SortableFieldItem = ({ field, onEdit, onToggle, onDelete, onDuplicate, index, totalItems, onMove }: any) => {
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
    zIndex: isDragging ? 50 : 1
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'select': return <ListChecks className="h-4 w-4" />;
      case 'textarea': return <FileText className="h-4 w-4" />;
      case 'file': return <Upload className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'checkbox': return <CheckSquare className="h-4 w-4" />;
      case 'radio': return <CircleDot className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'number': return 'bg-green-100 text-green-600 border-green-200';
      case 'date': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'select': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'textarea': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'file': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'image': return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'checkbox': return 'bg-teal-100 text-teal-600 border-teal-200';
      case 'radio': return 'bg-cyan-100 text-cyan-600 border-cyan-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 ${
        !field.isEnabled ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-2xl ring-2 ring-blue-500 ring-opacity-50 scale-[1.02]' : ''}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="mt-2 cursor-move text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Field Icon with Gradient */}
            <div className={`p-3 rounded-xl border ${getTypeColor(field.type)}`}>
              {getTypeIcon(field.type)}
            </div>

            {/* Field Details */}
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h4 className="font-semibold text-gray-900">{field.label}</h4>
                {field.required && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full font-medium shadow-sm">
                    Required
                  </span>
                )}
                {field.readOnly && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs rounded-full font-medium shadow-sm">
                    Read Only
                  </span>
                )}
                {field.isSystem && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full font-medium shadow-sm flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    System
                  </span>
                )}
                {!field.visible && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs rounded-full font-medium shadow-sm">
                    Hidden
                  </span>
                )}
              </div>
              
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 mt-2">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                  {field.fieldKey}
                </span>
                <span className={`capitalize px-2 py-1 rounded-lg text-xs font-medium border ${getTypeColor(field.type)}`}>
                  {field.type}
                </span>
                {field.options && field.options.length > 0 && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                    {field.options.length} options
                  </span>
                )}
                {field.validation && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg border border-green-200">
                    Validated
                  </span>
                )}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">
                  Order: {field.order + 1}
                </span>
              </div>

              {/* Validation Rules */}
              {field.validation && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {field.validation.min !== undefined && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                      Min: {field.validation.min}
                    </span>
                  )}
                  {field.validation.max !== undefined && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                      Max: {field.validation.max}
                    </span>
                  )}
                  {field.validation.regex && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200 font-mono">
                      /{field.validation.regex}/
                    </span>
                  )}
                  {field.validation.allowedFileTypes && field.validation.allowedFileTypes.length > 0 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                      {field.validation.allowedFileTypes.join(', ')}
                    </span>
                  )}
                  {field.validation.maxFileSize && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200">
                      Max: {field.validation.maxFileSize / 1024 / 1024}MB
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="mt-3 flex items-center text-xs text-gray-400">
                <span>ID: {field._id.slice(-8)}</span>
                {field.updatedAt && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Updated {new Date(field.updatedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions with Tooltips */}
          <div className="flex items-center space-x-1">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden mr-1 bg-white shadow-sm">
              <button
                onClick={() => onMove(field._id, 'up')}
                disabled={index === 0}
                className="p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => onMove(field._id, 'down')}
                disabled={index === totalItems - 1}
                className="p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed border-l border-gray-200 transition-colors"
                title="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => onToggle(field._id)}
              className={`p-2 rounded-xl transition-all ${
                field.isEnabled 
                  ? 'text-green-600 hover:bg-green-50 border border-green-200' 
                  : 'text-gray-400 hover:bg-gray-50 border border-gray-200'
              }`}
              title={field.isEnabled ? 'Disable' : 'Enable'}
            >
              {field.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            <button
              onClick={() => onDuplicate?.(field)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl border border-purple-200 transition-all"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>

            <button
              onClick={() => onEdit(field)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-all"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>

            {!field.isSystem && (
              <button
                onClick={() => onDelete(field)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-all"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Fields Content Component
export default function FieldsContent() {
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get('module');

  const [fields, setFields] = useState<Field[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>(
    (moduleParam as 're' | 'expense') || 're'
  );
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedEntityObj, setSelectedEntityObj] = useState<Entity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'preview'>('fields');
  const [stats, setStats] = useState({ total: 0, visible: 0, required: 0, system: 0 });

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

  // ✅ Update stats
  useEffect(() => {
    setStats({
      total: fields.length,
      visible: fields.filter(f => f.visible).length,
      required: fields.filter(f => f.required).length,
      system: fields.filter(f => f.isSystem).length
    });
  }, [fields]);

  // ✅ Fetch entities
  const fetchEntities = async () => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities?module=${selectedModule}`, {
        headers: {
          'Authorization': token
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities || []);
        
        if (data.entities.length > 0 && !selectedEntity) {
          setSelectedEntity(data.entities[0]._id);
          setSelectedEntityObj(data.entities[0]);
          setFormData(prev => ({ ...prev, entityId: data.entities[0]._id }));
        }
      }
    } catch (error) {
      toast.error('Failed to load entities');
    }
  };

  // ✅ Fetch fields
  const fetchFields = async () => {
    if (!selectedEntity) return;
    
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/fields?module=${selectedModule}&entityId=${selectedEntity}${!showInactive ? '' : '&includeDisabled=true'}`,
        {
          headers: {
            'Authorization': token
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch fields');
      
      const data = await response.json();
      setFields(data.fields?.sort((a: Field, b: Field) => a.order - b.order) || []);
    } catch (error) {
      toast.error('Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle export
  const handleExport = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (selectedModule) params.append('module', selectedModule);
      if (selectedEntity) params.append('entityId', selectedEntity);
      if (showInactive) params.append('includeDisabled', 'true');
      
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/export?${params.toString()}`, {
        headers: { 'Authorization': token }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fields-${selectedEntityObj?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Fields exported successfully');
    } catch (error) {
      toast.error('Failed to export fields');
    }
  };

  // ✅ Fixed handleDuplicate function
const handleDuplicate = async (field: Field) => {
  setFormData({
    module: field.module,
    entityId: field.entityId,
    fieldKey: `${field.fieldKey}-copy`,
    label: `${field.label} (Copy)`,
    type: field.type,
    required: field.required,
    readOnly: field.readOnly,
    visible: field.visible,
    isEnabled: field.isEnabled,
    defaultValue: field.defaultValue || '',
    options: field.options || [''],
    validation: {
      min: field.validation?.min,
      max: field.validation?.max,
      regex: field.validation?.regex || '',
      allowedFileTypes: field.validation?.allowedFileTypes || [],
      maxFileSize: field.validation?.maxFileSize
    }
  });
  setEditingField(null);
  setIsModalOpen(true);
};
  useEffect(() => {
    if (selectedEntity) {
      const entity = entities.find(e => e._id === selectedEntity);
      setSelectedEntityObj(entity || null);
    }
  }, [selectedEntity, entities]);

  useEffect(() => {
    fetchEntities();
  }, [selectedModule]);

  useEffect(() => {
    if (selectedEntity) {
      fetchFields();
    }
  }, [selectedEntity, showInactive]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f._id === active.id);
      const newIndex = fields.findIndex((f) => f._id === over?.id);

      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);

      try {
        const token = getToken();
        const fieldOrders = newFields.map((field:any, index:any) => ({
          fieldId: field._id,
          order: index
        }));

        const response = await fetch('/financial-tracker/api/financial-tracker/fields/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            entityId: selectedEntity,
            fieldOrders
          })
        });

        if (!response.ok) throw new Error('Failed to save order');
        toast.success('Fields reordered successfully');
      } catch (error) {
        toast.error('Failed to save field order');
        fetchFields();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[a-z0-9-]+$/.test(formData.fieldKey)) {
      toast.error('Field key can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    const filteredOptions = formData.options?.filter(opt => opt.trim() !== '') || [];

    if ((formData.type === 'select' || formData.type === 'radio') && filteredOptions.length === 0) {
      toast.error('Please add at least one option');
      return;
    }

    try {
      const token = getToken();
      const url = editingField 
        ? `/financial-tracker/api/financial-tracker/fields/${editingField._id}`
        : '/financial-tracker/api/financial-tracker/fields';
      
      const method = editingField ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
        throw new Error(error.error || 'Failed to save field');
      }

      toast.success(editingField ? 'Field updated successfully' : 'Field created successfully');
      setIsModalOpen(false);
      setEditingField(null);
      resetForm();
      fetchFields();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleField = async (fieldId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${fieldId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to toggle field');

      toast.success('Field toggled successfully');
      fetchFields();
    } catch (error) {
      toast.error('Failed to toggle field');
    }
  };

  const handleDeleteField = async (field: Field) => {
    if (field.isSystem) {
      toast.error('System fields cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${field.label}"?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${field._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error('Failed to delete field');

      toast.success('Field deleted successfully');
      fetchFields();
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

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

    try {
      const token = getToken();
      const fieldOrders = newFields.map((field, idx) => ({
        fieldId: field._id,
        order: idx
      }));

      await fetch('/financial-tracker/api/financial-tracker/fields/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          entityId: selectedEntity,
          fieldOrders
        })
      });
    } catch (error) {
      fetchFields();
    }
  };

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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const filteredFields = fields.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.fieldKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/25">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dynamic Fields
                </h1>
                <p className="text-gray-600 mt-0.5">Configure custom fields for each entity</p>
              </div>
            </div>
            
            {/* Stats Badges */}
            {selectedEntity && (
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                  <span className="text-blue-600 font-medium">{stats.total}</span>
                  <span className="text-gray-500 ml-1">Total</span>
                </div>
                <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-sm">
                  <span className="text-green-600 font-medium">{stats.visible}</span>
                  <span className="text-gray-500 ml-1">Visible</span>
                </div>
                <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-sm">
                  <span className="text-red-600 font-medium">{stats.required}</span>
                  <span className="text-gray-500 ml-1">Required</span>
                </div>
                <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-sm">
                  <span className="text-purple-600 font-medium">{stats.system}</span>
                  <span className="text-gray-500 ml-1">System</span>
                </div>
              </div>
            )}
          </div>

          {/* Module and Entity Selection */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <div className="flex rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <button
                  onClick={() => {
                    setSelectedModule('re');
                    setSelectedEntity('');
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    selectedModule === 're'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  RE Module
                </button>
                <button
                  onClick={() => {
                    setSelectedModule('expense');
                    setSelectedEntity('');
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    selectedModule === 'expense'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  Expense Module
                </button>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setFormData(prev => ({ ...prev, entityId: e.target.value }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="">Select Entity</option>
                {entities.map(entity => (
                  <option key={entity._id} value={entity._id}>
                    {entity.name} ({entity.entityKey})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by label, key, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 bg-white px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 shadow-sm flex-1">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show inactive</span>
                </label>
                
                <button
                  onClick={handleExport}
                  disabled={!selectedEntity}
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 bg-white shadow-sm disabled:opacity-50"
                  title="Export"
                >
                  <Download className="h-5 w-5 text-gray-500" />
                </button>

                <button
                  onClick={fetchFields}
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 bg-white shadow-sm"
                  title="Refresh"
                >
                  <RefreshCw className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          {selectedEntity && (
            <div className="mt-6 border-b border-gray-200">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                    activeTab === 'fields'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Fields ({filteredFields.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                    activeTab === 'preview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {!selectedEntity ? (
          <div className="bg-white rounded-2xl border shadow-xl p-16 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
              <FolderTree className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Select an Entity</h3>
            <p className="text-gray-500 mb-6">Choose a module and entity to manage its custom fields</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setSelectedModule('re')}
                className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors font-medium"
              >
                <DollarSign className="h-4 w-4 inline mr-2" />
                RE Module
              </button>
              <button
                onClick={() => setSelectedModule('expense')}
                className="px-6 py-3 bg-green-50 text-green-700 rounded-xl border border-green-200 hover:bg-green-100 transition-colors font-medium"
              >
                <CreditCard className="h-4 w-4 inline mr-2" />
                Expense Module
              </button>
            </div>
          </div>
        ) : activeTab === 'fields' ? (
          isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Loading fields...</span>
            </div>
          ) : filteredFields.length === 0 ? (
            <div className="bg-white rounded-2xl border shadow-xl p-16 text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Fields Yet</h3>
              <p className="text-gray-500 mb-6">Create your first custom field for {selectedEntityObj?.name}</p>
              <button
                onClick={() => {
                  setEditingField(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Field
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
                      onDuplicate={handleDuplicate}
                      onMove={handleMoveField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )
        ) : (
          // Preview Mode
          <div className="bg-white rounded-2xl border shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg shadow-purple-500/25">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Form Preview: {selectedEntityObj?.name}
                </h3>
                <p className="text-sm text-gray-500">This is how the form will look to users</p>
              </div>
            </div>

            <div className="space-y-5">
              {filteredFields.filter(f => f.visible).map((field) => (
                <div key={field._id} className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.readOnly && (
                      <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Read only
                      </span>
                    )}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all"
                      disabled
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                      disabled
                    />
                  )}
                  
                  {field.type === 'date' && (
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                      disabled
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                      disabled
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50" disabled>
                      <option>Select {field.label}</option>
                    </select>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                      <input type="checkbox" className="h-5 w-5 text-blue-600 border-gray-300 rounded" disabled />
                      <span className="text-sm text-gray-600">Enable {field.label}</span>
                    </div>
                  )}
                  
                  {field.type === 'radio' && field.options && (
                    <div className="space-y-2 p-3 border border-gray-200 rounded-xl bg-gray-50">
                      {field.options.slice(0, 2).map((opt, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <input type="radio" className="h-4 w-4 text-blue-600 border-gray-300" disabled />
                          <span className="text-sm text-gray-600">{opt}</span>
                        </div>
                      ))}
                      {field.options.length > 2 && (
                        <p className="text-xs text-gray-400 mt-1">+{field.options.length - 2} more options</p>
                      )}
                    </div>
                  )}
                  
                  {field.type === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      {field.validation?.allowedFileTypes && (
                        <p className="text-xs text-gray-400 mt-1">
                          Allowed: {field.validation.allowedFileTypes.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {field.type === 'image' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                  )}
                  
                  {field.validation && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {field.validation.min !== undefined && `Min: ${field.validation.min} `}
                      {field.validation.max !== undefined && `Max: ${field.validation.max} `}
                      {field.validation.regex && 'Pattern required '}
                    </p>
                  )}
                </div>
              ))}

              {filteredFields.filter(f => f.visible).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <EyeOff className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No visible fields to preview</p>
                </div>
              )}
            </div>

            {/* Preview Actions */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 font-medium">
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-xl p-2">
                    {editingField ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingField ? `Edit Field: ${editingField.label}` : 'Create New Field'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingField(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Field Key & Label Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fieldKey}
                    onChange={(e) => setFormData({
                      ...formData,
                      fieldKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g., office-rent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Lowercase letters, numbers, hyphens
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Office Rent"
                    required
                  />
                </div>
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Field Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { type: 'text', label: 'Text', icon: Type, color: 'blue' },
                    { type: 'number', label: 'Number', icon: Hash, color: 'green' },
                    { type: 'date', label: 'Date', icon: Calendar, color: 'purple' },
                    { type: 'select', label: 'Select', icon: ListChecks, color: 'yellow' },
                    { type: 'textarea', label: 'Textarea', icon: FileText, color: 'orange' },
                    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'teal' },
                    { type: 'radio', label: 'Radio', icon: CircleDot, color: 'cyan' },
                    { type: 'file', label: 'File', icon: Upload, color: 'indigo' },
                    { type: 'image', label: 'Image', icon: ImageIcon, color: 'pink' }
                  ].map(({ type, label, icon: Icon, color }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type as any })}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                        formData.type === type
                          ? `border-${color}-500 bg-${color}-50`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-1 ${
                        formData.type === type ? `text-${color}-600` : 'text-gray-500'
                      }`} />
                      <span className={`text-xs font-medium ${
                        formData.type === type ? `text-${color}-700` : 'text-gray-600'
                      }`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options for Select/Radio */}
              {(formData.type === 'select' || formData.type === 'radio') && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Options <span className="text-red-500">*</span>
                  </label>
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex mb-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional default value"
                />
              </div>

              {/* Validation */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  Validation Rules
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(formData.type === 'number' || formData.type === 'text') && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Min {formData.type === 'number' ? 'Value' : 'Length'}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Max {formData.type === 'number' ? 'Value' : 'Length'}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'text' && (
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        Regex Pattern
                      </label>
                      <input
                        type="text"
                        value={formData.validation.regex}
                        onChange={(e) => setFormData({
                          ...formData,
                          validation: { ...formData.validation, regex: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                        placeholder="^[A-Z0-9]+$"
                      />
                    </div>
                  )}

                  {(formData.type === 'file' || formData.type === 'image') && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Allowed File Types
                        </label>
                        <input
                          type="text"
                          value={formData.validation.allowedFileTypes?.join(', ') || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            validation: {
                              ...formData.validation,
                              allowedFileTypes: e.target.value.split(',').map(t => t.trim())
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="jpg, png, pdf"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'required', label: 'Required', description: 'Field must be filled', color: 'blue' },
                  { key: 'readOnly', label: 'Read Only', description: 'Cannot be edited', color: 'gray' },
                  { key: 'visible', label: 'Visible', description: 'Shown in forms', color: 'green' },
                  { key: 'isEnabled', label: 'Enabled', description: 'Field is active', color: 'green' }
                ].map(({ key, label, description, color }) => (
                  <label
                    key={key}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData[key as keyof typeof formData]
                        ? `border-${color}-500 bg-${color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData[key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData[key as keyof typeof formData]
                        ? `border-${color}-500 bg-${color}-500`
                        : 'border-gray-300'
                    }`}>
                      {formData[key as keyof typeof formData] && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingField(null);
                  }}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/25 flex items-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingField ? 'Update Field' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}