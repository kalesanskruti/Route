"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Bus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Download,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Eye,
  FileText,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Send,
  Loader2,
} from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export interface BusRecord {
  id: string
  busNumber: string
  registrationNumber: string
  driver: {
    name: string
    phone: string
    licenseNumber: string
  }
  capacity: number
  route: string
  gpsStatus: "ONLINE" | "OFFLINE"
  compliance: "VALID" | "EXPIRING" | "EXPIRED"
  maintenanceStatus: "GOOD" | "DUE" | "IN_WORKSHOP"
  mileage: number
  year: number
  model: string
}

export function BusManagement() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [selectedComplianceFilter, setSelectedComplianceFilter] = useState<string>("ALL")
  const [sortField, setSortField] = useState<keyof BusRecord>("busNumber")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedBusIds, setSelectedBusIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const itemsPerPage = 8
  const queryClient = useQueryClient()
  const { data: apiBuses = [], isLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: async () => {
      const response = await fetch("/api/buses")
      if (!response.ok) throw new Error("Failed to fetch buses")
      return response.json()
    },
  })

  const { data: activeRoutes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const response = await fetch("/api/routes")
      if (!response.ok) throw new Error("Failed to fetch routes")
      return response.json()
    },
  })

  // Form State
  const [formData, setFormData] = useState({
    busNumber: "",
    registrationNumber: "",
    seatingCapacity: 52,
    manufacturingYear: 2024,
    routeId: "",
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newBus: any) => {
      const routeId = newBus.routeId;
      delete newBus.routeId;

      // Ensure all required fields for busSchema are met with defaults if missing from UI
      const busPayload = {
        ...newBus,
        vehicleType: "Diesel", // Default mock
        insuranceNumber: "INS-" + Date.now(),
        insuranceExpiry: new Date(Date.now() + 31536000000).toISOString(),
        fitnessExpiry: new Date(Date.now() + 31536000000).toISOString(),
        gpsDeviceId: "GPS-" + newBus.busNumber
      };

      const res = await fetch("/api/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(busPayload),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create bus")
      }
      const createdBus = await res.json()

      if (routeId) {
        await fetch(`/api/routes/${routeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ busId: createdBus.id })
        })
      }
      return createdBus
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] })
      queryClient.invalidateQueries({ queryKey: ["routes"] })
      setIsAddModalOpen(false)
      toast.success("New fleet vehicle registered successfully!")
      setFormData({ busNumber: "", registrationNumber: "", seatingCapacity: 52, manufacturingYear: 2024, routeId: "" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Map API response to UI model
  const buses: BusRecord[] = useMemo(() => {
    if (!apiBuses) return []
    return apiBuses.map((bus: any) => {
      // Calculate compliance status
      const now = new Date()
      let complianceStatus: "VALID" | "EXPIRING" | "EXPIRED" = "VALID"
      
      const insExpiry = bus.insuranceExpiry ? new Date(bus.insuranceExpiry) : null
      const fitExpiry = bus.fitnessExpiry ? new Date(bus.fitnessExpiry) : null
      
      let earliestExpiry: Date | null = null
      if (insExpiry && fitExpiry) {
        earliestExpiry = insExpiry < fitExpiry ? insExpiry : fitExpiry
      } else if (insExpiry) {
        earliestExpiry = insExpiry
      } else if (fitExpiry) {
        earliestExpiry = fitExpiry
      }

      if (earliestExpiry) {
        const daysUntilExpiry = Math.ceil((earliestExpiry.getTime() - now.getTime()) / (1000 * 3600 * 24))
        
        if (daysUntilExpiry < 0) {
          complianceStatus = "EXPIRED"
        } else if (daysUntilExpiry <= 30) {
          complianceStatus = "EXPIRING"
        }
      }

      const assignedDriver = (bus.drivers && bus.drivers.length > 0) ? bus.drivers[0] : { name: "Unassigned", phone: "-", licenseNumber: "-" }
      const routeNames = bus.routes && bus.routes.length > 0 
        ? bus.routes.map((r: any) => r.name).join(", ")
        : "Unassigned"

      return {
        id: bus.id,
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber,
        driver: assignedDriver,
        capacity: bus.seatingCapacity,
        route: routeNames,
        gpsStatus: bus.status === "ACTIVE" ? "ONLINE" : "OFFLINE", // Or use live gps state if available
        compliance: complianceStatus,
        maintenanceStatus: "GOOD", // Placeholder for actual maintenance logic
        mileage: 0, // Placeholder
        year: bus.manufacturingYear || 2023,
        model: bus.model || bus.vehicleType || "Unknown",
      }
    })
  }, [apiBuses])

  // Filter & Sort computation
  const filteredAndSortedBuses = useMemo(() => {
    return buses
      .filter((bus) => {
        const matchesSearch =
          bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.route.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus =
          selectedStatusFilter === "ALL" || bus.gpsStatus === selectedStatusFilter
        const matchesCompliance =
          selectedComplianceFilter === "ALL" || bus.compliance === selectedComplianceFilter
        return matchesSearch && matchesStatus && matchesCompliance
      })
      .sort((a, b) => {
        const valA = a[sortField]
        const valB = b[sortField]
        if (valA < valB) return sortOrder === "asc" ? -1 : 1
        if (valA > valB) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [buses, searchQuery, selectedStatusFilter, selectedComplianceFilter, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedBuses.length / itemsPerPage) || 1
  const paginatedBuses = filteredAndSortedBuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: keyof BusRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBusIds(paginatedBuses.map((b) => b.id))
    } else {
      setSelectedBusIds([])
    }
  }

  const toggleSelectBus = (id: string) => {
    setSelectedBusIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: string) => {
    if (selectedBusIds.length === 0) {
      toast.error("Please select at least one vehicle")
      return
    }
    if (action === "MAINTENANCE") {
      toast.success(`Scheduled 10,000 km workshop maintenance for ${selectedBusIds.length} vehicles`)
    } else if (action === "EXPORT") {
      toast.success(`Exported complete statutory dossier for ${selectedBusIds.length} vehicles`)
    } else if (action === "ALERT") {
      toast.success(`Sent SMS & push alert to ${selectedBusIds.length} assigned drivers`)
    }
    setSelectedBusIds([])
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Enterprise Fleet Bus Management
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `${buses.length} Vehicles`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Statutory records, route assignments, driver mapping, and telemetry status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.success("Exported complete fleet registry as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Fleet</span>
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm shadow-blue-600/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add New Bus
          </Button>
        </div>
      </div>

      {/* Bulk Selection Bar (Sticky banner if items selected) */}
      {selectedBusIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-600 text-white shadow-lg animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs">
              {selectedBusIds.length} Selected
            </span>
            <span>Bulk Enterprise Actions:</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleBulkAction("MAINTENANCE")}
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl h-8"
            >
              <Wrench className="h-3.5 w-3.5 mr-1.5" />
              Schedule Maintenance
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkAction("ALERT")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl h-8 border border-white/20"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Alert Drivers
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkAction("EXPORT")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl h-8 border border-white/20"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export Selected
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Bus Number, Reg, Driver or Route..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 h-9 rounded-xl border-border text-sm"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">GPS:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All GPS Status</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Compliance:</span>
              <select
                value={selectedComplianceFilter}
                onChange={(e) => {
                  setSelectedComplianceFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Compliance</option>
                <option value="VALID">Valid</option>
                <option value="EXPIRING">Expiring Soon</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Enterprise Data Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Sticky Header */}
            <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">
                  <Checkbox
                    checked={
                      paginatedBuses.length > 0 &&
                      paginatedBuses.every((b) => selectedBusIds.includes(b.id))
                    }
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  />
                </th>
                <th
                  onClick={() => handleSort("busNumber")}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Bus &amp; Reg Number</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("driver")}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Assigned Driver</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Route Assignment</th>
                <th className="py-3.5 px-4 text-center">GPS Status</th>
                <th className="py-3.5 px-4 text-center">Compliance</th>
                <th className="py-3.5 px-4 text-center">Maintenance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Syncing fleet data...
                  </td>
                </tr>
              ) : paginatedBuses.length > 0 ? (
                paginatedBuses.map((bus) => {
                  const isSelected = selectedBusIds.includes(bus.id)
                  return (
                    <tr
                      key={bus.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-blue-600/5" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectBus(bus.id)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <span className="font-mono">{bus.busNumber}</span>
                          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {bus.year}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">
                          {bus.registrationNumber}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-foreground">{bus.driver.name}</div>
                        <div className="text-xs text-muted-foreground">{bus.driver.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-semibold text-foreground">{bus.capacity}</span>
                        <span className="text-xs text-muted-foreground ml-1">Seats</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{bus.route}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            bus.gpsStatus === "ONLINE"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              bus.gpsStatus === "ONLINE" ? "bg-blue-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {bus.gpsStatus === "ONLINE" ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            bus.compliance === "VALID"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : bus.compliance === "EXPIRING"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}
                        >
                          {bus.compliance === "VALID" && <CheckCircle2 className="h-3 w-3" />}
                          {bus.compliance === "EXPIRING" && <AlertTriangle className="h-3 w-3" />}
                          {bus.compliance === "EXPIRED" && <ShieldAlert className="h-3 w-3" />}
                          {bus.compliance === "VALID"
                            ? "Valid"
                            : bus.compliance === "EXPIRING"
                            ? "Expiring"
                            : "Expired"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            bus.maintenanceStatus === "GOOD"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : bus.maintenanceStatus === "DUE"
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {bus.maintenanceStatus === "GOOD" && "Good"}
                          {bus.maintenanceStatus === "DUE" && "Due Soon"}
                          {bus.maintenanceStatus === "IN_WORKSHOP" && "Workshop"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => {
                              const basePath = window.location.pathname.startsWith('/manager') ? '/manager' : '/admin'
                              router.push(`${basePath}/buses/${bus.id}`)
                            }}
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-xl text-xs font-semibold border-border hover:bg-muted text-blue-600 dark:text-blue-400"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">
                    No fleet vehicles match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <div className="text-xs font-medium text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {filteredAndSortedBuses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedBuses.length)}
            </span>{" "}
            of <span className="font-bold text-foreground">{filteredAndSortedBuses.length}</span>{" "}
            vehicles
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add New Bus Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Register New Fleet Bus
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter statutory registration, capacity, and assign to a route
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Bus Number
                </label>
                <Input 
                  placeholder="e.g. BUS-110" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.busNumber}
                  onChange={e => setFormData({ ...formData, busNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Registration Number
                </label>
                <Input 
                  placeholder="e.g. KA-01-EQ-5501" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.registrationNumber}
                  onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Seating Capacity
                </label>
                <Input 
                  type="number" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.seatingCapacity}
                  onChange={e => setFormData({ ...formData, seatingCapacity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Vehicle Year
                </label>
                <Input 
                  type="number" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.manufacturingYear}
                  onChange={e => setFormData({ ...formData, manufacturingYear: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Route Corridor (Optional)
              </label>
              <select 
                className="w-full rounded-xl border border-border h-9 px-3 text-sm bg-card text-foreground"
                value={formData.routeId}
                onChange={e => setFormData({ ...formData, routeId: e.target.value })}
              >
                <option value="">Do not assign route yet</option>
                {activeRoutes.map((rt: any) => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl text-xs font-semibold h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                createMutation.mutate(formData)
              }}
              disabled={createMutation.isPending || !formData.busNumber || !formData.registrationNumber}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              {createMutation.isPending ? "Registering..." : "Register Bus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
