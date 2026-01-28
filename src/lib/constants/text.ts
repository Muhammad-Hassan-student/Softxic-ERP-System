export const DASHBOARD_TEXTS = {
  // Header
  header: {
    title: 'ERP Admin Dashboard',
    welcome: 'Welcome back,',
    searchPlaceholder: 'Search modules, reports...',
  },
  
  // Sidebar
  sidebar: {
    title: 'ERP System',
    subtitle: 'v2.0.0',
    mainMenu: 'MAIN MENU',
    modules: 'MODULES',
    reports: 'REPORTS',
    system: 'SYSTEM',
  },
  
  // Navigation items
  navItems: {
    dashboard: {
      admin: 'Admin Dashboard',
      hr: 'HR Dashboard',
      finance: 'Finance Dashboard',
      support: 'Support Dashboard',
      marketing: 'Marketing Dashboard',
      user: 'User Dashboard',
    },
    modules: {
      users: 'Users',
      roleManagement: 'Role Management',
      inventory: 'Inventory',
      vendors: 'Vendors',
      expenses: 'Expenses',
      invoice: 'Invoice',
      payments: 'Payments',
      collections: 'Collections',
      tax: 'Tax Management',
      creditDebit: 'Credit/Debit',
      complaints: 'Complaints',
      reports: 'Reports',
    },
    system: {
      settings: 'Settings',
      help: 'Help & Support',
      documentation: 'Documentation',
      logout: 'Logout',
    },
  },
  
  // Dashboard content
  dashboard: {
    stats: {
      totalUsers: 'Total Users',
      activeSessions: 'Active Sessions',
      pendingTasks: 'Pending Tasks',
      revenue: 'Revenue',
      growth: 'Growth',
      completion: 'Completion Rate',
    },
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    upcomingTasks: 'Upcoming Tasks',
    systemHealth: 'System Health',
  },
} as const;