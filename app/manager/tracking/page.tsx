"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { GpsTrackingView } from "@/components/tracking/GpsTrackingView"

export default function ManagerTrackingPage() {
  return (
    <AppLayout>
      <GpsTrackingView />
    </AppLayout>
  )
}
