'use client';

import { StatsCard } from './StatsCard';
import { DASHBOARD_TEXTS } from '@/lib/constants/text';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';

export const HRDashboard = () => {
  const hrStats = [
    {
      title: 'Total Employees',
      value: '248',
      change: '+8.2%',
      icon: 'users',
      color: 'blue',
    },
    {
      title: 'New Hires',
      value: '12',
      change: '+15%',
      icon: 'userPlus',
      color: 'green',
    },
    {
      title: 'Pending Leave',
      value: '18',
      change: '-5%',
      icon: 'calendar',
      color: 'orange',
    },
    {
      title: 'Active Projects',
      value: '24',
      change: '+12.5%',
      icon: 'briefcase',
      color: 'purple',
    },
    {
      title: 'Avg. Attendance',
      value: '94%',
      change: '+1.8%',
      icon: 'trendingUp',
      color: 'teal',
    },
    {
      title: 'Payroll Processed',
      value: '$124,580',
      change: '+10.2%',
      icon: 'dollar',
      color: 'indigo',
    },
  ] as const;

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          HR Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Human Resources Management - Employees, Attendance, Leave & Payroll
        </p>
      </div>

      {/* HR Specific Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {hrStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* HR Specific Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Upcoming HR Events
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Performance Reviews', date: 'Tomorrow', count: 24 },
                { title: 'Training Sessions', date: 'This Week', count: 3 },
                { title: 'Interviews Scheduled', date: 'Today', count: 8 },
                { title: 'Team Meetings', date: 'This Week', count: 12 },
              ].map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {event.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Quick HR Actions
            </h3>
            <div className="space-y-3">
              {[
                { icon: UserPlus, label: 'Add New Employee', color: 'blue' },
                { icon: Clock, label: 'Approve Leave', color: 'green' },
                { icon: DollarSign, label: 'Process Payroll', color: 'purple' },
                { icon: CheckCircle, label: 'Mark Attendance', color: 'orange' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <action.icon className={`h-5 w-5 mr-3 text-${action.color}-500`} />
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};