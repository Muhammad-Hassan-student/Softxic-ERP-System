// src/app/admin/financial-tracker/entities/components/CreateEntityModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEntityModal({
  isOpen,
  onClose,
  onSuccess
}: CreateEntityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    module: 're' as 're' | 'expense',
    entityKey: '',
    name: '',
    description: '',
    isEnabled: true,
    enableApproval: false,
    branchId: ''
  });

  if (!isOpen) return null;

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entityKey format
    if (!/^[a-z0-9-]+$/.test(formData.entityKey)) {
      toast.error('Entity key can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch('/api/financial-tracker/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create entity');
      }

      toast.success('Entity created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      module: 're',
      entityKey: '',
      name: '',
      description: '',
      isEnabled: true,
      enableApproval: false,
      branchId: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create New Entity</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Module Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, module: 're' })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.module === 're'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium">RE Module</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, module: 'expense' })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.module === 'expense'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium">Expense Module</span>
              </button>
            </div>
          </div>

          {/* Entity Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Key *
            </label>
            <input
              type="text"
              value={formData.entityKey}
              onChange={(e) => setFormData({
                ...formData,
                entityKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
              })}
              className="w-full px-3 py-2 border rounded-lg font-mono"
              placeholder="e.g., dealer, client, project"
              required
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Dealers, Projects"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Optional description of this entity"
            />
          </div>

          {/* Branch ID (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch ID
            </label>
            <input
              type="text"
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Optional branch identifier"
            />
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable entity</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enableApproval}
                onChange={(e) => setFormData({ ...formData, enableApproval: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable approval workflow</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Entity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}