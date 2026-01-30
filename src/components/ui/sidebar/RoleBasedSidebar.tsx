'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SidebarItem from './SidebarItems';
import { getGroupedSidebarItems } from '@/lib/constants/sidebar-items';
import { useAuth } from '@/context/AuthContext';

interface RoleBasedSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const RoleBasedSidebar: React.FC<RoleBasedSidebarProps> = ({ 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const { user } = useAuth();
  const role = user?.role || 'employee';
  
  // Get sidebar items grouped by section for this role
  const groupedItems = getGroupedSidebarItems(role);

  // Section titles mapping with proper typing
  const sectionTitles: Record<string, string> = {
    dashboard: 'DASHBOARD',
    management: 'MANAGEMENT',
    employees: 'EMPLOYEES',
    finance: 'FINANCE',
    payroll: 'PAYROLL',
    operations: 'OPERATIONS',
    personal: 'PERSONAL',
    attendance: 'ATTENDANCE & LEAVES',
    salary: 'SALARY',
    payments: 'PAYMENTS',
    tickets: 'TICKETS',
    campaigns: 'CAMPAIGNS',
    analytics: 'ANALYTICS',
    leads: 'LEADS',
    reports: 'REPORTS',
    support: 'SUPPORT',
    system: 'SYSTEM',
    communication: 'COMMUNICATION',
    other: 'OTHER',
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col",
        "bg-gray-900 text-white",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="font-bold text-white">ERP</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">
                {role.charAt(0).toUpperCase() + role.slice(1)} Panel
              </h2>
              <p className="text-xs text-gray-400">
                {user?.fullName || 'User'}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="font-bold text-white">ERP</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-700"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="px-4 py-2">
            {!isCollapsed && sectionTitles[section] && (
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {sectionTitles[section]}
              </p>
            )}
            <div className="space-y-1">
              {items.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Info at Bottom */}
      {!isCollapsed && user && (
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-white text-sm">
                {user.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {user.role} • {user.department || 'No Department'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};