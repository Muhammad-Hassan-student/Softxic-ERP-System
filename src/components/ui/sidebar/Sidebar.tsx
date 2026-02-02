'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Briefcase,
  DollarSign,
  Headphones,
  Megaphone,
  User,
  Shield,
  Truck,
  Receipt,
  Wallet,
  Flag,
  Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_TEXTS } from '@/lib/constants/text';
import  SidebarItem  from './SidebarItems';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const dashboardItems = [
    { icon: LayoutDashboard, label: DASHBOARD_TEXTS.navItems.dashboard.admin, href: '/admin/dashboard' },
    { icon: Briefcase, label: DASHBOARD_TEXTS.navItems.dashboard.hr, href: '/admin/dashboard/employee-management' },
    { icon: DollarSign, label: DASHBOARD_TEXTS.navItems.dashboard.finance, href: '/finance/dashboard' },
    { icon: Headphones, label: DASHBOARD_TEXTS.navItems.dashboard.support, href: '/support/dashboard' },
    { icon: Megaphone, label: DASHBOARD_TEXTS.navItems.dashboard.marketing, href: '/marketing/dashboard' },
    { icon: User, label: DASHBOARD_TEXTS.navItems.dashboard.user, href: '/user/dashboard' },
  ];

  const moduleItems = [
    { icon: Users, label: DASHBOARD_TEXTS.navItems.modules.users, href: '/modules/users' },
    { icon: Shield, label: DASHBOARD_TEXTS.navItems.modules.roleManagement, href: '/modules/role-management' },
    { icon: Package, label: DASHBOARD_TEXTS.navItems.modules.inventory, href: '/modules/inventory' },
    { icon: Truck, label: DASHBOARD_TEXTS.navItems.modules.vendors, href: '/modules/vendors' },
    { icon: CreditCard, label: DASHBOARD_TEXTS.navItems.modules.expenses, href: '/modules/expenses' },
    { icon: Receipt, label: DASHBOARD_TEXTS.navItems.modules.invoice, href: '/modules/invoice' },
    { icon: Wallet, label: DASHBOARD_TEXTS.navItems.modules.payments, href: '/modules/payments' },
    { icon: FileText, label: DASHBOARD_TEXTS.navItems.modules.collections, href: '/modules/collections' },
    { icon: Percent, label: DASHBOARD_TEXTS.navItems.modules.tax, href: '/modules/tax' },
    { icon: CreditCard, label: DASHBOARD_TEXTS.navItems.modules.creditDebit, href: '/modules/credit-debit' },
    { icon: Flag, label: DASHBOARD_TEXTS.navItems.modules.complaints, href: '/modules/complaints' },
    { icon: BarChart3, label: DASHBOARD_TEXTS.navItems.modules.reports, href: '/modules/reports' },
  ];

  const systemItems = [
    { icon: Settings, label: DASHBOARD_TEXTS.navItems.system.settings, href: '/system/settings' },
    { icon: HelpCircle, label: DASHBOARD_TEXTS.navItems.system.help, href: '/system/help' },
    { icon: BookOpen, label: DASHBOARD_TEXTS.navItems.system.documentation, href: '/system/docs' },
    { icon: LogOut, label: DASHBOARD_TEXTS.navItems.system.logout, href: '/logout' },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-gray-900 text-white",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-erp-primary flex items-center justify-center">
              <span className="font-bold">ERP</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">{DASHBOARD_TEXTS.sidebar.title}</h2>
              <p className="text-xs text-gray-400">{DASHBOARD_TEXTS.sidebar.subtitle}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-erp-primary flex items-center justify-center">
              <span className="font-bold">ERP</span>
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
      <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">
        {/* Dashboard Section */}
        <div className="px-4 py-2">
          {!isCollapsed && (
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {DASHBOARD_TEXTS.sidebar.mainMenu}
            </p>
          )}
          <div className="space-y-1">
            {dashboardItems.map((item) => (
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

        {/* Modules Section */}
        <div className="px-4 py-2">
          {!isCollapsed && (
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {DASHBOARD_TEXTS.sidebar.modules}
            </p>
          )}
          <div className="space-y-1">
            {moduleItems.map((item) => (
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

        {/* System Section */}
        <div className="px-4 py-2">
          {!isCollapsed && (
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {DASHBOARD_TEXTS.sidebar.system}
            </p>
          )}
          <div className="space-y-1">
            {systemItems.map((item) => (
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
      </div>
    </aside>
  );
};