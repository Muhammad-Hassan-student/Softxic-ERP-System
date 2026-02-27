// src/app/admin/financial-tracker/entities/components/modals/BulkEditModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityIds: string[];
  entities: any[];
  onSuccess: () => void;
}

export default function BulkEditModal({ isOpen, onClose, entityIds, entities, onSuccess }: BulkEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bulk Edit ({entityIds.length} entities)</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Add your bulk edit form here */}
        <div className="text-center py-8 text-gray-500">
          Bulk edit functionality coming soon
        </div>
      </motion.div>
    </div>
  );
}