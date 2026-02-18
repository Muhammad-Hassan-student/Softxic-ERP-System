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
  Upload
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
}

// Sortable Field Item
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
    opacity: isDragging ? 0.5 : 1
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
          <button
            onClick={() => onMove(field._id, 'up')}
            disabled={index === 0}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(field._id, 'down')}
            disabled={index === totalItems - 1}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggle(field._id)}
            className={`p-1 rounded ${field.isEnabled ? 'text-green-600' : 'text-gray-400'}`}
          >
            {field.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onEdit(field)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          {!field.isSystem && (
            <button
              onClick={() => onDelete(field)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Fields Page
export default function FieldsPage() {
  const searchParams = useSearchParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<'re' | 'expense'>(
    (searchParams.get('module') as any) || 're'
  );
  const [selectedEntity, setSelectedEntity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
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
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Fetch entities
  useEffect(() => {
    fetchEntities();
  }, [selectedModule]);

  // Fetch fields
  useEffect(() => {
    if (selectedEntity) {
      fetchFields();
    }
  }, [selectedEntity]);

  const fetchEntities = async () => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities?module=${selectedModule}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
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
      toast.error('Failed to load entities');
    }
  };

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/fields?module=${selectedModule}&entityId=${selectedEntity}`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setFields(data.fields.sort((a: Field, b: Field) => a.order - b.order));
      }
    } catch (error) {
      toast.error('Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = () => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(f => f._id === active.id);
      const newIndex = fields.findIndex(f => f._id === over?.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);

      try {
        await fetch('/financial-tracker/api/financial-tracker/fields/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            entityId: selectedEntity,
            fieldOrders: newFields.map((f, i) => ({ fieldId: f._id, order: i }))
          })
        });
      } catch (error) {
        toast.error('Failed to save order');
        fetchFields();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingField 
        ? `/financial-tracker/api/financial-tracker/fields/${editingField._id}`
        : '/financial-tracker/api/financial-tracker/fields';
      
      const method = editingField ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save field');

      toast.success(editingField ? 'Field updated' : 'Field created');
      setIsModalOpen(false);
      setEditingField(null);
      resetForm();
      fetchFields();
    } catch (error) {
      toast.error('Failed to save field');
    }
  };

  const handleToggle = async (fieldId: string) => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${fieldId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        toast.success('Field toggled');
        fetchFields();
      }
    } catch (error) {
      toast.error('Failed to toggle field');
    }
  };

  const handleDelete = async (field: Field) => {
    if (field.isSystem) {
      toast.error('System fields cannot be deleted');
      return;
    }
    if (!confirm('Delete this field?')) return;

    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${field._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        toast.success('Field deleted');
        fetchFields();
      }
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  const handleMove = async (fieldId: string, direction: 'up' | 'down') => {
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
      await fetch('/financial-tracker/api/financial-tracker/fields/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          entityId: selectedEntity,
          fieldOrders: newFields.map((f, i) => ({ fieldId: f._id, order: i }))
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
      options: field.options || [''],
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

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dynamic Fields</h1>
          <p className="text-gray-600">Create and manage custom fields for entities</p>
        </div>
        <button
          onClick={() => {
            setEditingField(null);
            resetForm();
            setIsModalOpen(true);
          }}
          disabled={!selectedEntity}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </button>
      </div>

      {/* Module/Entity Selection */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedModule('re')}
                className={`flex-1 px-4 py-2 text-sm ${
                  selectedModule === 're' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                }`}
              >
                RE Module
              </button>
              <button
                onClick={() => setSelectedModule('expense')}
                className={`flex-1 px-4 py-2 text-sm ${
                  selectedModule === 'expense' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
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
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Entity</option>
              {entities.map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fields List */}
      {!selectedEntity ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Select an Entity</h3>
          <p className="text-gray-500">Choose a module and entity to manage fields</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : fields.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Fields Yet</h3>
          <p className="text-gray-500 mb-4">Create your first custom field</p>
          <button
            onClick={() => {
              setEditingField(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Field
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map(f => f._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableFieldItem
                  key={field._id}
                  field={field}
                  index={index}
                  totalItems={fields.length}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onMove={handleMove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingField ? 'Edit Field' : 'Create Field'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field Key */}
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
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  placeholder="e.g., office-rent"
                  required
                  pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, hyphens</p>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Office Rent"
                  required
                />
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'text', label: 'Text', icon: Type },
                    { type: 'number', label: 'Number', icon: Hash },
                    { type: 'date', label: 'Date', icon: Calendar },
                    { type: 'select', label: 'Select', icon: ListChecks },
                    { type: 'textarea', label: 'Textarea', icon: FileText },
                    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
                    { type: 'radio', label: 'Radio', icon: CircleDot },
                    { type: 'file', label: 'File', icon: Upload },
                    { type: 'image', label: 'Image', icon: ImageIcon }
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type as any })}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        formData.type === type ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
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
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex mb-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[i] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        placeholder={`Option ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Option
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
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Validation */}
              <div className="grid grid-cols-2 gap-4">
                {(formData.type === 'number' || formData.type === 'text') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 border rounded-lg"
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
                      value={formData.validation.regex}
                      onChange={(e) => setFormData({
                        ...formData,
                        validation: { ...formData.validation, regex: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                      placeholder="^[A-Z0-9]+$"
                    />
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
                        className="w-full px-3 py-2 border rounded-lg"
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
                            allowedFileTypes: e.target.value.split(',').map(t => t.trim())
                          }
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="jpg, png, pdf"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Required</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.readOnly}
                    onChange={(e) => setFormData({ ...formData, readOnly: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Read Only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Visible</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Enabled</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingField(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  {editingField ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}