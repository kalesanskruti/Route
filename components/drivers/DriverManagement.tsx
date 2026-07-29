"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  UserCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  Loader2, 
  X,
  AlertTriangle,
  Calendar,
  Phone,
  Link as LinkIcon
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { driverSchema } from "@/lib/validations"

type DriverFormValues = z.infer<typeof driverSchema>

interface DriverType {
  id: string
  name: string
  licenseNumber: string
  licenseExpiry: string
  contactDetails: string
  userId: string | null
  user?: { email: string } | null
  routes: Array<{
    id: string
    name: string
    bus?: { busNumber: string } | null
  }>
}

interface UserType {
  id: string
  name: string
  email: string
}

export function DriverManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingDriver, setEditingDriver] = useState<DriverType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // 1. Queries
  const { data: drivers = [], isLoading } = useQuery<DriverType[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await fetch("/api/drivers")
      if (!res.ok) throw new Error("Failed to load drivers")
      return res.json()
    }
  })

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["unlinked-users"],
    queryFn: async () => {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("Failed to load user credentials")
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
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      licenseExpiry: new Date(),
      contactDetails: "",
      userId: null,
    },
  })

  const watchUserId = watch("userId")

  // 3. Expiry Warning Helper
  const getLicenseStatus = (expiryStr: string) => {
    const expiry = new Date(expiryStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { label: "Expired", badge: "bg-red-500/10 text-red-400 border border-red-500/20" }
    } else if (diffDays <= 30) {
      return { label: `Expiring in ${diffDays}d`, badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20" }
    } else {
      return { label: "Active", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" }
    }
  }

  // 4. Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to register driver")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      queryClient.invalidateQueries({ queryKey: ["unlinked-users"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Driver registered successfully!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update driver")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      queryClient.invalidateQueries({ queryKey: ["unlinked-users"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Driver profile updated!")
      handleCloseForm()
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to archive driver")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      queryClient.invalidateQueries({ queryKey: ["unlinked-users"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      toast.success("Driver profile archived successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // 5. Actions
  const handleOpenCreateForm = () => {
    reset({
      name: "",
      licenseNumber: "",
      licenseExpiry: new Date(),
      contactDetails: "",
      userId: null,
    })
    setEditingDriver(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (driver: DriverType) => {
    setEditingDriver(driver)
    reset({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: new Date(driver.licenseExpiry),
      contactDetails: driver.contactDetails,
      userId: driver.userId,
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingDriver(null)
  }

  const onSubmit = (data: any) => {
    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.contactDetails.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, license plate, phone..."
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
          Register Driver
        </Button>
      </div>

      {/* Split Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Table list */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-400" />
                Staff Registry
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage drivers, licenses, and mapping credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No active drivers found matching search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Driver Name</th>
                        <th className="px-6 py-4">License / Expiry</th>
                        <th className="px-6 py-4">Linked User</th>
                        <th className="px-6 py-4">Assigned Line / Bus</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/10">
                      {filteredDrivers.map((driver) => {
                        const license = getLicenseStatus(driver.licenseExpiry)
                        const activeRoute = driver.routes?.find(r => !r.id) || driver.routes?.[0]
                        return (
                          <tr key={driver.id} className="transition-colors hover:bg-white/5">
                            <td className="px-6 py-4">
                              <span className="block font-semibold text-white">{driver.name}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" /> {driver.contactDetails}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="block font-mono text-xs text-slate-300">{driver.licenseNumber}</span>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 ${license.badge}`}>
                                {license.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {driver.user ? (
                                <span className="text-xs text-slate-300 flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3 text-emerald-400" />
                                  {driver.user.email}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-600 italic">Unlinked login</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-medium">
                              {activeRoute ? (
                                <div>
                                  <span className="text-emerald-400 block">{activeRoute.name}</span>
                                  {activeRoute.bus ? (
                                    <span className="text-[10px] text-slate-500 block">Bus: {activeRoute.bus.busNumber}</span>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-slate-600 italic">Not Mapped (Read-Only)</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                              <Button
                                onClick={() => handleOpenEditForm(driver)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to archive driver ${driver.name}?`)) {
                                    archiveMutation.mutate(driver.id)
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
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form panel */}
        {isFormOpen && (
          <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-100 sticky top-24 transition-all duration-300">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-400" />
                  {editingDriver ? `Edit Driver ${editingDriver.name}` : "Register New Driver"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Input license parameters and user accounts.
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
                
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-300">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-500 font-medium">{errors.name.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="licenseNumber" className="text-xs font-semibold text-slate-300">License Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="DL-04-1122"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm font-mono"
                      {...register("licenseNumber")}
                    />
                    {errors.licenseNumber && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.licenseNumber.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="licenseExpiry" className="text-xs font-semibold text-slate-300">License Expiry Date</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                      {...register("licenseExpiry")}
                    />
                    {errors.licenseExpiry && (
                      <p className="text-[10px] text-rose-500 font-medium">{errors.licenseExpiry.message as string}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactDetails" className="text-xs font-semibold text-slate-300">Mobile Phone / Contact Details</Label>
                  <Input
                    id="contactDetails"
                    placeholder="+91 99999 88888"
                    className="bg-slate-950/40 border-white/5 text-white focus:border-emerald-500 h-9 text-sm"
                    {...register("contactDetails")}
                  />
                  {errors.contactDetails && (
                    <p className="text-[10px] text-rose-500 font-medium">{errors.contactDetails.message as string}</p>
                  )}
                </div>

                {/* Account link dropdown */}
                <div className="space-y-1.5 border-t border-white/5 pt-4">
                  <Label htmlFor="userId" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <LinkIcon className="h-3 w-3 text-slate-400" />
                    Link User Account (Driver Login)
                  </Label>
                  <select
                    id="userId"
                    className="flex h-9 w-full rounded-lg border border-white/5 bg-slate-950/40 px-3 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                    onChange={(e) => setValue("userId", e.target.value || null)}
                    value={watchUserId || ""}
                  >
                    <option value="" className="bg-slate-900 text-slate-400 italic">None (Unlinked)</option>
                    {/* If editing, include currently linked user in option */}
                    {editingDriver?.user && (
                      <option value={editingDriver.userId!} className="bg-slate-900 text-white">
                        {editingDriver.user.email} (Current)
                      </option>
                    )}
                    {users.map((user) => (
                      <option key={user.id} value={user.id} className="bg-slate-900 text-white">
                        {user.email} ({user.name})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Required for the driver to sign in and mark attendance on their mobile dashboard.
                  </p>
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
                      {editingDriver ? "Update Profile" : "Register Driver"}
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
