'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Printer,
  Mail,
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  Edit,
  Copy,
  Share2,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  Building2,
  Package,
  Home,
  Briefcase,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  Upload,
  Settings,
  Grid3x3,
  List,
  Table as TableIcon,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Import components
import { ChartComponent } from '@/app/financial-tracker/components/shared/ChartComponents';
import { ReportScheduler } from '@/app/financial-tracker/components/admin/ReportScheduler';
import { ExportButton } from '@/app/financial-tracker/components/shared/ExportButton';
import { ConnectionStatus } from '@/app/financial-tracker/components/shared/ConnectionStatus';

interface ReportConfig {
  id?: string;
  name: string;
  description: string;
  module: 're' | 'expense' | 'both';
  entity: string;
  dateRange: {
    start: string;
    end: string;
    preset?: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'category' | 'entity';
  metrics: Array<'total' | 'count' | 'average' | 'min' | 'max' | 'sum'>;
  filters: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
    value: any;
  }>;
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'table';
  format: 'excel' | 'csv' | 'pdf' | 'html';
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  lastRun?: string;
  config: ReportConfig;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function ReportsPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedReport, setSelectedReport] = useState<string>('new');
  const [showPreview, setShowPreview] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedReportForSchedule, setSelectedReportForSchedule] = useState<string | null>(null);
  
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    module: 'both',
    entity: 'all',
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset: 'month'
    },
    groupBy: 'month',
    metrics: ['total', 'count'],
    filters: [],
    chartType: 'line',
    format: 'excel',
    schedule: {
      enabled: false,
      frequency: 'weekly',
      recipients: []
    }
  });

  // Fetch saved reports
  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/financial-tracker/reports', {
        headers: { 'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setSavedReports(data.reports);
    } catch (error) {
      toast.error('Failed to load saved reports');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate report
  const generateReport = async () => {
    try {
      setIsGenerating(true);
      setShowPreview(true);
      const response = await fetch('/api/financial-tracker/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report
  const exportReport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/financial-tracker/reports/export?format=${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ config, data: reportData })
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name || 'report'}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  // Save report configuration
  const saveReport = async () => {
    if (!config.name) {
      toast.error('Please enter a report name');
      return;
    }
    try {
      const response = await fetch('/api/financial-tracker/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to save report');
      toast.success('Report saved successfully');
      setShowSaveModal(false);
      fetchSavedReports();
    } catch (error) {
      toast.error('Failed to save report');
    }
  };

  // Delete report
  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const response = await fetch(`/api/financial-tracker/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}` }
      });
      if (!response.ok) throw new Error('Failed to delete report');
      toast.success('Report deleted successfully');
      fetchSavedReports();
      if (selectedReport === reportId) {
        setSelectedReport('new');
        setReportData(null);
        setShowPreview(false);
      }
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  // Load saved report
  const loadReport = (report: SavedReport) => {
    setConfig(report.config);
    setSelectedReport(report.id);
    setReportData(null);
    setShowPreview(false);
  };

  // Schedule report
  const handleScheduleSave = async (schedule: any) => {
    if (!selectedReportForSchedule) return;
    try {
      const response = await fetch(`/api/financial-tracker/reports/${selectedReportForSchedule}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ schedule })
      });
      if (!response.ok) throw new Error('Failed to schedule report');
      toast.success('Report scheduled successfully');
      setShowScheduleModal(false);
      setSelectedReportForSchedule(null);
      fetchSavedReports();
    } catch (error) {
      toast.error('Failed to schedule report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <ConnectionStatus module="reports" entity="all" />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Report
              </button>
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Preview
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-4">
            <button
              onClick={() => setSelectedReport('new')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedReport === 'new' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              New Report
            </button>
            <button
              onClick={() => setSelectedReport('saved')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedReport === 'saved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Saved Reports ({savedReports.length})
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {selectedReport === 'new' ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Configuration Panel */}
            <div className="col-span-4 space-y-6">
              {/* ... existing config UI ... */}
            </div>

            {/* Preview Panel */}
            <div className="col-span-8">
              {!showPreview ? (
                <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h3>
                  <p className="text-gray-500 mb-4">Configure your report settings and click Generate Preview</p>
                  <button
                    onClick={generateReport}
                    disabled={isGenerating}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Generate Preview
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Report Header */}
                  <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{config.name || 'Untitled Report'}</h2>
                        <p className="text-sm text-gray-500 mt-1">{config.description || 'No description provided'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ExportButton
                          onExport={exportReport}
                          formats={['excel', 'csv', 'pdf']}
                          size="sm"
                        />
                        <button
                          onClick={() => {
                            setSelectedReportForSchedule(selectedReport === 'new' ? 'new' : selectedReport);
                            setShowScheduleModal(true);
                          }}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Schedule"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {reportData && (
  <div className="bg-white rounded-xl border shadow-sm p-6">
    <div className="h-96">
      <ChartComponent
        data={reportData.chartData || reportData.pieData}
        type={config.chartType as 'line' | 'area' | 'bar' | 'pie'} // ✅ Type assertion
        height={350}
        dataKey="value"
        xAxisKey="label"
      />
    </div>
  </div>
)}

{config.chartType === 'table' && reportData?.tableData && (
  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b">
      <h3 className="font-medium text-gray-900">Detailed Data</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {reportData.columns?.map((col: string, idx: number) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {reportData.tableData.map((row: any, idx: number) => (
            <tr key={idx} className="hover:bg-gray-50">
              {reportData.columns?.map((col: string, colIdx: number) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-gray-900">
                  {typeof row[col] === 'number' ? row[col].toLocaleString() : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Saved Reports View
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
            {savedReports.map((report) => (
              <div key={report.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${viewMode === 'list' ? 'flex items-center' : ''}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => loadReport(report)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Load">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReportForSchedule(report.id);
                          setShowScheduleModal(true);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Schedule"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteReport(report.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{report.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{report.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    <span>by {report.createdBy}</span>
                  </div>
                  {report.config.schedule?.enabled && (
                    <div className="mt-2 text-xs text-green-600">
                      Scheduled: {report.config.schedule.frequency}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedReportForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Report</h3>
            <ReportScheduler
              reportId={selectedReportForSchedule}
              onSave={handleScheduleSave}
              onCancel={() => {
                setShowScheduleModal(false);
                setSelectedReportForSchedule(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}