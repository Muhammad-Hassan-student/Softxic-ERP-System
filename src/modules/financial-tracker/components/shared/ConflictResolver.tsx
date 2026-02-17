'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Check, Copy, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

interface ConflictResolverProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (strategy: 'client' | 'server' | 'manual', mergedData?: any) => void;
  clientData: any;
  serverData: any;
  fieldLabels?: Record<string, string>;
  isLoading?: boolean;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  isOpen,
  onClose,
  onResolve,
  clientData,
  serverData,
  fieldLabels = {},
  isLoading = false
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'client' | 'server' | 'manual'>('manual');
  const [mergedData, setMergedData] = useState<any>({ ...serverData, ...clientData });
  const [activeTab, setActiveTab] = useState<'diff' | 'merge'>('diff');

  if (!isOpen) return null;

  // Find fields that have conflicts
  const conflictingFields = Object.keys({ ...clientData, ...serverData }).filter(key => 
    JSON.stringify(clientData[key]) !== JSON.stringify(serverData[key])
  );

  const handleFieldChange = (field: string, value: any) => {
    setMergedData((prev:any) => ({ ...prev, [field]: value }));
  };

  const handleUseClient = (field: string) => {
    handleFieldChange(field, clientData[field]);
  };

  const handleUseServer = (field: string) => {
    handleFieldChange(field, serverData[field]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg max-w-4xl w-full shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Version Conflict</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('diff')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'diff'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                View Differences
              </button>
              <button
                onClick={() => setActiveTab('merge')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'merge'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Manual Merge
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'diff' ? (
              <div className="space-y-4">
                {conflictingFields.map(field => (
                  <div key={field} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {fieldLabels[field] || field}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Client Version */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded">
                            Your Changes
                          </span>
                          <button
                            onClick={() => handleUseClient(field)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Use This
                          </button>
                        </div>
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                          {JSON.stringify(clientData[field], null, 2)}
                        </pre>
                      </div>

                      {/* Server Version */}
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                            Server Version
                          </span>
                          <button
                            onClick={() => handleUseServer(field)}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Use This
                          </button>
                        </div>
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                          {JSON.stringify(serverData[field], null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(mergedData).map(field => {
                  const isConflicting = conflictingFields.includes(field);
                  
                  return (
                    <div key={field} className={`border rounded-lg p-4 ${isConflicting ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {fieldLabels[field] || field}
                          {isConflicting && (
                            <span className="ml-2 text-xs text-yellow-600">(Conflict)</span>
                          )}
                        </label>
                        {isConflicting && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUseClient(field)}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Use Yours
                            </button>
                            <button
                              onClick={() => handleUseServer(field)}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Use Server
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {typeof mergedData[field] === 'object' ? (
                        <textarea
                          value={JSON.stringify(mergedData[field], null, 2)}
                          onChange={(e) => {
                            try {
                              handleFieldChange(field, JSON.parse(e.target.value));
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={5}
                          className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                        />
                      ) : (
                        <input
                          type={typeof mergedData[field] === 'number' ? 'number' : 'text'}
                          value={mergedData[field] || ''}
                          onChange={(e) => handleFieldChange(
                            field, 
                            typeof mergedData[field] === 'number' ? Number(e.target.value) : e.target.value
                          )}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resolution Strategy */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Resolution Strategy</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedStrategy('client')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedStrategy === 'client'
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-gray-900">Use My Changes</p>
                <p className="text-xs text-gray-500 mt-1">Keep all your changes</p>
              </button>
              <button
                onClick={() => setSelectedStrategy('server')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedStrategy === 'server'
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-gray-900">Use Server Version</p>
                <p className="text-xs text-gray-500 mt-1">Discard your changes</p>
              </button>
              <button
                onClick={() => setSelectedStrategy('manual')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedStrategy === 'manual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-gray-900">Manual Merge</p>
                <p className="text-xs text-gray-500 mt-1">Select field by field</p>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => onResolve(selectedStrategy, mergedData)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Resolving...' : 'Resolve Conflict'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};