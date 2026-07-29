"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardView } from "@/components/dashboard/DashboardView"

export default function AdminDashboard() {
  return (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  )
}
