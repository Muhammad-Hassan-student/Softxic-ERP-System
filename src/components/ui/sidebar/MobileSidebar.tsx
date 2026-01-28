'use client';

import React from 'react';
import { 
  X,
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
import { Button } from '@/components/ui/button';
import  SidebarItem  from './SidebarItems';
import { cn } from '@/lib/utils';
import { DASHBOARD_TEXTS } from '@/lib/constants/text';
import Link from 'next/link';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const dashboardItems = [
    { icon: LayoutDashboard, label: DASHBOARD_TEXTS.navItems.dashboard.admin, href: '/admin/dashboard' },
    { icon: Briefcase, label: DASHBOARD_TEXTS.navItems.dashboard.hr, href: '/hr/dashboard' },
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

  const handleItemClick = () => {
    onClose();
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

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          "bg-erp-sidebar text-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center space-x-2"
            onClick={handleItemClick}
          >
            <div className="h-8 w-8 rounded-lg bg-erp-primary flex items-center justify-center">
              <span className="font-bold">ERP</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">{DASHBOARD_TEXTS.sidebar.title}</h2>
              <p className="text-xs text-gray-400">{DASHBOARD_TEXTS.sidebar.subtitle}</p>
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
          {/* Dashboard Section */}
          <div className="px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {DASHBOARD_TEXTS.sidebar.mainMenu}
            </p>
            <div className="space-y-1">
              {dashboardItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    handleItemClick();
                    // You would typically use router.push here
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

          {/* Modules Section */}
          <div className="px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {DASHBOARD_TEXTS.sidebar.modules}
            </p>
            <div className="space-y-1">
              {moduleItems.map((item) => (
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

          {/* System Section */}
          <div className="px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {DASHBOARD_TEXTS.sidebar.system}
            </p>
            <div className="space-y-1">
              {systemItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    handleItemClick();
                    if (item.href === '/logout') {
                      // Handle logout logic
                      console.log('Logout clicked');
                    } else {
                      window.location.href = item.href;
                    }
                  }}
                  className="w-full"
                >
                  <div className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-800 hover:text-white ${item.href === '/logout' ? 'text-red-400' : 'text-gray-300'} justify-start`}>
                    <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Info (Bottom) */}
          <div className="mt-auto px-4 py-6 border-t border-gray-700">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-erp-primary flex items-center justify-center">
                <span className="font-bold text-white">JD</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};