"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Shield,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  Bus,
  MapPin,
  Bell,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  KeyRound,
  Radio,
  Clock,
  PhoneCall,
  ChevronRight,
  Laptop,
  ShieldCheck,
  HelpCircle,
  Building2,
  Users,
  Compass,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid institutional email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface DemoAccount {
  role: string
  title: string
  email: string
  badgeColor: string
  description: string
  icon: any
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "Admin",
    title: "Super Admin",
    email: "admin@route.com",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    description: "Full platform governance, user management & system settings",
    icon: ShieldCheck,
  },
  {
    role: "Manager",
    title: "Transport Manager",
    email: "manager@route.com",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    description: "Fleet telematics, route assignment, attendance & compliance",
    icon: Bus,
  },
  {
    role: "Driver",
    title: "Bus Driver",
    email: "driver1@route.com",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    description: "Mobile trip execution, GPS tracking & student boarding",
    icon: Compass,
  },
]

const SHOWCASE_FEATURES = [
  {
    id: "telematics",
    title: "Live Fleet Telematics & GPS",
    subtitle: "Sub-second vehicle tracking with geofence security",
    description:
      "Monitor 100% of your institutional fleet in real-time. Instant alerts for route deviation, overspeeding, harsh braking, and predictive arrival times.",
    icon: MapPin,
    badge: "Real-Time Telematics",
    metrics: "28 Active Buses • Sub-second Latency",
  },
  {
    id: "attendance",
    title: "RFID & NFC Student Attendance",
    subtitle: "Automated parent notifications upon boarding & drop-off",
    description:
      "Integrated smart boarding verify students at every bus stop. Instantly send automated SMS and WhatsApp check-in alerts to parents and guardians.",
    icon: UserCheck,
    badge: "100% Student Safety",
    metrics: "4,280+ Students Verified Daily",
  },
  {
    id: "compliance",
    title: "Compliance & Fleet Health",
    subtitle: "Automated fitness certificates, insurance & maintenance",
    description:
      "Never miss a regulatory renewal. Automated reminders for vehicle fitness certificates, insurance policies, pollution checks, and driver licenses.",
    icon: Shield,
    badge: "Zero Regulatory Lapse",
    metrics: "100% Document Compliance",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeShowcase, setActiveShowcase] = useState(0)
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  })

  const currentEmail = watch("email")

  const handleQuickDemoSelect = (account: DemoAccount) => {
    setValue("email", account.email, { shouldValidate: true })
    setValue("password", "password123", { shouldValidate: true })
    setSelectedDemoRole(account.role)
    toast.success(`Loaded ${account.title} credentials`, {
      description: `Email set to ${account.email}. Click Sign In to access the dashboard.`,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    })
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Authentication successful!", {
          description: "Welcome to Route Command Center. Redirecting...",
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        })
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-background font-sans overflow-hidden">
      {/* LEFT PANEL: Enterprise Brand & Feature Command Center */}
      <div className="lg:col-span-7 xl:col-span-7 relative bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Subtle architectural background grid & glowing ambient gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[140px] pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/20">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Route</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 font-semibold">
                  ENTERPRISE OS
                </Badge>
              </div>
              <p className="text-xs text-slate-400">School & University Transit Intelligence</p>
            </div>
          </div>

          {/* Live system status pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-slate-300">
              All 12 Transit Services Operational
            </span>
          </div>
        </div>

        {/* Center Showcase Content */}
        <div className="relative z-10 my-10 lg:my-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-medium text-emerald-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Institutional Transportation Suite</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Smart Fleet Control. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Complete Student Safety.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            Manage your entire educational transit infrastructure from a unified command portal. Real-time GPS tracking, automated parent check-in notifications, and compliance monitoring.
          </p>

          {/* Interactive Feature Showcase Selector */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              {SHOWCASE_FEATURES.map((feat, index) => {
                const Icon = feat.icon
                const isActive = activeShowcase === index
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => setActiveShowcase(index)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="hidden sm:block truncate">
                      <div className="text-xs font-semibold truncate">{feat.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{feat.badge}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Active Feature Detail Card */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-semibold">
                  {SHOWCASE_FEATURES[activeShowcase].badge}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {SHOWCASE_FEATURES[activeShowcase].metrics}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">
                {SHOWCASE_FEATURES[activeShowcase].title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {SHOWCASE_FEATURES[activeShowcase].description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom System Metrics Banner */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">4,280+</div>
                <div className="text-xs text-slate-400">Students Daily</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">28 Buses</div>
                <div className="text-xs text-slate-400">Active Fleet</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">99.4%</div>
                <div className="text-xs text-slate-400">On-Time Index</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">0 Incidents</div>
                <div className="text-xs text-slate-400">Safety Record</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} Route SaaS Platform. All rights reserved.</div>
            <div className="flex items-center gap-3">
              <span>ISO 27001 Certified</span>
              <span>•</span>
              <span>SOC 2 Type II</span>
              <span>•</span>
              <span>DPDP Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Systematic Enterprise Login Interface */}
      <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16 bg-background text-foreground relative">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Header text */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
              <KeyRound className="h-3.5 w-3.5" />
              <span>SECURE ACCESS PORTAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Sign in to your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your institutional credentials below or choose a demo role to preview the dashboard.
            </p>
          </div>

          {/* Quick-Access Demo Credentials Switcher */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Quick-Access Demo Credentials</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono bg-background">
                Password: password123
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon
                const isSelected = selectedDemoRole === account.role || currentEmail === account.email
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickDemoSelect(account)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all duration-150 ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                        : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs font-bold leading-none">{account.title}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-full">
                      {account.role}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedDemoRole && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                <span>
                  Selected: <strong className="text-foreground">{selectedDemoRole} account</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setValue("email", "")
                    setValue("password", "")
                    setSelectedDemoRole(null)
                  }}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  Clear fields
                </button>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-xs font-normal text-muted-foreground">Institutional / User ID</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.com"
                  autoComplete="email"
                  className="pl-10 h-11 bg-background border-input focus:border-emerald-500 focus:ring-emerald-500/20 text-sm"
                  disabled={isLoading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <Dialog>
                  <DialogTrigger className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    Forgot password?
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-emerald-500" />
                        <span>Password & Credential Recovery</span>
                      </DialogTitle>
                      <DialogDescription>
                        Institutional security guidelines for resetting your account credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                      <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Demo & Evaluation Access
                        </div>
                        <p className="text-muted-foreground">
                          All default demo accounts use the standard password:{" "}
                          <strong className="font-mono text-foreground">password123</strong>
                        </p>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">For Institutional Employees:</p>
                        <p>
                          1. Contact your School Transport Administrator or IT Desk to issue a reset link.
                        </p>
                        <p>
                          2. Alternatively, use the automated SMS recovery service registered with your official phone number.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 bg-background border-input focus:border-emerald-500 focus:ring-emerald-500/20 text-sm"
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Security option */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  defaultChecked
                  onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                >
                  Remember this device for 30 days
                </Label>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">TLS 1.3 Encrypted</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating credentials...
                </>
              ) : (
                <>
                  Sign in to Portal
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Institutional Support & Security Footer */}
          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>256-Bit SSL Secured</span>
              </div>

              <Dialog>
                <DialogTrigger className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  <HelpCircle className="h-4 w-4" />
                  <span>IT Support Helpdesk</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <PhoneCall className="h-5 w-5 text-emerald-500" />
                      <span>Institutional Transport IT Support</span>
                    </DialogTitle>
                    <DialogDescription>
                      Contact our support team for immediate account or hardware telematics assistance.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2 text-xs">
                    <div className="p-3 rounded-lg bg-muted border border-border flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">Springdale IT Helpdesk</div>
                        <div className="text-muted-foreground">Mon - Fri • 07:00 AM to 06:00 PM</div>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        Ext. 4021
                      </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-muted border border-border flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">Fleet Telematics Emergency Desk</div>
                        <div className="text-muted-foreground">24/7 Live GPS Control Room</div>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        +91 (11) 2345-6789
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] pt-1">
                      For urgent bus breakdown or emergency SOS alerts, please contact the transport control room directly.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">
                By signing in, you agree to the{" "}
                <span className="underline cursor-pointer">Institutional Acceptable Use Policy</span>{" "}
                and <span className="underline cursor-pointer">Data Privacy Guidelines</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

