'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExportButtonProps {
  onExport: (format: 'excel' | 'csv' | 'pdf' | 'json') => Promise<void>;
  fileName?: string;
  disabled?: boolean;
  formats?: Array<'excel' | 'csv' | 'pdf' | 'json'>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  fileName = 'export',
  disabled = false,
  formats = ['excel', 'csv', 'pdf', 'json'],
  size = 'md',
  variant = 'primary'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv' | 'pdf' | 'json'>(formats[0] || 'excel');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'excel' | 'csv' | 'pdf' | 'json') => {
    try {
      setIsExporting(true);
      await onExport(format);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export as ${format}`);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const getIcon = (format: string) => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'json':
        return <FileJson className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'excel':
        return 'Excel (.xlsx)';
      case 'csv':
        return 'CSV (.csv)';
      case 'pdf':
        return 'PDF (.pdf)';
      case 'json':
        return 'JSON (.json)';
      default:
        return format;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div className="flex">
        {/* Main Export Button */}
        <button
          onClick={() => handleExport(selectedFormat)}
          disabled={disabled || isExporting}
          className={`flex items-center space-x-2 rounded-l-lg ${sizeClasses[size]} ${variantClasses[variant]} disabled:opacity-50 transition-colors`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              {getIcon(selectedFormat)}
              <span>Export {getFormatLabel(selectedFormat)}</span>
            </>
          )}
        </button>

        {/* Dropdown Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isExporting}
          className={`px-2 rounded-r-lg border-l border-l-white/20 ${sizeClasses[size]} ${variantClasses[variant]} disabled:opacity-50`}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
          <div className="py-1">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => {
                  setSelectedFormat(format);
                  handleExport(format);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center">
                  {getIcon(format)}
                  <span className="ml-2">{getFormatLabel(format)}</span>
                </span>
                {selectedFormat === format && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};