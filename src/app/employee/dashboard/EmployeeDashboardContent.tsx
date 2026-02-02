'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AuthUser } from '@/lib/auth/server-auth';
import { 
  User, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText,
  Bell,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EmployeeDashboardContentProps {
  user: AuthUser;
}

export default function EmployeeDashboardContent({ user }: EmployeeDashboardContentProps) {
  const { logout } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, <span className="font-semibold text-blue-600">{user.fullName}</span>
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {user.role}
                </span>
                {user!.department! && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    {user!.department!}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Attendance</p>
                <p className="text-2xl font-bold mt-1">Present</p>
                <p className="text-xs text-green-600 mt-1">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Checked in at 9:00 AM
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Leave Balance</p>
                <p className="text-2xl font-bold mt-1">12 Days</p>
                <p className="text-xs text-blue-600 mt-1">Annual Leave</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month Salary</p>
                <p className="text-2xl font-bold mt-1">$4,500</p>
                <p className="text-xs text-green-600 mt-1">Next payout: 5th</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { icon: FileText, label: 'Apply Leave', color: 'blue' },
                { icon: User, label: 'Update Profile', color: 'green' },
                { icon: Clock, label: 'Mark Attendance', color: 'purple' },
                { icon: DollarSign, label: 'View Payslip', color: 'orange' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <action.icon className={`h-5 w-5 mr-3 text-${action.color}-600`} />
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
            <div className="space-y-4">
              {[
                { title: 'Team Meeting', time: '10:30 AM Today', icon: Bell },
                { title: 'Salary Credited', time: 'Yesterday', icon: DollarSign },
                { title: 'Leave Approved', time: '2 days ago', icon: CheckCircle },
              ].map((notification, idx) => (
                <div key={idx} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <notification.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}