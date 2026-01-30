'use client';

import React, { useState } from 'react';
import { RoleBasedSidebar } from '@/components/ui/sidebar/RoleBasedSidebar';
import { RoleBasedMobileSidebar } from '@/components/ui/sidebar/RoleBasedMobileSidebar';
import Header  from '@/components/ui/header/Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Role-Based Sidebar */}
      <div className="hidden lg:block">
        <RoleBasedSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Mobile Role-Based Sidebar */}
      <RoleBasedMobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "lg:ml-64",
          isSidebarCollapsed && "lg:ml-20"
        )}
      >
        <Header toggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};