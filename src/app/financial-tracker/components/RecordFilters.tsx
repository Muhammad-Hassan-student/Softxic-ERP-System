// src/app/admin/financial-tracker/records/components/RecordFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Filter, Users } from 'lucide-react';

interface Filters {
  module?: 're' | 'expense' | 'all';
  entity?: string;
  status?: 'all' | 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface RecordFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function RecordFilters({
  filters,
  onFilterChange,
  onApply,
  onClear
}: RecordFiltersProps) {
  const [entities, setEntities] = useState<string[]>([]);
  const [users, setUsers] = useState<Array<{ _id: string; fullName: string }>>([]);
  const [loading, setLoading] = useState(false);

  const getToken = (): string => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  // Fetch entities
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const token = getToken();
        const response = await fetch('/api/financial-tracker/entities', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setEntities(data.entities.map((e: any) => e.entityKey));
        }
      } catch (error) {
        console.error('Failed to fetch entities:', error);
      }
    };
    fetchEntities();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken();
        const response = await fetch('/api/financial-tracker/admin/users?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Module Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Module</label>
          <select
            value={filters.module || 'all'}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              module: e.target.value as 're' | 'expense' | 'all' 
            })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Modules</option>
            <option value="re">RE Module</option>
            <option value="expense">Expense Module</option>
          </select>
        </div>

        {/* Entity Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Entity</label>
          <select
            value={filters.entity || 'all'}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              entity: e.target.value === 'all' ? undefined : e.target.value 
            })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Entities</option>
            {entities.map(entity => (
              <option key={entity} value={entity}>
                {entity.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              status: e.target.value as any 
            })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Created By Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Created By</label>
          <select
            value={filters.createdBy || 'all'}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              createdBy: e.target.value === 'all' ? undefined : e.target.value 
            })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange({ 
                ...filters, 
                dateFrom: e.target.value 
              })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFilterChange({ 
                ...filters, 
                dateTo: e.target.value 
              })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}