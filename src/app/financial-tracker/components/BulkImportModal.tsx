// src/app/financial-tracker/components/user/BulkImportModal.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: 're' | 'expense';
  entity: string;
  onSuccess?: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  module,
  entity,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext !== 'xlsx' && ext !== 'csv') {
      toast.error('Please upload Excel (.xlsx) or CSV (.csv) file');
      return;
    }
    
    setFile(file);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    }
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);
    formData.append('entity', entity);

    try {
      const response = await fetch('/api/financial-tracker/records/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Import failed');
      
      setResult(data);
      toast.success(`Import completed: ${data.success} records imported`);
      
      if (data.success > 0) {
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`/api/financial-tracker/records/export/template?module=${module}&entity=${entity}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${module}-${entity}-template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Bulk Import</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <>
              {/* Template Download */}
              <button
                onClick={downloadTemplate}
                className="mb-4 w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                {isDragActive ? (
                  <p className="text-sm text-gray-600">Drop the file here...</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Drag & drop your Excel/CSV file here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or click to browse
                    </p>
                  </>
                )}
              </div>

              {/* Selected File */}
              {file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}

              {/* Upload Button */}
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Import
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            // Import Results
            <div className="text-center">
              {result.failed === 0 ? (
                <div className="mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Import Successful!</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {result.success} records imported successfully
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-900">Import Completed with Errors</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {result.success} success, {result.failed} failed
                  </p>
                </div>
              )}

              {/* Error List */}
              {result.errors.length > 0 && (
                <div className="mt-4 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Errors:</h4>
                  <div className="space-y-2">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="text-xs text-left bg-red-50 p-2 rounded">
                        <span className="font-medium text-red-700">Row {err.row}:</span>{' '}
                        <span className="text-red-600">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  onClose();
                }}
                className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};