"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { signOut } from "next-auth/react"
import { 
  Bus, 
  MapPin, 
  UserCheck, 
  Play, 
  Square, 
  QrCode, 
  AlertOctagon, 
  LogOut, 
  Loader2, 
  Compass, 
  CheckCircle,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface StudentType {
  id: string
  name: string
  admissionNumber: string
  classSection: string
  pickupStopId: string | null
  pickupStop?: { stopName: string } | null
}

interface DriverLogisticsData {
  driver: {
    id: string
    name: string
  }
  route: {
    id: string
    name: string
    source: string
    destination: string
    estimatedTime: string
    bus?: { busNumber: string } | null
    stops: Array<{
      id: string
      stopName: string
      stopOrder: number
    }>
    students: StudentType[]
  } | null
  todayDate: string
  attendanceRecords: Array<{
    studentId: string
    status: "BOARDED" | "DROPPED"
  }>
}

export default function DriverDashboard() {
  const queryClient = useQueryClient()
  const [isTripActive, setIsTripActive] = useState(false)
  const [scanInput, setScanInput] = useState("")
  const [issueText, setIssueText] = useState("")
  const [activeTab, setActiveTab] = useState<"pickup" | "drop">("pickup")

  // 1. Query Driver logistics info
  const { data, isLoading, error } = useQuery<DriverLogisticsData>({
    queryKey: ["driver-logistics"],
    queryFn: async () => {
      const res = await fetch("/api/driver")
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to load logistics")
      }
      return res.json()
    }
  })

  // 2. Attendance Mutation
  const attendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: "BOARDED" | "DROPPED" }) => {
      const res = await fetch("/api/driver/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit attendance")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-logistics"] })
      toast.success("Attendance marked and alert notification dispatched!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // 3. Issue Report Mutation
  const issueMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/driver/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueText: text }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to log alert")
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success("Delay alert logged to logistics center.")
      setIssueText("")
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // Mock scan submission
  const handleMockScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scanInput.trim() || !data?.route) return

    const student = data.route.students.find(
      s => s.admissionNumber.toLowerCase() === scanInput.trim().toLowerCase()
    )

    if (!student) {
      toast.error("Invalid scan code: Student not found on this route.")
      return
    }

    const status = activeTab === "pickup" ? "BOARDED" : "DROPPED"
    attendanceMutation.mutate({ studentId: student.id, status })
    setScanInput("")
  }

  const handleToggleAttendance = (studentId: string, currentStatus?: "BOARDED" | "DROPPED") => {
    const targetStatus = activeTab === "pickup" ? "BOARDED" : "DROPPED"
    // Block if already marked in this state
    if (currentStatus === targetStatus) {
      toast.info("Student already marked for this status.")
      return
    }
    attendanceMutation.mutate({ studentId, status: targetStatus })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span>Syncing route manifest...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <Card className="border-rose-500/20 bg-slate-900 text-center max-w-md w-full p-6 text-slate-200">
          <CardHeader>
            <CardTitle className="text-rose-400 flex items-center justify-center gap-2">
              <AlertOctagon className="h-6 w-6" /> Access Warning
            </CardTitle>
            <CardDescription className="text-slate-400">
              {error?.message || "Verify your account profile has an associated driver license record."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { driver, route, attendanceRecords } = data

  const getAttendanceForStudent = (studentId: string) => {
    return attendanceRecords.find(r => r.studentId === studentId)?.status
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-md mx-auto border-x border-white/5 shadow-2xl relative pb-20">
      {/* Header */}
      <header className="p-5 border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bus className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white">{driver.name}</span>
            <span className="block text-[10px] text-slate-400">
              {route?.bus ? `Bus: ${route.bus.busNumber}` : "No Bus Mapped"}
            </span>
          </div>
        </div>
        <Button 
          onClick={() => signOut({ callbackUrl: "/login" })} 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg h-9 w-9"
        >
          <LogOut className="h-4.5 w-4.5" />
        </Button>
      </header>

      {/* Main Panel Content */}
      <main className="p-5 space-y-6 flex-1">
        
        {/* Route info */}
        {route ? (
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Assigned Route</span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">{data.todayDate}</span>
              </div>
              <div className="text-base font-bold text-white">{route.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Compass className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{route.source} → {route.destination}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl bg-slate-900/20 text-slate-500 text-sm">
            You are not assigned to any active route today. Contact dispatch.
          </div>
        )}

        {route && (
          <>
            {/* Trip Action Start / End toggle */}
            <div className="space-y-3">
              {!isTripActive ? (
                <Button 
                  onClick={() => {
                    setIsTripActive(true)
                    toast.success("Trip started! Roster and scan logs are active.")
                  }}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-emerald-950/20"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Start Transit Trip
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setIsTripActive(false)
                    toast.info("Trip ended successfully.")
                  }}
                  className="w-full h-12 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 font-bold flex items-center justify-center gap-2 rounded-xl"
                >
                  <Square className="h-4.5 w-4.5 fill-current" />
                  End Transit Trip
                </Button>
              )}
            </div>

            {isTripActive && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* QR RFID scan stub portal */}
                <Card className="border border-white/10 bg-slate-900/60 shadow-xl">
                  <CardHeader className="p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-emerald-400" />
                      Mock QR / RFID Scan Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <form onSubmit={handleMockScan} className="flex gap-2">
                      <Input
                        placeholder="Enter Student Admission ID..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        className="bg-slate-950/40 border-white/5 text-white h-9 text-sm focus:border-emerald-500 placeholder:text-slate-600 font-mono"
                      />
                      <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 h-9 font-semibold text-xs px-4">
                        Scan ID
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Tab select: Morning Pickup vs Afternoon Dropoff */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActiveTab("pickup")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "pickup"
                        ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Morning Pickup (Boarded)
                  </button>
                  <button
                    onClick={() => setActiveTab("drop")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "drop"
                        ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Afternoon Drop (Dropped)
                  </button>
                </div>

                {/* Student roster manifest */}
                <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl">
                  <CardHeader className="p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-white">
                      Roster: {activeTab === "pickup" ? "Pickup Manifest" : "Dropoff Manifest"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 max-h-[35vh] overflow-y-auto">
                    {route.students.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs italic">
                        No students registered on this route.
                      </div>
                    ) : (
                      route.students.map((student) => {
                        const status = getAttendanceForStudent(student.id)
                        const isChecked = activeTab === "pickup" 
                          ? status === "BOARDED"
                          : status === "DROPPED"

                        return (
                          <div 
                            key={student.id} 
                            onClick={() => handleToggleAttendance(student.id, status)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isChecked
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-slate-950/20 border-white/5 hover:bg-slate-950/40"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <span className="block text-sm font-bold text-white truncate">{student.name}</span>
                              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                                Class: {student.classSection} • {student.admissionNumber}
                              </span>
                              {student.pickupStop && (
                                <span className="block text-[9px] text-slate-400 mt-1 flex items-center gap-0.5 truncate">
                                  <MapPin className="h-2.5 w-2.5 shrink-0" /> {student.pickupStop.stopName}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? "bg-emerald-500 border-emerald-400 text-white"
                                  : "border-white/10 text-transparent"
                              }`}
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Delay reporting alerts panel */}
                <Card className="border border-white/5 bg-slate-900/40">
                  <CardHeader className="p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4 text-amber-500" />
                      Report Delay / Transit Issue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <textarea
                      placeholder="e.g. Stuck in heavy traffic on Noida expressway, expected delay of 15 mins."
                      value={issueText}
                      onChange={(e) => setIssueText(e.target.value)}
                      className="w-full h-20 p-2.5 text-xs bg-slate-950/40 border border-white/5 rounded-lg text-white outline-none focus:border-emerald-500 placeholder:text-slate-650"
                    />
                    <Button
                      onClick={() => {
                        if (issueText.trim().length > 0) {
                          issueMutation.mutate(issueText)
                        }
                      }}
                      disabled={issueMutation.isPending || issueText.trim().length === 0}
                      size="sm"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      {issueMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Submit Issue Alert
                    </Button>
                  </CardContent>
                </Card>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}
