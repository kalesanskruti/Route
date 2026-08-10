"use client"

import React, { useState } from "react"
import {
  FileText,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Eye,
  Building2,
  Bus,
  UserCheck,
  RefreshCw,
  Layers,
  ShieldCheck,
  Wrench,
  BarChart3,
  Clock,
  ArrowRight,
  Printer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export type ReportType =
  | "ATTENDANCE"
  | "ROUTE_UTILIZATION"
  | "FUEL_ANALYSIS"
  | "DRIVER_AUDIT"
  | "COMPLIANCE_DOSSIER"
  | "MAINTENANCE_COST"

export function ReportsView() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("ATTENDANCE")
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "EXCEL" | "CSV">("PDF")
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days")
  const [selectedCampus, setSelectedCampus] = useState("All University Campuses")
  const [selectedBusFilter, setSelectedBusFilter] = useState("All Fleet Vehicles")
  const [isGenerating, setIsGenerating] = useState(false)

  const reportTypes = [
    {
      id: "ATTENDANCE" as ReportType,
      title: "Daily Attendance Summary",
      description: "RFID smart card boarding & drop-off audit across 5 departments",
      icon: Layers,
      badge: "Most Exported",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      id: "ROUTE_UTILIZATION" as ReportType,
      title: "Route Utilization Report",
      description: "Seat occupancy %, on-time arrival rate, and stop delay logs",
      icon: BarChart3,
      badge: "Operational BI",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "FUEL_ANALYSIS" as ReportType,
      title: "Fuel & EV Energy Analysis",
      description: "Diesel litres vs EV kWh energy usage & AI predictive savings",
      icon: Clock,
      badge: "ESG Metrics",
      badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
    {
      id: "DRIVER_AUDIT" as ReportType,
      title: "Driver Performance Audit",
      description: "Safety scores out of 5.0, speed alert logs, and attendance roster",
      icon: UserCheck,
      badge: "HR & Safety",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      id: "COMPLIANCE_DOSSIER" as ReportType,
      title: "Compliance Expiry Dossier",
      description: "Permits, comprehensive insurance, fitness test & PUC certs",
      icon: ShieldCheck,
      badge: "Statutory",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: "MAINTENANCE_COST" as ReportType,
      title: "Maintenance Cost Analysis",
      description: "Preventive workshop invoices, spare parts replaced & repairs",
      icon: Wrench,
      badge: "Finance",
      badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
  ]

  // Mock preview table data for each report type
  const previewHeaders: Record<ReportType, string[]> = {
    ATTENDANCE: ["Date", "Campus Route", "Total Enrolled", "Boarded", "Dropped", "Attendance %"],
    ROUTE_UTILIZATION: ["Route Code", "Corridor Name", "Assigned Bus", "Scheduled Mins", "Actual Mins", "On-Time SLA"],
    FUEL_ANALYSIS: ["Month / Period", "Fleet Powertrain", "Total Distance", "Diesel / kWh Used", "Cost per Km", "AI Saved"],
    DRIVER_AUDIT: ["Employee ID", "Driver Name", "Assigned Bus", "Total Km Driven", "Speed Alerts", "Safety Score"],
    COMPLIANCE_DOSSIER: ["Bus #", "Registration", "Document Type", "Certificate ID", "Expiry Date", "Compliance Status"],
    MAINTENANCE_COST: ["Work Order #", "Bus #", "Service Type", "Workshop Depot", "Parts Replaced", "Total Cost"],
  }

  const previewRows: Record<ReportType, Array<Array<string | number>>> = {
    ATTENDANCE: [
      ["04 Aug 2026", "Main Campus Express #1", 52, 52, 51, "99.8%"],
      ["04 Aug 2026", "Science Park Route #4", 52, 50, 50, "96.2%"],
      ["04 Aug 2026", "South Medical Center #2", 40, 38, 38, "95.0%"],
      ["04 Aug 2026", "North Gateway Line #8", 40, 39, 39, "97.5%"],
    ],
    ROUTE_UTILIZATION: [
      ["RT-EXP-01", "Main Campus Express #1", "BUS-101 (EV)", "45 mins", "43 mins", "100% On-Time"],
      ["RT-SCI-04", "Science Park Route #4", "BUS-102 (EV)", "38 mins", "39 mins", "98.5% On-Time"],
      ["RT-MED-02", "South Medical Center #2", "BUS-103 (Diesel)", "52 mins", "50 mins", "99.1% On-Time"],
      ["RT-GTW-08", "North Gateway Line #8", "BUS-104 (Diesel)", "40 mins", "42 mins", "96.0% On-Time"],
    ],
    FUEL_ANALYSIS: [
      ["July 2026", "Electric (Tata Starbus EV)", "18,400 km", "4,820 kWh", "₹4.20 / km", "₹42,000"],
      ["July 2026", "Diesel (Ashok Leyland)", "14,200 km", "3,800 Litres", "₹24.80 / km", "₹12,400"],
      ["June 2026", "Electric (Tata Starbus EV)", "19,100 km", "4,980 kWh", "₹4.18 / km", "₹44,500"],
      ["June 2026", "Diesel (Ashok Leyland)", "13,900 km", "3,750 Litres", "₹25.10 / km", "₹11,800"],
    ],
    DRIVER_AUDIT: [
      ["EMP-4012", "Rajesh Kumar", "BUS-101", "14,200 km", "0 Alerts", "4.9 / 5.0"],
      ["EMP-4013", "Anil Sharma", "BUS-102", "13,800 km", "1 Alert", "4.8 / 5.0"],
      ["EMP-4014", "Vikram Patel", "BUS-103", "16,400 km", "0 Alerts", "4.95 / 5.0"],
      ["EMP-4015", "Suresh Singh", "BUS-104", "12,100 km", "2 Alerts", "4.7 / 5.0"],
    ],
    COMPLIANCE_DOSSIER: [
      ["BUS-101", "KA-01-EQ-4421", "Comprehensive Insurance", "POL-ICICI-2026-9912", "14 Jan 2027", "VALID"],
      ["BUS-102", "KA-01-EQ-4422", "State Route Permit", "STA/KA/01/2023/8812", "31 Jan 2029", "VALID"],
      ["BUS-103", "KA-01-EQ-4425", "Insurance Policy", "POL-ICICI-2025-8812", "13 Aug 2026", "EXPIRING"],
      ["BUS-105", "KA-01-EQ-4433", "State Permit", "STA/KA/2021/4092", "04 Aug 2026", "EXPIRED"],
    ],
    MAINTENANCE_COST: [
      ["WO-2026-081", "BUS-101", "10,000 km Preventive", "Tata EV Authorized Workshop", "Brake Pads, Cabin Filter", "₹14,200"],
      ["WO-2026-079", "BUS-102", "Battery Thermal Audit", "Central EV Fleet Service Hub", "Sensor recalibration", "₹8,500"],
      ["WO-2026-074", "BUS-106", "Tire Replacement", "Tata EV Authorized Workshop", "2x Rear Radial Tires", "₹34,000"],
      ["WO-2026-068", "BUS-103", "Front Suspension", "Ashok Leyland Workshop", "Suspension bushings", "₹12,200"],
    ],
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      const currentReport = reportTypes.find((r) => r.id === selectedReport)?.title
      toast.success(
        `Generated & downloaded official ${currentReport} in ${selectedFormat} format successfully!`
      )
    }, 900)
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Professional BI Reports Generation Center
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              ISO / Statutory Ready
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Export customizable executive dossiers, ridership statistics, statutory audits, and workshop expense sheets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.info("Sent report print command to connected campus printer")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Dossier</span>
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-5 shadow-sm"
          >
            <Download className={`h-3.5 w-3.5 mr-1.5 ${isGenerating ? "animate-bounce" : ""}`} />
            <span>{isGenerating ? "Compiling Report..." : `Generate & Download ${selectedFormat}`}</span>
          </Button>
        </div>
      </div>

      {/* Step 1: Select Report Type (6 Grid Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Step 1: Select Enterprise BI Report Type
          </h2>
          <span className="text-xs text-muted-foreground">Click any card to load live preview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((rep) => {
            const isSelected = selectedReport === rep.id
            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-600/10 border-blue-600/40 shadow-md ring-2 ring-blue-500/20"
                    : "bg-card border-border hover:border-blue-500/30 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-muted text-foreground">
                    <rep.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rep.badgeClass}`}
                  >
                    {rep.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-foreground">{rep.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rep.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-muted-foreground"}>
                    {isSelected ? "● Currently Selected" : "Select Report"}
                  </span>
                  <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600" : "text-muted-foreground"}`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step 2: Configure Report Filters & Export Format */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Step 2: Configure Parameters &amp; Export Format
          </h2>
          <span className="text-xs text-muted-foreground">Applies to live preview &amp; download</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Timeframe / Period
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
            >
              <option value="Today (Live)">Today (Live Data)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Fiscal Year 2026">Fiscal Year 2026</option>
            </select>
          </div>

          {/* Campus Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              University Campus
            </label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
            >
              <option value="All University Campuses">All University Campuses</option>
              <option value="Main Campus — North">Main Campus — North</option>
              <option value="Science & Tech Park">Science &amp; Tech Park</option>
              <option value="South Medical Center">South Medical Center</option>
            </select>
          </div>

          {/* Bus Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Fleet Vehicle / Roster
            </label>
            <select
              value={selectedBusFilter}
              onChange={(e) => setSelectedBusFilter(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
            >
              <option value="All Fleet Vehicles">All Fleet Vehicles (142)</option>
              <option value="EV Fleet Only">EV Fleet Only (84)</option>
              <option value="Diesel Fleet Only">Diesel Fleet Only (58)</option>
            </select>
          </div>

          {/* Export Format Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Document Export Format
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted border border-border">
              {[
                { id: "PDF" as const, label: "PDF", icon: FileText },
                { id: "EXCEL" as const, label: "Excel", icon: FileSpreadsheet },
                { id: "CSV" as const, label: "CSV", icon: FileCode },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedFormat === fmt.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <fmt.icon className="h-3.5 w-3.5" />
                  <span>{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Step 3: Interactive Live Report Preview Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-blue-600" />
              Live Report Preview • {reportTypes.find((r) => r.id === selectedReport)?.title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Showing 4 sample records from current database ({selectedDateRange} • {selectedCampus})
            </CardDescription>
          </div>

          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs">
            100% Data Verified
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                {previewHeaders[selectedReport].map((hdr, idx) => (
                  <th key={idx} className="py-3.5 px-4">
                    {hdr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {previewRows[selectedReport].map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-muted/40 transition-colors">
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} className="py-4 px-4 font-medium text-foreground">
                      {typeof cell === "string" && cell.includes("VALID") ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          {cell}
                        </span>
                      ) : typeof cell === "string" && cell.includes("EXPIRED") ? (
                        <span className="text-red-600 dark:text-red-400 font-bold">{cell}</span>
                      ) : typeof cell === "string" && cell.includes("EXPIRING") ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Full export includes all <span className="font-bold text-foreground">142 vehicles</span>,{" "}
            <span className="font-bold text-foreground">4,820 student riders</span>, and complete statutory audit trails.
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-6 shadow-sm w-full sm:w-auto"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Download {selectedFormat} Report Now</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
