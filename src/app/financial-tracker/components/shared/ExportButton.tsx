'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, FileCode, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Define supported export formats
export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json' | 'xml' | 'html';

interface ExportFormatOption {
  value: ExportFormat;
  label: string;
  extension: string;
  icon: React.ElementType;
  mimeType: string;
  description?: string;
}

// Format configurations
const FORMAT_CONFIGS: Record<ExportFormat, ExportFormatOption> = {
  excel: {
    value: 'excel',
    label: 'Excel',
    extension: 'xlsx',
    icon: FileSpreadsheet,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Microsoft Excel format'
  },
  csv: {
    value: 'csv',
    label: 'CSV',
    extension: 'csv',
    icon: FileText,
    mimeType: 'text/csv',
    description: 'Comma-separated values'
  },
  pdf: {
    value: 'pdf',
    label: 'PDF',
    extension: 'pdf',
    icon: FileText,
    mimeType: 'application/pdf',
    description: 'Portable Document Format'
  },
  json: {
    value: 'json',
    label: 'JSON',
    extension: 'json',
    icon: FileJson,
    mimeType: 'application/json',
    description: 'JavaScript Object Notation'
  },
  xml: {
    value: 'xml',
    label: 'XML',
    extension: 'xml',
    icon: FileCode,
    mimeType: 'application/xml',
    description: 'Extensible Markup Language'
  },
  html: {
    value: 'html',
    label: 'HTML',
    extension: 'html',
    icon: FileCode,
    mimeType: 'text/html',
    description: 'HyperText Markup Language'
  }
};

export interface ExportButtonProps<T extends ExportFormat = ExportFormat> {
  /** Export handler function */
  onExport: (format: T) => Promise<void>;
  /** Default filename (without extension) */
  fileName?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Available formats to show */
  formats?: T[];
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Show format icons */
  showIcons?: boolean;
  /** Show format labels in dropdown */
  showLabels?: boolean;
  /** Custom class name */
  className?: string;
  /** Maximum items to show before truncating */
  maxFormats?: number;
  /** Allow selecting multiple formats */
  multiSelect?: boolean;
  /** Callback when format changes */
  onFormatChange?: (format: T) => void;
}

export const ExportButton = <T extends ExportFormat = ExportFormat>({
  onExport,
  fileName = 'export',
  disabled = false,
  formats = ['excel', 'csv', 'pdf', 'json'] as T[],
  size = 'md',
  variant = 'primary',
  showIcons = true,
  showLabels = true,
  className = '',
  maxFormats = 5,
  multiSelect = false,
  onFormatChange
}: ExportButtonProps<T>): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<T>(formats[0] || 'excel' as T);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out formats that exceed maxFormats
  const visibleFormats = formats.slice(0, maxFormats);
  const hiddenFormats = formats.slice(maxFormats);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: T) => {
    try {
      setError(null);
      setIsExporting(true);

      // Validate format is supported
      if (!FORMAT_CONFIGS[format]) {
        throw new Error(`Unsupported format: ${format}`);
      }

      await onExport(format);
      
      toast.success(
        <div className="flex items-center">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span>Exported as {FORMAT_CONFIGS[format].label}</span>
        </div>,
        { duration: 3000 }
      );

      if (onFormatChange) {
        onFormatChange(format);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setError(errorMessage);
      toast.error(
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
          <span>Failed to export as {FORMAT_CONFIGS[format].label}</span>
        </div>
      );
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const getIcon = (format: ExportFormat) => {
    const Icon = FORMAT_CONFIGS[format]?.icon || Download;
    return <Icon className="h-4 w-4" />;
  };

  const getFormatLabel = (format: ExportFormat) => {
    return FORMAT_CONFIGS[format]?.label || format.toUpperCase();
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  };

  const disabledClasses = disabled || isExporting ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div className="flex">
        {/* Main Export Button */}
        <button
          onClick={() => handleExport(selectedFormat)}
          disabled={disabled || isExporting}
          className={`
            flex items-center space-x-2 rounded-l-lg
            ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses}
            transition-all duration-200
          `}
          title={`Export as ${getFormatLabel(selectedFormat)}`}
          aria-label={`Export as ${getFormatLabel(selectedFormat)}`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              {showIcons && getIcon(selectedFormat)}
              {showLabels && <span>Export {getFormatLabel(selectedFormat)}</span>}
            </>
          )}
        </button>

        {/* Dropdown Toggle - Only show if multiple formats */}
        {formats.length > 1 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled || isExporting}
            className={`
              px-2 rounded-r-lg border-l border-l-white/20
              ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses}
              transition-all duration-200
            `}
            aria-label="Select export format"
            aria-expanded={isOpen}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Error Tooltip */}
      {error && (
        <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {visibleFormats.map((format) => {
              const isSelected = selectedFormat === format;
              const formatConfig = FORMAT_CONFIGS[format];

              return (
                <button
                  key={format}
                  onClick={() => {
                    setSelectedFormat(format);
                    handleExport(format);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm
                    hover:bg-gray-50 transition-colors duration-150
                    flex items-center justify-between
                    ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                  title={formatConfig?.description}
                >
                  <span className="flex items-center">
                    {showIcons && (
                      <span className={`mr-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                        {getIcon(format)}
                      </span>
                    )}
                    <span className="flex flex-col">
                      <span>{getFormatLabel(format)}</span>
                      {formatConfig?.description && (
                        <span className="text-xs text-gray-400">{formatConfig.description}</span>
                      )}
                    </span>
                  </span>
                  <span className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">.{formatConfig?.extension}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </span>
                </button>
              );
            })}

            {/* Hidden formats dropdown */}
            {hiddenFormats.length > 0 && (
              <div className="relative group">
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700"
                >
                  <span className="flex items-center">
                    <ChevronDown className="h-4 w-4 mr-2 text-gray-400" />
                    <span>More formats ({hiddenFormats.length})</span>
                  </span>
                </button>
                <div className="absolute left-full top-0 ml-1 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                  {hiddenFormats.map((format) => (
                    <button
                      key={format}
                      onClick={() => {
                        setSelectedFormat(format);
                        handleExport(format);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        {showIcons && <span className="mr-2 text-gray-400">{getIcon(format)}</span>}
                        <span>{getFormatLabel(format)}</span>
                      </span>
                      <span className="text-xs text-gray-400">.{FORMAT_CONFIGS[format]?.extension}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Also export individual format components for convenience
export const ExcelExportButton = (props: Omit<ExportButtonProps, 'formats'>) => (
  <ExportButton {...props} formats={['excel']} />
);

export const CSVExportButton = (props: Omit<ExportButtonProps, 'formats'>) => (
  <ExportButton {...props} formats={['csv']} />
);

export const PDFExportButton = (props: Omit<ExportButtonProps, 'formats'>) => (
  <ExportButton {...props} formats={['pdf']} />
);

export const JSONExportButton = (props: Omit<ExportButtonProps, 'formats'>) => (
  <ExportButton {...props} formats={['json']} />
);