"use client"

import React, { useState, useMemo } from "react"
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Bus,
  Route as RouteIcon,
  MapPin,
  RefreshCw,
  Eye,
  Check,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export interface AttendanceRecord {
  id: string
  studentId: string
  name: string
  department: string
  semester: string
  route: string
  busNumber: string
  stopName: string
  timestamp: string
  status: "BOARDED" | "DROPPED" | "MISSED_TAP"
  cardRfid: string
}

export function AttendanceView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>("ALL")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const initialRecords: AttendanceRecord[] = [
    {
      id: "att-1",
      studentId: "2024-CS-0091",
      name: "Aarav Sharma",
      department: "Engineering & Tech",
      semester: "Sem 4",
      route: "Main Campus Express #1",
      busNumber: "BUS-101",
      stopName: "North Gate Hub",
      timestamp: "07:31:12 AM",
      status: "BOARDED",
      cardRfid: "RFID-8819001",
    },
    {
      id: "att-2",
      studentId: "2025-MBA-0142",
      name: "Priya Nair",
      department: "Business Management",
      semester: "Sem 2",
      route: "Science Park Route #4",
      busNumber: "BUS-102",
      stopName: "Science Block D",
      timestamp: "07:42:05 AM",
      status: "BOARDED",
      cardRfid: "RFID-8819042",
    },
    {
      id: "att-3",
      studentId: "2023-AR-0012",
      name: "Rohan Gupta",
      department: "Engineering & Tech",
      semester: "Sem 6",
      route: "South Medical Center #2",
      busNumber: "BUS-103",
      stopName: "Engineering Library",
      timestamp: "07:55:40 AM",
      status: "BOARDED",
      cardRfid: "RFID-8819091",
    },
    {
      id: "att-4",
      studentId: "2024-LW-0084",
      name: "Sanya Mehta",
      department: "Law & Public Policy",
      semester: "Sem 4",
      route: "North Gateway Line #8",
      busNumber: "BUS-104",
      stopName: "North Gate Hub",
      timestamp: "08:14:22 AM",
      status: "DROPPED",
      cardRfid: "RFID-8819112",
    },
    {
      id: "att-5",
      studentId: "2025-MD-0209",
      name: "Kiran Rao",
      department: "Medicine & Surgery",
      semester: "Sem 2",
      route: "Main Campus Express #1",
      busNumber: "BUS-101",
      stopName: "Central Auditorium",
      timestamp: "08:18:10 AM",
      status: "DROPPED",
      cardRfid: "RFID-8819201",
    },
    {
      id: "att-6",
      studentId: "2023-CS-0412",
      name: "Neha Joshi",
      department: "Engineering & Tech",
      semester: "Sem 6",
      route: "Main Campus Express #1",
      busNumber: "BUS-101",
      stopName: "North Gate Hub",
      timestamp: "07:34:00 AM",
      status: "MISSED_TAP",
      cardRfid: "RFID-8819300",
    },
    {
      id: "att-7",
      studentId: "2024-AH-0019",
      name: "Devendra Patel",
      department: "Arts & Humanities",
      semester: "Sem 4",
      route: "Science Park Route #4",
      busNumber: "BUS-102",
      stopName: "Science Block D",
      timestamp: "08:16:45 AM",
      status: "DROPPED",
      cardRfid: "RFID-8819342",
    },
  ]

  const [records] = useState<AttendanceRecord[]>(initialRecords)

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.cardRfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.stopName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRoute =
        selectedRouteFilter === "ALL" || rec.route === selectedRouteFilter
      const matchesStatus =
        selectedStatusFilter === "ALL" || rec.status === selectedStatusFilter
      return matchesSearch && matchesRoute && matchesStatus
    })
  }, [records, searchQuery, selectedRouteFilter, selectedStatusFilter])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Synchronized real-time RFID tap logs from 142 bus card readers")
    }, 600)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Live Student RFID Attendance Hub
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Live Readers Connected
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time student card taps from smart readers on active campus routes • Parent SMS alerts enabled
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
            <span>Sync Taps</span>
          </Button>

          <Button
            onClick={() => toast.success("Exported today's complete attendance log as XLSX")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Roster Log
          </Button>
        </div>
      </div>

      {/* 4 Attendance Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today&apos;s Boardings</span>
            <div className="text-2xl font-extrabold text-foreground mt-1">4,820</div>
            <span className="text-xs text-muted-foreground">100% scheduled riders</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">On-Time Boarding</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">99.8%</div>
            <span className="text-xs text-muted-foreground">+0.4% vs last week</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Missing RFID Taps</span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">6</div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Manual verification req.</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMS Alerts Sent</span>
            <div className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">9,640</div>
            <span className="text-xs text-muted-foreground">Boarded + Dropped SMS</span>
          </div>
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Clock className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student, roll #, RFID card, or stop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 rounded-xl border-border text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Route:</span>
              <select
                value={selectedRouteFilter}
                onChange={(e) => setSelectedRouteFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Routes</option>
                <option value="Main Campus Express #1">Main Campus Express #1</option>
                <option value="Science Park Route #4">Science Park Route #4</option>
                <option value="South Medical Center #2">South Medical Center #2</option>
                <option value="North Gateway Line #8">North Gateway Line #8</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Tap Status</option>
                <option value="BOARDED">Boarded</option>
                <option value="DROPPED">Dropped</option>
                <option value="MISSED_TAP">Missed Tap</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Live Attendance Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-3.5 px-4">Student &amp; Roll #</th>
                <th className="py-3.5 px-4">Department &amp; Sem</th>
                <th className="py-3.5 px-4">Route &amp; Bus Number</th>
                <th className="py-3.5 px-4">Stop Point</th>
                <th className="py-3.5 px-4">RFID Card Serial</th>
                <th className="py-3.5 px-4 text-center">Scan Timestamp</th>
                <th className="py-3.5 px-4 text-center">Event Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-foreground">{rec.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">{rec.studentId}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-foreground">{rec.department}</div>
                    <div className="text-xs text-muted-foreground">{rec.semester}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-foreground">{rec.route}</div>
                    <div className="text-xs font-mono text-blue-600 dark:text-blue-400">{rec.busNumber}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{rec.stopName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-muted-foreground">
                    {rec.cardRfid}
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-xs font-bold text-foreground">
                    {rec.timestamp}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        rec.status === "BOARDED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : rec.status === "DROPPED"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {rec.status === "BOARDED" ? "Boarded" : rec.status === "DROPPED" ? "Dropped" : "Missed Tap"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button
                      onClick={() => toast.info(`Resending automated SMS attendance alert to parents of ${rec.name}`)}
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-xl text-xs font-semibold"
                    >
                      Resend SMS
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
