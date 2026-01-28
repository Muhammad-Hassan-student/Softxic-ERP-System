'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar/Sidebar';
import Header  from '@/components/ui/header/Header';
import { MobileSidebar } from '@/components/ui/sidebar/MobileSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
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
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}