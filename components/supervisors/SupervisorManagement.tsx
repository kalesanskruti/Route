"use client"

import React, { useState, useMemo } from "react"
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  Award,
  Clock,
  LayoutGrid,
  List,
  Download,
  Plus,
  Eye,
  Star,
  MapPin,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export interface SupervisorRecord {
  id: string
  employeeId: string
  name: string
  photo: string
  phone: string
  email: string
  assignedZone: string
  teamSize: number
  performanceScore: number
  attendanceToday: "PRESENT" | "ON_LEAVE"
  status: "ACTIVE" | "INACTIVE"
}

export function SupervisorManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const initialSupervisors: SupervisorRecord[] = [
    {
      id: "sup-1",
      employeeId: "EMP-2001",
      name: "Meera Reddy",
      photo: "M",
      phone: "+91 98765 43210",
      email: "meera.reddy@smartbus.com",
      assignedZone: "North Campus Zone",
      teamSize: 12,
      performanceScore: 4.9,
      attendanceToday: "PRESENT",
      status: "ACTIVE",
    },
    {
      id: "sup-2",
      employeeId: "EMP-2002",
      name: "Sanjay Gupta",
      photo: "S",
      phone: "+91 98765 43211",
      email: "sanjay.gupta@smartbus.com",
      assignedZone: "South Medical Center",
      teamSize: 8,
      performanceScore: 4.7,
      attendanceToday: "PRESENT",
      status: "ACTIVE",
    },
    {
      id: "sup-3",
      employeeId: "EMP-2003",
      name: "Priya Patel",
      photo: "P",
      phone: "+91 98765 43212",
      email: "priya.patel@smartbus.com",
      assignedZone: "Science Park Area",
      teamSize: 15,
      performanceScore: 4.8,
      attendanceToday: "ON_LEAVE",
      status: "ACTIVE",
    }
  ]

  const [supervisors] = useState<SupervisorRecord[]>(initialSupervisors)

  const filteredSupervisors = useMemo(() => {
    return supervisors.filter((sup) => {
      const matchesSearch =
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.assignedZone.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        selectedStatusFilter === "ALL" || sup.status === selectedStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [supervisors, searchQuery, selectedStatusFilter])

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Supervisors
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              {supervisors.length} Supervisors
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage route supervisors, team assignments, and performance metrics
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
            onClick={() => toast.success("Exported complete supervisor registry as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Registry</span>
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Supervisor
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, EMP ID, or zone..."
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

      {/* Grid of Modern Supervisor Cards */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupervisors.map((sup) => (
            <Card
              key={sup.id}
              className="rounded-2xl border-border bg-card shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-lg font-extrabold shadow-sm">
                      {sup.photo}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        {sup.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-mono mt-0.5">
                        {sup.employeeId}
                      </CardDescription>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      sup.attendanceToday === "PRESENT"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {sup.attendanceToday === "PRESENT" ? "Present Today" : "On Leave"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border border-border">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Assigned Zone
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block truncate">
                      {sup.assignedZone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Performance
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-foreground">{sup.performanceScore}</span>
                      <span className="text-[11px] text-muted-foreground">/ 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-muted-foreground">Team Size:</span>
                    <span className="font-bold text-foreground truncate">{sup.teamSize} Drivers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-semibold text-foreground truncate">{sup.email}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    onClick={() => toast.info(`Calling supervisor at ${sup.phone}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-semibold rounded-xl h-8 text-blue-600 dark:text-blue-400 border-border"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-semibold rounded-xl h-8 border-border"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Table placeholder for brevity */}
          <div className="p-8 text-center text-muted-foreground text-sm">
            Table view is currently under construction.
          </div>
        </div>
      )}
    </div>
  )
}
