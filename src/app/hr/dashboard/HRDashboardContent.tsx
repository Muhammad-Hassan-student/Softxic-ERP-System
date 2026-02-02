'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AuthUser } from '@/lib/auth/server-auth';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  DollarSign,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HRDashboardContentProps {
  user: AuthUser;
}

export default function HRDashboardContent({ user }: HRDashboardContentProps) {
  const { logout } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                HR Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome, <span className="font-semibold text-blue-600">{user.fullName}</span>
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Human Resources
                </span>
                {user.department && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    {user.department}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Employees', value: '248', icon: Users, color: 'blue' },
            { title: 'New Hires', value: '12', icon: UserPlus, color: 'green' },
            { title: 'Pending Leaves', value: '18', icon: Calendar, color: 'orange' },
            { title: 'Payroll Due', value: '$124,580', icon: DollarSign, color: 'purple' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">HR Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: UserPlus, label: 'Add Employee', description: 'Create new employee record' },
              { icon: Calendar, label: 'Leave Management', description: 'Approve/reject leave requests' },
              { icon: DollarSign, label: 'Process Payroll', description: 'Run monthly payroll' },
              { icon: Users, label: 'Employee Directory', description: 'View all employees' },
              { icon: FileText, label: 'Reports', description: 'Generate HR reports' },
              { icon: BarChart3, label: 'Analytics', description: 'HR analytics dashboard' },
            ].map((action, idx) => (
              <button
                key={idx}
                className="flex flex-col items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <action.icon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium">{action.label}</span>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}