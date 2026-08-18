"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { SupervisorManagement } from "@/components/supervisors/SupervisorManagement"

export default function ManagerSupervisorsPage() {
  return (
    <AppLayout>
      <SupervisorManagement />
    </AppLayout>
  )
}
