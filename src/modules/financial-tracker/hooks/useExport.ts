'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface UseExportReturn {
  isExporting: boolean;
  exportProgress: number;
  exportError: string | null;
  exportToExcel: (filters?: Record<string, any>) => Promise<void>;
  exportToCSV: (filters?: Record<string, any>) => Promise<void>;
  importFromFile: (file: File) => Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }>;
  downloadTemplate: () => Promise<void>;
}

/**
 * Hook for export/import functionality
 * @param module - 're' | 'expense'
 * @param entity - Entity name
 */
export function useExport(
  module: string,
  entity: string
): UseExportReturn {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  // Export to Excel
  const exportToExcel = useCallback(async (filters?: Record<string, any>) => {
    if (!user?.id) return;

    try {
      setIsExporting(true);
      setExportError(null);
      setExportProgress(0);

      // Build query string
      const params = new URLSearchParams();
      params.append('module', module);
      params.append('entity', entity);
      params.append('format', 'excel');
      
      if (filters) {
        params.append('filters', JSON.stringify(filters));
      }

      // Simulate progress (since we can't track actual progress easily)
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(
        `/api/financial-tracker/export?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      clearInterval(progressInterval);
      setExportProgress(100);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${module}-${entity}-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully');

    } catch (err: any) {
      setExportError(err.message);
      toast.error(err.message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [user?.id, module, entity]);

  // Export to CSV
  const exportToCSV = useCallback(async (filters?: Record<string, any>) => {
    if (!user?.id) return;

    try {
      setIsExporting(true);
      setExportError(null);

      const params = new URLSearchParams();
      params.append('module', module);
      params.append('entity', entity);
      params.append('format', 'csv');
      
      if (filters) {
        params.append('filters', JSON.stringify(filters));
      }

      const response = await fetch(
        `/api/financial-tracker/export?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${module}-${entity}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully');

    } catch (err: any) {
      setExportError(err.message);
      toast.error(err.message);
    } finally {
      setIsExporting(false);
    }
  }, [user?.id, module, entity]);

  // Import from file
  const importFromFile = useCallback(async (file: File) => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt !== 'xlsx' && fileExt !== 'csv') {
      toast.error('Please upload an Excel (.xlsx) or CSV (.csv) file');
      throw new Error('Invalid file type');
    }

    try {
      setIsExporting(true);
      setExportError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', module);
      formData.append('entity', entity);

      const response = await fetch('/api/financial-tracker/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();

      if (result.failed > 0) {
        toast.error(`Import completed with ${result.failed} errors`);
      } else {
        toast.success(`Successfully imported ${result.success} records`);
      }

      return result;

    } catch (err: any) {
      setExportError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [user?.id, module, entity]);

  // Download template
  const downloadTemplate = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/financial-tracker/export/template?module=${module}&entity=${entity}`,
        {
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${module}-${entity}-template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded');

    } catch (err: any) {
      toast.error(err.message);
    }
  }, [user?.id, module, entity]);

  return {
    isExporting,
    exportProgress,
    exportError,
    exportToExcel,
    exportToCSV,
    importFromFile,
    downloadTemplate
  };
}