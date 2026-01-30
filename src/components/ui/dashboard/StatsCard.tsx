
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Users,
  DollarSign,
  ShoppingCart,
  LucideIcon,
  Package,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  UserPlus,
  Briefcase,
  Calendar,
  PieChart,
  Wallet,
  CreditCard,
  TrendingDown,
  Clock,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  dollar: DollarSign,
  cart: ShoppingCart,
  package: Package,
  checkCircle: CheckCircle,
  trendingUp: TrendingUp,
  alertCircle: AlertCircle,
  activity: Activity,
  userPlus: UserPlus,
  briefcase: Briefcase,
  calendar: Calendar,
  pieChart : PieChart,
   wallet:     Wallet,
    creditCard :CreditCard,
    trendingDown: TrendingDown,
    clock: Clock,
  
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof iconMap;
  color: StatColor;
}

export type StatColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'orange'
  | 'purple'
  | 'teal'
  | 'indigo';

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  
}) => {
      const Icon = iconMap[icon];

  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      changeColor: change.startsWith('+') ? 'text-green-600' : 'text-red-600',
      changeBg: change.startsWith('+') ? 'bg-green-100' : 'bg-red-100',
    },
    green: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      changeColor: change.startsWith('+') ? 'text-green-600' : 'text-red-600',
      changeBg: change.startsWith('+') ? 'bg-green-100' : 'bg-red-100',
    },
    red: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      changeColor: change.startsWith('+') ? 'text-green-600' : 'text-red-600',
      changeBg: change.startsWith('+') ? 'bg-green-100' : 'bg-red-100',
    },
    orange: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      changeColor: change.startsWith('+') ? 'text-green-600' : 'text-red-600',
      changeBg: change.startsWith('+') ? 'bg-green-100' : 'bg-red-100',
    },
    purple: {
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      changeColor: change.startsWith('+') ? 'text-green-600' : 'text-red-600',
      changeBg: change.startsWith('+') ? 'bg-green-100' : 'bg-red-100',
    },
    teal: {
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      changeColor: change.startsWith('+') ? 'text-green-600' : 'text-red-600',
      changeBg: change.startsWith('+') ? 'bg-green-100' : 'bg-red-100',
    },
    indigo: {
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      changeColor: change.startsWith('+') ? 'text-green-600' : 'text-red-600',
      changeBg: change.startsWith('+') ? 'bg-green-100' : 'bg-red-100',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", colors.iconBg)}>
          <Icon className={cn("h-5 w-5", colors.iconColor)} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", colors.changeColor, colors.changeBg)}>
              {change}
            </span>
            <span className="text-xs text-gray-500 ml-2">from last month</span>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full", {
              'bg-blue-500': color === 'blue',
              'bg-green-500': color === 'green',
              'bg-red-500': color === 'red',
              'bg-orange-500': color === 'orange',
              'bg-purple-500': color === 'purple',
              'bg-teal-500': color === 'teal',
              'bg-indigo-500': color === 'indigo',
            })}
            style={{ 
              width: Math.min(
                Math.abs(parseFloat(change.replace('%', ''))) * 2, 
                100
              ) + '%' 
            }}
          />
        </div>
      </div>
    </div>
  );
};