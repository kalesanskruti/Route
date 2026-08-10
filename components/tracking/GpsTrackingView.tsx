"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Map,
  Bus,
  Search,
  Filter,
  Radio,
  AlertTriangle,
  Phone,
  ShieldAlert,
  Navigation,
  Clock,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  Maximize2,
  Zap,
  BatteryCharging,
  SlidersHorizontal,
  Send,
  BellRing,
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

export interface LiveBusTelemetry {
  id: string
  busNumber: string
  reg: string
  driverName: string
  driverPhone: string
  route: string
  status: "MOVING" | "STOPPED" | "OFFLINE"
  speedKmh: number
  batteryPercent: number
  nextStop: string
  etaMins: number
  delayStatus: "ON_TIME" | "DELAYED"
  delayMins?: number
  coords: { x: number; y: number } // Percentage coordinates for GIS Canvas
}

export function GpsTrackingView() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "MOVING" | "STOPPED" | "OFFLINE">("ALL")
  const [selectedBusId, setSelectedBusId] = useState<string>("bus-1")
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const initialTelemetry: LiveBusTelemetry[] = [
    {
      id: "bus-1",
      busNumber: "BUS-101",
      reg: "KA-01-EQ-4421",
      driverName: "Rajesh Kumar",
      driverPhone: "+91 98450 11223",
      route: "Main Campus Express #1",
      status: "MOVING",
      speedKmh: 44,
      batteryPercent: 88,
      nextStop: "Central Auditorium",
      etaMins: 4,
      delayStatus: "ON_TIME",
      coords: { x: 38, y: 42 },
    },
    {
      id: "bus-2",
      busNumber: "BUS-102",
      reg: "KA-01-EQ-4422",
      driverName: "Anil Sharma",
      driverPhone: "+91 98450 11224",
      route: "Science Park Route #4",
      status: "MOVING",
      speedKmh: 38,
      batteryPercent: 92,
      nextStop: "Biotech Innovation Center",
      etaMins: 6,
      delayStatus: "ON_TIME",
      coords: { x: 65, y: 30 },
    },
    {
      id: "bus-3",
      busNumber: "BUS-103",
      reg: "KA-01-EQ-4425",
      driverName: "Vikram Patel",
      driverPhone: "+91 98450 11229",
      route: "South Medical Center #2",
      status: "MOVING",
      speedKmh: 52,
      batteryPercent: 74,
      nextStop: "Medical College Hostels",
      etaMins: 3,
      delayStatus: "DELAYED",
      delayMins: 4,
      coords: { x: 78, y: 68 },
    },
    {
      id: "bus-4",
      busNumber: "BUS-104",
      reg: "KA-01-EQ-4430",
      driverName: "Suresh Singh",
      driverPhone: "+91 98450 11234",
      route: "North Gateway Line #8",
      status: "STOPPED",
      speedKmh: 0,
      batteryPercent: 85,
      nextStop: "Gateway Mall Terminal",
      etaMins: 10,
      delayStatus: "ON_TIME",
      coords: { x: 22, y: 72 },
    },
    {
      id: "bus-5",
      busNumber: "BUS-105",
      reg: "KA-01-EQ-4433",
      driverName: "Karthik Rao",
      driverPhone: "+91 98450 11239",
      route: "Main Campus Express #1",
      status: "OFFLINE",
      speedKmh: 0,
      batteryPercent: 40,
      nextStop: "North Gate Hub",
      etaMins: 0,
      delayStatus: "ON_TIME",
      coords: { x: 48, y: 82 },
    },
    {
      id: "bus-6",
      busNumber: "BUS-106",
      reg: "KA-01-EQ-4440",
      driverName: "Manoj Verma",
      driverPhone: "+91 98450 11242",
      route: "Science Park Route #4",
      status: "MOVING",
      speedKmh: 46,
      batteryPercent: 95,
      nextStop: "Science Park Gate #2",
      etaMins: 5,
      delayStatus: "ON_TIME",
      coords: { x: 55, y: 48 },
    },
  ]

  const [fleet] = useState<LiveBusTelemetry[]>(initialTelemetry)

  const filteredFleet = useMemo(() => {
    return fleet.filter((item) => {
      const matchesSearch =
        item.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.route.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [fleet, searchQuery, statusFilter])

  const selectedBus = fleet.find((b) => b.id === selectedBusId) || fleet[0]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("GPS Telemetry socket synchronized across all 142 vehicles")
    }, 600)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              GPS Live Fleet Tracking Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              128 Online • 15s Socket Ping
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time GIS vehicle telemetry, speed monitoring, delay SLA verification, and emergency dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Sync GPS</span>
          </Button>

          <Button
            onClick={() => setIsSosModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-lg shadow-red-600/30 animate-pulse flex items-center gap-2"
          >
            <ShieldAlert className="h-4 w-4" />
            EMERGENCY SOS ALERT
          </Button>
        </div>
      </div>

      {/* Main Tracking UI: Left Fleet Sidebar (4 cols) | Right Interactive GIS Map (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Filter Pills, Search & Vehicle Roster */}
        <Card className="lg:col-span-4 rounded-2xl border-border bg-card shadow-sm flex flex-col h-[700px]">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-base font-bold text-foreground">
                Active Fleet Telemetry
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono">
                {filteredFleet.length} Shown
              </Badge>
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-muted border border-border">
              {[
                { label: "All", value: "ALL", count: fleet.length },
                { label: "Moving", value: "MOVING", count: fleet.filter((f) => f.status === "MOVING").length },
                { label: "Stopped", value: "STOPPED", count: fleet.filter((f) => f.status === "STOPPED").length },
                { label: "Offline", value: "OFFLINE", count: fleet.filter((f) => f.status === "OFFLINE").length },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value as any)}
                  className={`py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === pill.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bus, driver, or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-xl border-border text-xs"
              />
            </div>
          </CardHeader>

          {/* Roster list */}
          <CardContent className="p-2 flex-1 overflow-y-auto space-y-2">
            {filteredFleet.map((bus) => {
              const isSelected = bus.id === selectedBusId
              return (
                <div
                  key={bus.id}
                  onClick={() => setSelectedBusId(bus.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-600/40 shadow-sm"
                      : "bg-card border-border hover:bg-muted/40 hover:border-blue-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{bus.busNumber}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {bus.reg}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        bus.status === "MOVING"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : bus.status === "STOPPED"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          bus.status === "MOVING"
                            ? "bg-emerald-500 animate-pulse"
                            : bus.status === "STOPPED"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {bus.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-foreground mt-1.5 truncate">
                    {bus.route}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-between">
                    <span>Driver: {bus.driverName}</span>
                    <span className="font-mono font-bold text-foreground">{bus.speedKmh} km/h</span>
                  </div>

                  {/* Footer status row */}
                  <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Next: <span className="font-medium text-foreground">{bus.nextStop}</span> ({bus.etaMins}m)
                    </span>
                    <span
                      className={`font-bold ${
                        bus.delayStatus === "ON_TIME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {bus.delayStatus === "ON_TIME" ? "On Time" : `+${bus.delayMins}m Delay`}
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Right GIS Map View (8 cols) */}
        <Card className="lg:col-span-8 rounded-2xl border-border bg-card shadow-sm overflow-hidden flex flex-col h-[700px]">
          <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Navigation className="h-4.5 w-4.5 text-blue-600" />
                Live Campus Telemetry GIS Radar
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Tracking {selectedBus.busNumber} along {selectedBus.route} • Next stop in {selectedBus.etaMins} mins
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                Lat 12.9716° N • Lon 77.5946° E
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/admin/buses/${selectedBus.id}`)}
                className="text-xs font-semibold rounded-xl h-8 text-blue-600 dark:text-blue-400 border-border"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Full Bus Dossier
              </Button>
            </div>
          </CardHeader>

          {/* GIS Interactive Dark Map Area */}
          <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col justify-between p-6">
            {/* Grid & Radar Circles background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Simulated GIS Campus Map Corridors */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40">
              <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#3B82F6" strokeWidth="3" strokeDasharray="6,6" />
              <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="#10B981" strokeWidth="3" strokeDasharray="6,6" />
              <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="#6366F1" strokeWidth="2" />
            </svg>

            {/* Floating Top Radar Status Badge */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-emerald-400 font-bold shadow-md">
                ● SMARTBUS TELEMETRY GATEWAY v4.12 • SOCKET ONLINE
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400">
                MAP RESOLUTION: 1:50,000 CAMPUS METRIC
              </span>
            </div>

            {/* Interactive Bus Markers on Map */}
            <div className="absolute inset-0 z-20 pointer-events-auto">
              {filteredFleet.map((bus) => {
                const isSelected = bus.id === selectedBusId
                return (
                  <div
                    key={bus.id}
                    onClick={() => setSelectedBusId(bus.id)}
                    style={{
                      left: `${bus.coords.x}%`,
                      top: `${bus.coords.y}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    {/* Pulsing radar ring */}
                    {isSelected && (
                      <span className="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping" />
                    )}

                    {/* Bus Marker Icon */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xl transition-transform group-hover:scale-110 ${
                        isSelected
                          ? "bg-blue-600 text-white border-2 border-white ring-4 ring-blue-500/20"
                          : bus.status === "MOVING"
                          ? "bg-emerald-600 text-white border border-white/60"
                          : bus.status === "STOPPED"
                          ? "bg-amber-600 text-white border border-white/60"
                          : "bg-slate-700 text-slate-300 border border-slate-600"
                      }`}
                    >
                      <Bus className="h-3.5 w-3.5" />
                      <span>{bus.busNumber}</span>
                    </div>

                    {/* Hover tooltip label */}
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-slate-900/95 border border-slate-800 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      {bus.driverName} • {bus.speedKmh} km/h
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Bus Telemetry Popover Card (Bottom Right Floating) */}
            <div className="relative z-30 mt-auto ml-auto max-w-sm w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl text-slate-100 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
                    <Bus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {selectedBus.busNumber}
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedBus.reg}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{selectedBus.route}</div>
                  </div>
                </div>
                <Badge
                  className={`text-xs font-bold ${
                    selectedBus.delayStatus === "ON_TIME"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {selectedBus.delayStatus === "ON_TIME" ? "On Time" : `+${selectedBus.delayMins}m Delay`}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Speed</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{selectedBus.speedKmh} km/h</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Battery SOC</span>
                  <span className="text-sm font-bold font-mono text-blue-400">{selectedBus.batteryPercent}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Next Stop</span>
                  <span className="text-xs font-bold text-white truncate block mt-0.5" title={selectedBus.nextStop}>
                    {selectedBus.nextStop}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <Button
                  onClick={() => toast.info(`Calling driver ${selectedBus.driverName} at ${selectedBus.driverPhone}`)}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 rounded-xl text-xs font-semibold bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  <Phone className="h-3 w-3 mr-1.5" />
                  Call Driver
                </Button>
                <Button
                  onClick={() => router.push(`/admin/buses/${selectedBus.id}`)}
                  size="sm"
                  className="flex-1 h-8 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  Full Dossier
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency SOS Alert Dialog */}
      <Dialog open={isSosModalOpen} onOpenChange={setIsSosModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-2 border-red-500 shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 text-red-600 animate-pulse">
                <BellRing className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-red-600 dark:text-red-500">
                  EMERGENCY SOS FLEET BROADCAST
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Triggers immediate siren broadcast &amp; SMS alerts to Campus Security and all on-duty drivers
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-400">
              <span className="font-bold uppercase block mb-1">Warning: Emergency Dispatch Action</span>
              This will notify the Chief Transportation Officer, University Security Control Room, and trigger an in-cabin buzzer on the selected vehicle.
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Select Vehicle / Corridor
              </label>
              <select className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm">
                <option value="ALL">Broadcast to ALL 142 Active Vehicles</option>
                <option value="BUS-101">BUS-101 • Main Campus Express #1</option>
                <option value="BUS-102">BUS-102 • Science Park Route #4</option>
                <option value="BUS-103">BUS-103 • South Medical Center #2</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Emergency Reason / Alert Message
              </label>
              <Input
                placeholder="e.g. Heavy rainfall / Waterlogging on North Ring Road. Diversion mandatory."
                className="rounded-xl border-border h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSosModalOpen(false)}
              className="rounded-xl text-xs font-semibold h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsSosModalOpen(false)
                toast.error("EMERGENCY ALERT BROADCASTED to Security Control Room & Driver App!", {
                  duration: 5000,
                })
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-9 px-6 shadow-lg shadow-red-600/30"
            >
              BROADCAST SOS ALERT NOW
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
