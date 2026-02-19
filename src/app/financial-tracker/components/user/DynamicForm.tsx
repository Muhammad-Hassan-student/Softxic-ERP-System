// src/app/financial-tracker/components/user/DynamicForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FieldRenderer from './DynamicForm/FieldRenderer'; // ✅ Fixed path - remove DynamicForm/
import { usePermissions } from '../../hooks/usePermission';

// ✅ Define a simplified interface for frontend use
export interface FormField {
  _id: string;
  fieldKey: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'image' | 'checkbox' | 'radio';
  isSystem?: boolean;
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

export interface DynamicFormProps {
  fields: FormField[];
  initialData?: Record<string, any>;
  module: string;
  entity: string;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;  // ✅ Added onCancel to props
  readOnly?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  initialData = {},
  module,
  entity,
  onSubmit,
  onCancel,  // ✅ Added onCancel parameter
  readOnly = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canEditColumn } = usePermissions(module, entity);

  // Build validation schema dynamically
  const buildValidationSchema = () => {
    const schemaShape: Record<string, any> = {};
    
    fields.forEach(field => {
      if (!field.isEnabled || !field.visible) return;

      let fieldSchema: any;
      
      switch (field.type) {
        case 'text':
        case 'textarea':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, 'Required');
          if (field.validation?.min) fieldSchema = fieldSchema.min(field.validation.min);
          if (field.validation?.max) fieldSchema = fieldSchema.max(field.validation.max);
          if (field.validation?.regex) {
            fieldSchema = fieldSchema.regex(new RegExp(field.validation.regex));
          }
          break;

        case 'number':
          fieldSchema = z.number();
          if (field.required) fieldSchema = fieldSchema.min(1, 'Required');
          if (field.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(field.validation.max);
          }
          break;

        case 'date':
          fieldSchema = z.date();
          if (field.required) fieldSchema = fieldSchema.min(new Date('1900-01-01'));
          break;

        case 'checkbox':
          fieldSchema = z.boolean();
          break;

        case 'select':
        case 'radio':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, 'Required');
          if (field.options?.length) {
            fieldSchema = fieldSchema.refine(
              (val: string) => field.options?.includes(val),
              { message: 'Invalid option' }
            );
          }
          break;

        case 'file':
        case 'image':
          fieldSchema = z.any();
          if (field.required) {
            fieldSchema = fieldSchema.refine(
              (val: any) => val !== null && val !== undefined,
              { message: 'Required' }
            );
          }
          break;

        default:
          fieldSchema = z.any();
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaShape[field.fieldKey] = fieldSchema;
    });

    return z.object(schemaShape);
  };

  const schema = buildValidationSchema();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
  });

  const formValues = watch();

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort visible fields
  const visibleFields = [...fields]
    .filter(f => f.isEnabled && f.visible)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <form id="dynamic-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {visibleFields.map((field) => {
        const canEdit = !readOnly && canEditColumn(field.fieldKey);
        
        return (
          <Controller
            key={field._id || field.fieldKey}
            name={field.fieldKey}
            control={control}
            render={({ field: formField }) => (
              <FieldRenderer
                field={field as any}
                value={formValues[field.fieldKey]}
                onChange={formField.onChange}
                error={errors[field.fieldKey]?.message as string}
                disabled={!canEdit}
              />
            )}
          />
        );
      })}
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;