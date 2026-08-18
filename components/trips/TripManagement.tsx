"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  LayoutGrid,
  List,
  Download,
  Plus,
  Eye,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bus,
  Users,
  MapPin,
  Activity,
  ArrowLeft,
  Signal,
  Map,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export interface TripRecord {
  id: string
  tripId: string
  driverName: string
  busNumber: string
  routeName: string
  status: "IN_TRANSIT" | "COMPLETED" | "SCHEDULED"
  departureTime: string
  expectedArrivalTime: string
  currentDelayMin: number
  passengers: number
}

export function TripManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedTripForTracking, setSelectedTripForTracking] = useState<TripRecord | null>(null)

  const initialTrips: TripRecord[] = [
    {
      id: "trip-1",
      tripId: "TRP-8001",
      driverName: "Rajesh Kumar",
      busNumber: "BUS-101",
      routeName: "Main Campus Express #1",
      status: "IN_TRANSIT",
      departureTime: "08:00 AM",
      expectedArrivalTime: "08:45 AM",
      currentDelayMin: 5,
      passengers: 42,
    },
    {
      id: "trip-2",
      tripId: "TRP-8002",
      driverName: "Anil Sharma",
      busNumber: "BUS-102",
      routeName: "Science Park Route #4",
      status: "COMPLETED",
      departureTime: "07:15 AM",
      expectedArrivalTime: "08:10 AM",
      currentDelayMin: 0,
      passengers: 38,
    },
    {
      id: "trip-3",
      tripId: "TRP-8003",
      driverName: "Vikram Patel",
      busNumber: "BUS-103",
      routeName: "South Medical Center #2",
      status: "SCHEDULED",
      departureTime: "09:30 AM",
      expectedArrivalTime: "10:15 AM",
      currentDelayMin: 0,
      passengers: 0,
    }
  ]

  const [trips] = useState<TripRecord[]>(initialTrips)

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.tripId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        selectedStatusFilter === "ALL" || trip.status === selectedStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [trips, searchQuery, selectedStatusFilter])

  const getStatusBadge = (status: TripRecord["status"]) => {
    switch (status) {
      case "IN_TRANSIT":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">In Transit</Badge>
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Completed</Badge>
      case "SCHEDULED":
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px]">Scheduled</Badge>
    }
  }


  if (selectedTripForTracking) {
    return (
      <div className="space-y-6 font-sans min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTripForTracking(null)}
              className="h-9 rounded-xl border-border"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trips
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {selectedTripForTracking.routeName}
                </h1>
                <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold animate-pulse flex items-center gap-1.5 px-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400"></div>
                  LIVE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">
                Trip ID: {selectedTripForTracking.tripId} • Bus: {selectedTripForTracking.busNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 rounded-xl border-border text-xs font-semibold gap-2">
              <Activity className="h-4 w-4" />
              View Telemetry Details
            </Button>
          </div>
        </div>

        {/* Tracking Layout (Grid 2/3 Map, 1/3 Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Main Map Canvas */}
          <Card className="lg:col-span-2 rounded-2xl border border-border shadow-sm overflow-hidden relative min-h-[500px] flex items-center justify-center bg-[#e5e5e5] dark:bg-[#111111]">
            {/* Simulated Map Background Grid */}
            <div 
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" 
              style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            ></div>
            
            {/* Simulated Map Roads */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.05]">
               <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0 100 Q 200 200, 300 150 T 600 250 T 900 100" stroke="#000" strokeWidth="12" fill="none" />
                  <path d="M 100 0 Q 150 300, 400 350 T 800 300" stroke="#000" strokeWidth="8" fill="none" />
               </svg>
            </div>

            {/* The Active Trip Route Trajectory */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <svg width="80%" height="60%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible drop-shadow-md">
                    {/* The Path */}
                    <path 
                      d="M 10,80 C 30,80 40,20 60,30 S 80,70 90,40" 
                      stroke="url(#routeGradient)" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeDasharray="4 4"
                    />
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Start Node */}
                    <circle cx="10" cy="80" r="3" fill="#3b82f6" stroke="currentColor" strokeWidth="1" className="text-card" />
                    <text x="10" y="90" fontSize="3" fontWeight="bold" fill="currentColor" textAnchor="middle" className="text-foreground">Origin</text>

                    {/* Middle Stop Node */}
                    <circle cx="60" cy="30" r="2.5" fill="#10b981" stroke="currentColor" strokeWidth="1" className="text-card" />
                    <text x="60" y="24" fontSize="2.5" fontWeight="bold" fill="currentColor" textAnchor="middle" className="text-foreground">Tech Park Stop</text>

                    {/* End Node */}
                    <circle cx="90" cy="40" r="3" fill="#ef4444" stroke="currentColor" strokeWidth="1" className="text-card" />
                    <text x="90" y="48" fontSize="3" fontWeight="bold" fill="currentColor" textAnchor="middle" className="text-foreground">Destination</text>

                    {/* Animated Bus Marker */}
                    <g className="animate-[moveBus_12s_ease-in-out_infinite_alternate]" style={{ transformOrigin: 'center' }}>
                       <circle cx="10" cy="80" r="4" fill="#3b82f6" className="animate-pulse" />
                       <circle cx="10" cy="80" r="2" fill="white" />
                       {/* SVG animation to follow path */}
                       <animateMotion dur="12s" repeatCount="indefinite" path="M 10,80 C 30,80 40,20 60,30 S 80,70 90,40" />
                    </g>
                </svg>
            </div>

            {/* Floating Top-Right Overlay */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md border border-border p-3 rounded-2xl shadow-lg z-20 flex gap-4">
               <div className="text-center">
                 <span className="block text-[10px] font-bold text-muted-foreground uppercase">Current Speed</span>
                 <span className="block text-lg font-black text-emerald-600 mt-0.5">42 <span className="text-xs font-semibold">km/h</span></span>
               </div>
               <div className="w-px bg-border"></div>
               <div className="text-center">
                 <span className="block text-[10px] font-bold text-muted-foreground uppercase">Signal</span>
                 <Signal className="h-5 w-5 text-emerald-500 mx-auto mt-1" />
               </div>
            </div>
            
            {/* Disclaimer */}
            <div className="absolute bottom-4 right-4 bg-background/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-muted-foreground font-mono">
              Simulated Premium Map UI
            </div>
          </Card>

          {/* Right Sidebar (Telemetry & Info) */}
          <div className="space-y-6">
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-base font-bold text-foreground">Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Passengers</p>
                        <p className="text-sm font-bold text-foreground">{selectedTripForTracking.passengers} / 52 Onboard</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Arrival Status</p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedTripForTracking.currentDelayMin > 0 ? (
                            <span className="text-red-500">{selectedTripForTracking.currentDelayMin} Min Delayed</span>
                          ) : (
                            <span className="text-emerald-600">On Time</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center shadow-sm">
                        <span className="text-lg font-black text-foreground">
                           {selectedTripForTracking.driverName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Captain</p>
                        <p className="text-sm font-bold text-foreground">{selectedTripForTracking.driverName}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] rounded-lg">Contact</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-base font-bold text-foreground">Next Stops (ETA)</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500 before:to-transparent">
                   
                   {/* Stop 1 */}
                   <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-emerald-500 text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm text-left md:group-odd:text-right">
                        <div className="text-[10px] font-bold text-emerald-600 mb-0.5 uppercase">Passed</div>
                        <div className="text-xs font-bold text-foreground">Origin Campus</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">08:00 AM</div>
                      </div>
                   </div>

                   {/* Stop 2 */}
                   <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-blue-500 text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 shadow-sm text-left md:group-odd:text-right">
                        <div className="text-[10px] font-bold text-blue-600 mb-0.5 uppercase">Approaching (12 mins)</div>
                        <div className="text-xs font-bold text-foreground">Tech Park Stop</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">08:22 AM</div>
                      </div>
                   </div>

                   {/* Stop 3 */}
                   <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-muted shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-border bg-card shadow-sm text-left md:group-odd:text-right">
                        <div className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase">Scheduled</div>
                        <div className="text-xs font-bold text-foreground text-muted-foreground">Destination</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">08:45 AM</div>
                      </div>
                   </div>

                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
              Trips Overview
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              {trips.length} Trips
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor live trips, completed journeys, and scheduled departures
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
            onClick={() => toast.success("Exported trips report as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by trip ID, driver, bus, or route..."
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
              <option value="ALL">All Trips</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="COMPLETED">Completed</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Modern Trip Cards */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <Card
              key={trip.id}
              className="rounded-2xl border-border bg-card shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        {trip.routeName}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-mono mt-0.5">
                        {trip.tripId}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(trip.status)}
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border border-border">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Departure
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-foreground truncate">{trip.departureTime}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Arrival (Expected)
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-foreground truncate">{trip.expectedArrivalTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Bus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-muted-foreground">Driver:</span>
                    <span className="font-bold text-foreground truncate">{trip.driverName} ({trip.busNumber})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-muted-foreground">Passengers:</span>
                      <span className="font-semibold text-foreground truncate">{trip.passengers}</span>
                    </div>
                    {trip.currentDelayMin > 0 && (
                      <span className="text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {trip.currentDelayMin} min delay
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTripForTracking(trip)}
                    className="flex-1 text-xs font-semibold rounded-xl h-8 border-border text-blue-600"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Live Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-8 text-center text-muted-foreground text-sm">
            Table view is currently under construction.
          </div>
        </div>
      )}
    </div>
  )
}
