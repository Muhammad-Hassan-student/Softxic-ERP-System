// src/app/financial-tracker/components/user/EditRecordModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DynamicForm from './DynamicForm';  // ✅ Import as default export
import { useFields } from '../../hooks/useField';
import { useRecords } from '../../hooks/useRecord';
import { usePermissions } from '../../hooks/usePermission';

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: 're' | 'expense';
  entity: string;
  record: any;
  onSuccess?: () => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  onClose,
  module,
  entity,
  record,
  onSuccess
}) => {
  const { fields, isLoading, error: fieldsError } = useFields(module, entity);
  const { updateRecord } = useRecords(module, entity);
  const { canEditRecord } = usePermissions(module, entity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (record) {
      setInitialData(record.data || {});
    }
  }, [record]);

  useEffect(() => {
    // Check edit permission
    if (isOpen && record && !canEditRecord(record.createdBy)) {
      toast.error('You do not have permission to edit this record');
      onClose();
    }
  }, [isOpen, record, canEditRecord, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await updateRecord(record._id, data, record.version);
      toast.success('Record updated successfully');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('version') || error.message?.toLowerCase().includes('conflict')) {
        toast.error(
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            <span>This record was modified by another user. Please refresh and try again.</span>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(error.message || 'Failed to update record');
      }
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
            Edit {entityName} Record
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading form fields...</p>
            </div>
          ) : fieldsError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Form</h3>
              <p className="text-gray-600">{fieldsError}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Version Warning */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <span className="text-sm text-blue-700">
                  Editing version {record.version || 1}. Changes will create a new version.
                </span>
              </div>

              <DynamicForm
                module={module}
                entity={entity}
                fields={fields}
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={onClose}  // ✅ Now works because onCancel is in props
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};