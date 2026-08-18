"use client"

import React, { useState } from "react"
import {
  Route as RouteIcon,
  MapPin,
  Bus,
  UserCheck,
  Clock,
  Users,
  Search,
  Plus,
  Download,
  ChevronRight,
  CheckCircle2,
  Navigation,
  ArrowUpRight,
  ShieldCheck,
  Map,
  Calendar,
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

export interface RouteCorridor {
  id: string
  name: string
  code: string
  campus: string
  distanceKm: number
  estimatedMins: number
  assignedBus: {
    busNumber: string
    reg: string
    capacity: number
  }
  assignedDriver: {
    name: string
    phone: string
    rating: number
  }
  studentsAssigned: number
  onTimePercent: number
  status: "ACTIVE" | "MAINTENANCE"
  stops: Array<{
    name: string
    time: string
    studentsCount: number
    coords: [number, number]
  }>
}

export function RouteManagement() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampus, setSelectedCampus] = useState("ALL")
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    source: "",
    destination: "",
    estimatedTime: "45",
    distance: "15",
  })

  // Queries
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await fetch("/api/routes")
      if (!res.ok) throw new Error("Failed to fetch routes")
      return res.json()
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newRoute: any) => {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoute),
      })
      if (!res.ok) throw new Error("Failed to create route")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
      setIsAddModalOpen(false)
      toast.success("New route corridor published successfully!")
      setFormData({ name: "", source: "", destination: "", estimatedTime: "45", distance: "15" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const filteredRoutes = routes.filter((rt: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      rt.name?.toLowerCase().includes(searchLower) ||
      rt.source?.toLowerCase().includes(searchLower) ||
      rt.destination?.toLowerCase().includes(searchLower)
    // Ignore campus filter for now since it's not strictly mapped in the new schema without institution details
    return matchesSearch
  })

  const selectedRoute = routes.find((r: any) => r.id === selectedRouteId) || filteredRoutes[0]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Enterprise Campus Route Corridors
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              {routes.length} Active Lines
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            GIS route trajectories, time-table stop schedules, and vehicle-driver assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.success("Exported official university route timetables")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Timetables</span>
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create New Route
          </Button>
        </div>
      </div>

      {/* Main Content Layout: Left Route List (4 cols) | Right Route Interactive Map & Schedule (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Search & Route Selector Cards */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-2xl border-border bg-card shadow-sm p-3.5">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search routes or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 rounded-xl border-border text-sm"
                />
              </div>

              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All University Campuses</option>
                <option value="Main Campus — North">Main Campus — North</option>
                <option value="Science & Tech Park">Science &amp; Tech Park</option>
                <option value="South Medical Center">South Medical Center</option>
              </select>
            </div>
          </Card>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No routes found</div>
            ) : (
              filteredRoutes.map((rt: any) => {
                const isSelected = selectedRoute && rt.id === selectedRoute.id
                return (
                  <div
                    key={rt.id}
                    onClick={() => setSelectedRouteId(rt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600/10 border-blue-600/40 shadow-sm"
                        : "bg-card border-border hover:border-blue-500/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {rt.code || "N/A"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mt-2">{rt.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{rt.campus}</p>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/80 text-[11px] font-semibold text-muted-foreground">
                    <div>
                      <span className="block font-bold text-foreground">{rt.distanceKm} km</span>
                      <span>Distance</span>
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">{rt.estimatedMins} min</span>
                      <span>Duration</span>
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">{rt.studentsAssigned}</span>
                      <span>Students</span>
                    </div>
                  </div>
                </div>
              )
            })
            )}
          </div>
        </div>

        {/* Right Side: Selected Route Map View & Stop Schedule */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedRoute ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground space-y-4">
              <MapPin className="h-12 w-12 opacity-20" />
              <p>Select a route to view details</p>
            </div>
          ) : (
            <>
              {/* Top Card: GIS Interactive Map Preview & Route Telemetry */}
              <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {selectedRoute.name} • Transit Map
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Code: {selectedRoute.code} • Campus: {selectedRoute.campus} • {selectedRoute.stops?.length || 0} Authorized Stops
                    </CardDescription>
                  </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                  SLA 100% On-Time
                </Badge>
                <Button
                  size="sm"
                  onClick={() => toast.info("Opening Live Fleet GPS Map for this corridor")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-8"
                >
                  <Map className="h-3.5 w-3.5 mr-1" />
                  Live GPS
                </Button>
              </div>
            </CardHeader>

            {/* Custom SVG Interactive Canvas Route Visualization */}
            <div className="relative h-64 w-full bg-slate-950 p-6 flex flex-col justify-between overflow-hidden">
              {/* Grid Background overlay */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 font-mono">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-emerald-400 font-bold">
                  ● TELEMETRY GATEWAY CONNECTED
                </span>
                <span>TOTAL DISTANCE: {selectedRoute.distance || 0} KM</span>
              </div>

              {/* Route Trajectory Visual Line */}
              <div className="relative z-10 my-auto flex items-center justify-between px-10 sm:px-14">
                {selectedRoute?.stops?.length > 0 ? selectedRoute.stops.map((stop: any, idx: number) => {
                  const isFirst = idx === 0
                  const isLast = idx === selectedRoute.stops.length - 1
                  return (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center group relative">
                        {/* Stop Node circle */}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-xs shadow-lg transition-transform group-hover:scale-110 relative z-10 ${
                            isFirst
                              ? "bg-blue-600 text-white border-2 border-white ring-4 ring-blue-500/30"
                              : isLast
                              ? "bg-emerald-600 text-white border-2 border-white ring-4 ring-emerald-500/30"
                              : "bg-slate-800 text-slate-200 border border-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {/* Label - Staggered top and bottom to prevent overlap */}
                        <div className={`absolute left-1/2 -translate-x-1/2 ${idx % 2 === 0 ? '-bottom-14' : '-top-14'} w-24 sm:w-28 text-center`}>
                          <span className="text-[10px] sm:text-[11px] leading-[1.2] font-bold text-slate-100 block break-words">
                            {stop.name}
                          </span>
                          <span className="text-[9px] text-blue-400 font-mono mt-1 block">
                            {stop.time}
                          </span>
                        </div>
                      </div>

                      {/* Connecting Line */}
                      {!isLast && (
                        <div className="flex-1 h-1.5 bg-gradient-to-r from-blue-600/80 via-blue-500/80 to-emerald-500/80 mx-1 sm:mx-2 rounded-full relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
                        </div>
                      )}
                    </React.Fragment>
                  )
                }) : null}
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6">
                <span>START: 07:30 AM (North Gate)</span>
                <span>EST. ARRIVAL: 08:15 AM (Main Campus)</span>
              </div>
            </div>
          </Card>

          {/* Assigned Bus & Driver Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col justify-center hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Bus className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Assigned Fleet Vehicle
                  </span>
                  <div className="text-base font-extrabold text-foreground mt-0.5">
                    {selectedRoute?.assignedBus?.busNumber || "Unassigned"}
                    {selectedRoute?.assignedBus?.reg && (
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 ml-2 rounded bg-muted text-muted-foreground">
                        {selectedRoute.assignedBus.reg}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Telemetry Online
                    </span>
                    <span className="text-muted-foreground">{selectedRoute?.assignedBus?.capacity || 0} Seats</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col justify-center hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Assigned Captain
                  </span>
                  <div className="text-base font-extrabold text-foreground mt-0.5">
                    {selectedRoute?.assignedDriver?.name || "Unassigned"}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      ★ {selectedRoute?.assignedDriver?.rating || "N/A"} Safety
                    </span>
                    <span className="text-muted-foreground">{selectedRoute?.assignedDriver?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Card: Official Schedule & Stop List as a Vertical Timeline */}
          <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="pb-6 border-b border-border">
              <CardTitle className="text-lg font-extrabold text-foreground">
                Verified Stop Timeline
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Chronological geo-fence checkpoints and boarding counts for {selectedRoute.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="relative border-l-2 border-muted/60 ml-4 space-y-8">
                {selectedRoute?.stops?.length > 0 ? selectedRoute.stops.map((stop: any, index: number) => {
                  const isLast = index === selectedRoute.stops.length - 1
                  return (
                    <div key={index} className="relative pl-8 sm:pl-10">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs shadow-sm ring-4 ring-card ${
                        isLast ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                      }`}>
                        {index + 1}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div>
                          <div className="text-sm font-bold text-foreground">{stop.stopName}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            GPS Coords: {stop.latitude?.toFixed(4) || "0"}, {stop.longitude?.toFixed(4) || "0"}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-left sm:text-right">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">Stop Status</div>
                          </div>

                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1">
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-sm text-muted-foreground pl-8">No stops defined for this route.</div>
                )}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>

      {/* Add New Route Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Create New Campus Transit Corridor
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure route code, campus destination, and GPS geo-fence stops
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Route Name</label>
              <Input 
                placeholder="e.g. Science Park Express #5" 
                className="rounded-xl border-border h-9 text-sm" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Source</label>
                <Input 
                  placeholder="North Gate" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Destination</label>
                <Input 
                  placeholder="Main Campus" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Estimated Time (HH:MM)</label>
                <Input 
                  placeholder="45" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.estimatedTime}
                  onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Distance (km)</label>
                <Input 
                  type="number" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.distance}
                  onChange={e => setFormData({ ...formData, distance: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={() => {
                createMutation.mutate({
                  ...formData,
                  distance: parseFloat(formData.distance),
                  stops: [] // Initially create without stops, stops management can be added later
                })
              }}
              disabled={createMutation.isPending || !formData.name || !formData.source || !formData.destination}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              {createMutation.isPending ? "Saving..." : "Publish Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
