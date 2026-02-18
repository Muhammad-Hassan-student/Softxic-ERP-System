'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Clock,
  Activity,
  Zap,
  CheckCircle,
  Edit3,
  Trash2
} from 'lucide-react';

interface LiveMetric {
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
  format?: 'number' | 'currency';
}

export const LiveMetrics: React.FC<{ module: string; entity?: string }> = ({
  module,
  entity
}) => {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    { label: 'Active Users', value: 0, change: 0, icon: Users, color: 'blue', format: 'number' },
    { label: 'Records Today', value: 0, change: 0, icon: FileText, color: 'green', format: 'number' },
    { label: 'Revenue', value: 0, change: 0, icon: TrendingUp, color: 'purple', format: 'currency' },
    { label: 'Expenses', value: 0, change: 0, icon: TrendingDown, color: 'red', format: 'currency' }
  ]);

  const { socket, isConnected } = useSocket(module, entity);

  useEffect(() => {
    if (!socket) return;

    const handleMetricsUpdate = (data: any) => {
      setMetrics(prev => prev.map((metric, index) => ({
        ...metric,
        value: data[metric.label.toLowerCase().replace(/\s+/g, '')] || metric.value,
        change: data.changes?.[index] || metric.change
      })));
    };

    socket.on('metricsUpdate', handleMetricsUpdate);

    return () => {
      socket.off('metricsUpdate', handleMetricsUpdate);
    };
  }, [socket]);

  const formatValue = (value: number, format?: 'number' | 'currency') => {
    if (format === 'currency') {
      return `PKR ${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white rounded-lg border p-4 relative overflow-hidden">
          {isConnected && (
            <div className="absolute top-2 right-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          )}
          
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 bg-${metric.color}-100 rounded-lg`}>
              <metric.icon className={`h-5 w-5 text-${metric.color}-600`} />
            </div>
            <div className={`text-xs font-medium ${
              metric.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change >= 0 ? '+' : ''}{metric.change}%
            </div>
          </div>
          
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(metric.value, metric.format)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
        </div>
      ))}
    </div>
  );
};

export const LiveActivityStream: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleActivity = (activity: any) => {
      setActivities(prev => [activity, ...prev].slice(0, 10));
    };

    socket.on('activity', handleActivity);

    return () => {
      socket.off('activity', handleActivity);
    };
  }, [socket]);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg border p-4 text-center text-gray-500">
        <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Connecting to live stream...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Live Activity</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="divide-y max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={index} className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className={`p-1.5 rounded-full ${
                activity.type === 'CREATE' ? 'bg-green-100' :
                activity.type === 'UPDATE' ? 'bg-blue-100' :
                activity.type === 'DELETE' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {activity.type === 'CREATE' && <CheckCircle className="h-3 w-3 text-green-600" />}
                {activity.type === 'UPDATE' && <Edit3 className="h-3 w-3 text-blue-600" />}
                {activity.type === 'DELETE' && <Trash2 className="h-3 w-3 text-red-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>{' '}
                  {activity.type.toLowerCase()}d{' '}
                  <span className="font-medium">{activity.entity}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};