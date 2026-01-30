
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function AdminDashboard() {
  const [authStatus, setAuthStatus] = useState<any>(null);

  useEffect(() => {
    // Check auth status
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        console.log('Auth check result:', data);
        setAuthStatus(data);
      })
      .catch(error => {
        console.error('Auth check failed:', error);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome to the Admin Dashboard</p>
        
        {/* Debug info (remove in production) */}
        {authStatus && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-sm bg-white p-3 rounded overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Total Users</h3>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Active Employees</h3>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Pending Tasks</h3>
              <p className="text-2xl font-bold mt-2">0</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}