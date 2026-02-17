'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter
} from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  loading?: boolean;
  selectable?: boolean;
  onSelect?: (selected: string[]) => void;
  actions?: (record: T) => React.ReactNode;
}

export function DataTable<T extends { _id: string }>({
  columns,
  data,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSort,
  onFilter,
  loading = false,
  selectable = false,
  onSelect,
  actions
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map(item => item._id));
      onSelect?.(data.map(item => item._id));
    } else {
      setSelectedRows([]);
      onSelect?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = checked 
      ? [...selectedRows, id]
      : selectedRows.filter(rowId => rowId !== id);
    setSelectedRows(newSelected);
    onSelect?.(newSelected);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white rounded-lg border">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border rounded-lg text-sm w-64"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 border rounded-lg hover:bg-gray-50 ${
              showFilters ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="grid grid-cols-4 gap-3">
            {columns.filter(col => col.filterable).map(col => (
              <input
                key={col.key as string}
                type="text"
                placeholder={`Filter ${col.label}`}
                value={filterValues[col.key as string] || ''}
                onChange={(e) => {
                  const newFilters = { ...filterValues, [col.key]: e.target.value };
                  setFilterValues(newFilters);
                  onFilter?.(newFilters);
                }}
                className="px-3 py-1 border rounded-lg text-sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key as string}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <button
                        onClick={() => handleSort(col.key as string)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(record._id)}
                        onChange={(e) => handleSelectRow(record._id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key as string} className="px-4 py-3 text-sm">
                      {col.render
                        ? col.render(record[col.key as keyof T], record)
                        : String(record[col.key as keyof T] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      {actions(record)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={page === 1}
              className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={page === totalPages}
              className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}