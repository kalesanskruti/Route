"use client"

import { useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { BusDetailsView } from "@/components/buses/BusDetailsView"

export default function AdminBusDetailsPage() {
  const params = useParams()
  const busId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "bus-1"

  return (
    <AppLayout>
      <BusDetailsView busId={busId} />
    </AppLayout>
  )
}
