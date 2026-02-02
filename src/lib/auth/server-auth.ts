import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';

export interface AuthUser {
  userId: string;
  role: string;
  fullName?: string;
  email?: string;
  department?: string;
  profilePhoto?: string;
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

    // Get complete user data from database
    await connectDB();
    const user = await User.findById(decoded.userId)
      .select('fullName email role department profilePhoto')
      .lean();

    if (!user) {
      return null;
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      profilePhoto: user.profilePhoto,
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