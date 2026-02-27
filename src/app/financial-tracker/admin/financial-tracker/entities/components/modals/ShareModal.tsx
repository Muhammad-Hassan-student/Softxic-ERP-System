// src/app/admin/financial-tracker/entities/components/modals/ShareModal.tsx
'use client';

import React from 'react';
import { X, Copy, Mail, MessageSquare, Send, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  shareUrl: string;
}

export default function ShareModal({ isOpen, onClose, entity, shareUrl }: ShareModalProps) {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
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
          <h2 className="text-xl font-semibold">Share Entity</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Share Link</label>
            <div className="flex mt-1">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-l-lg dark:bg-gray-700"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Share via</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <button className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                <Mail className="h-5 w-5 mx-auto" />
              </button>
              <button className="p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                <MessageSquare className="h-5 w-5 mx-auto" />
              </button>
              <button className="p-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                <Send className="h-5 w-5 mx-auto" />
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                <Printer className="h-5 w-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}