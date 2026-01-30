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
  Percent,
  Calendar,
  Bell,
  Home,
  PieChart,
  TrendingUp,
  MessageSquare,
  Target,
  FolderOpen,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react';

export interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  roles: string[]; // Which roles can see this item
  section?: string;
}

export const SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  // ADMIN SIDEBAR ITEMS
  admin: [
    // Dashboard Section
    {
      icon: LayoutDashboard,
      label: 'Admin Dashboard',
      href: '/admin/dashboard',
      roles: ['admin'],
      section: 'dashboard',
    },
    {
      icon: Briefcase,
      label: 'HR Dashboard',
      href: '/hr/dashboard',
      roles: ['admin'],
      section: 'dashboard',
    },
    {
      icon: DollarSign,
      label: 'Finance Dashboard',
      href: '/finance/dashboard',
      roles: ['admin'],
      section: 'dashboard',
    },
    {
      icon: Headphones,
      label: 'Support Dashboard',
      href: '/support/dashboard',
      roles: ['admin'],
      section: 'dashboard',
    },
    {
      icon: Megaphone,
      label: 'Marketing Dashboard',
      href: '/marketing/dashboard',
      roles: ['admin'],
      section: 'dashboard',
    },

    // Management Section
    {
      icon: Users,
      label: 'User Management',
      href: '/admin/users',
      roles: ['admin'],
      section: 'management',
    },
    {
      icon: Shield,
      label: 'Role Management',
      href: '/admin/roles',
      roles: ['admin'],
      section: 'management',
    },
    {
      icon: Briefcase,
      label: 'Employee Management',
      href: '/admin/employees',
      roles: ['admin'],
      section: 'management',
    },

    // Finance Section
    {
      icon: CreditCard,
      label: 'Payments',
      href: '/admin/payments',
      roles: ['admin'],
      section: 'finance',
    },
    {
      icon: FileText,
      label: 'Payroll',
      href: '/admin/payroll',
      roles: ['admin'],
      section: 'finance',
    },
    {
      icon: Percent,
      label: 'Tax Management',
      href: '/admin/tax',
      roles: ['admin'],
      section: 'finance',
    },
    {
      icon: Receipt,
      label: 'Invoices',
      href: '/admin/invoices',
      roles: ['admin'],
      section: 'finance',
    },
    {
      icon: Wallet,
      label: 'Collections',
      href: '/admin/collections',
      roles: ['admin'],
      section: 'finance',
    },

    // Operations Section
    {
      icon: Package,
      label: 'Inventory',
      href: '/admin/inventory',
      roles: ['admin'],
      section: 'operations',
    },
    {
      icon: Truck,
      label: 'Vendors',
      href: '/admin/vendors',
      roles: ['admin'],
      section: 'operations',
    },

    // System Section
    {
      icon: Settings,
      label: 'System Settings',
      href: '/admin/settings',
      roles: ['admin'],
      section: 'system',
    },
    {
      icon: BarChart3,
      label: 'Analytics & Reports',
      href: '/admin/reports',
      roles: ['admin'],
      section: 'system',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/admin/help',
      roles: ['admin'],
      section: 'system',
    },
  ],

  // HR SIDEBAR ITEMS
  hr: [
    // Dashboard
    {
      icon: LayoutDashboard,
      label: 'HR Dashboard',
      href: '/hr/dashboard',
      roles: ['hr'],
      section: 'dashboard',
    },

    // Employee Management
    {
      icon: Users,
      label: 'Employees',
      href: '/hr/employees',
      roles: ['hr'],
      section: 'employees',
    },
    {
      icon: User,
      label: 'Add Employee',
      href: '/hr/employees/add',
      roles: ['hr'],
      section: 'employees',
    },
    {
      icon: Calendar,
      label: 'Attendance',
      href: '/hr/attendance',
      roles: ['hr'],
      section: 'employees',
    },
    {
      icon: CheckCircle,
      label: 'Leave Management',
      href: '/hr/leaves',
      roles: ['hr'],
      section: 'employees',
    },

    // Payroll
    {
      icon: DollarSign,
      label: 'Payroll Processing',
      href: '/hr/payroll',
      roles: ['hr'],
      section: 'payroll',
    },
    {
      icon: CreditCard,
      label: 'Salary Payments',
      href: '/hr/payments',
      roles: ['hr'],
      section: 'payroll',
    },

    // Reports
    {
      icon: BarChart3,
      label: 'HR Reports',
      href: '/hr/reports',
      roles: ['hr'],
      section: 'reports',
    },
    {
      icon: PieChart,
      label: 'Analytics',
      href: '/hr/analytics',
      roles: ['hr'],
      section: 'reports',
    },

    // System
    {
      icon: Settings,
      label: 'HR Settings',
      href: '/hr/settings',
      roles: ['hr'],
      section: 'system',
    },
  ],

  // EMPLOYEE SIDEBAR ITEMS
  employee: [
    // Dashboard
    {
      icon: LayoutDashboard,
      label: 'My Dashboard',
      href: '/employee/dashboard',
      roles: ['employee'],
      section: 'dashboard',
    },

    // Personal
    {
      icon: User,
      label: 'My Profile',
      href: '/employee/profile',
      roles: ['employee'],
      section: 'personal',
    },
    {
      icon: FileText,
      label: 'Documents',
      href: '/employee/documents',
      roles: ['employee'],
      section: 'personal',
    },

    // Attendance & Leaves
    {
      icon: Calendar,
      label: 'Attendance',
      href: '/employee/attendance',
      roles: ['employee'],
      section: 'attendance',
    },
    {
      icon: CheckCircle,
      label: 'Leave Request',
      href: '/employee/leaves',
      roles: ['employee'],
      section: 'attendance',
    },

    // Salary
    {
      icon: DollarSign,
      label: 'Salary Slips',
      href: '/employee/salary',
      roles: ['employee'],
      section: 'salary',
    },
    {
      icon: CreditCard,
      label: 'Payment History',
      href: '/employee/payments',
      roles: ['employee'],
      section: 'salary',
    },

    // Support
    {
      icon: HelpCircle,
      label: 'Help Desk',
      href: '/employee/support',
      roles: ['employee'],
      section: 'support',
    },
  ],

  // FINANCE SIDEBAR ITEMS
  finance: [
    {
      icon: LayoutDashboard,
      label: 'Finance Dashboard',
      href: '/finance/dashboard',
      roles: ['accounts'],
      section: 'dashboard',
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      href: '/finance/revenue',
      roles: ['accounts'],
      section: 'management',
    },
    {
      icon: TrendingUp,
      label: 'Expenses',
      href: '/finance/expenses',
      roles: ['accounts'],
      section: 'management',
    },
    {
      icon: PieChart,
      label: 'Profit & Loss',
      href: '/finance/profit-loss',
      roles: ['accounts'],
      section: 'management',
    },
    {
      icon: CreditCard,
      label: 'Payments',
      href: '/finance/payments',
      roles: ['accounts'],
      section: 'payments',
    },
    {
      icon: FileText,
      label: 'Invoices',
      href: '/finance/invoices',
      roles: ['accounts'],
      section: 'payments',
    },
    {
      icon: Percent,
      label: 'Tax',
      href: '/finance/tax',
      roles: ['accounts'],
      section: 'payments',
    },
    {
      icon: BarChart3,
      label: 'Reports',
      href: '/finance/reports',
      roles: ['accounts'],
      section: 'reports',
    },
  ],

  // SUPPORT SIDEBAR ITEMS
  support: [
    {
      icon: LayoutDashboard,
      label: 'Support Dashboard',
      href: '/support/dashboard',
      roles: ['support'],
      section: 'dashboard',
    },
    {
      icon: Headphones,
      label: 'Tickets',
      href: '/support/tickets',
      roles: ['support'],
      section: 'tickets',
    },
    {
      icon: Flag,
      label: 'Complaints',
      href: '/support/complaints',
      roles: ['support'],
      section: 'tickets',
    },
    {
      icon: MessageSquare,
      label: 'Live Chat',
      href: '/support/chat',
      roles: ['support'],
      section: 'communication',
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/support/notifications',
      roles: ['support'],
      section: 'communication',
    },
    {
      icon: BarChart3,
      label: 'Reports',
      href: '/support/reports',
      roles: ['support'],
      section: 'reports',
    },
  ],

  // MARKETING SIDEBAR ITEMS
  marketing: [
    {
      icon: LayoutDashboard,
      label: 'Marketing Dashboard',
      href: '/marketing/dashboard',
      roles: ['marketing'],
      section: 'dashboard',
    },
    {
      icon: Target,
      label: 'Campaigns',
      href: '/marketing/campaigns',
      roles: ['marketing'],
      section: 'campaigns',
    },
    {
      icon: Megaphone,
      label: 'Promotions',
      href: '/marketing/promotions',
      roles: ['marketing'],
      section: 'campaigns',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/marketing/analytics',
      roles: ['marketing'],
      section: 'analytics',
    },
    {
      icon: PieChart,
      label: 'Reports',
      href: '/marketing/reports',
      roles: ['marketing'],
      section: 'analytics',
    },
    {
      icon: Users,
      label: 'Leads',
      href: '/marketing/leads',
      roles: ['marketing'],
      section: 'leads',
    },
  ],
};

// Common items for all roles (logout, help, etc.)
export const COMMON_ITEMS: SidebarItem[] = [
  {
    icon: HelpCircle,
    label: 'Help & Support',
    href: '/help',
    roles: ['admin', 'hr', 'employee', 'accounts', 'support', 'marketing'],
    section: 'system',
  },
  {
    icon: BookOpen,
    label: 'Documentation',
    href: '/docs',
    roles: ['admin', 'hr', 'employee', 'accounts', 'support', 'marketing'],
    section: 'system',
  },
  {
    icon: LogOut,
    label: 'Logout',
    href: '/logout',
    roles: ['admin', 'hr', 'employee', 'accounts', 'support', 'marketing'],
    section: 'system',
  },
];

// Get sidebar items for specific role
export function getSidebarItems(role: string): SidebarItem[] {
  const roleItems = SIDEBAR_ITEMS[role] || [];
  const commonItems = COMMON_ITEMS.filter(item => item.roles.includes(role));
  
  return [...roleItems, ...commonItems];
}

// Get items grouped by section
export function getGroupedSidebarItems(role: string): Record<string, SidebarItem[]> {
  const items = getSidebarItems(role);
  const grouped: Record<string, SidebarItem[]> = {};
  
  items.forEach(item => {
    const section = item.section || 'other';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(item);
  });
  
  return grouped;
}