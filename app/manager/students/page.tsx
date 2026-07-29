"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { StudentManagement } from "@/components/students/StudentManagement"

export default function ManagerStudentsPage() {
  return (
    <AppLayout>
      <StudentManagement />
    </AppLayout>
  )
}
