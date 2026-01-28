import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { FinanceDashboard } from '@/components/ui/dashboard/FinanceDashboard';

export default function FinanceDashboardPage() {
  return (
    <DashboardLayout>
      <FinanceDashboard />
    </DashboardLayout>
  );
}