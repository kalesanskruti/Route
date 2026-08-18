"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bus,
  ArrowLeft,
  Download,
  Wrench,
  ShieldCheck,
  FileText,
  UserCheck,
  Route as RouteIcon,
  Users,
  Activity,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Award,
  HardDrive,
  Cpu,
  Signal,
  Eye,
  ExternalLink,
  Info,
  ShieldAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

interface BusDetailsViewProps {
  busId: string
  onClose?: () => void
}

export function BusDetailsView({ busId, onClose }: BusDetailsViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    | "VEHICLE"
    | "INSURANCE"
    | "PERMIT"
    | "FITNESS"
    | "PUC"
    | "GPS"
    | "MAINTENANCE"
    | "DOCS"
    | "DRIVER"
    | "ROUTE"
    | "STUDENTS"
    | "ACTIVITY"
  >("VEHICLE")

  // Mock enterprise data for the specific bus
  const bus = {
    id: busId,
    busNumber: "BUS-101",
    registrationNumber: "KA-01-EQ-4421",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
    make: "Tata Motors",
    model: "Starbus Ultra EV 40-Seater",
    year: 2023,
    vin: "MAT821900EV202391",
    chassisNumber: "TAT-EV-4421-CH99",
    engineNumber: "EV-MTR-882104",
    mileage: 48210,
    engineHours: 1940,
    capacity: 52,
    fuelType: "Electric (EV 180 kWh)",
    gpsStatus: "ONLINE" as const,
    complianceStatus: "VALID" as const,
    insurance: {
      policyNumber: "POL-ICICI-2026-9912",
      insurer: "ICICI Lombard General Insurance",
      startDate: "15 Jan 2026",
      expiryDate: "14 Jan 2027",
      premium: "₹42,500",
      status: "VALID",
    },
    permit: {
      permitNumber: "STA/KA/01/2023/8812",
      issuingAuthority: "State Transport Authority, Bangalore",
      validFrom: "01 Feb 2024",
      validUntil: "31 Jan 2029",
      routeAuthorized: "All University Campuses & Greater Metro Radius",
      status: "VALID",
    },
    fitness: {
      certificateNumber: "FIT/KA/2026/0091",
      testCenter: "RTO Central Inspection Depot #4",
      issueDate: "10 Mar 2026",
      expiryDate: "09 Mar 2027",
      inspectorNotes: "Brakes, EV battery insulation, and emergency doors certified 100% compliant.",
      status: "VALID",
    },
    pollution: {
      certificateNumber: "PUC/EV/EXEMPT-2026",
      emissionStandard: "Zero Emission EV / Bharat Stage VI Exempt",
      issueDate: "01 Jan 2026",
      expiryDate: "31 Dec 2030",
      status: "VALID",
    },
    gpsDevice: {
      imei: "867190041209881",
      hardwareModel: "Teltonika FMB120 Enterprise Telemetry",
      simCarrier: "Airtel M2M IoT",
      pingInterval: "15 Seconds",
      signalStrength: "-64 dBm (Excellent 4G LTE)",
      firmwareVersion: "v4.12.8-PROD",
    },
    driver: {
      name: "Rajesh Kumar",
      photo: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
      phone: "+91 98450 11223",
      emergencyContact: "+91 98450 99887",
      licenseNumber: "DL-042018001",
      experience: "8 Years with University",
      safetyScore: 4.9,
      totalTrips: 1420,
    },
    route: {
      id: "route-1",
      name: "Main Campus Express #1",
      distanceKm: 18.4,
      estimatedMins: 42,
      stops: [
        { name: "North Gate Hub", time: "07:30 AM", students: 14 },
        { name: "Science Block D", time: "07:42 AM", students: 12 },
        { name: "Engineering Library", time: "07:54 AM", students: 16 },
        { name: "Central Auditorium", time: "08:10 AM", students: 10 },
      ],
    },
    studentsCount: 52,
    studentsRoster: [
      { id: "STU-01", name: "Aarav Sharma", dept: "B.Tech CS", stop: "North Gate Hub", status: "BOARDED" },
      { id: "STU-02", name: "Priya Nair", dept: "MBA", stop: "Science Block D", status: "BOARDED" },
      { id: "STU-03", name: "Rohan Gupta", dept: "B.Arch", stop: "Engineering Library", status: "BOARDED" },
      { id: "STU-04", name: "Sanya Mehta", dept: "LL.B", stop: "North Gate Hub", status: "BOARDED" },
      { id: "STU-05", name: "Kiran Rao", dept: "B.Tech CS", stop: "Central Auditorium", status: "BOARDED" },
    ],
    maintenanceHistory: [
      {
        id: "maint-1",
        date: "12 Jul 2026",
        workshop: "Central EV Fleet Service Hub",
        type: "10,000 km Preventive",
        invoiceNumber: "INV-2026-881",
        partsReplaced: "Brake Pads, Cabin Air Filter, Tire Rotation",
        cost: "₹14,200",
      },
      {
        id: "maint-2",
        date: "05 Apr 2026",
        workshop: "Tata EV Authorized Workshop",
        type: "Battery Thermal Audit",
        invoiceNumber: "INV-2026-402",
        partsReplaced: "Coolant Flush, Sensor Recalibration",
        cost: "₹8,500",
      },
    ],
    activityTimeline: [
      { time: "10:14:22 AM", event: "Bus arrived at Central Auditorium stop • 10 students dropped", type: "ARRIVAL" },
      { time: "09:54:10 AM", event: "Telemetry ping: Speed 42 km/h • Battery SOC 88%", type: "TELEMETRY" },
      { time: "07:30:00 AM", event: "Driver Rajesh K. authenticated via RFID • Engine Ignition Start", type: "START" },
    ],
  }

  const tabs = [
    { id: "VEHICLE", label: "Vehicle Info", icon: Bus },
    { id: "INSURANCE", label: "Insurance", icon: ShieldCheck },
    { id: "PERMIT", label: "Permit", icon: FileText },
    { id: "FITNESS", label: "Fitness", icon: CheckCircle2 },
    { id: "PUC", label: "Pollution (PUC)", icon: Info },
    { id: "GPS", label: "GPS Device", icon: Radio },
    { id: "MAINTENANCE", label: "Maintenance", icon: Wrench },
    { id: "DOCS", label: "Documents", icon: HardDrive },
    { id: "DRIVER", label: "Assigned Driver", icon: UserCheck },
    { id: "ROUTE", label: "Assigned Route", icon: RouteIcon },
    { id: "STUDENTS", label: "Students Assigned", icon: Users },
    { id: "ACTIVITY", label: "Activity Timeline", icon: Activity },
  ]

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (onClose) return onClose()
              const basePath = window.location.pathname.startsWith('/manager') ? '/manager' : '/admin'
              router.push(`${basePath}/buses`)
            }}
            className="rounded-xl h-9 w-9 border-border hover:bg-muted"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-16 md:h-16 md:w-24 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
              <img src={bus.image} alt="Bus" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {bus.busNumber}
                </h1>
                <span className="text-sm font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {bus.registrationNumber}
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  Online Telemetry
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bus.year} {bus.make} {bus.model} • VIN: {bus.vin}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Downloading official PDF vehicle dossier...")}
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Dossier (PDF)</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              toast.info("Opening maintenance scheduling workshop modal")
              router.push("/admin/maintenance")
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-xl text-xs font-semibold shadow-sm"
          >
            <Wrench className="h-3.5 w-3.5 mr-1.5" />
            Schedule Service
          </Button>
        </div>
      </div>

      {/* 12 Enterprise Sections Navigation Tabs */}
      <div className="overflow-x-auto border-b border-border">
        <div className="flex items-center gap-1 min-w-max pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Vehicle Information */}
      {activeTab === "VEHICLE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground">
                Official Vehicle Specification &amp; Chassis Registration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Registered in Central Transport Authority Database
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 rounded-xl overflow-hidden border border-border h-48 sm:h-64 relative">
                <img src={bus.image} alt={bus.make} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                   <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md font-bold">Verified Asset</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Manufacturer &amp; Model
                  </span>
                  <span className="text-base font-bold text-foreground mt-1 block">
                    {bus.make} {bus.model}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Manufacturing Year
                  </span>
                  <span className="text-base font-bold text-foreground mt-1 block">
                    {bus.year}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    VIN / Vehicle Identification Number
                  </span>
                  <span className="text-sm font-mono font-bold text-foreground mt-1 block">
                    {bus.vin}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Chassis &amp; Engine Numbers
                  </span>
                  <span className="text-sm font-mono text-foreground mt-1 block">
                    {bus.chassisNumber} • {bus.engineNumber}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Odometer Mileage &amp; Engine Hours
                  </span>
                  <span className="text-base font-bold text-foreground mt-1 block">
                    {bus.mileage.toLocaleString()} km • {bus.engineHours} hrs
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Powertrain &amp; Fuel Type
                  </span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {bus.fuelType}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground">
                Statutory Status Snapshot
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                All regulatory checks verified
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Overall Compliance</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  100% VALID
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Insurance Validity</span>
                <span className="text-xs font-mono font-semibold text-foreground">Until 14 Jan 2027</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">State Permit</span>
                <span className="text-xs font-mono font-semibold text-foreground">Until 31 Jan 2029</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Fitness Certificate</span>
                <span className="text-xs font-mono font-semibold text-foreground">Until 09 Mar 2027</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Insurance */}
      {activeTab === "INSURANCE" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm max-w-3xl">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Commercial Comprehensive Fleet Insurance Policy
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Insured under University Group Transit Policy
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                VALID POLICY
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Policy Number
                </span>
                <span className="text-sm font-mono font-bold text-foreground mt-1 block">
                  {bus.insurance.policyNumber}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Insurance Carrier
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {bus.insurance.insurer}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Policy Period
                </span>
                <span className="text-sm font-semibold text-foreground mt-1 block">
                  {bus.insurance.startDate} — {bus.insurance.expiryDate}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Annual Premium Paid
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {bus.insurance.premium}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <span className="text-sm font-bold text-foreground block">ICICI_Lombard_Policy_BUS101.pdf</span>
                  <span className="text-xs text-muted-foreground">Digitally signed • 2.4 MB</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success("Downloaded official insurance certificate")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-8"
              >
                Download Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Permit */}
      {activeTab === "PERMIT" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm max-w-3xl">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  State Route Transport Authorization Permit
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Issued by State Transport Authority
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                5-YEAR PERMIT
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  State Permit Number
                </span>
                <span className="text-sm font-mono font-bold text-foreground mt-1 block">
                  {bus.permit.permitNumber}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Issuing RTO Authority
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {bus.permit.issuingAuthority}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Validity Window
                </span>
                <span className="text-sm font-semibold text-foreground mt-1 block">
                  {bus.permit.validFrom} — {bus.permit.validUntil}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Authorized Transit Corridors
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {bus.permit.routeAuthorized}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Fitness */}
      {activeTab === "FITNESS" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm max-w-3xl">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Statutory Vehicle Fitness Test Certificate
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Annual roadworthiness check
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                PASSED (100/100)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Fitness Certificate Number
                </span>
                <span className="text-sm font-mono font-bold text-foreground mt-1 block">
                  {bus.fitness.certificateNumber}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Inspection Depot
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {bus.fitness.testCenter}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Expiry Date
                </span>
                <span className="text-sm font-semibold text-foreground mt-1 block">
                  {bus.fitness.expiryDate}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1">
                Chief Inspector Remarks:
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{bus.fitness.inspectorNotes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: PUC (Pollution) */}
      {activeTab === "PUC" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm max-w-3xl">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Info className="h-5 w-5 text-emerald-500" />
                  Pollution Under Control (PUC) &amp; EV Emission Exemption
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  100% Zero-Emission Electric Powertrain Status
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                ZERO EMISSIONS
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Certificate ID
                </span>
                <span className="text-sm font-mono font-bold text-foreground mt-1 block">
                  {bus.pollution.certificateNumber}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Emission Standard
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {bus.pollution.emissionStandard}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 6: GPS Device */}
      {activeTab === "GPS" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm max-w-3xl">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Radio className="h-5 w-5 text-blue-600" />
                  On-Board GPS Telemetry &amp; IoT Hardware Tracker
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Active connection to SmartBus Real-Time Socket.IO Server
                </CardDescription>
              </div>
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                ONLINE • 15s PING
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  IMEI Serial Number
                </span>
                <span className="text-sm font-mono font-bold text-foreground mt-1 block">
                  {bus.gpsDevice.imei}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Hardware Tracker Model
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {bus.gpsDevice.hardwareModel}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  SIM Carrier &amp; IoT Network
                </span>
                <span className="text-sm font-semibold text-foreground mt-1 block">
                  {bus.gpsDevice.simCarrier}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Signal Strength &amp; Firmware
                </span>
                <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {bus.gpsDevice.signalStrength} • {bus.gpsDevice.firmwareVersion}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 7: Maintenance Timeline */}
      {activeTab === "MAINTENANCE" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">
              Chassis &amp; Powertrain Service Timeline
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Official workshop service history and parts replacement log
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {bus.maintenanceHistory.map((item, idx) => (
                <div key={item.id} className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{item.type}</span>
                      <span className="text-sm font-bold text-foreground font-mono">{item.cost}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.workshop} • Invoice: <span className="font-mono font-semibold">{item.invoiceNumber}</span> ({item.date})
                    </div>
                    <div className="text-xs font-semibold text-foreground mt-2 bg-muted/40 p-2.5 rounded-xl border border-border">
                      Parts Replaced: {item.partsReplaced}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 8: Documents (Digital Locker) */}
      {activeTab === "DOCS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Registration Certificate (RC)", filename: "KA01EQ4421_Official_RC.pdf", size: "1.8 MB", date: "Jan 2023" },
            { title: "Comprehensive Insurance Policy", filename: "ICICI_Lombard_Policy_2026.pdf", size: "2.4 MB", date: "Jan 2026" },
            { title: "State Route Transport Permit", filename: "STA_KA_Permit_8812.pdf", size: "3.1 MB", date: "Feb 2024" },
            { title: "Fitness Test Certificate", filename: "Fitness_RTO_Bangalore.pdf", size: "1.2 MB", date: "Mar 2026" },
          ].map((doc, idx) => (
            <Card key={idx} className="rounded-2xl border-border bg-card shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{doc.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{doc.filename} • {doc.size}</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success(`Downloaded ${doc.filename}`)}
                className="h-8 rounded-xl text-xs font-semibold"
              >
                Download
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 9: Assigned Driver */}
      {activeTab === "DRIVER" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm max-w-2xl">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">
              Currently Assigned Fleet Driver
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Verified university transport personnel
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl overflow-hidden border border-border shadow-sm shrink-0">
                  <img src={bus.driver.photo} alt={bus.driver.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{bus.driver.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    License: <span className="font-mono font-semibold">{bus.driver.licenseNumber}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      ★ {bus.driver.safetyScore} Safety Rating
                    </Badge>
                    <span className="text-muted-foreground">{bus.driver.experience}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => toast.info(`Calling driver at ${bus.driver.phone}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4"
              >
                <Phone className="h-3.5 w-3.5 mr-1.5" />
                Contact Driver
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 10: Assigned Route */}
      {activeTab === "ROUTE" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  {bus.route.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Total Corridor: {bus.route.distanceKm} km • Est. Duration: {bus.route.estimatedMins} mins
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => router.push("/admin/routes")}
                variant="outline"
                className="text-xs font-semibold rounded-xl h-8"
              >
                View in Route Center
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {bus.route.stops.map((stop, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{stop.name}</div>
                      <div className="text-xs text-muted-foreground">Scheduled Arrival: {stop.time}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-border">
                    {stop.students} students boarding
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 11: Students Assigned */}
      {activeTab === "STUDENTS" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">
              Enrolled Student Roster ({bus.studentsCount} Seats)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Students assigned to this campus corridor
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Pickup Stop</th>
                  <th className="py-3 px-4 text-center">Today&apos;s Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bus.studentsRoster.map((stu) => (
                  <tr key={stu.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-semibold">{stu.id}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{stu.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{stu.dept}</td>
                    <td className="py-3 px-4">{stu.stop}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {stu.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 12: Activity Timeline */}
      {activeTab === "ACTIVITY" && (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground">
              Real-Time Telemetry &amp; Event Stream
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Automated audit trail from GPS tracker and RFID reader
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {bus.activityTimeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3.5 rounded-xl border border-border bg-muted/20">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{item.event}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
