// Utility to check route access programmatically

const ROLE_ROUTES = {
  admin: ['*'],
  hr: ['/hr', '/employee', '/dashboard', '/profile'],
  employee: ['/employee', '/dashboard', '/profile'],
  accounts: ['/accounts', '/finance', '/dashboard', '/profile'],
  support: ['/support', '/dashboard', '/profile'],
  marketing: ['/marketing', '/dashboard', '/profile'],
};

const SHARED_ROUTES = ['/profile', '/dashboard', '/notifications', '/help'];

export function canAccessRoute(userRole: string, pathname: string): boolean {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // Check shared routes
  if (SHARED_ROUTES.some(route => pathname.startsWith(route))) {
    return true;
  }
  
  // Check role-specific routes
  const allowedRoutes = [...(ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || []), ...SHARED_ROUTES];
  
  return allowedRoutes.some(route => {
    if (route === '*') return true;
    if (route.endsWith('/*')) {
      const base = route.slice(0, -2);
      return pathname.startsWith(base);
    }
    return pathname.startsWith(route);
  });
}

// Get all accessible routes for a role
export function getAccessibleRoutes(userRole: string): string[] {
  const roleRoutes = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || [];
  return [...new Set([...roleRoutes, ...SHARED_ROUTES])];
}

// Check if user can access multiple routes
export function canAccessMultipleRoutes(userRole: string, paths: string[]): boolean[] {
  return paths.map(path => canAccessRoute(userRole, path));
}

// Example usage in components:
/*
'use client';
import { canAccessRoute } from '@/lib/auth/route-access';
import { useAuth } from '@/context/AuthContext';

export default function SomeComponent() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const canAccessAdmin = canAccessRoute(user.role, '/admin/dashboard');
  const canAccessHR = canAccessRoute(user.role, '/hr/dashboard');
  
  return (
    <div>
      {canAccessAdmin && <a href="/admin/dashboard">Admin Dashboard</a>}
      {canAccessHR && <a href="/hr/dashboard">HR Dashboard</a>}
    </div>
  );
}
*/