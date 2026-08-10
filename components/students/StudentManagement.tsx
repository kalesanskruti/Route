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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL")
  const [selectedAttendanceFilter, setSelectedAttendanceFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const itemsPerPage = 10

  const initialStudents: StudentRecord[] = [
    {
      id: "stu-1",
      studentId: "2024-CS-0091",
      name: "Aarav Sharma",
      department: "Engineering & Tech",
      semester: "Sem 4 (B.Tech CS)",
      pickupPoint: "North Gate Hub",
      assignedBus: "BUS-101 (KA-01-EQ-4421)",
      route: "Main Campus Express #1",
      todayAttendance: "BOARDED",
      status: "ACTIVE",
    },
    {
      id: "stu-2",
      studentId: "2025-MBA-0142",
      name: "Priya Nair",
      department: "Business Management",
      semester: "Sem 2 (MBA)",
      pickupPoint: "Science Block D",
      assignedBus: "BUS-102 (KA-01-EQ-4422)",
      route: "Science Park Route #4",
      todayAttendance: "DROPPED",
      status: "ACTIVE",
    },
    {
      id: "stu-3",
      studentId: "2023-AR-0012",
      name: "Rohan Gupta",
      department: "Engineering & Tech",
      semester: "Sem 6 (B.Arch)",
      pickupPoint: "Engineering Library",
      assignedBus: "BUS-103 (KA-01-EQ-4425)",
      route: "South Medical Center #2",
      todayAttendance: "BOARDED",
      status: "ACTIVE",
    },
    {
      id: "stu-4",
      studentId: "2024-LW-0084",
      name: "Sanya Mehta",
      department: "Law & Public Policy",
      semester: "Sem 4 (LL.B)",
      pickupPoint: "North Gate Hub",
      assignedBus: "BUS-104 (KA-01-EQ-4430)",
      route: "North Gateway Line #8",
      todayAttendance: "BOARDED",
      status: "ACTIVE",
    },
    {
      id: "stu-5",
      studentId: "2025-MD-0209",
      name: "Kiran Rao",
      department: "Medicine & Surgery",
      semester: "Sem 2 (MBBS)",
      pickupPoint: "Central Auditorium",
      assignedBus: "BUS-105 (KA-01-EQ-4433)",
      route: "Main Campus Express #1",
      todayAttendance: "ABSENT",
      status: "ACTIVE",
    },
    {
      id: "stu-6",
      studentId: "2023-CS-0412",
      name: "Neha Joshi",
      department: "Engineering & Tech",
      semester: "Sem 6 (B.Tech CS)",
      pickupPoint: "North Gate Hub",
      assignedBus: "BUS-101 (KA-01-EQ-4421)",
      route: "Main Campus Express #1",
      todayAttendance: "BOARDED",
      status: "ACTIVE",
    },
    {
      id: "stu-7",
      studentId: "2024-AH-0019",
      name: "Devendra Patel",
      department: "Arts & Humanities",
      semester: "Sem 4 (B.A)",
      pickupPoint: "Science Block D",
      assignedBus: "BUS-106 (KA-01-EQ-4440)",
      route: "Science Park Route #4",
      todayAttendance: "BOARDED",
      status: "ACTIVE",
    },
    {
      id: "stu-8",
      studentId: "2023-MD-0118",
      name: "Ananya Iyer",
      department: "Medicine & Surgery",
      semester: "Sem 6 (MBBS)",
      pickupPoint: "Engineering Library",
      assignedBus: "BUS-103 (KA-01-EQ-4425)",
      route: "South Medical Center #2",
      todayAttendance: "DROPPED",
      status: "ACTIVE",
    },
  ]

  const [students] = useState<StudentRecord[]>(initialStudents)

  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const matchesSearch =
        stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.pickupPoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.assignedBus.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept =
        selectedDeptFilter === "ALL" || stu.department === selectedDeptFilter
      const matchesAttendance =
        selectedAttendanceFilter === "ALL" || stu.todayAttendance === selectedAttendanceFilter
      return matchesSearch && matchesDept && matchesAttendance
    })
  }, [students, searchQuery, selectedDeptFilter, selectedAttendanceFilter])

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
              4,820 Total Enrolled
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
                paginatedStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-foreground">{stu.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{stu.studentId}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-foreground">{stu.department}</div>
                      <div className="text-xs text-muted-foreground">{stu.semester}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{stu.pickupPoint}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-foreground">{stu.assignedBus}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{stu.route}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          stu.todayAttendance === "BOARDED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : stu.todayAttendance === "DROPPED"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {stu.todayAttendance}
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
              <Input placeholder="e.g. Siddharth Verma" className="rounded-xl border-border h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Student Roll #</label>
                <Input placeholder="2025-CS-0999" className="rounded-xl border-border h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Department</label>
                <Input placeholder="Engineering & Tech" className="rounded-xl border-border h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Pickup Stop Point</label>
              <Input placeholder="North Gate Hub" className="rounded-xl border-border h-9 text-sm" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsAddModalOpen(false)
                toast.success("Student enrolled and RFID card mapped successfully!")
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              Enroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
