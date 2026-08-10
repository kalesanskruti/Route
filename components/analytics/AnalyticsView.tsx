"use client"

import React, { useState } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Building2, 
  Zap, 
  ShieldCheck, 
  Wrench, 
  Fuel, 
  Users, 
  Bus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Colors for Recharts components
const COLORS = {
  blue: "#2563EB",
  emerald: "#10B981",
  amber: "#F59E0B",
  violet: "#8B5CF6",
  navy: "#0F172A",
  red: "#EF4444",
  cyan: "#06B6D4",
}

const DEPARTMENT_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4"]
const COMPLIANCE_COLORS = ["#10B981", "#F59E0B", "#EF4444"]

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState("30 Days")
  const [selectedCampus, setSelectedCampus] = useState("All University Campuses")

  // Chart 1: Fleet Utilization Data (Bar/Area)
  const utilizationData = [
    { day: "Mon", operationalHours: 1120, idleHours: 180, utilizationPercent: 86.1 },
    { day: "Tue", operationalHours: 1180, idleHours: 140, utilizationPercent: 89.4 },
    { day: "Wed", operationalHours: 1210, idleHours: 120, utilizationPercent: 91.0 },
    { day: "Thu", operationalHours: 1195, idleHours: 130, utilizationPercent: 90.2 },
    { day: "Fri", operationalHours: 1240, idleHours: 110, utilizationPercent: 91.8 },
    { day: "Sat", operationalHours: 720, idleHours: 480, utilizationPercent: 60.0 },
    { day: "Sun", operationalHours: 340, idleHours: 820, utilizationPercent: 29.3 },
  ]

  // Chart 2: Attendance Trends (Area)
  const attendanceTrendsData = [
    { date: "Aug 1", boarded: 4520, dropped: 4505 },
    { date: "Aug 2", boarded: 4710, dropped: 4690 },
    { date: "Aug 3", boarded: 4680, dropped: 4672 },
    { date: "Aug 4", boarded: 4810, dropped: 4800 },
    { date: "Aug 5", boarded: 4890, dropped: 4882 },
    { date: "Aug 6", boarded: 4820, dropped: 4815 },
  ]

  // Chart 3: Route Efficiency (Bar)
  const routeEfficiencyData = [
    { route: "North Line 1", scheduledMins: 45, actualMins: 43, efficiency: 104 },
    { route: "Science Pk #4", scheduledMins: 38, actualMins: 39, efficiency: 97 },
    { route: "Med Campus #2", scheduledMins: 52, actualMins: 50, efficiency: 104 },
    { route: "South Exp #8", scheduledMins: 60, actualMins: 64, efficiency: 93 },
    { route: "Gateway Cir #3", scheduledMins: 35, actualMins: 34, efficiency: 103 },
  ]

  // Chart 4: Driver Performance (Bar)
  const driverPerformanceData = [
    { driver: "Rajesh K.", safetyScore: 4.9, onTimePercent: 98 },
    { driver: "Anil M.", safetyScore: 4.8, onTimePercent: 96 },
    { driver: "Vikram P.", safetyScore: 4.95, onTimePercent: 99 },
    { driver: "Suresh S.", safetyScore: 4.7, onTimePercent: 93 },
    { driver: "Karthik R.", safetyScore: 4.85, onTimePercent: 97 },
  ]

  // Chart 5: Student Distribution by Department (Donut)
  const studentDeptData = [
    { name: "Engineering & Tech", students: 2180 },
    { name: "Medicine & Surgery", students: 960 },
    { name: "Business Management", students: 840 },
    { name: "Arts & Humanities", students: 540 },
    { name: "Law & Public Policy", students: 300 },
  ]

  // Chart 6: Bus Occupancy (Radial / Progress Ring)
  const occupancyData = [
    { name: "Main Campus North", value: 92, fill: "#2563EB" },
    { name: "Science & Tech Park", value: 88, fill: "#10B981" },
    { name: "South Medical Center", value: 84, fill: "#8B5CF6" },
  ]

  // Chart 7: Maintenance Cost Trends (Line)
  const maintenanceCostData = [
    { month: "Jan", expenditure: 84000, preventive: 62000, repairs: 22000 },
    { month: "Feb", expenditure: 78000, preventive: 60000, repairs: 18000 },
    { month: "Mar", expenditure: 91000, preventive: 65000, repairs: 26000 },
    { month: "Apr", expenditure: 74000, preventive: 59000, repairs: 15000 },
    { month: "May", expenditure: 68000, preventive: 54000, repairs: 14000 },
    { month: "Jun", expenditure: 95000, preventive: 71000, repairs: 24000 },
    { month: "Jul", expenditure: 72000, preventive: 61000, repairs: 11000 },
  ]

  // Chart 8: Compliance Status (Donut)
  const complianceStatusData = [
    { name: "Valid & Current", count: 133 },
    { name: "Expiring (<30d)", count: 6 },
    { name: "Expired / Action Req.", count: 3 },
  ]

  // Chart 9: Fuel / EV Energy Usage (Bar - Future AI Telemetry)
  const fuelUsageData = [
    { month: "Jan", dieselLitres: 14200, evKwh: 4800, aiEstimatedSavings: 840 },
    { month: "Feb", dieselLitres: 13800, evKwh: 5100, aiEstimatedSavings: 910 },
    { month: "Mar", dieselLitres: 14500, evKwh: 5400, aiEstimatedSavings: 1040 },
    { month: "Apr", dieselLitres: 13400, evKwh: 5800, aiEstimatedSavings: 1120 },
    { month: "May", dieselLitres: 12900, evKwh: 6100, aiEstimatedSavings: 1250 },
    { month: "Jun", dieselLitres: 13200, evKwh: 6400, aiEstimatedSavings: 1380 },
  ]

  return (
    <div className="space-y-8 font-sans">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Enterprise Analytics Platform
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              Business Intelligence
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Deep-dive telemetry metrics, operational efficiency, ridership distributions, and predictive maintenance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Campus Filter */}
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All University Campuses">All University Campuses</option>
            <option value="Main Campus — North">Main Campus — North (64 Buses)</option>
            <option value="Science & Tech Park">Science & Tech Park (42 Buses)</option>
            <option value="South Medical Center">South Medical Center (36 Buses)</option>
          </select>

          {/* Date Range Group */}
          <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
            {["7 Days", "30 Days", "Q3", "YTD"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === range
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            onClick={() => toast.success("Exported full analytics dataset as XLSX")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-3.5 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export BI Report
          </Button>
        </div>
      </div>

      {/* Grid of 9 Recharts Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Fleet Utilization */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                1. Fleet Utilization
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                Avg 90.2%
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Operational vs Idle transit hours
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar name="Operational (Hrs)" dataKey="operationalHours" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                <Bar name="Idle (Hrs)" dataKey="idleHours" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Attendance Trends */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                2. Attendance Trends
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                99.8% Accuracy
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Daily Boarded vs Dropped student count
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendsData}>
                <defs>
                  <linearGradient id="colorBoarded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[4400, 5000]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  name="Boarded"
                  type="monotone"
                  dataKey="boarded"
                  stroke={COLORS.emerald}
                  fillOpacity={1}
                  fill="url(#colorBoarded)"
                />
                <Line name="Dropped" type="monotone" dataKey="dropped" stroke={COLORS.blue} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Route Efficiency */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                3. Route Efficiency
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                On-Time SLA
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Scheduled vs Actual transit minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeEfficiencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis dataKey="route" type="category" stroke="var(--muted-foreground)" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar name="Scheduled (Mins)" dataKey="scheduledMins" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
                <Bar name="Actual (Mins)" dataKey="actualMins" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Driver Performance */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                4. Driver Performance
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Avg 4.86 / 5.0
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Safety score vs On-Time schedule rate %
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="driver" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} domain={[4.0, 5.0]} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} domain={[85, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar yAxisId="left" name="Safety Score (/5)" dataKey="safetyScore" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" name="On-Time %" type="monotone" dataKey="onTimePercent" stroke={COLORS.blue} strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Student Distribution by Department */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                5. Student Distribution
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                4,820 Total
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Enrolled riders across 5 departments
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentDeptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="students"
                  label={({ name, percent }: any) => `${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {studentDeptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 6: Bus Occupancy (Radial Bar) */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                6. Bus Occupancy
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                88% Avg Load
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Seat utilization across university campuses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="90%"
                barSize={14}
                data={occupancyData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  background
                  dataKey="value"
                  label={{ position: "insideStart", fill: "#fff", fontSize: 10 }}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="bottom" wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 7: Maintenance Cost Trends */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                7. Maintenance Cost
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                ₹5.62L YTD
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Monthly workshop expenditure (Preventive vs Repairs)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line name="Total Cost" type="monotone" dataKey="expenditure" stroke={COLORS.amber} strokeWidth={2.5} />
                <Line name="Preventive" type="monotone" dataKey="preventive" stroke={COLORS.emerald} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 8: Compliance Status */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                8. Compliance Status
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                133 / 142 Valid
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Statutory documents (Insurance, Permits, PUC)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  label={({ name, value }: any) => `${value || 0}`}
                  labelLine={false}
                >
                  {complianceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COMPLIANCE_COLORS[index % COMPLIANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 9: Fuel / EV Energy Usage (Future AI Telemetry) */}
        <Card className="rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                9. Fuel &amp; EV Usage
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  Future AI Telemetry
                </span>
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Diesel Litres vs EV kWh &amp; AI Predictive fuel savings
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar name="Diesel (L)" dataKey="dieselLitres" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                <Bar name="EV (kWh)" dataKey="evKwh" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
