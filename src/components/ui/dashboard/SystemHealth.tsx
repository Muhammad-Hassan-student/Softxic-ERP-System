// components/ui/dashboard/SystemHealth.tsx
'use client';

import { Activity, Database, HardDrive, Cpu } from 'lucide-react';

export function SystemHealth() {
  const metrics = [
    {
      label: 'Server Uptime',
      value: '99.8%',
      icon: Activity,
      color: 'bg-green-500',
      trend: 'up',
    },
    {
      label: 'Database Load',
      value: '42%',
      icon: Database,
      color: 'bg-blue-500',
      trend: 'stable',
    },
    {
      label: 'Storage Usage',
      value: '78%',
      icon: HardDrive,
      color: 'bg-orange-500',
      trend: 'up',
    },
    {
      label: 'CPU Usage',
      value: '34%',
      icon: Cpu,
      color: 'bg-purple-500',
      trend: 'down',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-gray-900">
          System Health
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
          Optimal
        </span>
      </div>
      
      <div className="space-y-5">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${metric.color.replace('bg-', 'bg-')} bg-opacity-10 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${metric.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{metric.value}</p>
                  </div>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                  metric.trend === 'down' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </div>
              </div>
              
              {/* Progress Bar with Gradient */}
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full ${metric.color}`}
                  style={{ 
                    width: metric.value,
                    background: `linear-gradient(90deg, ${metric.color} 0%, ${
                      metric.color.replace('500', '400')
                    } 100%)`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}