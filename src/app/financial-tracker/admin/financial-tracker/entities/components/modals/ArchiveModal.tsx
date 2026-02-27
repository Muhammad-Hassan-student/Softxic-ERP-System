// src/app/admin/financial-tracker/entities/components/modals/ArchiveModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Archive, AlertCircle, Calendar, Clock, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  onConfirm: () => Promise<void>;
}

export default function ArchiveModal({ isOpen, onClose, entity, onConfirm }: ArchiveModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [permanent, setPermanent] = useState(false);

  if (!isOpen) return null;

  const handleArchive = async () => {
    setLoading(true);
    try {
      await onConfirm();
      toast.success('Entity archived successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to archive entity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Archive className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Archive Entity</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Entity Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Tag className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{entity.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {entity._id.slice(-8)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Created: {format(new Date(entity.createdAt), 'PP')}
              </div>
              <div className="flex items-center text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Updated: {format(new Date(entity.updatedAt), 'PP')}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start space-x-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Archiving this entity will:</p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                <li>Move it to archive storage</li>
                <li>Hide it from main views</li>
                <li>Preserve all associated data</li>
                <li>Allow restoration at any time</li>
              </ul>
            </div>
          </div>

          {/* Archive Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Archive Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you archiving this entity?"
              className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>

          {/* Permanent Option */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permanent}
              onChange={(e) => setPermanent(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Permanently delete instead (cannot be undone)
            </span>
          </label>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleArchive}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Archiving...
                </>
              ) : permanent ? (
                'Permanently Delete'
              ) : (
                'Archive Entity'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}