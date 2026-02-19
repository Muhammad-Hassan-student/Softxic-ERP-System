// src/app/financial-tracker/components/user/CreateRecordModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import  DynamicForm  from './DynamicForm';  // ✅ Fixed: import DynamicForm (not DynamicEntryForm)
import  {CategorySelector}  from '../shared/CategorySelector';
import { useFields } from '../../hooks/useField';
import { useRecords } from '../../hooks/useRecord';

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: 're' | 'expense';
  entity: string;
  onSuccess?: () => void;
}

export const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  isOpen,
  onClose,
  module,
  entity,
  onSuccess
}) => {
  const { fields, isLoading } = useFields(module, entity);
  const { createRecord } = useRecords(module, entity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // Add category to data
      const finalData = {
        ...data,
        categoryId: selectedCategory,
        categoryName: selectedCategoryName
      };
      
      await createRecord(finalData);
      toast.success('Record created successfully');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const entityName = entity.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Add New {entityName} Record
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* ✅ CATEGORY SELECTOR */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Category <span className="text-red-500">*</span>
            </label>
            <CategorySelector
              module={module}
              entity={entity}
              value={selectedCategory}
              onChange={(id: string, name: string) => {
                setSelectedCategory(id);
                setSelectedCategoryName(name);
              }}
              type={module === 're' ? 'income' : 'expense'}
              required={true}
              placeholder="Choose a category..."
            />
            {!selectedCategory && (
              <p className="text-xs text-red-500 mt-1">Category is required</p>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading form fields...</p>
            </div>
          ) : (
            <DynamicForm
              fields={fields}
              module={module}
              entity={entity}
              onSubmit={handleSubmit}
              initialData={{}}
            />
          )}

          {/* Manual Save Button (if needed) */}
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="dynamic-form"
              disabled={isSubmitting || !selectedCategory}
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
        </div>
      </div>
    </div>
  );
};