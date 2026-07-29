"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  Loader2, 
  X,
  GraduationCap,
  Phone,
  User,
  MapPin,
  Bus as BusIcon
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { studentSchema } from "@/lib/validations"

type StudentFormValues = z.infer<typeof studentSchema>

interface StopType {
  id: string
  stopName: string
  stopOrder: number
}

interface StudentType {
  id: string
  name: string
  admissionNumber: string
  classSection: string
  parentName: string
  parentMobileNumber: string
  busId: string | null
  routeId: string | null
  pickupStopId: string | null
  bus?: { busNumber: string } | null
  route?: { name: string } | null
  pickupStop?: { stopName: string } | null
}

interface RouteType {
  id: string
  name: string
  busId: string | null
  bus?: { busNumber: string } | null
  stops: StopType[]
}

interface BusType {
  id: string
  busNumber: string
}

export function StudentManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingStudent, setEditingStudent] = useState<StudentType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // 1. Queries
  const { data: students = [], isLoading } = useQuery<StudentType[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students")
      if (!res.ok) throw new Error("Failed to load students")
      return res.json()
    }
  })

  const { data: routes = [] } = useQuery<RouteType[]>({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await fetch("/api/routes")
      if (!res.ok) throw new Error("Failed to load routes")
      return res.json()
    }
  })

  const { data: buses = [] } = useQuery<BusType[]>({
    queryKey: ["buses"],
    queryFn: async () => {
      const res = await fetch("/api/buses")
      if (!res.ok) throw new Error("Failed to load buses")
      return res.json()
    }
  })

  // 2. React Hook Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      admissionNumber: "",
      classSection: "",
      parentName: "",
      parentMobileNumber: "",
      busId: null,
      routeId: null,
      pickupStopId: null,
    },
  })

  const watchRouteId = watch("routeId")
  const watchBusId = watch("busId")
  const watchPickupStopId = watch("pickupStopId")

  // Find currently selected route to filter stops list
  const selectedRoute = routes.find(r => r.id === watchRouteId)
  const availableStops = selectedRoute?.stops || []

  // Handle route change: auto-select associated bus and clear prior stop
  const handleRouteChange = (routeId: string) => {
    setValue("routeId", routeId || null)
    setValue("pickupStopId", null)
    
    const matchedRoute = routes.find(r => r.id === routeId)
    if (matchedRoute && matchedRoute.busId) {
      setValue("busId", matchedRoute.busId)
    } else {
      setValue("busId", null)
    }
  }

  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add student")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Student profile added successfully!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update student")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Student details updated!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete student")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Student profile deleted successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // 4. Actions
  const handleOpenCreateForm = () => {
    reset({
      name: "",
      admissionNumber: "",
      classSection: "",
      parentName: "",
      parentMobileNumber: "",
      busId: null,
      routeId: null,
      pickupStopId: null,
    })
    setEditingStudent(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (student: StudentType) => {
    setEditingStudent(student)
    reset({
      name: student.name,
      admissionNumber: student.admissionNumber,
      classSection: student.classSection,
      parentName: student.parentName,
      parentMobileNumber: student.parentMobileNumber,
      busId: student.busId,
      routeId: student.routeId,
      pickupStopId: student.pickupStopId,
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingStudent(null)
  }

  const onSubmit = (data: any) => {
    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.classSection.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, admission #, class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900/40 border-white/5 text-white placeholder:text-slate-500 focus:border-emerald-500"
          />
        </div>
        <Button 
          onClick={handleOpenCreateForm}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-950/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Listing Panel */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                Student Roster
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage pupil route alignments and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No active students found matching search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Student Details</th>
                        <th className="px-6 py-4">Parent Info</th>
                        <th className="px-6 py-4">Assigned Line / Stop</th>
                        <th className="px-6 py-4">Bus</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/10">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="transition-colors hover:bg-white/5">
                          <td className="px-6 py-4">
                            <span className="block font-semibold text-white">{student.name}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <GraduationCap className="h-3.5 w-3.5" />
                              Adm: {student.admissionNumber} • Class {student.classSection}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block text-slate-300">{student.parentName}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" /> {student.parentMobileNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {student.route ? (
                              <div>
                                <span className="text-emerald-400 font-medium block">{student.route.name}</span>
                                {student.pickupStop ? (
                                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                                    <MapPin className="h-3 w-3 text-slate-600" />
                                    {student.pickupStop.stopName}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-500 italic block">No pickup stop assigned</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold">
                            {student.bus ? (
                              <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                {student.bus.busNumber}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              onClick={() => handleOpenEditForm(student)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete student ${student.name}?`)) {
                                  deleteMutation.mutate(student.id)
                                }
                              }}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Panel */}
        {isFormOpen && (
          <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-100 sticky top-24 transition-all duration-300">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  {editingStudent ? `Edit Student Details` : "Add New Student"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Input demographics and transport assignments.
                </CardDescription>
              </div>
              <Button
                onClick={handleCloseForm}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-white rounded-full hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-slate-300">Student Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.name.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admissionNumber" className="text-xs font-semibold text-slate-300">Admission Number</Label>
                    <Input
                      id="admissionNumber"
                      placeholder="ADM-2026-09"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("admissionNumber")}
                    />
                    {errors.admissionNumber && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.admissionNumber.message as string}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="classSection" className="text-xs font-semibold text-slate-300">Class & Section</Label>
                  <Input
                    id="classSection"
                    placeholder="V-A"
                    className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                    {...register("classSection")}
                  />
                  {errors.classSection && (
                    <p className="text-[10px] text-rose-500 font-medium">{errors.classSection.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="parentName" className="text-xs font-semibold text-slate-300">Parent Name</Label>
                    <Input
                      id="parentName"
                      placeholder="Robert Doe"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("parentName")}
                    />
                    {errors.parentName && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.parentName.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="parentMobileNumber" className="text-xs font-semibold text-slate-300">Parent Mobile (+91...)</Label>
                    <Input
                      id="parentMobileNumber"
                      placeholder="+919999988888"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("parentMobileNumber")}
                    />
                    {errors.parentMobileNumber && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.parentMobileNumber.message as string}</p>
                    )}
                  </div>
                </div>

                {/* Logistics Route assignments */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="text-xs font-semibold text-emerald-400">Logistics Routing Mappings</div>

                  <div className="space-y-1.5">
                    <Label htmlFor="routeId" className="text-xs font-semibold text-slate-300">Select Transit Route</Label>
                    <select
                      id="routeId"
                      className="flex h-9 w-full rounded-lg border border-white/5 bg-slate-950/40 px-3 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                      onChange={(e) => handleRouteChange(e.target.value)}
                      value={watchRouteId || ""}
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Unassigned</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id} className="bg-slate-900 text-white">
                          {route.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Pickup Stop select */}
                  <div className="space-y-1.5">
                    <Label htmlFor="pickupStopId" className="text-xs font-semibold text-slate-300">Select Pickup / Drop Stop</Label>
                    <select
                      id="pickupStopId"
                      className="flex h-9 w-full rounded-lg border border-white/5 bg-slate-950/40 px-3 py-1 text-sm text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                      onChange={(e) => setValue("pickupStopId", e.target.value || null)}
                      value={watchPickupStopId || ""}
                      disabled={!watchRouteId}
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Select Stop...</option>
                      {availableStops.map((stop) => (
                        <option key={stop.id} value={stop.id!} className="bg-slate-900 text-white">
                          Stop #{stop.stopOrder}: {stop.stopName}
                        </option>
                      ))}
                    </select>
                    {!watchRouteId && (
                      <p className="text-[10px] text-slate-500 italic">Select a transit route first to load stop listings.</p>
                    )}
                  </div>

                  {/* Associated Bus */}
                  <div className="space-y-1.5">
                    <Label htmlFor="busId" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <BusIcon className="h-3 w-3 text-slate-400" /> Assigned Bus (SSOT Sync)
                    </Label>
                    <select
                      id="busId"
                      className="flex h-9 w-full rounded-lg border border-white/5 bg-slate-950/40 px-3 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                      onChange={(e) => setValue("busId", e.target.value || null)}
                      value={watchBusId || ""}
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Unassigned</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id} className="bg-slate-900 text-white">
                          {bus.busNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </CardContent>

              <div className="p-6 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3 rounded-b-2xl">
                <Button 
                  type="button" 
                  onClick={handleCloseForm} 
                  variant="outline" 
                  className="border-white/5 text-slate-300 hover:bg-white/5 h-10 text-sm font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isMutating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-10 text-sm px-6"
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {editingStudent ? "Update Details" : "Add Student"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

      </div>
    </div>
  )
}
