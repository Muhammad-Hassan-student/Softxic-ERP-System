'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FieldRenderer from './FieldRenderer';
import { ICustomField } from '../../../models/custom-field.model';
import { usePermissions } from '../../../hooks/usePermission';

interface DynamicFormProps {
  fields: ICustomField[];
  initialData?: Record<string, any>;
  module: string;
  entity: string;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  readOnly?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  initialData = {},
  module,
  entity,
  onSubmit,
  readOnly = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canEditColumn } = usePermissions(module, entity);

  // Build validation schema dynamically
  const buildValidationSchema = () => {
    const schemaShape: Record<string, any> = {};
    
    fields.forEach(field => {
      if (!field.isEnabled) return;

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
              (val:any) => field.options?.includes(val),
              { message: 'Invalid option' }
            );
          }
          break;

        case 'file':
        case 'image':
          fieldSchema = z.any();
          if (field.required) {
            fieldSchema = fieldSchema.refine(
              (val:any) => val !== null && val !== undefined,
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

  // Filter visible fields
  const visibleFields = fields
    .filter(f => f.isEnabled && f.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {visibleFields.map((field) => {
        const canEdit = !readOnly && canEditColumn(field.fieldKey);
        
        return (
          <Controller
            key={field.fieldKey}
            name={field.fieldKey}
            control={control}
            render={({ field: formField }) => (
              <FieldRenderer
                field={field}
                value={formValues[field.fieldKey]}
                onChange={formField.onChange}
                error={errors[field.fieldKey]?.message as string}
                disabled={!canEdit}
              />
            )}
          />
        );
      })}

      {!readOnly && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      )}
    </form>
  );
};

export default DynamicForm;