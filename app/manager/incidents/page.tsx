"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { IncidentManagement } from "@/components/incidents/IncidentManagement"

export default function ManagerIncidentsPage() {
  return (
    <AppLayout>
      <IncidentManagement />
    </AppLayout>
  )
}
