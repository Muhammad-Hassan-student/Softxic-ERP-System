import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { redirect } from 'next/navigation';

export interface AuthUser {
  userId: string;
  role: string;
  fullName?: string;
  email?: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

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
    };
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireRole(role: string): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    redirect(`/${user.role}/dashboard`);
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole('admin');
}

export async function requireHR(): Promise<AuthUser> {
  return requireRole('hr');
}

export async function requireEmployee(): Promise<AuthUser> {
  return requireRole('employee');
}

export async function hasRole(role: string): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === role;
}

export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const user = await getAuthUser();
  return roles.includes(user?.role || '');
}