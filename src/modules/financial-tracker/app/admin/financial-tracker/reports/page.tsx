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
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
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
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
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

  // Add filter
  const addFilter = () => {
    setConfig({
      ...config,
      filters: [
        ...config.filters,
        { field: '', operator: 'eq', value: '' }
      ]
    });
  };

  // Remove filter
  const removeFilter = (index: number) => {
    const newFilters = [...config.filters];
    newFilters.splice(index, 1);
    setConfig({ ...config, filters: newFilters });
  };

  // Update filter
  const updateFilter = (index: number, field: string, value: any) => {
    const newFilters = [...config.filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setConfig({ ...config, filters: newFilters });
  };

  // Schedule report
  const scheduleReport = async () => {
    try {
      const response = await fetch(`/api/financial-tracker/reports/${selectedReport}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(config.schedule)
      });

      if (!response.ok) throw new Error('Failed to schedule report');

      toast.success('Report scheduled successfully');
      setShowScheduleModal(false);
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Generate, schedule, and export financial reports</p>
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
                selectedReport === 'new'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              New Report
            </button>
            <button
              onClick={() => setSelectedReport('saved')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedReport === 'saved'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
              {/* Basic Settings */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4">Basic Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Name
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Monthly Revenue Report"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={config.description}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Brief description of this report"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module
                      </label>
                      <select
                        value={config.module}
                        onChange={(e) => setConfig({ ...config, module: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="both">Both Modules</option>
                        <option value="re">RE Module</option>
                        <option value="expense">Expense Module</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entity
                      </label>
                      <select
                        value={config.entity}
                        onChange={(e) => setConfig({ ...config, entity: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="all">All Entities</option>
                        <option value="dealer">Dealer</option>
                        <option value="fhh-client">FHH Client</option>
                        <option value="cp-client">CP Client</option>
                        <option value="builder">Builder</option>
                        <option value="project">Project</option>
                        <option value="office">Office</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4">Date Range</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preset
                    </label>
                    <select
                      value={config.dateRange.preset}
                      onChange={(e) => {
                        const preset = e.target.value as any;
                        const now = new Date();
                        let start: Date, end: Date = now;

                        switch (preset) {
                          case 'today':
                            start = new Date(now.setHours(0, 0, 0, 0));
                            end = new Date(now.setHours(23, 59, 59, 999));
                            break;
                          case 'yesterday':
                            const yesterday = new Date(now);
                            yesterday.setDate(yesterday.getDate() - 1);
                            start = new Date(yesterday.setHours(0, 0, 0, 0));
                            end = new Date(yesterday.setHours(23, 59, 59, 999));
                            break;
                          case 'week':
                            start = new Date(now.setDate(now.getDate() - now.getDay()));
                            start.setHours(0, 0, 0, 0);
                            end = new Date();
                            end.setHours(23, 59, 59, 999);
                            break;
                          case 'month':
                            start = new Date(now.getFullYear(), now.getMonth(), 1);
                            end = new Date();
                            end.setHours(23, 59, 59, 999);
                            break;
                          case 'quarter':
                            const quarter = Math.floor(now.getMonth() / 3);
                            start = new Date(now.getFullYear(), quarter * 3, 1);
                            end = new Date();
                            end.setHours(23, 59, 59, 999);
                            break;
                          case 'year':
                            start = new Date(now.getFullYear(), 0, 1);
                            end = new Date();
                            end.setHours(23, 59, 59, 999);
                            break;
                          default:
                            return;
                        }

                        setConfig({
                          ...config,
                          dateRange: {
                            start: start.toISOString().split('T')[0],
                            end: end.toISOString().split('T')[0],
                            preset
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={config.dateRange.start}
                        onChange={(e) => setConfig({
                          ...config,
                          dateRange: { ...config.dateRange, start: e.target.value, preset: 'custom' }
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={config.dateRange.end}
                        onChange={(e) => setConfig({
                          ...config,
                          dateRange: { ...config.dateRange, end: e.target.value, preset: 'custom' }
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grouping & Metrics */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4">Grouping & Metrics</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group By
                    </label>
                    <select
                      value={config.groupBy}
                      onChange={(e) => setConfig({ ...config, groupBy: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                      <option value="year">Yearly</option>
                      <option value="category">By Category</option>
                      <option value="entity">By Entity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metrics
                    </label>
                    <div className="space-y-2">
                      {['total', 'count', 'average', 'min', 'max', 'sum'].map((metric) => (
                        <label key={metric} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.metrics.includes(metric as any)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  metrics: [...config.metrics, metric as any]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  metrics: config.metrics.filter(m => m !== metric)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 capitalize">{metric}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={addFilter}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Filter
                  </button>
                </div>
                
                <div className="space-y-3">
                  {config.filters.map((filter, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={filter.field}
                        onChange={(e) => updateFilter(index, 'field', e.target.value)}
                        placeholder="Field"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                        className="w-24 px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="eq">=</option>
                        <option value="neq">≠</option>
                        <option value="gt">{'>'}</option>
                        <option value="gte">≥</option>
                        <option value="lt">{'<'}</option>
                        <option value="lte">≤</option>
                        <option value="contains">contains</option>
                      </select>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={() => removeFilter(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {config.filters.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No filters added</p>
                  )}
                </div>
              </div>

              {/* Chart Type & Format */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4">Visualization</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chart Type
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { type: 'line', icon: TrendingUp },
                        { type: 'bar', icon: BarChart3 },
                        { type: 'area', icon: AreaChart },
                        { type: 'pie', icon: PieChart },
                        { type: 'table', icon: TableIcon }
                      ].map(({ type, icon: Icon }) => (
                        <button
                          key={type}
                          onClick={() => setConfig({ ...config, chartType: type as any })}
                          className={`p-3 border rounded-lg flex flex-col items-center ${
                            config.chartType === type
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-5 w-5 mb-1" />
                          <span className="text-xs capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Export Format
                    </label>
                    <select
                      value={config.format}
                      onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="csv">CSV (.csv)</option>
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="html">HTML (.html)</option>
                    </select>
                  </div>
                </div>
              </div>
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
                        <h2 className="text-xl font-bold text-gray-900">
                          {config.name || 'Untitled Report'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {config.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportReport('excel')}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Export as Excel"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => exportReport('pdf')}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Export as PDF"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowScheduleModal(true)}
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Schedule"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Date Range</p>
                        <p className="font-medium">
                          {new Date(config.dateRange.start).toLocaleDateString()} - {new Date(config.dateRange.end).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Module</p>
                        <p className="font-medium capitalize">{config.module}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Entity</p>
                        <p className="font-medium capitalize">{config.entity}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Group By</p>
                        <p className="font-medium capitalize">{config.groupBy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  {reportData && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          {config.chartType === 'line' && (
                            <LineChart data={reportData.chartData}>
                              <XAxis dataKey="label" />
                              <YAxis />
                              <CartesianGrid strokeDasharray="3 3" />
                              <Tooltip />
                              <Legend />
                              {config.metrics.map((metric, idx) => (
                                <Line
                                  key={metric}
                                  type="monotone"
                                  dataKey={metric}
                                  stroke={COLORS[idx % COLORS.length]}
                                  strokeWidth={2}
                                />
                              ))}
                            </LineChart>
                          )}

                          {config.chartType === 'bar' && (
                            <BarChart data={reportData.chartData}>
                              <XAxis dataKey="label" />
                              <YAxis />
                              <CartesianGrid strokeDasharray="3 3" />
                              <Tooltip />
                              <Legend />
                              {config.metrics.map((metric, idx) => (
                                <Bar key={metric} dataKey={metric} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </BarChart>
                          )}

                          {config.chartType === 'area' && (
                            <AreaChart data={reportData.chartData}>
                              <defs>
                                {config.metrics.map((metric, idx) => (
                                  <linearGradient key={metric} id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0}/>
                                  </linearGradient>
                                ))}
                              </defs>
                              <XAxis dataKey="label" />
                              <YAxis />
                              <CartesianGrid strokeDasharray="3 3" />
                              <Tooltip />
                              <Legend />
                              {config.metrics.map((metric, idx) => (
                                <Area
                                  key={metric}
                                  type="monotone"
                                  dataKey={metric}
                                  stroke={COLORS[idx % COLORS.length]}
                                  fillOpacity={1}
                                  fill={`url(#color${metric})`}
                                />
                              ))}
                            </AreaChart>
                          )}

                          {config.chartType === 'pie' && (
                            <RePieChart>
                              <Pie
                                data={reportData.pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {reportData.pieData?.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RePieChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Data Table */}
                  {reportData && reportData.tableData && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b">
                        <h3 className="font-medium text-gray-900">Detailed Data</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {reportData.columns?.map((col: string, idx: number) => (
                                <th
                                  key={idx}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.tableData.map((row: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                {reportData.columns?.map((col: string, colIdx: number) => (
                                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            {isLoading ? (
              <div className="col-span-3 text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading saved reports...</p>
              </div>
            ) : savedReports.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Reports</h3>
                <p className="text-gray-500 mb-4">Create and save your first report</p>
                <button
                  onClick={() => setSelectedReport('new')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </button>
              </div>
            ) : (
              savedReports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                    viewMode === 'list' ? 'flex items-center' : ''
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => loadReport(report)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Load"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteReport(report.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
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
                        {report.lastRun && (
                          <div className="mt-2 text-xs text-green-600">
                            Last run: {new Date(report.lastRun).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-500">{report.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => loadReport(report)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Save Report Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter report name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Brief description of this report"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="overwrite"
                  className="rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="overwrite" className="text-sm text-gray-700">
                  Overwrite if exists
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Report</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.schedule?.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    schedule: { ...config.schedule!, enabled: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600"
                  id="enableSchedule"
                />
                <label htmlFor="enableSchedule" className="text-sm font-medium text-gray-700">
                  Enable Scheduling
                </label>
              </div>

              {config.schedule?.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={config.schedule.frequency}
                      onChange={(e) => setConfig({
                        ...config,
                        schedule: { ...config.schedule!, frequency: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Recipients
                    </label>
                    <input
                      type="text"
                      value={config.schedule.recipients.join(', ')}
                      onChange={(e) => setConfig({
                        ...config,
                        schedule: {
                          ...config.schedule!,
                          recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="email1@example.com, email2@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={scheduleReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}