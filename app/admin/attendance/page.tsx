"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { AttendanceView } from "@/components/attendance/AttendanceView"

export default function AdminAttendancePage() {
  return (
    <AppLayout>
      <AttendanceView />
    </AppLayout>
  )
}
