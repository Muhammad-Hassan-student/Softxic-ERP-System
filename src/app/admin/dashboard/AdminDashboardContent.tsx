'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AuthUser } from '@/lib/auth/server-auth';
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  BarChart3, 
  Settings,
  Shield,
  Building
} from 'lucide-react';

interface AdminDashboardContentProps {
  user: AuthUser;
}

export default function AdminDashboardContent({ user }: AdminDashboardContentProps) {
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-semibold text-blue-600">{user.fullName}</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-500">Administrator Access</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold mt-1">1,248</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Departments</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold mt-1">$1.2M</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="text-2xl font-bold mt-1">48</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: UserPlus, label: 'Add New User', color: 'blue' },
              { icon: Settings, label: 'System Settings', color: 'gray' },
              { icon: Shield, label: 'Manage Roles', color: 'green' },
              { icon: Users, label: 'User Management', color: 'purple' },
              { icon: Building, label: 'Departments', color: 'orange' },
              { icon: DollarSign, label: 'Billing', color: 'red' },
            ].map((action, idx) => (
              <button
                key={idx}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <action.icon className={`h-5 w-5 mr-3 text-${action.color}-600`} />
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}