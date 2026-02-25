// src/app/financial-tracker/hooks/useAdminFields.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Field } from '../types';

interface FieldsResponse {
  fields: Field[];
  total: number;
}

export const useAdminFields = (module: 're' | 'expense', entity: string) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  // ✅ FETCH FIELDS
  const fetchFields = useCallback(async (): Promise<Field[]> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ module, entityId: entity });
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields?${params}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to fetch fields');

      const data: FieldsResponse = await response.json();
      setFields(data.fields);
      return data.fields;
    } catch (error) {
      toast.error('Failed to load fields');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [module, entity]);

  // ✅ CREATE FIELD
  const createField = useCallback(async (fieldData: Partial<Field>): Promise<Field> => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/fields', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          ...fieldData,
          module,
          entityId: entity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create field');
      }

      const data = await response.json();
      await fetchFields();
      toast.success('Field created successfully');
      return data.field;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [module, entity, fetchFields]);

  // ✅ UPDATE FIELD
  const updateField = useCallback(async (fieldId: string, fieldData: Partial<Field>): Promise<Field> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${fieldId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(fieldData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update field');
      }

      const data = await response.json();
      await fetchFields();
      toast.success('Field updated successfully');
      return data.field;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [fetchFields]);

  // ✅ DELETE FIELD
  const deleteField = useCallback(async (fieldId: string): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${fieldId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete field');
      }

      await fetchFields();
      toast.success('Field deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }, [fetchFields]);

  // ✅ TOGGLE FIELD
  const toggleField = useCallback(async (fieldId: string): Promise<void> => {
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/fields/${fieldId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle field');
      }

      await fetchFields();
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [fetchFields]);

  // ✅ REORDER FIELDS
  const reorderFields = useCallback(async (fieldOrders: Array<{ fieldId: string; order: number }>): Promise<void> => {
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/fields/reorder', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          entityId: entity,
          fieldOrders,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reorder fields');
      }

      await fetchFields();
      toast.success('Fields reordered');
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [entity, fetchFields]);

  // ✅ REFRESH
  const refreshFields = useCallback(async (): Promise<void> => {
    await fetchFields();
  }, [fetchFields]);

  return {
    fields,
    isLoading,
    fetchFields,
    createField,
    updateField,
    deleteField,
    toggleField,
    reorderFields,
    refreshFields,
  };
};