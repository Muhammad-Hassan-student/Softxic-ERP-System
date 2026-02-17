'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Save, X } from 'lucide-react';

interface Field {
  _id: string;
  fieldKey: string;
  label: string;
  type: string;
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

interface DynamicEntryFormProps {
  module: string;
  entity: string;
  fields: Field[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
}

export const DynamicEntryForm: React.FC<DynamicEntryFormProps> = ({
  module,
  entity,
  fields,
  initialData = {},
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});

  // Build validation schema
  const buildSchema = () => {
    const shape: Record<string, any> = {};
    
    fields.forEach(field => {
      if (!field.visible) return;

      let schema: any;
      
      switch (field.type) {
        case 'text':
        case 'textarea':
          schema = z.string();
          if (field.required) schema = schema.min(1, 'Required');
          if (field.validation?.min) schema = schema.min(field.validation.min);
          if (field.validation?.max) schema = schema.max(field.validation.max);
          if (field.validation?.regex) {
            schema = schema.regex(new RegExp(field.validation.regex));
          }
          break;

        case 'number':
          schema = z.number();
          if (field.required) schema = schema.min(1, 'Required');
          if (field.validation?.min !== undefined) {
            schema = schema.min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            schema = schema.max(field.validation.max);
          }
          break;

        case 'date':
          schema = z.date();
          if (field.required) schema = schema.min(new Date('1900-01-01'));
          break;

        case 'checkbox':
          schema = z.boolean();
          break;

        case 'select':
        case 'radio':
          schema = z.string();
          if (field.required) schema = schema.min(1, 'Required');
          if (field.options?.length) {
            schema = schema.refine((val: string) => field.options?.includes(val), {
              message: 'Invalid option'
            });
          }
          break;

        case 'file':
        case 'image':
          schema = z.any();
          if (field.required) {
            schema = schema.refine((val: any) => val !== null, { message: 'Required' });
          }
          break;

        default:
          schema = z.any();
      }

      if (!field.required) {
        schema = schema.optional();
      }

      shape[field.fieldKey] = schema;
    });

    return z.object(shape);
  };

  const schema = buildSchema();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const handleFileUpload = async (fieldKey: string, file: File) => {
    // Validate file type
    const field = fields.find(f => f.fieldKey === fieldKey);
    if (field?.validation?.allowedFileTypes) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!field.validation.allowedFileTypes.includes(ext || '')) {
        toast.error(`Invalid file type. Allowed: ${field.validation.allowedFileTypes.join(', ')}`);
        return;
      }
    }

    // Validate file size
    if (field?.validation?.maxFileSize && file.size > field.validation.maxFileSize) {
      toast.error(`File too large. Max size: ${field.validation.maxFileSize / 1024 / 1024}MB`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setValue(fieldKey, reader.result);
    };
    reader.readAsDataURL(file);
    
    setFiles(prev => ({ ...prev, [fieldKey]: file }));
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success('Record saved successfully');
      reset();
    } catch (error) {
      toast.error('Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort fields by order
  const sortedFields = [...fields]
    .filter(f => f.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {sortedFields.map((field) => (
        <div key={field._id} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {/* Render different input types */}
          {field.type === 'text' && (
            <input
              type="text"
              {...register(field.fieldKey)}
              readOnly={field.readOnly}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}

          {field.type === 'number' && (
            <input
              type="number"
              {...register(field.fieldKey, { valueAsNumber: true })}
              readOnly={field.readOnly}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}

          {field.type === 'date' && (
            <input
              type="date"
              {...register(field.fieldKey)}
              readOnly={field.readOnly}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              {...register(field.fieldKey)}
              readOnly={field.readOnly}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}

          {field.type === 'select' && (
            <select
              {...register(field.fieldKey)}
              disabled={field.readOnly}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {field.type === 'checkbox' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register(field.fieldKey)}
                disabled={field.readOnly}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-600">Yes</span>
            </div>
          )}

          {field.type === 'radio' && (
            <div className="space-y-2">
              {field.options?.map(opt => (
                <label key={opt} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={opt}
                    {...register(field.fieldKey)}
                    disabled={field.readOnly}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {(field.type === 'file' || field.type === 'image') && (
            <div>
              <input
                type="file"
                accept={field.validation?.allowedFileTypes?.map(t => `.${t}`).join(',')}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(field.fieldKey, file);
                }}
                disabled={field.readOnly}
                className="w-full px-3 py-2 border rounded-lg"
              />
              {watch(field.fieldKey) && (
                <div className="mt-2">
                  {field.type === 'image' ? (
                    <img 
                      src={watch(field.fieldKey) as string} 
                      alt="Preview" 
                      className="max-h-32 rounded"
                    />
                  ) : (
                    <a 
                      href={watch(field.fieldKey) as string} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View File
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errors[field.fieldKey] && (
            <p className="text-sm text-red-600">
              {errors[field.fieldKey]?.message as string}
            </p>
          )}

          {/* Validation Hint */}
          {field.validation && (
            <p className="text-xs text-gray-500">
              {field.validation.min !== undefined && `Min: ${field.validation.min} `}
              {field.validation.max !== undefined && `Max: ${field.validation.max} `}
              {field.validation.regex && 'Pattern required '}
              {field.validation.allowedFileTypes && 
                `Allowed: ${field.validation.allowedFileTypes.join(', ')}`}
            </p>
          )}
        </div>
      ))}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 inline mr-2" />
              Save Record
            </>
          )}
        </button>
      </div>
    </form>
  );
};