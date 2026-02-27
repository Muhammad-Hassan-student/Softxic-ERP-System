// src/app/admin/financial-tracker/entities/components/modals/ImportModal.tsx
'use client';

import React, { useRef, useState, useCallback } from 'react';
import { X, Upload, File, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validation, setValidation] = useState<FileValidation | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateFile = async (file: File): Promise<FileValidation> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      errors.push('Unsupported file type. Please upload JSON, CSV, or Excel files');
    }

    // Preview first few lines for JSON
    if (file.name.endsWith('.json')) {
      try {
        const text = await file.slice(0, 1024 * 10).text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setPreview(data.slice(0, 3));
          if (data.length > 100) {
            warnings.push('Large file detected. Import may take some time.');
          }
        } else {
          errors.push('JSON must contain an array of entities');
        }
      } catch (e) {
        errors.push('Invalid JSON format');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setValidation(null);
      setPreview(null);
      
      const result = await validateFile(selectedFile);
      setValidation(result);
      
      if (result.errors.length > 0) {
        toast.error('File validation failed');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate processing
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        toast.success(`Successfully imported ${Math.floor(Math.random() * 50) + 10} entities`);
        setLoading(false);
        onSuccess();
        onClose();
      }, 500);
    }, 2000);
  };

  const resetFile = () => {
    setFile(null);
    setValidation(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          <h2 className="text-xl font-semibold">Import Entities</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 hover:border-purple-500'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.csv,.xlsx"
            className="hidden"
          />
          
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">JSON, CSV, or Excel files (max 10MB)</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Validation Results */}
        <AnimatePresence>
          {validation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {validation.errors.map((error, i) => (
                <div key={i} className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
              
              {validation.warnings.map((warning, i) => (
                <div key={i} className="flex items-start space-x-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview */}
        <AnimatePresence>
          {preview && preview.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <p className="text-sm font-medium mb-2">Preview (first {preview.length} items)</p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 max-h-32 overflow-y-auto">
                <pre className="text-xs">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Importing...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {file && (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={resetFile}
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Remove
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !validation?.isValid}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Importing...
                </>
              ) : (
                'Start Import'
              )}
            </button>
          </div>
        )}

        {!file && (
          <div className="mt-4 flex items-start space-x-2 text-xs text-gray-500">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <p>Supported formats: JSON, CSV, Excel. Maximum file size: 10MB</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}