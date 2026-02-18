'use client';

import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import components
import { AuditLogsViewer } from '@/app/financial-tracker/components/admin/AuditLogViewer';
import { ConnectionStatus } from '@/app/financial-tracker/components/shared/ConnectionStatus';
import { ExportButton } from '@/app/financial-tracker/components/shared/ExportButton';

export default function LogsPage() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExport = async (format: 'excel' | 'csv' | 'pdf' | 'json') => {
    try {
      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module', selectedModule);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/financial-tracker/audit-logs/export?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}` }
      });

      if (!response.ok) throw new Error('Failed to export logs');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <ConnectionStatus module="admin" entity="logs" />
          </div>
          <p className="text-gray-600 mt-1">Track all system activities and audit trails</p>
        </div>
        <div className="flex space-x-3">
          <ExportButton
            onExport={handleExport}
            formats={['excel', 'csv', 'pdf']}
            size="md"
          />
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Audit Logs Viewer */}
      <AuditLogsViewer 
        key={refreshKey}
        module={selectedModule !== 'all' ? selectedModule : undefined}
      />
    </div>
  );
}