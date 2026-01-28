'use client';

import React from 'react';
import { 
  UserPlus, 
  FileText, 
  Package, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'created new invoice',
      target: 'INV-001',
      time: '5 minutes ago',
      icon: FileText,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      id: 2,
      user: 'Sarah Smith',
      action: 'added new product',
      target: 'Laptop Pro',
      time: '15 minutes ago',
      icon: Package,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'processed payment',
      target: '$12,500',
      time: '30 minutes ago',
      icon: CreditCard,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      id: 4,
      user: 'System',
      action: 'new user registered',
      target: 'Jane Wilson',
      time: '1 hour ago',
      icon: UserPlus,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    {
      id: 5,
      user: 'Robert Brown',
      action: 'resolved complaint',
      target: 'TKT-042',
      time: '2 hours ago',
      icon: CheckCircle,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-100',
    },
    {
      id: 6,
      user: 'System Alert',
      action: 'inventory low',
      target: 'Product #P-124',
      time: '3 hours ago',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      id: 7,
      user: 'Analytics',
      action: 'revenue increased',
      target: '+18.7%',
      time: '5 hours ago',
      icon: TrendingUp,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      id: 8,
      user: 'Support Team',
      action: 'new support ticket',
      target: 'TKT-045',
      time: '6 hours ago',
      icon: MessageSquare,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-gray-900">
          Recent Activity
        </h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View All →
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className={`flex-shrink-0 h-9 w-9 rounded-full ${activity.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${activity.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {activity.target}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="ml-2 flex-shrink-0 text-xs font-normal"
                  >
                    {activity.time}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};