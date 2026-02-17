'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ICustomField } from '../../../models/custom-field.model';

// Define the frontend record type (without Mongoose document methods)
interface IRecordFrontend {
  _id: string;
  data: Record<string, any>;
  version: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  module: 're' | 'expense';
  entity: string;
}

interface TableCellProps {
  field: ICustomField;
  value: any;
  record: IRecordFrontend; // Changed from IRecord to IRecordFrontend
  isEditing: boolean;
  canEdit: boolean;
  pendingChanges?: any;
  onStartEdit: () => void;
  onChange: (value: any) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const TableCell: React.FC<TableCellProps> = ({
  field,
  value,
  record,
  isEditing,
  canEdit,
  pendingChanges,
  onStartEdit,
  onChange,
  onKeyDown
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleBlur = () => {
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
    onKeyDown(e);
  };

  const renderCellContent = () => {
    if (!canEdit || field.readOnly) {
      // Read-only display
      switch (field.type) {
        case 'date':
          return value ? new Date(value).toLocaleDateString() : '-';
        case 'checkbox':
          return value ? '✓' : '✗';
        case 'file':
        case 'image':
          return value ? '📎 File' : '-';
        default:
          return value ?? '-';
      }
    }

    if (isEditing) {
      // Editable input
      switch (field.type) {
        case 'text':
        case 'number':
        case 'date':
          return (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={field.type}
              value={editValue ?? ''}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full px-2 border-2 border-blue-500 outline-none"
            />
          );

        case 'textarea':
          return (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue ?? ''}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full h-full px-2 border-2 border-blue-500 outline-none resize-none"
            />
          );

        case 'select':
          return (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={editValue ?? ''}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full px-2 border-2 border-blue-500 outline-none"
            >
              <option value="">Select...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );

        case 'checkbox':
          return (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="checkbox"
              checked={editValue ?? false}
              onChange={(e) => setEditValue(e.target.checked)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-4 h-4"
            />
          );

        default:
          return value ?? '-';
      }
    }

    // Display mode
    const displayValue = pendingChanges ?? value;
    
    switch (field.type) {
      case 'date':
        return displayValue ? new Date(displayValue).toLocaleDateString() : '-';
      case 'checkbox':
        return displayValue ? '✓' : '✗';
      case 'file':
      case 'image':
        return displayValue ? '📎 File' : '-';
      default:
        return displayValue ?? '-';
    }
  };

  const showPendingIndicator = pendingChanges !== undefined && pendingChanges !== value;

  return (
    <div
      onClick={canEdit && !field.readOnly ? onStartEdit : undefined}
      className={`
        flex-1 min-w-[200px] px-4 py-2 border-r cursor-default relative
        ${showPendingIndicator ? 'bg-yellow-50' : ''}
        ${canEdit && !field.readOnly ? 'hover:bg-blue-50' : ''}
      `}
      style={{ width: 200 }}
    >
      {renderCellContent()}
      {showPendingIndicator && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
      )}
    </div>
  );
};

export default TableCell;