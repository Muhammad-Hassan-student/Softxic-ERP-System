import { Metadata } from 'next';
import AdminDashboardContent from './AdminDashboardContent';
import { requireAuth, requireRole } from '@/lib/auth/server-auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrator dashboard',
};

export default async function AdminDashboardPage() {
  // Server-side auth check
  const user = await requireAuth();
  await requireRole('admin');

  return <AdminDashboardContent user={user} />;
}