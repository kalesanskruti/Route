import { MaintenanceManagement } from "@/components/maintenance/MaintenanceManagement";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AdminMaintenancePage() {
  return (
    <AppLayout>
      <div className="p-6">
        <MaintenanceManagement />
      </div>
    </AppLayout>
  );
}
