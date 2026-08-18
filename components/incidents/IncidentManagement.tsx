"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  LayoutGrid,
  List,
  Download,
  Plus,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export interface IncidentRecord {
  id: string
  incidentId: string
  title: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  date: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  reportedBy: string
  location: string
  description: string
}

export function IncidentManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const initialIncidents: IncidentRecord[] = [
    {
      id: "inc-1",
      incidentId: "INC-2026-001",
      title: "Bus Breakdown on Highway 4",
      severity: "HIGH",
      date: "10 Aug 2026, 08:30 AM",
      status: "IN_PROGRESS",
      reportedBy: "Rajesh Kumar (Driver)",
      location: "Highway 4, Near Exit 12",
      description: "Engine failure. Passengers have been safely evacuated and transferred to a backup bus."
    },
    {
      id: "inc-2",
      incidentId: "INC-2026-002",
      title: "Student Late Boarding Issue",
      severity: "LOW",
      date: "09 Aug 2026, 07:15 AM",
      status: "RESOLVED",
      reportedBy: "Vikram Patel (Driver)",
      location: "Stop 4, Elm Street",
      description: "Student boarded late causing a 5 minute delay for the rest of the route."
    },
    {
      id: "inc-3",
      incidentId: "INC-2026-003",
      title: "Minor Collision",
      severity: "CRITICAL",
      date: "11 Aug 2026, 04:45 PM",
      status: "OPEN",
      reportedBy: "Meera Reddy (Supervisor)",
      location: "Main Campus North Gate",
      description: "Minor fender bender at the intersection. No injuries reported. Awaiting police report."
    }
  ]

  const [incidents] = useState<IncidentRecord[]>(initialIncidents)

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        selectedStatusFilter === "ALL" || incident.status === selectedStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [incidents, searchQuery, selectedStatusFilter])

  const getSeverityBadge = (severity: IncidentRecord["severity"]) => {
    switch (severity) {
      case "LOW":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Low</Badge>
      case "MEDIUM":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Medium</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">High</Badge>
      case "CRITICAL":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Critical</Badge>
    }
  }

  const getStatusBadge = (status: IncidentRecord["status"]) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Open</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">In Progress</Badge>
      case "RESOLVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Resolved</Badge>
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Incidents & Reports
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              {incidents.length} Records
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track, manage, and resolve safety incidents and operational reports
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
            onClick={() => toast.success("Exported incident report as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Report Incident
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, title, or location..."
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
              <option value="ALL">All Incidents</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Modern Incident Cards */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              className="rounded-2xl border-border bg-card shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm ${
                      incident.severity === 'CRITICAL' ? 'bg-gradient-to-br from-red-600 to-rose-700' :
                      incident.severity === 'HIGH' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                      incident.severity === 'MEDIUM' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                      'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 truncate">
                        {incident.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-mono mt-0.5">
                        {incident.incidentId}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {getSeverityBadge(incident.severity)}
                  {getStatusBadge(incident.status)}
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-muted/30 p-3 rounded-xl border border-border line-clamp-3 leading-relaxed">
                  {incident.description}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-bold text-foreground truncate">{incident.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold text-foreground truncate">{incident.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-muted-foreground">Reported By:</span>
                    <span className="font-semibold text-foreground truncate">{incident.reportedBy}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-semibold rounded-xl h-8 border-border text-blue-600"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Details
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
