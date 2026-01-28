'use client';

import React from 'react';
import { 
  PlusCircle, 
  FileText, 
  Users, 
  Package,
  BarChart3,
  Settings,
  Download,
  Upload,
  Send,
  Bell,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const QuickActions: React.FC = () => {
  const quickActions = [
    {
      icon: PlusCircle,
      label: 'Create Invoice',
      description: 'Generate new invoice',
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      icon: Users,
      label: 'Add User',
      description: 'Register new user',
      color: 'bg-green-100 text-green-600 hover:bg-green-200',
      iconColor: 'text-green-600',
    },
    {
      icon: Package,
      label: 'Add Product',
      description: 'Add to inventory',
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Create analytics report',
      color: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      iconColor: 'text-orange-600',
    },
  ];

  const systemActions = [
    {
      icon: Download,
      label: 'Export Data',
      variant: 'outline' as const,
    },
    {
      icon: Upload,
      label: 'Import Data',
      variant: 'outline' as const,
    },
    {
      icon: Send,
      label: 'Send Bulk Email',
      variant: 'outline' as const,
    },
    {
      icon: Bell,
      label: 'Set Reminder',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h3 className="font-semibold text-lg text-gray-900 mb-6">
        Quick Actions
      </h3>
      
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-4 rounded-lg ${action.color} transition-colors`}
            >
              <Icon className={`h-6 w-6 ${action.iconColor} mb-2`} />
              <span className="text-xs font-medium">{action.label}</span>
              <span className="text-xs text-gray-600 mt-1">{action.description}</span>
            </button>
          );
        })}
      </div>
      
      {/* Secondary Actions */}
      <div className="space-y-2">
        {systemActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant}
              className="w-full justify-start"
            >
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          );
        })}
      </div>
      
      {/* Recent Actions */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Recently Used
        </h4>
        <div className="space-y-2">
          {[
            { icon: Calendar, label: 'Schedule Meeting', time: 'Today' },
            { icon: MessageSquare, label: 'Send Message', time: 'Yesterday' },
            { icon: BarChart3, label: 'View Analytics', time: '2 days ago' },
            { icon: Settings, label: 'System Settings', time: '3 days ago' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                <div className="flex items-center">
                  <Icon className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">{action.label}</span>
                </div>
                <span className="text-xs text-gray-500">{action.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
