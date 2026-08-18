"use client"

import React, { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  LayoutDashboard, 
  Bus, 
  Route as RouteIcon, 
  Users, 
  UserSquare2, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Bell, 
  Navigation, 
  CheckSquare, 
  Wrench, 
  ShieldCheck, 
  BarChart3, 
  FileText, 
  LifeBuoy, 
  Search, 
  Sun, 
  Moon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  MapPin, 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  Clock, 
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampus, setSelectedCampus] = useState("Main Campus — North")
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState("")

  const role = session?.user?.role
  const prefix = role === "SUPER_ADMIN" ? "/admin" : "/manager"

  // Current live clock display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
      setCurrentDateTime(formatted)
    }
    updateTime()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  // Keyboard shortcut for search Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const campuses = [
    { id: "1", name: "Main Campus — North", buses: 64 },
    { id: "2", name: "Science & Tech Park Campus", buses: 42 },
    { id: "3", name: "South Medical Center Campus", buses: 36 },
  ]

  const navSections = role === "SUPER_ADMIN" 
    ? [
        {
          title: "OVERVIEW",
          items: [
            { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          title: "INSTITUTION MANAGEMENT",
          items: [
            { label: "Universities", href: "/admin/institutions", icon: Building2 },
          ],
        },
        {
          title: "SYSTEM & ACCESS",
          items: [
            { label: "Users & Roles", href: "/admin/users", icon: Users },
            { label: "Global Settings", href: "/admin/settings", icon: Settings },
            { label: "Audit Logs", href: "/admin/audit", icon: ShieldCheck },
          ],
        },
      ]
    : [
        {
          title: "OVERVIEW",
          items: [
            { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          title: "TRANSPORT",
          items: [
            { label: "Fleet", href: "/manager/buses", icon: Bus },
            { label: "Drivers", href: "/manager/drivers", icon: UserSquare2 },
            { label: "Supervisors", href: "/manager/supervisors", icon: User },
            { label: "Routes", href: "/manager/routes", icon: RouteIcon },
            { label: "Students", href: "/manager/students", icon: Users },
            { label: "Trips", href: "/manager/trips", icon: Navigation },
          ],
        },
        {
          title: "MONITORING",
          items: [
            { label: "Live Tracking", href: "/manager/tracking", icon: MapPin },
            { label: "Attendance & Safety", href: "/manager/attendance", icon: CheckSquare },
            { label: "Incidents", href: "/manager/incidents", icon: AlertTriangle },
          ],
        },
        {
          title: "OPERATIONS",
          items: [
            { label: "Maintenance", href: "/manager/maintenance", icon: Wrench },
            { label: "Compliance", href: "/manager/compliance", icon: ShieldCheck },
            { label: "Notifications", href: "/manager/notifications", icon: Bell },
          ],
        },
        {
          title: "INSIGHTS",
          items: [
            { label: "Analytics", href: "/manager/analytics", icon: BarChart3 },
            { label: "Reports", href: "/manager/reports", icon: FileText },
          ],
        },
        {
          title: "SYSTEM",
          items: [
            { label: "Activity Log", href: "/manager/activity-log", icon: Clock },
            { label: "Settings", href: "/manager/settings", icon: Settings },
          ],
        }
      ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const roleLabel = role === "SUPER_ADMIN" ? "Super Admin" : "Transport Manager"
  const roleBadgeColor = role === "SUPER_ADMIN"
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-100 border-r border-slate-800/80 font-sans select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20">
            <Bus className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white truncate">SmartBus</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <span className="block text-[11px] text-slate-400 font-medium truncate">
                University Fleet System
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {navSections.map((section) => {
          if (section.items.length === 0) return null
          return (
            <div key={section.title}>
              {!isSidebarCollapsed && (
                <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        router.push(item.href)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left relative ${
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                      } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      {isActive && !isSidebarCollapsed && (
                        <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Information Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-white truncate">
                  {session?.user?.name || "Dr. Robert Vance"}
                </span>
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${roleBadgeColor}`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              onClick={() => setIsMobileMenuOpen(true)}
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* University Campus Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/80 text-sm font-semibold transition-all duration-150"
              >
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[240px] text-foreground">{selectedCampus}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {isCampusDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-card border border-border shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select University Campus
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      142 Total Enterprise Fleet Vehicles
                    </p>
                  </div>
                  <div className="space-y-1">
                    {campuses.map((campus) => (
                      <button
                        key={campus.id}
                        onClick={() => {
                          setSelectedCampus(campus.name)
                          setIsCampusDropdownOpen(false)
                          toast.success(`Switched active view to ${campus.name}`, {
                            description: `Managing ${campus.buses} active buses across this campus.`,
                          })
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                          selectedCampus === campus.name
                            ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="truncate">{campus.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono font-semibold">
                          {campus.buses} buses
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Cmd+K Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-border bg-muted/30 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-all duration-150"
            >
              <Search className="h-4 w-4" />
              <span>Search buses, routes, drivers...</span>
              <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shadow-sm">
                ⌘K
              </kbd>
            </button>

            {/* Quick Actions Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold px-3 py-1.5 h-9 shadow-sm shadow-blue-600/20"
              >
                <Plus className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Quick Action</span>
              </Button>
              {isQuickActionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-xl p-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                    Enterprise Actions
                  </div>
                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false)
                      router.push(`${prefix}/buses`)
                      toast.info("Opening Add New Bus Form")
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Bus className="h-4 w-4 text-blue-600" />
                    <span>Register New Bus</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false)
                      router.push(`${prefix}/routes`)
                      toast.info("Opening Route Assignment Form")
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <RouteIcon className="h-4 w-4 text-emerald-600" />
                    <span>Create Campus Route</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false)
                      router.push(`${prefix}/maintenance`)
                      toast.info("Opening Service Workshop Modal")
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Wrench className="h-4 w-4 text-amber-600" />
                    <span>Schedule Maintenance</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false)
                      router.push(`${prefix}/reports`)
                      toast.info("Exporting Daily Executive Summary")
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 text-violet-600" />
                    <span>Export Daily Dossier</span>
                  </button>
                </div>
              )}
            </div>

            {/* Current Date & Time */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/20 text-xs font-semibold text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              <span>{currentDateTime || "Mon, Aug 1 • 10:14 AM"}</span>
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl h-9 w-9 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications Popover */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative rounded-xl h-9 w-9 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-card">
                  3
                </span>
              </Button>

              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">Enterprise Alert Center</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                        3 New
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false)
                        toast.success("All notifications marked as read")
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Permit Renewal Due</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Bus #BUS-402 (Reg KA-01-EQ-4421) state permit expires in 4 days.
                        </p>
                        <button
                          onClick={() => {
                            setIsNotificationsOpen(false)
                            router.push(`${prefix}/compliance`)
                          }}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1.5 inline-block hover:underline"
                        >
                          Review in Compliance →
                        </button>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
                      <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">GPS Telemetry Offline</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Bus #BUS-108 lost GPS telemetry connection on Science Park Route 4.
                        </p>
                        <button
                          onClick={() => {
                            setIsNotificationsOpen(false)
                            router.push(`${prefix}/tracking`)
                          }}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1.5 inline-block hover:underline"
                        >
                          Open Live GPS Tracking →
                        </button>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Scheduled Service Reminder</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          6 buses are scheduled for 10,000 km maintenance at Metro Workshop tomorrow.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 relative z-10">{children}</main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 max-w-xs h-full relative">
            {renderSidebarContent()}
            <Button
              onClick={() => setIsMobileMenuOpen(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 -right-12 text-slate-300 hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Global Command Search Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 142 buses, 48 routes, drivers, and 4,820 students..."
              className="border-0 focus-visible:ring-0 text-base p-0 shadow-none bg-transparent"
              autoFocus
            />
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick Suggestions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  router.push(`${prefix}/buses`)
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bus className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">All Fleet Buses</div>
                  <div className="text-xs text-muted-foreground">142 registered vehicles</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  router.push(`${prefix}/tracking`)
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Live GPS Map</div>
                  <div className="text-xs text-muted-foreground">Real-time bus tracking</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  router.push(`${prefix}/analytics`)
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Analytics Center</div>
                  <div className="text-xs text-muted-foreground">Fleet utilization & KPIs</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  router.push(`${prefix}/compliance`)
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Compliance Dossier</div>
                  <div className="text-xs text-muted-foreground">Permits, PUC, insurance</div>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
