import { Metadata } from 'next';
import EmployeeDashboardContent from './EmployeeDashboardContent';
import { requireAuth, requireRole } from '@/lib/auth/server-auth';

export const metadata: Metadata = {
  title: 'Employee Dashboard',
  description: 'Employee dashboard',
};
export const dynamic = 'force-dynamic';

export default async function EmployeeDashboardPage() {
  const user = await requireAuth();
  await requireRole('employee');

  return <EmployeeDashboardContent user={user} />;
}