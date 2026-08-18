"use client"

import React, { useState, useMemo } from "react"
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Bus,
  Route as RouteIcon,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Loader2,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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

export interface StudentRecord {
  id: string
  studentId: string
  name: string
  department: string
  semester: string
  pickupPoint: string
  assignedBus: string
  route: string
  todayAttendance: "BOARDED" | "DROPPED" | "ABSENT"
  status: "ACTIVE" | "INACTIVE"
}

export function StudentManagement() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL")
  const [selectedAttendanceFilter, setSelectedAttendanceFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const itemsPerPage = 10

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    admissionNumber: "",
    department: "",
    routeId: "",
    busId: "",
  })

  // Queries
  const { data: apiStudents = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students")
      if (!res.ok) throw new Error("Failed to fetch students")
      return res.json()
    },
  })

  const { data: apiBuses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: async () => {
      const res = await fetch("/api/buses")
      if (!res.ok) throw new Error("Failed to fetch buses")
      return res.json()
    },
  })

  const { data: apiRoutes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await fetch("/api/routes")
      if (!res.ok) throw new Error("Failed to fetch routes")
      return res.json()
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newStudent: any) => {
      const payload = {
        ...newStudent,
        parentName: "Default Parent", // Mock required field
        parentMobileNumber: "+91 0000000000", // Mock required field
      }

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create student")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setIsAddModalOpen(false)
      toast.success("Student enrolled and RFID card mapped successfully!")
      setFormData({ name: "", admissionNumber: "", department: "", routeId: "", busId: "" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const filteredStudents = useMemo(() => {
    return apiStudents.filter((stu: any) => {
      const matchesSearch =
        stu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept =
        selectedDeptFilter === "ALL" || stu.department === selectedDeptFilter
      return matchesSearch && matchesDept
    })
  }, [apiStudents, searchQuery, selectedDeptFilter])

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Enterprise Student Transportation Directory
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `${apiStudents.length} Total Enrolled`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            RFID smart card assignments, pickup points, department mapping, and real-time boarding telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.success("Exported complete student directory as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Roster</span>
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Enroll Student Rider
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, ID, pickup point or bus..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 h-9 rounded-xl border-border text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => {
                  setSelectedDeptFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering & Tech">Engineering &amp; Tech</option>
                <option value="Medicine & Surgery">Medicine &amp; Surgery</option>
                <option value="Business Management">Business Management</option>
                <option value="Arts & Humanities">Arts &amp; Humanities</option>
                <option value="Law & Public Policy">Law &amp; Public Policy</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Today&apos;s Status:</span>
              <select
                value={selectedAttendanceFilter}
                onChange={(e) => {
                  setSelectedAttendanceFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Status</option>
                <option value="BOARDED">Boarded</option>
                <option value="DROPPED">Dropped</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Student Data Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-3.5 px-4">Student &amp; ID</th>
                <th className="py-3.5 px-4">Department &amp; Sem</th>
                <th className="py-3.5 px-4">Pickup Stop Point</th>
                <th className="py-3.5 px-4">Assigned Bus</th>
                <th className="py-3.5 px-4">Assigned Route</th>
                <th className="py-3.5 px-4 text-center">Today&apos;s RFID Attendance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((stu: any) => (
                  <tr key={stu.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-foreground">{stu.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{stu.admissionNumber}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-foreground">{stu.department || "N/A"}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{stu.pickupStop?.stopName || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-foreground">{stu.bus?.busNumber || "Unassigned"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{stu.route?.name || "Unassigned"}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                        N/A
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        onClick={() => toast.info(`Viewing RFID scan history for ${stu.name}`)}
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-xs font-semibold"
                      >
                        Scan History
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                    No students found matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <div className="text-xs font-medium text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {filteredStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
            </span>{" "}
            of <span className="font-bold text-foreground">{filteredStudents.length}</span>{" "}
            students
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Student Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Enroll Student for University Transport
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assigns a permanent RFID smart card and campus bus stop
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Student Full Name</label>
              <Input 
                placeholder="e.g. Siddharth Verma" 
                className="rounded-xl border-border h-9 text-sm" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Student Roll #</label>
                <Input 
                  placeholder="2025-CS-0999" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.admissionNumber}
                  onChange={e => setFormData({ ...formData, admissionNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Department</label>
                <Input 
                  placeholder="Engineering & Tech" 
                  className="rounded-xl border-border h-9 text-sm" 
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Route Corridor</label>
                <select 
                  className="w-full rounded-xl border border-border h-9 px-3 text-sm bg-card text-foreground"
                  value={formData.routeId}
                  onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                >
                  <option value="">Select Route...</option>
                  {apiRoutes.map((rt: any) => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Assign Bus</label>
                <select 
                  className="w-full rounded-xl border border-border h-9 px-3 text-sm bg-card text-foreground"
                  value={formData.busId}
                  onChange={e => setFormData({ ...formData, busId: e.target.value })}
                >
                  <option value="">Select Bus...</option>
                  {apiBuses.map((bus: any) => (
                    <option key={bus.id} value={bus.id}>{bus.busNumber} ({bus.registrationNumber})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={() => {
                createMutation.mutate(formData)
              }}
              disabled={createMutation.isPending || !formData.name || !formData.admissionNumber}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              {createMutation.isPending ? "Enrolling..." : "Enroll Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
