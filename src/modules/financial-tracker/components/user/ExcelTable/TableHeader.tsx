'use client';

import React from 'react';
import { ICustomField } from '../../../models/custom-field.model';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TableHeaderProps {
  field: ICustomField;
  width: number;
  onSort?: (fieldKey: string) => void;
  sortDirection?: 'asc' | 'desc' | null;
  isSorted?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  field,
  width,
  onSort,
  sortDirection,
  isSorted = false
}) => {
  const handleClick = () => {
    if (onSort && !field.readOnly) {
      onSort(field.fieldKey);
    }
  };

  return (
    <div
      className={`flex-1 min-w-[200px] px-4 py-2 text-sm font-medium text-gray-700 border-r bg-gray-100 ${
        onSort && !field.readOnly ? 'cursor-pointer hover:bg-gray-200' : ''
      }`}
      style={{ width }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <span>{field.label}</span>
        {field.required && <span className="text-red-500 ml-1">*</span>}
        
        {/* Sort indicators */}
        {isSorted && (
          <span className="ml-2">
            {sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-gray-600" />
            ) : sortDirection === 'desc' ? (
              <ArrowDown className="h-3 w-3 text-gray-600" />
            ) : null}
          </span>
        )}
      </div>
      
      {/* Field type indicator (optional) */}
      <div className="text-xs text-gray-400 mt-1 capitalize">
        {field.type}
      </div>
    </div>
  );
};

export default TableHeader;