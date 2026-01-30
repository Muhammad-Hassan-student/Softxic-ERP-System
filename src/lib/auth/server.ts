import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';

export interface AuthUser {
  userId: string;
  role: string;
  fullName?: string;
  email?: string;
}

// Get authenticated user from request
export async function getAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  try {
    let token: string | undefined;

    if (request) {
      // Get token from request headers
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Get token from cookies in request
        const cookieStore = await cookies();
        token = cookieStore.get('token')?.value;
      }
    } else {
      // Get token from server cookies
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value;
    }

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
    //   fullName: decoded.fullName,
    //   email: decoded.email,
    };
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return !!user;
}

// Check if user has specific role
export async function hasRole(role: string): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === role;
}

// Check if user has any of the specified roles
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const user = await getAuthUser();
  return roles.includes(user?.role || '');
}

// Require authentication middleware
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

// Require specific role
export async function requireRole(role: string) {
  const user = await requireAuth();
  if (user.role !== role) {
    redirect(`/${user.role}/dashboard`);
  }
  return user;
}

// Require admin role
export async function requireAdmin() {
  return requireRole('admin');
}

// Require HR role
export async function requireHR() {
  return requireRole('hr');
}

// Require employee role
export async function requireEmployee() {
  return requireRole('employee');
}

// Get user permissions based on role
export async function getUserPermissions() {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  // This would typically fetch from database
  // For now, return basic permissions based on role
  const rolePermissions: Record<string, any> = {
    admin: {
      dashboard: { view: true, create: true, edit: true, delete: true },
      employee_management: { view: true, create: true, edit: true, delete: true },
      payments: { view: true, create: true, edit: true, delete: true },
      payroll: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true },
      role_management: { view: true, create: true, edit: true, delete: true },
    },
    hr: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      employee_management: { view: true, create: true, edit: true, delete: false },
      payments: { view: true, create: true, edit: true, delete: false },
      payroll: { view: true, create: true, edit: true, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      role_management: { view: false, create: false, edit: false, delete: false },
    },
    employee: {
      dashboard: { view: true, create: false, edit: false, delete: false },
      employee_management: { view: false, create: false, edit: false, delete: false },
      payments: { view: false, create: false, edit: false, delete: false },
    },
  };

  return rolePermissions[user.role] || {};
}

// Check if user has permission for specific module
export async function hasPermission(module: string, action: string): Promise<boolean> {
  const permissions = await getUserPermissions();
  if (!permissions) {
    return false;
  }

  const modulePermissions = permissions[module];
  if (!modulePermissions) {
    return false;
  }

  return modulePermissions[action] === true;
}