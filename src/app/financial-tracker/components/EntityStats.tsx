// src/app/admin/financial-tracker/entities/components/EntityStats.tsx
'use client';

import React from 'react';
import { LayoutDashboard, CheckCircle, XCircle, DollarSign, CreditCard, Shield } from 'lucide-react';

interface StatsProps {
  stats: {
    total: number;
    re: number;
    expense: number;
    approval: number;
    disabled: number;
  };
}

export default function EntityStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Entities</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">RE Module</p>
            <p className="text-2xl font-bold text-blue-600">{stats.re}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Expense Module</p>
            <p className="text-2xl font-bold text-green-600">{stats.expense}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Approval Enabled</p>
            <p className="text-2xl font-bold text-purple-600">{stats.approval}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{stats.disabled}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <XCircle className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}