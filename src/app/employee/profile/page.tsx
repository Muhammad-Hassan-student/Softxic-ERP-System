import ProfilePage from '@/app/[role]/profile/page';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
export default function EmployeeProfilePage() {
  return <ProfilePage />;
}