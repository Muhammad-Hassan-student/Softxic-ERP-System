// src/app/admin/financial-tracker/entities/components/CreateEntityModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle, Check, DollarSign, CreditCard } from 'lucide-react';
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
    
    if (!/^[a-z0-9-]+$/.test(formData.entityKey)) {
      toast.error('Entity key can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch('/financial-tracker/api/financial-tracker/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Save className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Create New Entity</h2>
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
            {/* Module Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Module <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, module: 're' })}
                  className={`
                    relative overflow-hidden group p-4 rounded-xl border-2 transition-all
                    ${formData.module === 're'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <DollarSign className={`h-6 w-6 mb-1 ${
                      formData.module === 're' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.module === 're' ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      RE Module
                    </span>
                  </div>
                  {formData.module === 're' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, module: 'expense' })}
                  className={`
                    relative overflow-hidden group p-4 rounded-xl border-2 transition-all
                    ${formData.module === 'expense'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <CreditCard className={`h-6 w-6 mb-1 ${
                      formData.module === 'expense' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.module === 'expense' ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      Expense Module
                    </span>
                  </div>
                  {formData.module === 'expense' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Entity Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.entityKey}
                onChange={(e) => setFormData({
                  ...formData,
                  entityKey: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="e.g., dealer, client, project"
                required
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Only lowercase letters, numbers, and hyphens
              </p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Optional description of this entity"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all font-medium shadow-lg shadow-blue-500/25 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Entity
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