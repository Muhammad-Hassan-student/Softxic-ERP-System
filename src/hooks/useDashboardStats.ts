// hooks/useDashboardStats.ts
'use client';

import { useState, useEffect } from 'react';
import { DASHBOARD_TEXTS } from '@/lib/constants/text';

export function useDashboardStats() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    {
      title: DASHBOARD_TEXTS.dashboard.stats.totalUsers,
      value: '1,248',
      change: '+12.5%',
      icon: 'users' as const,
      color: 'blue' as const,
    },
    {
      title: DASHBOARD_TEXTS.dashboard.stats.activeSessions,
      value: '342',
      change: '+5.2%',
      icon: 'activity' as const,
      color: 'green' as const,
    },
    {
      title: DASHBOARD_TEXTS.dashboard.stats.pendingTasks,
      value: '42',
      change: '-3.1%',
      icon: 'alertCircle' as const,
      color: 'orange' as const,
    },
    {
      title: DASHBOARD_TEXTS.dashboard.stats.revenue,
      value: '$124,580',
      change: '+18.7%',
      icon: 'trendingUp' as const,
      color: 'purple' as const,
    },
    {
      title: DASHBOARD_TEXTS.dashboard.stats.completion,
      value: '89%',
      change: '+4.2%',
      icon: 'checkCircle' as const,
      color: 'teal' as const,
    },
    {
      title: 'Inventory Items',
      value: '4,872',
      change: '+2.3%',
      icon: 'package' as const,
      color: 'indigo' as const,
    },
  ]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { stats, isLoading };
}