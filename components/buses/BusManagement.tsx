"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  Bus, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Upload, 
  FileText, 
  Check, 
  Loader2, 
  X,
  AlertTriangle
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { busSchema } from "@/lib/validations"

type BusFormValues = z.infer<typeof busSchema>

interface BusType {
  id: string
  busNumber: string
  registrationNumber: string
  seatingCapacity: number
  vehicleType: string
  insuranceNumber: string
  insuranceExpiry: string
  insuranceDocumentUrl: string | null
  fitnessExpiry: string
  fitnessCertificateUrl: string | null
  gpsDeviceId: string
  status: "ACTIVE" | "MAINTENANCE"
  isArchived: boolean
}

export function BusManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingBus, setEditingBus] = useState<BusType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [uploadingField, setUploadingField] = useState<"insurance" | "fitness" | null>(null)

  // 1. Fetch Buses
  const { data: buses = [], isLoading, error } = useQuery<BusType[]>({
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
    resolver: zodResolver(busSchema),
    defaultValues: {
      busNumber: "",
      registrationNumber: "",
      seatingCapacity: 40,
      vehicleType: "Standard",
      insuranceNumber: "",
      insuranceExpiry: new Date(),
      insuranceDocumentUrl: null,
      fitnessExpiry: new Date(),
      fitnessCertificateUrl: null,
      gpsDeviceId: "",
      status: "ACTIVE",
    },
  })

  const watchInsuranceUrl = watch("insuranceDocumentUrl")
  const watchFitnessUrl = watch("fitnessCertificateUrl")

  // 3. Document Upload Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: "insurance" | "fitness") => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingField(field)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "File upload failed.")
      } else {
        if (field === "insurance") {
          setValue("insuranceDocumentUrl", data.url)
          toast.success("Insurance document uploaded successfully!")
        } else {
          setValue("fitnessCertificateUrl", data.url)
          toast.success("Fitness certificate uploaded successfully!")
        }
      }
    } catch (err) {
      toast.error("An error occurred during file upload.")
    } finally {
      setUploadingField(null)
    }
  }

  // 4. Mutation Handlers (Create/Update/Archive)
  const createMutation = useMutation({
    mutationFn: async (data: BusFormValues) => {
      const res = await fetch("/api/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to register bus")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Bus registered successfully!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BusFormValues> }) => {
      const res = await fetch(`/api/buses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update bus")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Bus details updated!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/buses/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to archive bus")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Bus archived successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // 5. Lifecycle and Modal Handlers
  const handleOpenCreateForm = () => {
    reset({
      busNumber: "",
      registrationNumber: "",
      seatingCapacity: 40,
      vehicleType: "Standard",
      insuranceNumber: "",
      insuranceExpiry: new Date(),
      insuranceDocumentUrl: null,
      fitnessExpiry: new Date(),
      fitnessCertificateUrl: null,
      gpsDeviceId: "",
      status: "ACTIVE",
    })
    setEditingBus(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (bus: BusType) => {
    setEditingBus(bus)
    reset({
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      seatingCapacity: bus.seatingCapacity,
      vehicleType: bus.vehicleType,
      insuranceNumber: bus.insuranceNumber,
      insuranceExpiry: new Date(bus.insuranceExpiry),
      insuranceDocumentUrl: bus.insuranceDocumentUrl,
      fitnessExpiry: new Date(bus.fitnessExpiry),
      fitnessCertificateUrl: bus.fitnessCertificateUrl,
      gpsDeviceId: bus.gpsDeviceId,
      status: bus.status,
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingBus(null)
  }

  const onSubmit = (data: any) => {
    if (editingBus) {
      updateMutation.mutate({ id: editingBus.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredBuses = buses.filter(bus => 
    bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.gpsDeviceId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by bus number, registration..."
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
          Register Bus
        </Button>
      </div>

      {/* Grid: List of Buses and Register Form */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Buses Table Panel */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Bus className="h-5 w-5 text-emerald-400" />
                Fleet Listing
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage registered logistics fleet vehicles.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : filteredBuses.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No active buses found matching search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Bus No.</th>
                        <th className="px-6 py-4">Registration</th>
                        <th className="px-6 py-4">Capacity</th>
                        <th className="px-6 py-4">GPS Device</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/10">
                      {filteredBuses.map((bus) => (
                        <tr key={bus.id} className="transition-colors hover:bg-white/5">
                          <td className="px-6 py-4 font-semibold text-white">{bus.busNumber}</td>
                          <td className="px-6 py-4">{bus.registrationNumber}</td>
                          <td className="px-6 py-4">{bus.seatingCapacity} Seats</td>
                          <td className="px-6 py-4 font-mono text-xs">{bus.gpsDeviceId}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              bus.status === "ACTIVE" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {bus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <Button
                              onClick={() => handleOpenEditForm(bus)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Are you sure you want to archive bus ${bus.busNumber}?`)) {
                                  archiveMutation.mutate(bus.id)
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

        {/* Bus Creation/Editing Form Side Card */}
        {isFormOpen && (
          <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-100 sticky top-24 transition-all duration-300">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Bus className="h-5 w-5 text-emerald-400" />
                  {editingBus ? `Edit Bus ${editingBus.busNumber}` : "Register New Fleet Bus"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Fill in parameters, insurance, and vehicle certifications.
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
              <CardContent className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                
                {/* Grid 1: Basic details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="busNumber" className="text-xs font-semibold text-slate-300">Bus Identifier Number</Label>
                    <Input
                      id="busNumber"
                      placeholder="BUS-01"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("busNumber")}
                    />
                    {errors.busNumber && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.busNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="registrationNumber" className="text-xs font-semibold text-slate-300">License Plate</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="DL-1C-A-1111"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("registrationNumber")}
                    />
                    {errors.registrationNumber && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.registrationNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="seatingCapacity" className="text-xs font-semibold text-slate-300">Seating Capacity</Label>
                    <Input
                      id="seatingCapacity"
                      type="number"
                      placeholder="40"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("seatingCapacity")}
                    />
                    {errors.seatingCapacity && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.seatingCapacity.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleType" className="text-xs font-semibold text-slate-300">Vehicle Type</Label>
                    <Input
                      id="vehicleType"
                      placeholder="Standard Bus"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("vehicleType")}
                    />
                    {errors.vehicleType && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.vehicleType.message}</p>
                    )}
                  </div>
                </div>

                {/* GPS and status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="gpsDeviceId" className="text-xs font-semibold text-slate-300">GPS Tracker Device ID</Label>
                    <Input
                      id="gpsDeviceId"
                      placeholder="GPS-8822"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm font-mono"
                      {...register("gpsDeviceId")}
                    />
                    {errors.gpsDeviceId && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.gpsDeviceId.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs font-semibold text-slate-300">Fleet Status</Label>
                    <select
                      id="status"
                      className="flex h-9 w-full rounded-lg border border-white/5 bg-slate-950/40 px-3 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                      {...register("status")}
                    >
                      <option value="ACTIVE" className="bg-slate-900 text-white">ACTIVE</option>
                      <option value="MAINTENANCE" className="bg-slate-900 text-white">MAINTENANCE</option>
                    </select>
                  </div>
                </div>

                {/* Insurance details */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="text-xs font-semibold text-emerald-400">Insurance & Fitness Certificates</div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="insuranceNumber" className="text-xs font-semibold text-slate-300">Insurance Policy No.</Label>
                      <Input
                        id="insuranceNumber"
                        placeholder="INS-992200"
                        className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                        {...register("insuranceNumber")}
                      />
                      {errors.insuranceNumber && (
                        <p className="text-[10px] text-rose-500 font-medium">{errors.insuranceNumber.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="insuranceExpiry" className="text-xs font-semibold text-slate-300">Insurance Expiry Date</Label>
                      <Input
                        id="insuranceExpiry"
                        type="date"
                        className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                        {...register("insuranceExpiry")}
                      />
                      {errors.insuranceExpiry && (
                        <p className="text-[10px] text-rose-500 font-medium">{errors.insuranceExpiry.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Document upload: Insurance */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Insurance Certificate PDF / Image</span>
                      {watchInsuranceUrl && (
                        <a 
                          href={watchInsuranceUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-emerald-400 flex items-center gap-1 hover:underline"
                        >
                          <FileText className="h-3 w-3" /> View Uploaded File
                        </a>
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => handleFileUpload(e, "insurance")}
                        disabled={uploadingField !== null}
                        className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/10 file:text-emerald-400 hover:file:bg-emerald-600/20"
                      />
                      {uploadingField === "insurance" && (
                        <Button disabled variant="outline" className="h-9 w-9 p-0 border-white/5">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fitness expiry and document */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fitnessExpiry" className="text-xs font-semibold text-slate-300">Fitness Expiry Date</Label>
                      <Input
                        id="fitnessExpiry"
                        type="date"
                        className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                        {...register("fitnessExpiry")}
                      />
                      {errors.fitnessExpiry && (
                        <p className="text-[10px] text-rose-500 font-medium">{errors.fitnessExpiry.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Fitness Certificate File</span>
                        {watchFitnessUrl && (
                          <a 
                            href={watchFitnessUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-emerald-400 flex items-center gap-1 hover:underline"
                          >
                            <FileText className="h-3 w-3" /> View Uploaded File
                          </a>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png"
                          onChange={(e) => handleFileUpload(e, "fitness")}
                          disabled={uploadingField !== null}
                          className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/10 file:text-emerald-400 hover:file:bg-emerald-600/20"
                        />
                        {uploadingField === "fitness" && (
                          <Button disabled variant="outline" className="h-9 w-9 p-0 border-white/5">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                          </Button>
                        )}
                      </div>
                    </div>
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
                  disabled={isMutating || uploadingField !== null}
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
                      {editingBus ? "Update Details" : "Register Bus"}
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
