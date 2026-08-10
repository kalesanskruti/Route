"use client"

import React, { useState } from "react"
import {
  Settings,
  Building2,
  Sliders,
  Bell,
  Shield,
  Save,
  RefreshCw,
  Key,
  Check,
  Smartphone,
  Lock,
  Globe,
  Cpu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export function SettingsView() {
  const [universityName, setUniversityName] = useState("National University of Engineering & Tech")
  const [academicYear, setAcademicYear] = useState("2026-2027 Academic Session")
  const [gpsPingSeconds, setGpsPingSeconds] = useState("15")
  const [speedLimitKmh, setSpeedLimitKmh] = useState("50")
  const [geoFenceRadius, setGeoFenceRadius] = useState("100")
  const [smsBoardingEnabled, setSmsBoardingEnabled] = useState(true)
  const [smsEmergencyEnabled, setSmsEmergencyEnabled] = useState(true)
  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Global SmartBus Enterprise settings saved and broadcasted to telemetry gateway!")
    }, 700)
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Global Enterprise System Settings
            </h1>
            <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
              Super Admin Control
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure university campus parameters, IoT socket telemetry intervals, parent SMS alerts, and security policies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-6 shadow-sm"
          >
            <Save className={`h-3.5 w-3.5 mr-1.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving Config..." : "Save All Settings"}</span>
          </Button>
        </div>
      </div>

      {/* 2 Column Responsive Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: University Organization Profile */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              University &amp; Organization Profile
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Official institutional branding and academic year metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Institution Legal Name
              </label>
              <Input
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="rounded-xl border-border h-9 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Active Academic Year
                </label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="rounded-xl border-border h-9 text-sm font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Timezone &amp; Locale
                </label>
                <Input
                  defaultValue="Asia/Kolkata (IST • UTC+05:30)"
                  disabled
                  className="rounded-xl border-border h-9 text-sm bg-muted text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Principal Campus Address
              </label>
              <Input
                defaultValue="North Ring Road, Science & Tech Park, Bengaluru, Karnataka 560001"
                className="rounded-xl border-border h-9 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: IoT Telemetry & GPS Gateway Configuration */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-600" />
              IoT Telemetry &amp; GPS Radar Parameters
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Hardware socket sync frequency and geo-fence safety thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  GPS Ping Interval (s)
                </label>
                <Input
                  type="number"
                  value={gpsPingSeconds}
                  onChange={(e) => setGpsPingSeconds(e.target.value)}
                  className="rounded-xl border-border h-9 text-sm font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Speed Limit (km/h)
                </label>
                <Input
                  type="number"
                  value={speedLimitKmh}
                  onChange={(e) => setSpeedLimitKmh(e.target.value)}
                  className="rounded-xl border-border h-9 text-sm font-mono font-bold text-amber-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Geo-Fence Radius (m)
                </label>
                <Input
                  type="number"
                  value={geoFenceRadius}
                  onChange={(e) => setGeoFenceRadius(e.target.value)}
                  className="rounded-xl border-border h-9 text-sm font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
              <span className="font-bold text-foreground block mb-1">Telemetry Socket Status:</span>
              SmartBus IoT Cloud Gateway v4.12 is connected to 142 bus OBD-II/GPS trackers with zero packet loss.
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Automated Parent SMS & Push Notification Rules */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-violet-600" />
              Automated Parent SMS &amp; Alert Rules
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Manage Twilio / AWS SNS gateway triggers for student boarding
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
              <div>
                <span className="text-sm font-bold text-foreground block">
                  Parent RFID Boarding &amp; Drop-off SMS
                </span>
                <span className="text-xs text-muted-foreground">
                  Automatically SMS parents within 5 seconds of card tap
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSmsBoardingEnabled(!smsBoardingEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  smsBoardingEnabled ? "bg-blue-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    smsBoardingEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
              <div>
                <span className="text-sm font-bold text-foreground block">
                  Emergency SOS Siren &amp; SMS Broadcast
                </span>
                <span className="text-xs text-muted-foreground">
                  Send immediate alert SMS to security control room &amp; drivers
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSmsEmergencyEnabled(!smsEmergencyEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  smsEmergencyEnabled ? "bg-red-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    smsEmergencyEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Enterprise Security & API Key Management */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Enterprise Security &amp; API Credentials
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Role-Based Access Control (RBAC) and hardware authentication keys
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
              <div>
                <span className="text-sm font-bold text-foreground block">
                  Mandatory Multi-Factor Auth (MFA)
                </span>
                <span className="text-xs text-muted-foreground">
                  Enforces 2FA for all Transport Managers and Chief Dispatchers
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  mfaEnabled ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    mfaEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                SmartBus IoT Master API Key
              </label>
              <div className="flex items-center gap-2">
                <Input
                  defaultValue="sb_live_ent_994821004128892_ka_univ"
                  type="password"
                  disabled
                  className="rounded-xl border-border h-9 text-xs font-mono bg-muted text-muted-foreground"
                />
                <Button
                  onClick={() => toast.success("Copied SmartBus IoT Master API Key to clipboard")}
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold rounded-xl"
                >
                  Copy Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button Bottom Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10 px-8 shadow-sm"
        >
          <Save className="h-3.5 w-3.5 mr-2" />
          <span>Save Global Enterprise Settings</span>
        </Button>
      </div>
    </div>
  )
}
