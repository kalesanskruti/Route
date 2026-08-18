"use client"

import React, { useState, useMemo } from "react"
import {
  UserCheck,
  Search,
  Filter,
  Phone,
  Mail,
  Award,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Bus,
  Route as RouteIcon,
  Plus,
  Eye,
  MoreHorizontal,
  LayoutGrid,
  List,
  Download,
  Star,
  Check,
  Loader2,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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

export interface DriverRecord {
  id: string
  employeeId: string
  name: string
  photo: string
  phone: string
  emergencyContact: string
  bloodGroup: string
  licenseNumber: string
  licenseExpiry: string
  licenseStatus: "VALID" | "EXPIRING"
  experienceYears: number
  totalKmDriven: number
  safetyScore: number
  onTimePercent: number
  assignedBus: string
  assignedRoute: string
  attendanceToday: "PRESENT" | "ON_LEAVE" | "OFF_DUTY"
  status: "ACTIVE" | "INACTIVE"
}

export function DriverManagement() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDriverForModal, setSelectedDriverForModal] = useState<DriverRecord | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    phone: "",
    licenseNumber: "",
    busId: "",
  })

  // Queries
  const { data: apiDrivers = [], isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await fetch("/api/drivers")
      if (!res.ok) throw new Error("Failed to fetch drivers")
      return res.json()
    },
  })

  const { data: apiBuses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: async () => {
      const res = await fetch("/api/buses")
      if (!res.ok) throw new Error("Failed to fetch buses")
      return res.json()
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newDriver: any) => {
      const payload = {
        ...newDriver,
        licenseExpiry: new Date(Date.now() + 31536000000).toISOString(), // Mock 1 year
        contactDetails: newDriver.employeeId, // Store employeeId here if needed
      }

      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create driver")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      setIsAddModalOpen(false)
      toast.success("Driver enrolled successfully into active roster!")
      setFormData({ name: "", employeeId: "", phone: "", licenseNumber: "", busId: "" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const filteredDrivers = useMemo(() => {
    return apiDrivers.filter((driver: any) => {
      const matchesSearch =
        driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        selectedStatusFilter === "ALL" || driver.status === selectedStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [apiDrivers, searchQuery, selectedStatusFilter])

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Enterprise Fleet Driver Roster
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `${apiDrivers.length} Drivers`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            License verifications, safety scores, route assignments, and daily attendance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "table" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={() => toast.success("Exported complete driver registry as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Roster</span>
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add New Driver
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, EMP ID, license, or bus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 rounded-xl border-border text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Duty</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Modern Driver Cards */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sm text-muted-foreground">No drivers found</div>
          ) : filteredDrivers.map((drv: any) => (
            <Card
              key={drv.id}
              className="rounded-2xl border-border bg-card shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white text-lg font-extrabold shadow-sm">
                      {drv.photo}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        {drv.name}
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {drv.bloodGroup}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-mono mt-0.5">
                        {drv.employeeId} • {drv.experienceYears} Yrs Experience
                      </CardDescription>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      drv.attendanceToday === "PRESENT"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {drv.attendanceToday === "PRESENT" ? "Present Today" : "On Leave"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* License and Safety Score row */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border border-border">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Driver License
                    </span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block truncate">
                      {drv.licenseNumber}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                      Valid til {drv.licenseExpiry}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Safety Score
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-foreground">{drv.safetyScore}</span>
                      <span className="text-[11px] text-muted-foreground">/ 5.0</span>
                    </div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5 block">
                      {drv.onTimePercent}% On-Time
                    </span>
                  </div>
                </div>

                {/* Assigned Bus & Route */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Bus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-muted-foreground">Bus:</span>
                    <span className="font-bold text-foreground truncate">{drv.assignedBus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RouteIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-muted-foreground">Route:</span>
                    <span className="font-semibold text-foreground truncate">{drv.assignedRoute}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    onClick={() => toast.info(`Calling driver at ${drv.phone}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-semibold rounded-xl h-8 text-blue-600 dark:text-blue-400 border-border"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Call Driver
                  </Button>
                  <Button
                    onClick={() => setSelectedDriverForModal(drv)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-semibold rounded-xl h-8 border-border"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Dossier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-muted-foreground border-b border-border w-[250px]">Driver Profile</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-muted-foreground border-b border-border">License Info</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-muted-foreground border-b border-border">Assigned Vehicle</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-muted-foreground border-b border-border">Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-muted-foreground border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">No drivers found</td>
                  </tr>
                ) : filteredDrivers.map((drv: any) => (
                  <tr key={drv.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {drv.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                            {drv.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{drv.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-sm font-mono font-bold text-foreground">{drv.licenseNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-sm text-foreground font-bold">{drv.bus?.busNumber || "Unassigned"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                        {drv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => setSelectedDriverForModal(drv)}
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-xs font-semibold"
                      >
                        Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Driver Details Modal */}
      <Dialog open={!!selectedDriverForModal} onOpenChange={(open) => !open && setSelectedDriverForModal(null)}>
        {selectedDriverForModal && (
          <DialogContent className="sm:max-w-lg bg-card border border-border shadow-2xl rounded-2xl p-6">
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 text-left">
              <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 border-2 border-border shadow-sm">
                <img 
                  src={`https://i.pravatar.cc/150?u=${selectedDriverForModal.employeeId}`} 
                  alt={selectedDriverForModal.name} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedDriverForModal.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  ID: {selectedDriverForModal.employeeId} • Blood Group: {selectedDriverForModal.bloodGroup}
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px]">
                    {selectedDriverForModal.experienceYears} Years Experience
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                    {selectedDriverForModal.attendanceToday === 'PRESENT' ? 'Present Today' : 'On Leave'}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs font-bold text-muted-foreground uppercase block">License Info</span>
                  <span className="font-mono font-bold text-foreground block mt-1">{selectedDriverForModal.licenseNumber}</span>
                  <span className="text-xs text-emerald-600 block mt-0.5">Expires {selectedDriverForModal.licenseExpiry}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs font-bold text-muted-foreground uppercase block">Safety Rating</span>
                  <span className="font-bold text-foreground block mt-1">★ {selectedDriverForModal.safetyScore} / 5.0</span>
                  <span className="text-xs text-blue-600 block mt-0.5">{selectedDriverForModal.onTimePercent}% On-Time Rating</span>
                </div>
              </div>
              <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-bold text-foreground">{selectedDriverForModal.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency:</span>
                  <span className="font-bold text-foreground">{selectedDriverForModal.emergencyContact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Distance:</span>
                  <span className="font-bold text-foreground">{selectedDriverForModal.totalKmDriven.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Bus:</span>
                  <span className="font-bold text-foreground">{selectedDriverForModal.assignedBus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Route:</span>
                  <span className="font-bold text-foreground">{selectedDriverForModal.assignedRoute}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  toast.success(`Message sent to ${selectedDriverForModal.name}`)
                  setSelectedDriverForModal(null)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5 w-full"
              >
                Send Message to Driver
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Add New Driver Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Enroll New University Driver
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              All drivers undergo statutory police verification &amp; license check
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Full Name</label>
              <Input 
                placeholder="e.g. Ramesh S." 
                className="rounded-xl border-border h-9 text-sm" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Employee ID</label>
                <Input 
                  placeholder="EMP-4018" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Phone Number</label>
                <Input 
                  placeholder="+91 98450 00000" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Commercial License #</label>
              <Input 
                placeholder="DL-042018000" 
                className="rounded-xl border-border h-9 text-sm" 
                value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Assign Fleet Bus (Optional)</label>
              <select 
                className="w-full rounded-xl border border-border h-9 px-3 text-sm bg-card text-foreground"
                value={formData.busId}
                onChange={e => setFormData({ ...formData, busId: e.target.value })}
              >
                <option value="">Select a bus from the fleet...</option>
                {apiBuses.map((bus: any) => (
                  <option key={bus.id} value={bus.id}>{bus.busNumber} ({bus.registrationNumber})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={() => {
                createMutation.mutate(formData)
              }}
              disabled={createMutation.isPending || !formData.name || !formData.licenseNumber}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              {createMutation.isPending ? "Enrolling..." : "Enroll Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
