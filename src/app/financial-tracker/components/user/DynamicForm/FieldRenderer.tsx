  'use client';

  import React from 'react';
  import { ICustomField } from '../../../models/custom-field.model';

  interface FieldRendererProps {
    field: ICustomField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    disabled?: boolean;
  }

  const FieldRenderer: React.FC<FieldRendererProps> = ({
    field,
    value,
    onChange,
    error,
    disabled = false
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      let newValue: any = e.target.value;

      // Type conversion
      if (field.type === 'number') {
        newValue = e.target.value === '' ? null : Number(e.target.value);
      } else if (field.type === 'checkbox') {
        newValue = (e as React.ChangeEvent<HTMLInputElement>).target.checked;
      } else if (field.type === 'date') {
        newValue = e.target.value ? new Date(e.target.value) : null;
      }

      onChange(newValue);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (field.validation?.allowedFileTypes?.length) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!field.validation.allowedFileTypes.includes(fileExt || '')) {
          alert(`Invalid file type. Allowed: ${field.validation.allowedFileTypes.join(', ')}`);
          return;
        }
      }

      // Validate file size
      if (field.validation?.maxFileSize && file.size > field.validation.maxFileSize) {
        alert(`File too large. Max size: ${field.validation.maxFileSize / 1024 / 1024}MB`);
        return;
      }

      // Convert to base64 or upload to server
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    };

    const renderField = () => {
      switch (field.type) {
        case 'text':
        case 'number':
        case 'date':
          return (
            <input
              type={field.type}
              value={value || ''}
              onChange={handleChange}
              disabled={disabled}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          );

        case 'textarea':
          return (
            <textarea
              value={value || ''}
              onChange={handleChange}
              disabled={disabled}
              rows={4}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          );

        case 'select':
          return (
            <select
              value={value || ''}
              onChange={handleChange}
              disabled={disabled}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );

        case 'checkbox':
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={value || false}
                onChange={handleChange}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-600">Yes</span>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map(opt => (
                <label key={opt} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={opt}
                    checked={value === opt}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          );

        case 'file':
        case 'image':
          return (
            <div className="space-y-2">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={disabled}
                accept={field.validation?.allowedFileTypes?.map(t => `.${t}`).join(',')}
                className="w-full p-2 border rounded"
              />
              {value && (
                <div className="mt-2">
                  {field.type === 'image' ? (
                    <img src={value} alt="Preview" className="max-h-32 rounded" />
                  ) : (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View File
                    </a>
                  )}
                </div>
              )}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {renderField()}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  export default FieldRenderer;