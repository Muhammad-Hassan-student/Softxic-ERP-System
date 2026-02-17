'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export interface Field {
  _id: string;
  module: string;
  entityId: string;
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

interface UseFieldsReturn {
  fields: Field[];
  visibleFields: Field[];
  isLoading: boolean;
  error: string | null;
  refreshFields: () => Promise<void>;
  getFieldByKey: (key: string) => Field | undefined;
  validateData: (data: Record<string, any>) => { valid: boolean; errors: Record<string, string> };
}

/**
 * Hook for managing dynamic fields
 * @param module - 're' | 'expense'
 * @param entityId - Entity ID
 */
export function useFields(
  module: string,
  entityId: string
): UseFieldsReturn {
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch fields
  const fetchFields = useCallback(async () => {
    if (!user?.id || !entityId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/financial-tracker/fields?module=${module}&entityId=${entityId}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch fields');
      }

      const data = await response.json();
      setFields(data.fields);
      
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, module, entityId]);

  // Load fields on mount
  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  // Get visible fields (enabled and visible)
  const visibleFields = fields
    .filter(f => f.isEnabled && f.visible)
    .sort((a, b) => a.order - b.order);

  // Get field by key
  const getFieldByKey = useCallback((key: string) => {
    return fields.find(f => f.fieldKey === key);
  }, [fields]);

  // Validate data against field definitions
  const validateData = useCallback((data: Record<string, any>) => {
    const errors: Record<string, string> = {};
    let valid = true;

    for (const field of fields) {
      if (!field.isEnabled) continue;

      const value = data[field.fieldKey];

      // Check required
      if (field.required && (value === undefined || value === null || value === '')) {
        errors[field.fieldKey] = `${field.label} is required`;
        valid = false;
        continue;
      }

      // Skip further validation if value is empty and not required
      if (!field.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type-specific validation
      switch (field.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors[field.fieldKey] = `${field.label} must be a number`;
            valid = false;
          } else {
            const num = Number(value);
            if (field.validation?.min !== undefined && num < field.validation.min) {
              errors[field.fieldKey] = `${field.label} must be at least ${field.validation.min}`;
              valid = false;
            }
            if (field.validation?.max !== undefined && num > field.validation.max) {
              errors[field.fieldKey] = `${field.label} must be at most ${field.validation.max}`;
              valid = false;
            }
          }
          break;

        case 'date':
          if (isNaN(Date.parse(value))) {
            errors[field.fieldKey] = `${field.label} must be a valid date`;
            valid = false;
          }
          break;

        case 'select':
        case 'radio':
          if (value && field.options && !field.options.includes(value)) {
            errors[field.fieldKey] = `${field.label} must be one of: ${field.options.join(', ')}`;
            valid = false;
          }
          break;

        case 'text':
          if (field.validation?.regex) {
            const regex = new RegExp(field.validation.regex);
            if (!regex.test(value)) {
              errors[field.fieldKey] = `${field.label} has invalid format`;
              valid = false;
            }
          }
          if (field.validation?.min && value.length < field.validation.min) {
            errors[field.fieldKey] = `${field.label} must be at least ${field.validation.min} characters`;
            valid = false;
          }
          if (field.validation?.max && value.length > field.validation.max) {
            errors[field.fieldKey] = `${field.label} must be at most ${field.validation.max} characters`;
            valid = false;
          }
          break;
      }
    }

    return { valid, errors };
  }, [fields]);

  return {
    fields,
    visibleFields,
    isLoading,
    error,
    refreshFields: fetchFields,
    getFieldByKey,
    validateData
  };
}