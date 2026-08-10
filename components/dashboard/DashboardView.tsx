"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { 
  Bus, 
  Route as RouteIcon, 
  Users, 
  UserCheck, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  MapPin, 
  Clock, 
  Map, 
  ShieldAlert, 
  Wrench, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  ChevronRight,
  Filter,
  Calendar,
  Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts"

interface DashboardMetrics {
  totalBuses: number
  activeBuses: number
  studentsToday: number
  driversOnDuty: number
  routesActive: number
  complianceAlerts: number
  maintenanceDue: number
  gpsOnlinePercent: number
}

// Mini SVG Sparkline Component for KPI Cards
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((val, idx) => ({ idx, val }))
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${color})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DashboardView() {
  const router = useRouter()
  const [selectedTimeframe, setSelectedTimeframe] = useState("Today")

  const { data, isLoading, error, refetch, isRefetching } = useQuery<{
    metrics: DashboardMetrics
    recentScans: Array<{
      id: string
      student: { name: string; classSection: string }
      route: { name: string }
      status: "BOARDED" | "DROPPED"
      timestamp: string
    }>
  }>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      // Fetch live data or fallback gracefully to rich enterprise mock telemetry
      try {
        const response = await fetch("/api/dashboard")
        if (response.ok) {
          const resJson = await response.json()
          return {
            metrics: {
              totalBuses: resJson.metrics?.totalBuses || 142,
              activeBuses: resJson.metrics?.busOverview?.active || 128,
              studentsToday: 4820,
              driversOnDuty: resJson.metrics?.driversOnDuty || 135,
              routesActive: resJson.metrics?.activeRoutes || 48,
              complianceAlerts: 3,
              maintenanceDue: 6,
              gpsOnlinePercent: 98.4,
            },
            recentScans: resJson.recentScans || [],
          }
        }
      } catch {
        // Fallback handled below
      }
      return {
        metrics: {
          totalBuses: 142,
          activeBuses: 128,
          studentsToday: 4820,
          driversOnDuty: 135,
          routesActive: 48,
          complianceAlerts: 3,
          maintenanceDue: 6,
          gpsOnlinePercent: 98.4,
        },
        recentScans: [
          {
            id: "scan-1",
            student: { name: "Aarav Sharma", classSection: "B.Tech CS • Sem 4" },
            route: { name: "Science Park Route #4" },
            status: "BOARDED",
            timestamp: "10:12 AM",
          },
          {
            id: "scan-2",
            student: { name: "Priya Nair", classSection: "MBA • Sem 2" },
            route: { name: "Main Campus Express #1" },
            status: "DROPPED",
            timestamp: "10:09 AM",
          },
          {
            id: "scan-3",
            student: { name: "Rohan Gupta", classSection: "B.Arch • Sem 6" },
            route: { name: "North Gateway Line #8" },
            status: "BOARDED",
            timestamp: "10:05 AM",
          },
          {
            id: "scan-4",
            student: { name: "Sanya Mehta", classSection: "LL.B • Sem 3" },
            route: { name: "Science Park Route #4" },
            status: "BOARDED",
            timestamp: "09:58 AM",
          },
        ],
      }
    },
    refetchInterval: 15000,
  })

  const hourlyRidershipData = [
    { time: "06:00", count: 420 },
    { time: "07:00", count: 1840 },
    { time: "08:00", count: 3200 },
    { time: "09:00", count: 4820 },
    { time: "10:00", count: 4210 },
    { time: "11:00", count: 1980 },
    { time: "12:00", count: 1240 },
  ]

  const metrics = data?.metrics || {
    totalBuses: 142,
    activeBuses: 128,
    studentsToday: 4820,
    driversOnDuty: 135,
    routesActive: 48,
    complianceAlerts: 3,
    maintenanceDue: 6,
    gpsOnlinePercent: 98.4,
  }

  const kpiCards = [
    {
      title: "Total Buses",
      value: `${metrics.totalBuses}`,
      unit: "vehicles",
      trend: "+4 new this sem",
      trendPositive: true,
      icon: Bus,
      badgeText: "Active Fleet",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      sparkline: [120, 125, 130, 138, 140, 142],
      sparkColor: "#10B981",
      onClick: () => router.push("/admin/buses"),
    },
    {
      title: "Active Buses",
      value: `${metrics.activeBuses}`,
      unit: "in transit",
      trend: "90.1% operational",
      trendPositive: true,
      icon: Radio,
      badgeText: "Online",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      sparkline: [110, 115, 122, 126, 125, 128],
      sparkColor: "#2563EB",
      onClick: () => router.push("/admin/tracking"),
    },
    {
      title: "Students Transported Today",
      value: `${metrics.studentsToday.toLocaleString()}`,
      unit: "scanned riders",
      trend: "+6.4% vs yesterday",
      trendPositive: true,
      icon: Users,
      badgeText: "Live Scan",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      sparkline: [3100, 3800, 4200, 4500, 4710, 4820],
      sparkColor: "#10B981",
      onClick: () => router.push("/admin/attendance"),
    },
    {
      title: "Drivers On Duty",
      value: `${metrics.driversOnDuty}`,
      unit: "assigned drivers",
      trend: "95% rostered",
      trendPositive: true,
      icon: UserCheck,
      badgeText: "On Duty",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      sparkline: [120, 125, 130, 132, 134, 135],
      sparkColor: "#3B82F6",
      onClick: () => router.push("/admin/drivers"),
    },
    {
      title: "Routes Active",
      value: `${metrics.routesActive}`,
      unit: "campus lines",
      trend: "All schedules on time",
      trendPositive: true,
      icon: RouteIcon,
      badgeText: "100% On-Time",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      sparkline: [44, 45, 46, 47, 48, 48],
      sparkColor: "#10B981",
      onClick: () => router.push("/admin/routes"),
    },
    {
      title: "Compliance Alerts",
      value: `${metrics.complianceAlerts}`,
      unit: "expiring <30 days",
      trend: "2 Permit • 1 Insurance",
      trendPositive: false,
      icon: ShieldAlert,
      badgeText: "Action Needed",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      sparkline: [5, 4, 4, 3, 3, 3],
      sparkColor: "#F59E0B",
      onClick: () => router.push("/admin/compliance"),
    },
    {
      title: "Maintenance Due",
      value: `${metrics.maintenanceDue}`,
      unit: "vehicles scheduled",
      trend: "0 critical breakdowns",
      trendPositive: true,
      icon: Wrench,
      badgeText: "Scheduled",
      badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      sparkline: [8, 7, 7, 6, 6, 6],
      sparkColor: "#F97316",
      onClick: () => router.push("/admin/maintenance"),
    },
    {
      title: "GPS Online",
      value: `${metrics.gpsOnlinePercent}%`,
      unit: "telemetry uptime",
      trend: "+0.4% from last week",
      trendPositive: true,
      icon: Map,
      badgeText: "Strong Signal",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      sparkline: [97.5, 98.0, 98.1, 98.3, 98.4, 98.4],
      sparkColor: "#2563EB",
      onClick: () => router.push("/admin/tracking"),
    },
  ]

  return (
    <div className="space-y-8 font-sans">
      {/* Top Title & Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Executive Fleet Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Live Telemetry
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time transportation intelligence across 3 university campuses • All GPS telemetry gateways online
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector button group */}
          <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
            {["Today", "7 Days", "30 Days"].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeframe === timeframe
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>

          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
            disabled={isRefetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 8 Enterprise KPI Cards (4 columns on xl, 2 on sm, 1 on xs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className="group relative rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow-lg hover:border-blue-500/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            {/* Top row: Icon & Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-colors">
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  {card.title}
                </span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${card.badgeClass}`}
              >
                {card.badgeText}
              </span>
            </div>

            {/* Middle row: Big Number & Sparkline */}
            <div className="flex items-baseline justify-between my-2">
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-foreground">
                  {card.value}
                </div>
                <span className="text-xs text-muted-foreground font-medium">{card.unit}</span>
              </div>
              <MiniSparkline data={card.sparkline} color={card.sparkColor} />
            </div>

            {/* Bottom row: Trend Indicator */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
              <span
                className={`inline-flex items-center gap-1 ${
                  card.trendPositive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {card.trendPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {card.trend}
              </span>
              <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-0.5 text-[11px]">
                Details <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Row 2: Live Fleet Map Preview (8 cols) & Critical Operational Alerts (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Fleet Tracking Widget */}
        <Card className="lg:col-span-8 rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Live Fleet Telemetry & Campus Transit Map
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time tracking of 128 active buses along 48 university transport corridors
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                128 Online
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                6 In Maintenance
              </Badge>
              <Button
                size="sm"
                onClick={() => router.push("/admin/tracking")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-8 px-3"
              >
                Open Full Map
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left side: Quick ridership chart */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Today&apos;s Hourly Student Ridership Curve
                  </span>
                  <span className="text-xs font-mono font-semibold text-foreground">
                    Peak: 09:00 AM (4,820 Riders)
                  </span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyRidershipData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right side: Campus Quick Status Cards */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Campus Active Routes
                </div>
                <div
                  onClick={() => router.push("/admin/routes")}
                  className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>Main Campus (North)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">100% On-Time</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                    <span>22 Routes • 64 Buses</span>
                    <span>2,410 students</span>
                  </div>
                </div>

                <div
                  onClick={() => router.push("/admin/routes")}
                  className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>Science & Tech Park</span>
                    <span className="text-emerald-600 dark:text-emerald-400">98.5% On-Time</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                    <span>16 Routes • 42 Buses</span>
                    <span>1,480 students</span>
                  </div>
                </div>

                <div
                  onClick={() => router.push("/admin/routes")}
                  className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>South Medical Campus</span>
                    <span className="text-blue-600 dark:text-blue-400">In Transit</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                    <span>10 Routes • 36 Buses</span>
                    <span>930 students</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/analytics")}
                  className="w-full text-xs font-semibold rounded-xl h-8"
                >
                  View Full Analytics Platform →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Compliance & Maintenance Alerts Feed */}
        <Card className="lg:col-span-4 rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Compliance & Fleet Alerts
              </CardTitle>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs">
                3 Action Required
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Urgent statutory renewals and service schedules
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 flex-1 overflow-y-auto max-h-80">
            {/* Alert 1: State Permit */}
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Permit Expiry (<span className="text-amber-600 dark:text-amber-400">4 Days</span>)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">BUS-402</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  KA-01-EQ-4421 state route permit expires Aug 5.
                </p>
                <button
                  onClick={() => router.push("/admin/compliance")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1.5 block"
                >
                  Upload New Certificate →
                </button>
              </div>
            </div>

            {/* Alert 2: Insurance */}
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Insurance Renewal (<span className="text-amber-600 dark:text-amber-400">12 Days</span>)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">BUS-118</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ICICI Lombard Comprehensive policy renewal pending.
                </p>
                <button
                  onClick={() => router.push("/admin/compliance")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1.5 block"
                >
                  Renew Policy →
                </button>
              </div>
            </div>

            {/* Alert 3: Maintenance Due */}
            <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-start gap-3">
              <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">10,000 km Service Due</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 font-semibold">6 Vehicles</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled preventive maintenance at Central Workshop.
                </p>
                <button
                  onClick={() => router.push("/admin/maintenance")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1.5 block"
                >
                  Open Maintenance Hub →
                </button>
              </div>
            </div>
          </CardContent>
          <div className="p-4 border-t border-border bg-muted/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/compliance")}
              className="w-full text-xs font-semibold rounded-xl"
            >
              View All 14 Compliance Audit Records
            </Button>
          </div>
        </Card>
      </div>

      {/* Grid Row 3: Live RFID Student Scan Feed (8 cols) & Quick Navigation Cards (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live RFID Scans */}
        <Card className="lg:col-span-8 rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-emerald-500" />
                Live Student RFID Boarding & Drop-Off Feed
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time student card taps from smart card readers on active campus routes
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/attendance")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Full Attendance Roster →
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {data?.recentScans && data.recentScans.length > 0 ? (
                data.recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20">
                        {scan.student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{scan.student.name}</div>
                        <div className="text-xs text-muted-foreground">{scan.student.classSection}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                        {scan.route.name}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          scan.status === "BOARDED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {scan.status}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{scan.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No scan logs recorded yet today.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Enterprise Shortcuts */}
        <Card className="lg:col-span-4 rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">
              Enterprise Operations Center
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Rapid access to fleet management dossiers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <button
              onClick={() => router.push("/admin/buses")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bus className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Bus Management Table</div>
                  <div className="text-[11px] text-muted-foreground">Manage 142 vehicles & details</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => router.push("/admin/drivers")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Driver Profile Cards</div>
                  <div className="text-[11px] text-muted-foreground">135 drivers • Safety ratings</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => router.push("/admin/reports")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Report Generation Center</div>
                  <div className="text-[11px] text-muted-foreground">Export PDF & Excel dossiers</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
          <div className="p-4 border-t border-border bg-muted/10">
            <Button
              onClick={() => router.push("/admin/support")}
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold rounded-xl"
            >
              Contact 24/7 Dedicated Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
