'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getGroupedSidebarItems } from '@/lib/constants/sidebar-items';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface RoleBasedMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleBasedMobileSidebar: React.FC<RoleBasedMobileSidebarProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const role = user?.role || 'employee';
  const groupedItems = getGroupedSidebarItems(role);

  const handleItemClick = () => {
    onClose();
  };

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
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          "bg-gray-900 text-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
          <Link 
            href={`/${role}/dashboard`} 
            className="flex items-center space-x-2"
            onClick={handleItemClick}
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="font-bold">ERP</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">
                {role.charAt(0).toUpperCase() + role.slice(1)} Panel
              </h2>
              <p className="text-xs text-gray-400">
                {user?.fullName || 'User'}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className="px-4 py-2">
              {sectionTitles[section] && (
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  {sectionTitles[section]}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      handleItemClick();
                      window.location.href = item.href;
                    }}
                    className="w-full"
                  >
                    <div className="flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-800 hover:text-white text-gray-300 justify-start">
                      <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};