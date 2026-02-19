// src/app/admin/financial-tracker/records/components/RecordStats.tsx
'use client';

import React from 'react';
import { 
  FileText, 
  DollarSign, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users 
} from 'lucide-react';

interface StatsProps {
  stats: {
    total: number;
    re: number;
    expense: number;
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    users: number;
  };
}

export default function RecordStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-8 gap-4 mt-4">
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs text-blue-600">Total Records</p>
        <p className="text-lg font-bold text-blue-700">{stats.total}</p>
      </div>
      <div className="bg-purple-50 rounded-lg p-3">
        <p className="text-xs text-purple-600">RE Module</p>
        <p className="text-lg font-bold text-purple-700">{stats.re}</p>
      </div>
      <div className="bg-green-50 rounded-lg p-3">
        <p className="text-xs text-green-600">Expense Module</p>
        <p className="text-lg font-bold text-green-700">{stats.expense}</p>
      </div>
      <div className="bg-yellow-50 rounded-lg p-3">
        <p className="text-xs text-yellow-600">Pending</p>
        <p className="text-lg font-bold text-yellow-700">{stats.submitted}</p>
      </div>
      <div className="bg-green-50 rounded-lg p-3">
        <p className="text-xs text-green-600">Approved</p>
        <p className="text-lg font-bold text-green-700">{stats.approved}</p>
      </div>
      <div className="bg-red-50 rounded-lg p-3">
        <p className="text-xs text-red-600">Rejected</p>
        <p className="text-lg font-bold text-red-700">{stats.rejected}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">Draft</p>
        <p className="text-lg font-bold text-gray-700">{stats.draft}</p>
      </div>
      <div className="bg-indigo-50 rounded-lg p-3">
        <p className="text-xs text-indigo-600">Unique Users</p>
        <p className="text-lg font-bold text-indigo-700">{stats.users}</p>
      </div>
    </div>
  );
}