import { Metadata } from 'next';
import AdminDashboardContent from './AdminDashboardContent';
import { requireAuth, requireRole } from '@/lib/auth/server-auth';
// Server component mein yeh line add karo
export const dynamic = 'force-dynamic';

// Ya phir yeh:
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrator dashboard',
};

export default async function AdminDashboardPage() {
    const cookieStore = cookies(); // ✅ Server component mein cookies use karo

  // Server-side auth check
  const user = await requireAuth();
  await requireRole('admin');

  return <AdminDashboardContent user={user} />;
}