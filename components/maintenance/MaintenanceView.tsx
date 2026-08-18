"use client"

import React, { useState, useMemo } from "react"
import {
  Wrench,
  Calendar,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bus,
  DollarSign,
  RefreshCw,
  Check,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export interface MaintenanceOrder {
  id: string
  workOrderNumber: string
  busNumber: string
  registrationNumber: string
  workshop: string
  serviceType: "PREVENTIVE" | "REPAIR" | "BATTERY_AUDIT" | "TIRE_SERVICE"
  date: string
  invoiceNumber: string
  partsReplaced: string
  cost: string
  costValue: number
  status: "COMPLETED" | "SCHEDULED" | "IN_WORKSHOP"
}

export function MaintenanceView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const initialOrders: MaintenanceOrder[] = [
    {
      id: "ord-1",
      workOrderNumber: "WO-2026-091",
      busNumber: "BUS-105",
      registrationNumber: "KA-01-EQ-4433",
      workshop: "Central EV Fleet Service Hub",
      serviceType: "PREVENTIVE",
      date: "04 Aug 2026",
      invoiceNumber: "PENDING",
      partsReplaced: "10,000 km Preventive Schedule (Brakes, Filter, Coolant)",
      cost: "₹16,500 (Est)",
      costValue: 16500,
      status: "IN_WORKSHOP",
    },
    {
      id: "ord-2",
      workOrderNumber: "WO-2026-092",
      busNumber: "BUS-103",
      registrationNumber: "KA-01-EQ-4425",
      workshop: "Ashok Leyland Service Depot",
      serviceType: "REPAIR",
      date: "06 Aug 2026",
      invoiceNumber: "PENDING",
      partsReplaced: "Front Suspension Bushing & Wheel Alignment",
      cost: "₹12,200 (Est)",
      costValue: 12200,
      status: "SCHEDULED",
    },
    {
      id: "ord-3",
      workOrderNumber: "WO-2026-088",
      busNumber: "BUS-107",
      registrationNumber: "KA-01-EQ-4448",
      workshop: "Eicher Authorized Workshop",
      serviceType: "PREVENTIVE",
      date: "10 Aug 2026",
      invoiceNumber: "PENDING",
      partsReplaced: "20,000 km Major Service & Fluid replacement",
      cost: "₹19,000 (Est)",
      costValue: 19000,
      status: "SCHEDULED",
    },
    {
      id: "ord-4",
      workOrderNumber: "WO-2026-081",
      busNumber: "BUS-101",
      registrationNumber: "KA-01-EQ-4421",
      workshop: "Tata EV Authorized Workshop",
      serviceType: "PREVENTIVE",
      date: "12 Jul 2026",
      invoiceNumber: "INV-2026-881",
      partsReplaced: "Brake Pads, Cabin Air Filter, Tire Rotation",
      cost: "₹14,200",
      costValue: 14200,
      status: "COMPLETED",
    },
    {
      id: "ord-5",
      workOrderNumber: "WO-2026-079",
      busNumber: "BUS-102",
      registrationNumber: "KA-01-EQ-4422",
      workshop: "Central EV Fleet Service Hub",
      serviceType: "BATTERY_AUDIT",
      date: "28 Jun 2026",
      invoiceNumber: "INV-2026-742",
      partsReplaced: "High-Voltage Thermal Sensor calibration",
      cost: "₹8,500",
      costValue: 8500,
      status: "COMPLETED",
    },
    {
      id: "ord-6",
      workOrderNumber: "WO-2026-074",
      busNumber: "BUS-106",
      registrationNumber: "KA-01-EQ-4440",
      workshop: "Tata EV Authorized Workshop",
      serviceType: "TIRE_SERVICE",
      date: "15 Jun 2026",
      invoiceNumber: "INV-2026-691",
      partsReplaced: "2x Rear Radial Commercial Tires replaced",
      cost: "₹34,000",
      costValue: 34000,
      status: "COMPLETED",
    },
  ]

  const [orders] = useState<MaintenanceOrder[]>(initialOrders)

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        ord.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.workshop.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedTypeFilter === "ALL" || ord.serviceType === selectedTypeFilter
      const matchesStatus = selectedStatusFilter === "ALL" || ord.status === selectedStatusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [orders, searchQuery, selectedTypeFilter, selectedStatusFilter])

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Fleet Maintenance &amp; Workshop Hub
            </h1>
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
              6 Due For Service
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Preventive service schedules, repair work orders, workshop invoice logs, and battery health audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.success("Exported complete workshop expenditure log as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Expenses</span>
          </Button>

          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Expense (YTD)</span>
            <div className="text-2xl font-extrabold text-foreground mt-1">₹5.62L</div>
            <span className="text-xs text-muted-foreground">Across 142 vehicles</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In Workshop Now</span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">2 Buses</div>
            <span className="text-xs text-muted-foreground">BUS-105 • BUS-112</span>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Wrench className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scheduled Due</span>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">6 Buses</div>
            <span className="text-xs text-muted-foreground">Within next 14 days</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed (YTD)</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">124 Work Orders</div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">0 Breakdowns</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bus, work order #, workshop, or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 rounded-xl border-border text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Service Type:</span>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Service Types</option>
                <option value="PREVENTIVE">Preventive Service</option>
                <option value="REPAIR">Repair Order</option>
                <option value="BATTERY_AUDIT">Battery Audit</option>
                <option value="TIRE_SERVICE">Tire &amp; Wheel</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Status</option>
                <option value="IN_WORKSHOP">In Workshop Now</option>
                <option value="SCHEDULED">Scheduled Due</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Work Orders Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-3.5 px-4">Work Order #</th>
                <th className="py-3.5 px-4">Bus &amp; Registration</th>
                <th className="py-3.5 px-4">Workshop &amp; Service Type</th>
                <th className="py-3.5 px-4">Service Date</th>
                <th className="py-3.5 px-4">Parts Replaced / Notes</th>
                <th className="py-3.5 px-4">Cost / Estimate</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-foreground">{ord.workOrderNumber}</td>
                  <td className="py-4 px-4">
                    <div className="font-mono font-bold text-foreground">{ord.busNumber}</div>
                    <div className="text-xs font-mono text-muted-foreground">{ord.registrationNumber}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-foreground block">{ord.serviceType}</span>
                    <span className="text-xs text-muted-foreground">{ord.workshop}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono">{ord.date}</td>
                  <td className="py-4 px-4 max-w-xs">
                    <div className="text-xs text-foreground font-medium line-clamp-2">
                      {ord.partsReplaced}
                    </div>
                    {ord.invoiceNumber !== "PENDING" && (
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                        Invoice: {ord.invoiceNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-foreground">{ord.cost}</td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        ord.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : ord.status === "SCHEDULED"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {ord.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
                      {ord.status === "SCHEDULED" && <Clock className="h-3 w-3" />}
                      {ord.status === "IN_WORKSHOP" && <Wrench className="h-3 w-3 animate-spin" />}
                      {ord.status === "COMPLETED" ? "Completed" : ord.status === "SCHEDULED" ? "Scheduled" : "Workshop"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button
                      onClick={() => toast.success(`Viewing official invoice & parts record for ${ord.workOrderNumber}`)}
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-xl text-xs font-semibold"
                    >
                      Job Card
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule Maintenance Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              Schedule Fleet Vehicle Maintenance
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Book workshop bay for preventive service or mechanical repair
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Select Fleet Bus</label>
              <select className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm">
                <option>BUS-108 (KA-01-EQ-4451) • 10,000 km Due</option>
                <option>BUS-107 (KA-01-EQ-4448) • Brake Inspection Due</option>
                <option>BUS-103 (KA-01-EQ-4425) • Battery Check</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Service Type</label>
                <select className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm">
                  <option>Preventive Schedule</option>
                  <option>Mechanical Repair</option>
                  <option>Battery Thermal Audit</option>
                  <option>Tire &amp; Suspension</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Service Date</label>
                <Input type="date" defaultValue="2026-08-10" className="rounded-xl border-border h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop Facility</label>
              <Input defaultValue="Central EV Fleet Service Hub #1" className="rounded-xl border-border h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Required Parts / Notes</label>
              <Input placeholder="e.g. Brake pads inspection & cabin air filter replacement" className="rounded-xl border-border h-9 text-sm" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsScheduleModalOpen(false)
                toast.success("Workshop maintenance scheduled and synced to Chief Mechanic dashboard!")
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              Book Workshop Bay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
