import { ComplianceManagement } from "@/components/compliance/ComplianceManagement";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AdminCompliancePage() {
  return (
    <AppLayout>
      <div className="p-6">
        <ComplianceManagement />
      </div>
    </AppLayout>
  );
}
