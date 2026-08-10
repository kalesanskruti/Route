"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { GpsTrackingView } from "@/components/tracking/GpsTrackingView"

export default function AdminTrackingPage() {
  return (
    <AppLayout>
      <GpsTrackingView />
    </AppLayout>
  )
}
