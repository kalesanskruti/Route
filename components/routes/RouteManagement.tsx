"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  Route as RouteIcon, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Loader2, 
  X,
  MapPin,
  AlertTriangle,
  Map
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { routeSchema } from "@/lib/validations"

type RouteFormValues = z.infer<typeof routeSchema>

interface StopType {
  id?: string
  stopName: string
  stopOrder: number
  latitude: number
  longitude: number
  type: "PICKUP" | "DROP" | "BOTH"
}

interface RouteType {
  id: string
  name: string
  source: string
  destination: string
  estimatedTime: string
  busId: string | null
  driverId: string | null
  bus?: { busNumber: string } | null
  driver?: { name: string } | null
  stops: StopType[]
}

interface BusType {
  id: string
  busNumber: string
}

interface DriverType {
  id: string
  name: string
}

export function RouteManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [stops, setStops] = useState<StopType[]>([])

  // 1. Query Data
  const { data: routes = [], isLoading: isRoutesLoading } = useQuery<RouteType[]>({
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

  const { data: drivers = [] } = useQuery<DriverType[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await fetch("/api/drivers")
      if (!res.ok) throw new Error("Failed to load drivers")
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
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      source: "",
      destination: "",
      estimatedTime: "",
      busId: null,
      driverId: null,
    },
  })

  const watchBusId = watch("busId")
  const watchDriverId = watch("driverId")

  // Helper check for double-assignments in active routes
  const getAssignedBusRoute = (busId: string | null | undefined) => {
    if (!busId) return null
    const assigned = routes.find(r => r.busId === busId && r.id !== editingRoute?.id)
    return assigned ? assigned.name : null
  }

  const getAssignedDriverRoute = (driverId: string | null | undefined) => {
    if (!driverId) return null
    const assigned = routes.find(r => r.driverId === driverId && r.id !== editingRoute?.id)
    return assigned ? assigned.name : null
  }

  // 3. Stops Sequencer Handlers
  const handleAddStop = () => {
    setStops([
      ...stops,
      {
        stopName: "",
        stopOrder: stops.length + 1,
        latitude: 28.61, // Sensible NCR defaults
        longitude: 77.23,
        type: "BOTH",
      },
    ])
  }

  const handleRemoveStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      stopOrder: i + 1, // Re-index order
    }))
    setStops(updated)
  }

  const handleStopFieldChange = (index: number, field: keyof StopType, value: any) => {
    const updated = [...stops]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setStops(updated)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...stops]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp

    // Re-assign sequence order property
    updated.forEach((s, i) => {
      s.stopOrder = i + 1
    })
    setStops(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === stops.length - 1) return
    const updated = [...stops]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp

    // Re-assign sequence order property
    updated.forEach((s, i) => {
      s.stopOrder = i + 1
    })
    setStops(updated)
  }

  // 4. Mutation Handlers
  const createMutation = useMutation({
    mutationFn: async (data: RouteFormValues) => {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create route")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      queryClient.invalidateQueries({ queryKey: ["drivers"] }) // Driver caches synced
      toast.success("Logistics route created successfully!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RouteFormValues> }) => {
      const res = await fetch(`/api/routes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update route")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      toast.success("Route details updated!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/routes/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to archive route")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      toast.success("Route archived successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // 5. Lifecycle and Modal Handlers
  const handleOpenCreateForm = () => {
    reset({
      name: "",
      source: "",
      destination: "",
      estimatedTime: "",
      busId: null,
      driverId: null,
    })
    setStops([])
    setEditingRoute(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (route: RouteType) => {
    setEditingRoute(route)
    reset({
      name: route.name,
      source: route.source,
      destination: route.destination,
      estimatedTime: route.estimatedTime,
      busId: route.busId,
      driverId: route.driverId,
    })
    // Clone stops and sort by stopOrder
    const sortedStops = [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder)
    setStops(sortedStops)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingRoute(null)
    setStops([])
  }

  const onSubmit = (data: any) => {
    // Client-side Double assignment validation check
    const busConflict = getAssignedBusRoute(data.busId)
    if (busConflict) {
      toast.error(`Bus already active on route: "${busConflict}"`)
      return
    }

    const driverConflict = getAssignedDriverRoute(data.driverId)
    if (driverConflict) {
      toast.error(`Driver already active on route: "${driverConflict}"`)
      return
    }

    // Embed stops sequencer data inside the form payload
    const payload = {
      ...data,
      stops: stops.map(s => ({
        stopName: s.stopName,
        stopOrder: s.stopOrder,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        type: s.type,
      }))
    }

    if (editingRoute) {
      updateMutation.mutate({ id: editingRoute.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const filteredRoutes = routes.filter(route => 
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by route name, source, destination..."
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
          Create Route
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Routes Listing Table */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <RouteIcon className="h-5 w-5 text-emerald-400" />
                Transit Routes
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage lines, bus/driver mappings, and stops sequencing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isRoutesLoading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : filteredRoutes.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No active routes found matching search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Route Name</th>
                        <th className="px-6 py-4">Transit Path</th>
                        <th className="px-6 py-4">Assigned Bus</th>
                        <th className="px-6 py-4">Driver Mapped</th>
                        <th className="px-6 py-4">Stops</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/10">
                      {filteredRoutes.map((route) => (
                        <tr key={route.id} className="transition-colors hover:bg-white/5">
                          <td className="px-6 py-4 font-semibold text-white">{route.name}</td>
                          <td className="px-6 py-4 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-400">{route.source}</span>
                              <span className="text-slate-600">→</span>
                              <span className="text-blue-400">{route.destination}</span>
                            </div>
                            <span className="block text-[10px] text-slate-500 mt-0.5">Est: {route.estimatedTime}</span>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {route.bus ? (
                              <span className="text-emerald-400">{route.bus.busNumber}</span>
                            ) : (
                              <span className="text-slate-600 italic">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {route.driver ? (
                              <span className="text-slate-300">{route.driver.name}</span>
                            ) : (
                              <span className="text-slate-600 italic">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5">
                              {route.stops.length} Stops
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              onClick={() => handleOpenEditForm(route)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Are you sure you want to archive route ${route.name}?`)) {
                                  archiveMutation.mutate(route.id)
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

        {/* Route Creation/Editing Form Side Card */}
        {isFormOpen && (
          <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-100 sticky top-24 transition-all duration-300 max-h-[85vh] flex flex-col">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between shrink-0">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <RouteIcon className="h-5 w-5 text-emerald-400" />
                  {editingRoute ? `Edit Route "${editingRoute.name}"` : "Create New Route"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Assign active fleet assets and sequence bus stops.
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

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <CardContent className="p-6 space-y-5 overflow-y-auto flex-1">
                
                {/* Form fields */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-300">Route Label / Name</Label>
                  <Input
                    id="name"
                    placeholder="Route 101"
                    className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-500 font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="source" className="text-xs font-semibold text-slate-300">Start / Source Location</Label>
                    <Input
                      id="source"
                      placeholder="Noida Sector 62"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("source")}
                    />
                    {errors.source && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.source.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="destination" className="text-xs font-semibold text-slate-300">Destination Location</Label>
                    <Input
                      id="destination"
                      placeholder="Springdale School"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("destination")}
                    />
                    {errors.destination && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.destination.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="estimatedTime" className="text-xs font-semibold text-slate-300">Estimated Duration</Label>
                  <Input
                    id="estimatedTime"
                    placeholder="45 mins"
                    className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                    {...register("estimatedTime")}
                  />
                  {errors.estimatedTime && (
                    <p className="text-[10px] text-rose-500 font-medium">{errors.estimatedTime.message}</p>
                  )}
                </div>

                {/* Dropdowns for Fleet assignment with double-assignment safeguards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="busId" className="text-xs font-semibold text-slate-300">Assign Bus</Label>
                    <select
                      id="busId"
                      className="flex h-9 w-full rounded-lg border border-white/5 bg-slate-950/40 px-3 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                      onChange={(e) => setValue("busId", e.target.value || null)}
                      value={watchBusId || ""}
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Unassigned</option>
                      {buses.map((bus) => {
                        const assignedRoute = getAssignedBusRoute(bus.id)
                        return (
                          <option 
                            key={bus.id} 
                            value={bus.id} 
                            disabled={!!assignedRoute}
                            className="bg-slate-900 text-white disabled:text-slate-600"
                          >
                            {bus.busNumber} {assignedRoute ? `(Active: ${assignedRoute})` : ""}
                          </option>
                        )
                      })}
                    </select>
                    {watchBusId && getAssignedBusRoute(watchBusId) && (
                      <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" /> Conflict: Bus assigned to active route.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="driverId" className="text-xs font-semibold text-slate-300">Assign Driver</Label>
                    <select
                      id="driverId"
                      className="flex h-9 w-full rounded-lg border border-white/5 bg-slate-950/40 px-3 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                      onChange={(e) => setValue("driverId", e.target.value || null)}
                      value={watchDriverId || ""}
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Unassigned</option>
                      {drivers.map((driver) => {
                        const assignedRoute = getAssignedDriverRoute(driver.id)
                        return (
                          <option 
                            key={driver.id} 
                            value={driver.id} 
                            disabled={!!assignedRoute}
                            className="bg-slate-900 text-white disabled:text-slate-600"
                          >
                            {driver.name} {assignedRoute ? `(Active: ${assignedRoute})` : ""}
                          </option>
                        )
                      })}
                    </select>
                    {watchDriverId && getAssignedDriverRoute(watchDriverId) && (
                      <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" /> Conflict: Driver assigned to active route.
                      </p>
                    )}
                  </div>
                </div>

                {/* Section: Stops Sequencer */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Stops Sequencer ({stops.length})</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddStop}
                      size="sm"
                      className="bg-slate-800 hover:bg-slate-700 text-white h-7 px-3 text-xs flex items-center gap-1 rounded-lg border border-white/5"
                    >
                      <Plus className="h-3 w-3" /> Add Stop
                    </Button>
                  </div>

                  {stops.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs italic border border-dashed border-white/5 rounded-xl bg-slate-950/20">
                      No route stops defined. Click &apos;Add Stop&apos; above to begin.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                      {stops.map((stop, index) => (
                        <div 
                          key={index} 
                          className="p-3 border border-white/5 bg-slate-950/30 rounded-xl space-y-2 flex flex-col group relative transition-all hover:bg-slate-950/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">Stop #{stop.stopOrder}</span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="h-6 w-6 p-0 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 rounded-lg text-slate-400"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === stops.length - 1}
                                className="h-6 w-6 p-0 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 rounded-lg text-slate-400"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleRemoveStop(index)}
                                className="h-6 w-6 p-0 bg-rose-950/30 hover:bg-rose-900/50 rounded-lg text-rose-400 ml-1.5"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Input
                                placeholder="Stop Name (e.g. Metro Station)"
                                value={stop.stopName}
                                onChange={(e) => handleStopFieldChange(index, "stopName", e.target.value)}
                                className="bg-slate-950/40 border-white/5 text-white h-7 text-xs px-2"
                              />
                            </div>
                            <div className="space-y-1">
                              <select
                                className="flex h-7 w-full rounded-md border border-white/5 bg-slate-950/40 px-2 text-xs text-white outline-none"
                                value={stop.type}
                                onChange={(e) => handleStopFieldChange(index, "type", e.target.value)}
                              >
                                <option value="BOTH" className="bg-slate-900 text-white">PICKUP & DROP</option>
                                <option value="PICKUP" className="bg-slate-900 text-white">PICKUP ONLY</option>
                                <option value="DROP" className="bg-slate-900 text-white">DROP ONLY</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span>Lat:</span>
                              <input
                                type="number"
                                step="any"
                                value={stop.latitude}
                                onChange={(e) => handleStopFieldChange(index, "latitude", e.target.value)}
                                className="bg-slate-950/40 border-white/5 text-white h-6 text-[10px] px-1.5 rounded outline-none font-mono w-full"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>Lon:</span>
                              <input
                                type="number"
                                step="any"
                                value={stop.longitude}
                                onChange={(e) => handleStopFieldChange(index, "longitude", e.target.value)}
                                className="bg-slate-950/40 border-white/5 text-white h-6 text-[10px] px-1.5 rounded outline-none font-mono w-full"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </CardContent>

              <div className="p-6 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3 shrink-0 rounded-b-2xl">
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
                      {editingRoute ? "Update Route" : "Create Route"}
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
