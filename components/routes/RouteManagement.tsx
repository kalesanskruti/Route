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
  RefreshCw,
  Map,
  Calendar,
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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampus, setSelectedCampus] = useState("ALL")
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route-1")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const initialRoutes: RouteCorridor[] = [
    {
      id: "route-1",
      name: "Main Campus Express #1",
      code: "RT-EXP-01",
      campus: "Main Campus — North",
      distanceKm: 18.4,
      estimatedMins: 42,
      assignedBus: { busNumber: "BUS-101", reg: "KA-01-EQ-4421", capacity: 52 },
      assignedDriver: { name: "Rajesh Kumar", phone: "+91 98450 11223", rating: 4.9 },
      studentsAssigned: 48,
      onTimePercent: 100,
      status: "ACTIVE",
      stops: [
        { name: "North Gate Metro Interchange", time: "07:30 AM", studentsCount: 16, coords: [12.9716, 77.5946] },
        { name: "Science Park Block D", time: "07:44 AM", studentsCount: 14, coords: [12.975, 77.601] },
        { name: "Engineering Central Library", time: "07:56 AM", studentsCount: 12, coords: [12.981, 77.608] },
        { name: "Main University Auditorium", time: "08:12 AM", studentsCount: 6, coords: [12.988, 77.615] },
      ],
    },
    {
      id: "route-2",
      name: "Science Park Route #4",
      code: "RT-SCI-04",
      campus: "Science & Tech Park",
      distanceKm: 14.8,
      estimatedMins: 35,
      assignedBus: { busNumber: "BUS-102", reg: "KA-01-EQ-4422", capacity: 52 },
      assignedDriver: { name: "Anil Sharma", phone: "+91 98450 11224", rating: 4.8 },
      studentsAssigned: 50,
      onTimePercent: 98.5,
      status: "ACTIVE",
      stops: [
        { name: "West Ring Road Junction", time: "07:40 AM", studentsCount: 20, coords: [12.965, 77.585] },
        { name: "Biotech Innovation Center", time: "07:55 AM", studentsCount: 18, coords: [12.97, 77.592] },
        { name: "Science Park Gate #2", time: "08:15 AM", studentsCount: 12, coords: [12.978, 77.6] },
      ],
    },
    {
      id: "route-3",
      name: "South Medical Center #2",
      code: "RT-MED-02",
      campus: "South Medical Center",
      distanceKm: 22.1,
      estimatedMins: 52,
      assignedBus: { busNumber: "BUS-103", reg: "KA-01-EQ-4425", capacity: 40 },
      assignedDriver: { name: "Vikram Patel", phone: "+91 98450 11229", rating: 4.95 },
      studentsAssigned: 38,
      onTimePercent: 99.1,
      status: "ACTIVE",
      stops: [
        { name: "South City Hospital Circle", time: "07:20 AM", studentsCount: 18, coords: [12.94, 77.58] },
        { name: "Medical College Hostels", time: "07:45 AM", studentsCount: 12, coords: [12.948, 77.588] },
        { name: "University Teaching Hospital", time: "08:12 AM", studentsCount: 8, coords: [12.955, 77.595] },
      ],
    },
    {
      id: "route-4",
      name: "North Gateway Line #8",
      code: "RT-GTW-08",
      campus: "Main Campus — North",
      distanceKm: 16.5,
      estimatedMins: 40,
      assignedBus: { busNumber: "BUS-104", reg: "KA-01-EQ-4430", capacity: 40 },
      assignedDriver: { name: "Suresh Singh", phone: "+91 98450 11234", rating: 4.7 },
      studentsAssigned: 36,
      onTimePercent: 96.0,
      status: "ACTIVE",
      stops: [
        { name: "Gateway Mall Terminal", time: "07:35 AM", studentsCount: 15, coords: [12.985, 77.58] },
        { name: "North Residential Towers", time: "07:50 AM", studentsCount: 12, coords: [12.99, 77.59] },
        { name: "Main Campus Gate #1", time: "08:15 AM", studentsCount: 9, coords: [12.995, 77.6] },
      ],
    },
  ]

  const [routes] = useState<RouteCorridor[]>(initialRoutes)

  const filteredRoutes = routes.filter((rt) => {
    const matchesSearch =
      rt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rt.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rt.campus.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCampus = selectedCampus === "ALL" || rt.campus === selectedCampus
    return matchesSearch && matchesCampus
  })

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0]

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
            {filteredRoutes.map((rt) => {
              const isSelected = rt.id === selectedRouteId
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
                      {rt.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {rt.onTimePercent}% On-Time
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
            })}
          </div>
        </div>

        {/* Right Side: Selected Route Map View & Stop Schedule */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Card: GIS Interactive Map Preview & Route Telemetry */}
          <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {selectedRoute.name} • Transit Map
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Code: {selectedRoute.code} • Campus: {selectedRoute.campus} • {selectedRoute.stops.length} Authorized Stops
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
                <span>TOTAL DISTANCE: {selectedRoute.distanceKm} KM</span>
              </div>

              {/* Route Trajectory Visual Line */}
              <div className="relative z-10 my-auto flex items-center justify-between px-8">
                {selectedRoute.stops.map((stop, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === selectedRoute.stops.length - 1
                  return (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center group relative">
                        {/* Stop Node circle */}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-xs shadow-lg transition-transform group-hover:scale-110 ${
                            isFirst
                              ? "bg-blue-600 text-white border-2 border-white"
                              : isLast
                              ? "bg-emerald-600 text-white border-2 border-white"
                              : "bg-slate-800 text-slate-200 border border-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {/* Label tooltip */}
                        <div className="absolute -bottom-9 whitespace-nowrap text-center">
                          <span className="text-[11px] font-bold text-white block">
                            {stop.name}
                          </span>
                          <span className="text-[10px] text-blue-400 font-mono">
                            {stop.time}
                          </span>
                        </div>
                      </div>

                      {/* Connecting Line */}
                      {!isLast && (
                        <div className="flex-1 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 mx-2 rounded-full relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white shadow-sm animate-pulse" />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6">
                <span>START: 07:30 AM (North Gate)</span>
                <span>EST. ARRIVAL: 08:15 AM (Main Campus)</span>
              </div>
            </div>

            {/* Assigned Bus & Driver Cards */}
            <div className="p-4 bg-muted/20 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Assigned Fleet Vehicle</span>
                  <div className="text-sm font-bold text-foreground">
                    {selectedRoute.assignedBus.busNumber} ({selectedRoute.assignedBus.reg})
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedRoute.assignedBus.capacity} Seats • Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Assigned Driver</span>
                  <div className="text-sm font-bold text-foreground">
                    {selectedRoute.assignedDriver.name}
                  </div>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                    ★ {selectedRoute.assignedDriver.rating} Safety • {selectedRoute.assignedDriver.phone}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom Card: Official Schedule & Stop List */}
          <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground">
                Time-Table Stop Schedule &amp; Student Boarding Counts
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Verified GPS geo-fence checkpoints along {selectedRoute.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {selectedRoute.stops.map((stop, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{stop.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          Coords: {stop.coords[0].toFixed(4)}, {stop.coords[1].toFixed(4)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs font-bold text-foreground">{stop.time}</div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Scheduled ETA</div>
                      </div>

                      <Badge variant="outline" className="text-xs font-semibold">
                        <Users className="h-3 w-3 mr-1 text-blue-600" />
                        {stop.studentsCount} Students
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <Input placeholder="e.g. Science Park Express #5" className="rounded-xl border-border h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Route Code</label>
                <Input placeholder="RT-SCI-05" className="rounded-xl border-border h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Distance (km)</label>
                <Input type="number" defaultValue={15.2} className="rounded-xl border-border h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Assign Fleet Bus</label>
              <Input placeholder="Select vehicle from roster..." className="rounded-xl border-border h-9 text-sm" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsAddModalOpen(false)
                toast.success("New route corridor published and synced to driver app!")
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              Publish Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
