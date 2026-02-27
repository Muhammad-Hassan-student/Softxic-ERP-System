// src/app/admin/financial-tracker/entities/components/modals/ExportModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Download, FileJson, FileSpreadsheet, FileText, FileCode, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<void> | void;
  selectedCount: number;
  totalCount: number;
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  selectedCount, 
  totalCount 
}: ExportModalProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const formats: { id: ExportFormat; label: string; icon: React.ElementType; color: string; description: string }[] = [
    { id: 'json', label: 'JSON', icon: FileJson, color: 'yellow', description: 'JavaScript Object Notation' },
    { id: 'csv', label: 'CSV', icon: FileText, color: 'green', description: 'Comma-separated values' },
    { id: 'pdf', label: 'PDF', icon: FileCode, color: 'red', description: 'Portable Document Format' },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'blue', description: 'Microsoft Excel' },
    { id: 'xml', label: 'XML', icon: FileCode, color: 'purple', description: 'Extensible Markup Language' },
    { id: 'html', label: 'HTML', icon: FileCode, color: 'orange', description: 'HyperText Markup Language' },
  ];

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onExport(format);
      setProgress(100);
      setTimeout(() => {
        toast.success(`Exported as ${format.toUpperCase()}`);
        setExporting(null);
        onClose();
      }, 500);
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
      setExporting(null);
    } finally {
      clearInterval(interval);
    }
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
          <h2 className="text-xl font-semibold">Export Data</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Exporting {selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} total`} entities
        </p>

        <div className="space-y-2">
          {formats.map(({ id, label, icon: Icon, color, description }) => (
            <button
              key={id}
              onClick={() => handleExport(id)}
              disabled={exporting !== null}
              className="w-full px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
            >
              {exporting === id && (
                <motion.div
                  className="absolute inset-0 bg-blue-500/20"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className="flex items-center justify-between relative z-10">
                <span className="flex items-center">
                  <Icon className={`h-5 w-5 mr-3 text-${color}-600`} />
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-gray-400 ml-2">{description}</span>
                </span>
                {exporting === id ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-blue-600">{progress}%</span>
                    <Loader className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <Download className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        {exporting && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Preparing your export... This may take a moment.
          </div>
        )}
      </motion.div>
    </div>
  );
}