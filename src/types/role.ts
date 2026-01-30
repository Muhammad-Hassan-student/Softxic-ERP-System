export type ModuleType = 
  | 'dashboard'
  | 'employee_management'
  | 'payments'
  | 'payroll'
  | 'reports'
  | 'attendance'
  | 'leaves'
  | 'tax'
  | 'inventory'
  | 'vendors'
  | 'invoices'
  | 'complaints'
  | 'credit_debit'
  | 'role_management'
  | 'user_management'
  | 'settings';

export interface Permission {
  module: ModuleType;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
  approve?: boolean;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleConfig {
  id: ModuleType;
  name: string;
  description: string;
  icon: string;
  category: 'management' | 'operations' | 'finance' | 'system';
}

export const MODULES_CONFIG: ModuleConfig[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Access to dashboard overview',
    icon: 'LayoutDashboard',
    category: 'system'
  },
  {
    id: 'employee_management',
    name: 'Employee Management',
    description: 'Manage employee records, salaries, and details',
    icon: 'Users',
    category: 'management'
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Process employee payments and salary disbursement',
    icon: 'CreditCard',
    category: 'finance'
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Manage payroll processing and calculations',
    icon: 'FileText',
    category: 'finance'
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Generate and view various reports',
    icon: 'BarChart3',
    category: 'operations'
  },
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Track employee attendance and timings',
    icon: 'Calendar',
    category: 'operations'
  },
  {
    id: 'leaves',
    name: 'Leaves',
    description: 'Manage employee leaves and approvals',
    icon: 'CalendarOff',
    category: 'operations'
  },
  {
    id: 'tax',
    name: 'Tax Management',
    description: 'Handle tax deductions and calculations',
    icon: 'Percent',
    category: 'finance'
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Manage company inventory and stock',
    icon: 'Package',
    category: 'operations'
  },
  {
    id: 'vendors',
    name: 'Vendors',
    description: 'Manage vendor information and payments',
    icon: 'Truck',
    category: 'operations'
  },
  {
    id: 'invoices',
    name: 'Invoices',
    description: 'Create and manage invoices',
    icon: 'Receipt',
    category: 'finance'
  },
  {
    id: 'complaints',
    name: 'Complaints',
    description: 'Handle customer and employee complaints',
    icon: 'Flag',
    category: 'operations'
  },
  {
    id: 'credit_debit',
    name: 'Credit/Debit',
    description: 'Manage credit and debit transactions',
    icon: 'Wallet',
    category: 'finance'
  },
  {
    id: 'role_management',
    name: 'Role Management',
    description: 'Manage user roles and permissions',
    icon: 'Shield',
    category: 'system'
  },
  {
    id: 'user_management',
    name: 'User Management',
    description: 'Manage system users and access',
    icon: 'UserCog',
    category: 'system'
  },
  {
    id: 'settings',
    name: 'System Settings',
    description: 'Configure system settings',
    icon: 'Settings',
    category: 'system'
  }
];