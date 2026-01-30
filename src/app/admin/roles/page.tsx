import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import RoleList from '@/components/role-management/RoleList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Role Management | ERP System',
  description: 'Manage user roles and permissions',
};

export default function RoleManagementPage() {
  return (
    <DashboardLayout>
      <RoleList />
    </DashboardLayout>
  );
}