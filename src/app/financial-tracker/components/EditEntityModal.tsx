// src/app/admin/financial-tracker/entities/components/EditEntityModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Check, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Entity {
  _id: string;
  module: 're' | 'expense';
  entityKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  enableApproval: boolean;
  branchId?: string;
}

interface EditEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity;
  onSuccess: () => void;
}

export default function EditEntityModal({
  isOpen,
  onClose,
  entity,
  onSuccess
}: EditEntityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isEnabled: true,
    enableApproval: false,
    branchId: ''
  });

  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name,
        description: entity.description || '',
        isEnabled: entity.isEnabled,
        enableApproval: entity.enableApproval,
        branchId: entity.branchId || ''
      });
    }
  }, [entity]);

  if (!isOpen) return null;

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getToken();
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities/${entity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update entity');
      }

      toast.success('Entity updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Edit Entity</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Entity Key (Read Only) */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Entity Key
              </label>
              <div className="flex items-center">
                <code className="text-sm font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 flex-1">
                  {entity.entityKey}
                </code>
                <span className="ml-2 text-xs text-gray-400">(read only)</span>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Branch ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch ID
              </label>
              <input
                type="text"
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                placeholder="Optional branch identifier"
              />
            </div>

            {/* Settings Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className={`
                relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                ${formData.isEnabled 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}>
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Active</p>
                  <p className="text-xs text-gray-500">Entity is enabled</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.isEnabled 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300'
                }`}>
                  {formData.isEnabled && <Check className="h-4 w-4 text-white" />}
                </div>
              </label>

              <label className={`
                relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                ${formData.enableApproval 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}>
                <input
                  type="checkbox"
                  checked={formData.enableApproval}
                  onChange={(e) => setFormData({ ...formData, enableApproval: e.target.checked })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Approval</p>
                  <p className="text-xs text-gray-500">Enable workflow</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.enableApproval 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-gray-300'
                }`}>
                  {formData.enableApproval && <Check className="h-4 w-4 text-white" />}
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 transition-all font-medium shadow-lg shadow-amber-500/25 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}