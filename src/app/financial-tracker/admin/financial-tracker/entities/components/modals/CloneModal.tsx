// src/app/admin/financial-tracker/entities/components/modals/CloneModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface CloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  onSuccess: (clonedEntity: any) => void;
}

export default function CloneModal({ isOpen, onClose, entity, onSuccess }: CloneModalProps) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entity) {
      setName(`${entity.name} (Copy)`);
      setKey(`${entity.entityKey}-copy`);
      setError(null);
    }
  }, [entity]);

  if (!isOpen) return null;

  const validateKey = (value: string) => {
    const isValid = /^[a-z0-9-]+$/.test(value);
    if (!isValid && value.length > 0) {
      setError('Only lowercase letters, numbers, and hyphens allowed');
    } else {
      setError(null);
    }
    return isValid;
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setKey(value);
    validateKey(value);
  };

  const handleClone = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!key.trim()) {
      toast.error('Entity key is required');
      return;
    }

    if (!validateKey(key)) {
      toast.error('Invalid entity key format');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const clonedEntity = {
        ...entity,
        _id: `new-${Date.now()}`,
        name,
        entityKey: key,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      toast.success('Entity cloned successfully');
      setLoading(false);
      onSuccess(clonedEntity);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Clone Entity</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Original Entity Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Original</p>
            <p className="font-medium">{entity?.name}</p>
            <code className="text-xs bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
              {entity?.entityKey}
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder="Enter entity name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Entity Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={key}
              onChange={handleKeyChange}
              className={`w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 ${
                error ? 'border-red-500' : ''
              }`}
              placeholder="e.g., entity-name"
            />
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens
            </p>
          </div>

          <div className="flex items-start space-x-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>This will create a copy with all properties except ID and timestamps</p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClone}
              disabled={loading || !name.trim() || !key.trim() || !!error}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Cloning...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}