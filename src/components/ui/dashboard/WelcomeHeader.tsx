// components/ui/dashboard/WelcomeHeader.tsx
'use client';

import { DASHBOARD_TEXTS } from '@/lib/constants/text';
import { Bell, Search, Calendar } from 'lucide-react';
import { useState } from 'react';

export function WelcomeHeader() {
  const [date] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-blue-600">Admin</span> 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your ERP system today.
          </p>
        </div>
        <div className="flex items-center gap-3">
         
        
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{date}</span>
          </div>
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-600">System Status: <span className="font-medium text-green-600">All Systems Operational</span></span>
        </div>
        
      </div>
    </div>
  );
}