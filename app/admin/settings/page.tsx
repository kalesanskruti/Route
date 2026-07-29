"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Settings, Save, Loader2, ArrowLeft, Globe, Clock, MessageSquare, ShieldAlert } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { settingsSchema } from "@/lib/validations"

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [ianaTimezones, setIanaTimezones] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      schoolName: "",
      notificationBoardedTemplate: "",
      notificationDroppedTemplate: "",
      defaultTripStartTime: "07:30",
      defaultTripEndTime: "16:30",
      timezone: "Asia/Kolkata",
      smsEnabled: false,
      whatsappEnabled: false,
    },
  })

  const watchSms = watch("smsEnabled")
  const watchWhatsapp = watch("whatsappEnabled")

  useEffect(() => {
    // Populate timezones
    try {
      setIanaTimezones(Intl.supportedValuesOf("timeZone"))
    } catch (e) {
      setIanaTimezones(["Asia/Kolkata", "UTC", "Europe/London", "America/New_York"])
    }

    // Fetch existing settings
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          reset({
            schoolName: data.schoolName || "",
            notificationBoardedTemplate: data.notificationBoardedTemplate || "",
            notificationDroppedTemplate: data.notificationDroppedTemplate || "",
            defaultTripStartTime: data.defaultTripStartTime || "07:30",
            defaultTripEndTime: data.defaultTripEndTime || "16:30",
            timezone: data.timezone || "Asia/Kolkata",
            smsEnabled: !!data.smsEnabled,
            whatsappEnabled: !!data.whatsappEnabled,
          })
        } else {
          toast.error("Failed to load settings data.")
        }
      } catch (error) {
        toast.error("An error occurred loading settings.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [reset])

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Settings updated successfully!")
        router.refresh()
      } else {
        const errData = await response.json()
        toast.error(errData.error || "Failed to save settings.")
      }
    } catch (error) {
      toast.error("An error occurred saving settings.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  // Extra fallback protection (middleware already secures this path)
  if (session?.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <Card className="w-full max-w-md border border-rose-500/20 bg-slate-900 shadow-2xl text-slate-100">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Access Denied</CardTitle>
            <CardDescription className="text-slate-400">
              Only users with SUPER_ADMIN role are allowed to view this page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full bg-slate-800 hover:bg-slate-700">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px]" />

      <div className="max-w-4xl mx-auto space-y-6 z-10 relative">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Settings className="h-5 w-5" />
              <span>System Control</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Global Settings</h1>
            <p className="text-slate-400 text-sm">
              Configure system defaults, notifications templates, and localization.
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="self-start sm:self-center h-9 border-white/10 hover:bg-white/5 text-slate-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-100">
            <CardContent className="space-y-8 pt-6">
              
              {/* Section 1: Institution Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-emerald-400 font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Institution & Regional Defaults</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="schoolName" className="text-sm font-medium text-slate-300">
                      School / Institution Name
                    </Label>
                    <Input
                      id="schoolName"
                      placeholder="Springdale Public School"
                      className="bg-slate-950/40 border-slate-800 text-slate-100 focus:border-emerald-500"
                      disabled={isSaving}
                      {...register("schoolName")}
                    />
                    {errors.schoolName && (
                      <p className="text-xs text-rose-500 font-medium">{errors.schoolName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="timezone" className="text-sm font-medium text-slate-300">
                      System Timezone (IANA)
                    </Label>
                    <select
                      id="timezone"
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none disabled:cursor-not-allowed md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 bg-slate-900 border-slate-800 text-slate-100"
                      disabled={isSaving}
                      {...register("timezone")}
                    >
                      {ianaTimezones.map((tz) => (
                        <option key={tz} value={tz} className="bg-slate-900 text-slate-100">
                          {tz}
                        </option>
                      ))}
                    </select>
                    {errors.timezone && (
                      <p className="text-xs text-rose-500 font-medium">{errors.timezone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Trip Schedules */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-emerald-400 font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Trip Schedule Defaults</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultTripStartTime" className="text-sm font-medium text-slate-300">
                      Default Morning Trip Start Time
                    </Label>
                    <Input
                      id="defaultTripStartTime"
                      type="time"
                      className="bg-slate-950/40 border-slate-800 text-slate-100 focus:border-emerald-500"
                      disabled={isSaving}
                      {...register("defaultTripStartTime")}
                    />
                    {errors.defaultTripStartTime && (
                      <p className="text-xs text-rose-500 font-medium">{errors.defaultTripStartTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="defaultTripEndTime" className="text-sm font-medium text-slate-300">
                      Default Afternoon Trip End Time
                    </Label>
                    <Input
                      id="defaultTripEndTime"
                      type="time"
                      className="bg-slate-950/40 border-slate-800 text-slate-100 focus:border-emerald-500"
                      disabled={isSaving}
                      {...register("defaultTripEndTime")}
                    />
                    {errors.defaultTripEndTime && (
                      <p className="text-xs text-rose-500 font-medium">{errors.defaultTripEndTime.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Notification Templates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-emerald-400 font-medium">
                  <MessageSquare className="h-4 w-4" />
                  <span>Parent Alerts & Templates</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-6 p-4 rounded-lg border border-white/5 bg-slate-950/20">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smsEnabled"
                        checked={watchSms}
                        onCheckedChange={(checked) => setValue("smsEnabled", !!checked)}
                        disabled={isSaving}
                      />
                      <Label htmlFor="smsEnabled" className="text-sm font-medium text-slate-300 cursor-pointer">
                        Enable SMS Alerts
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="whatsappEnabled"
                        checked={watchWhatsapp}
                        onCheckedChange={(checked) => setValue("whatsappEnabled", !!checked)}
                        disabled={isSaving}
                      />
                      <Label htmlFor="whatsappEnabled" className="text-sm font-medium text-slate-300 cursor-pointer">
                        Enable WhatsApp Alerts
                      </Label>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 flex items-center">
                    Note: Toggle these values to control whether notifications are dispatched to parents on student scans. Use the placeholder token <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-mono font-semibold">{`{student}`}</code> to inject student names dynamically.
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="notificationBoardedTemplate" className="text-sm font-medium text-slate-300">
                      Boarding Notification Template
                    </Label>
                    <textarea
                      id="notificationBoardedTemplate"
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed aria-invalid:border-destructive md:text-sm bg-slate-950/40 border-slate-800 text-slate-100 focus:border-emerald-500"
                      placeholder="Dear parent, your child {student} has boarded the bus."
                      disabled={isSaving}
                      {...register("notificationBoardedTemplate")}
                    />
                    {errors.notificationBoardedTemplate && (
                      <p className="text-xs text-rose-500 font-medium">{errors.notificationBoardedTemplate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notificationDroppedTemplate" className="text-sm font-medium text-slate-300">
                      Drop-off Notification Template
                    </Label>
                    <textarea
                      id="notificationDroppedTemplate"
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed aria-invalid:border-destructive md:text-sm bg-slate-950/40 border-slate-800 text-slate-100 focus:border-emerald-500"
                      placeholder="Dear parent, your child {student} has been dropped off."
                      disabled={isSaving}
                      {...register("notificationDroppedTemplate")}
                    />
                    {errors.notificationDroppedTemplate && (
                      <p className="text-xs text-rose-500 font-medium">{errors.notificationDroppedTemplate.message}</p>
                    )}
                  </div>
                </div>
              </div>

            </CardContent>
            <CardFooter className="border-t border-white/5 pt-6 pb-6 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
