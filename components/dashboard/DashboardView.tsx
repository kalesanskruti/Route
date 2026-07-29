"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  Bus, 
  Route as RouteIcon, 
  Users, 
  UserCheck, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  MapPin,
  Clock,
  Map
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveMap } from "../shared/LiveMap"

interface DashboardData {
  metrics: {
    totalBuses: number
    activeRoutes: number
    driversOnDuty: number
    totalStudents: number
    attendanceToday: {
      boarded: number
      dropped: number
    }
    busOverview: {
      active: number
      maintenance: number
    }
  }
  recentScans: Array<{
    id: string
    student: {
      name: string
      classSection: string
    }
    route: {
      name: string
    }
    status: "BOARDED" | "DROPPED"
    timestamp: string
  }>
  timezone: string
  todayDate: string
}

export function DashboardView() {
  const [selectedTrackRouteId, setSelectedTrackRouteId] = useState<string | null>(null)

  const { data, isLoading, error, refetch, isRefetching } = useQuery<DashboardData>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard")
      if (!response.ok) {
        throw new Error("Failed to fetch metrics")
      }
      return response.json()
    },
    refetchInterval: 15000, // Auto-refresh every 15s to support live telemetry mock updates
  })

  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ["routes"],
    queryFn: async () => {
      const response = await fetch("/api/routes")
      if (!response.ok) throw new Error("Failed to fetch routes")
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-sm text-slate-400 font-medium">Fetching real-time logistics...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/20 bg-slate-900/60 p-6 text-center max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-rose-400">Loading Error</CardTitle>
          <CardDescription className="text-slate-400">
            We encountered an issue downloading the telemetry dashboard data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} className="bg-rose-600 hover:bg-rose-500 text-white font-medium">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { metrics, recentScans } = data

  const cardItems = [
    {
      title: "Total Fleet Buses",
      value: metrics.totalBuses,
      desc: `${metrics.busOverview.active} Active, ${metrics.busOverview.maintenance} Maintenance`,
      icon: Bus,
      glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Logistics Routes",
      value: metrics.activeRoutes,
      desc: "All systems operational",
      icon: RouteIcon,
      glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Active Drivers on Duty",
      value: metrics.driversOnDuty,
      desc: "Currently assigned on routes",
      icon: UserCheck,
      glow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
      iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "Enrolled Students Mapped",
      value: metrics.totalStudents,
      desc: "Assigned routes and pickup stops",
      icon: Users,
      glow: "group-hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]",
      iconColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    },
  ]

  return (
    <div className="space-y-8 font-sans">
      {/* Title block with refresh action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            System Telemetry Dashboard
            {isRefetching && <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Displaying database summaries and scans for date <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-semibold font-mono">{data.todayDate}</code> ({data.timezone}).
          </p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          className="border-white/10 text-slate-300 hover:bg-white/5 h-9"
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          Force Refresh
        </Button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cardItems.map((card) => (
          <Card key={card.title} className="group border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-white/10 hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {card.title}
                  </span>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {card.value}
                  </div>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${card.iconColor} ${card.glow}`}>
                  <card.icon className="h-5.5 w-5.5" />
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {card.desc}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Split Cards: Left: Analytics, Right: Scans Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) - Attendance & Fleet Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live tracking map card */}
          {(() => {
            const trackableRoutes = routes.filter(r => r.busId && r.stops && r.stops.length > 0)
            const currentTrackRoute = trackableRoutes.find(r => r.id === selectedTrackRouteId) || trackableRoutes[0]
            
            if (!currentTrackRoute) return null

            return (
              <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl overflow-hidden">
                <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <Map className="h-4.5 w-4.5 text-emerald-450" />
                      Live Fleet Route Tracking
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Coordinates of active bus logistics routes.
                    </CardDescription>
                  </div>
                  {trackableRoutes.length > 1 && (
                    <select
                      value={currentTrackRoute.id}
                      onChange={(e) => setSelectedTrackRouteId(e.target.value)}
                      className="flex h-7 rounded-lg border border-white/5 bg-slate-950/40 px-2 text-xs text-white outline-none"
                    >
                      {trackableRoutes.map(r => (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                          {r.name}
                        </option>
                      ))}
                    </select>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <LiveMap 
                    busId={currentTrackRoute.busId} 
                    routeName={currentTrackRoute.name} 
                    stops={currentTrackRoute.stops} 
                  />
                </CardContent>
              </Card>
            )
          })()}
          
          {/* Attendance Overview Card */}
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
                Attendance Scans Mapped (Today)
              </CardTitle>
              <CardDescription className="text-slate-400">
                Boarding vs Dropoff records processed on live terminals today.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-2">
                  <div className="text-xs font-medium text-slate-400">Morning Boarded Today</div>
                  <div className="text-2xl font-bold text-emerald-400">{metrics.attendanceToday.boarded}</div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 space-y-2">
                  <div className="text-xs font-medium text-slate-400">Afternoon Dropped Today</div>
                  <div className="text-2xl font-bold text-blue-400">{metrics.attendanceToday.dropped}</div>
                </div>
              </div>
              
              {/* Graphical representation bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Progress Log (Total Scans: {metrics.attendanceToday.boarded + metrics.attendanceToday.dropped})</span>
                  <span>Goal: {metrics.totalStudents * 2}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  {metrics.totalStudents > 0 ? (
                    <>
                      <div 
                        className="bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${Math.min(100, (metrics.attendanceToday.boarded / (metrics.totalStudents * 2)) * 100)}%` }}
                      />
                      <div 
                        className="bg-blue-500 transition-all duration-500" 
                        style={{ width: `${Math.min(100, (metrics.attendanceToday.dropped / (metrics.totalStudents * 2)) * 100)}%` }}
                      />
                    </>
                  ) : (
                    <div className="w-full bg-slate-800" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fleet status card */}
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Bus className="h-4.5 w-4.5 text-blue-400" />
                Fleet Service Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Active / Dispatch
                    </span>
                    <span className="font-bold text-white">{metrics.busOverview.active} Buses</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      Maintenance / Garage
                    </span>
                    <span className="font-bold text-white">{metrics.busOverview.maintenance} Buses</span>
                  </div>
                </div>
                
                {/* Visual donut bar indicator */}
                <div className="h-6 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  {metrics.totalBuses > 0 ? (
                    <>
                      <div 
                        className="bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(metrics.busOverview.active / metrics.totalBuses) * 100}%` }}
                      />
                      <div 
                        className="bg-amber-500 transition-all duration-500" 
                        style={{ width: `${(metrics.busOverview.maintenance / metrics.totalBuses) * 100}%` }}
                      />
                    </>
                  ) : (
                    <div className="w-full bg-slate-800" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) - Recent Activity Scans */}
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col h-full">
          <CardHeader className="border-b border-white/5 shrink-0">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-emerald-400" />
              Live Scan Activity Feed
            </CardTitle>
            <CardDescription className="text-slate-400">
              Real-time student card scans at bus terminal portals.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 overflow-y-auto min-h-[300px]">
            {recentScans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                No scans processed today yet.
              </div>
            ) : (
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-slate-950/20 transition-all hover:bg-slate-950/30">
                    <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      scan.status === "BOARDED" 
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                    }`}>
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white truncate">{scan.student.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          scan.status === "BOARDED" 
                            ? "bg-emerald-500/15 text-emerald-400" 
                            : "bg-blue-500/15 text-blue-400"
                        }`}>
                          {scan.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{scan.route.name} • Class {scan.student.classSection}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
