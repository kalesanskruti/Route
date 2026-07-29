"use client"

import React, { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
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
  Shield,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const role = session?.user?.role
  const prefix = role === "SUPER_ADMIN" ? "/admin" : "/manager"

  // Base navigation links
  const navItems = [
    { label: "Dashboard", href: `${prefix}/dashboard`, icon: LayoutDashboard },
    { label: "Buses", href: `${prefix}/buses`, icon: Bus },
    { label: "Routes", href: `${prefix}/routes`, icon: RouteIcon },
    { label: "Drivers", href: `${prefix}/drivers`, icon: UserSquare2 },
    { label: "Students", href: `${prefix}/students`, icon: Users },
  ]

  // Add settings link strictly to Super Admins
  if (role === "SUPER_ADMIN") {
    navItems.push({ label: "Global Settings", href: "/admin/settings", icon: Settings })
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const roleLabel = role === "SUPER_ADMIN" ? "Super Admin" : "Transport Manager"
  const roleBadgeColor = role === "SUPER_ADMIN" 
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-white/5 font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Bus className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white">Route</span>
          <span className="block text-xs text-slate-500 font-medium">Bus Logistics System</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <button
              key={item.label}
              onClick={() => {
                router.push(item.href)
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group text-left ${
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
              }`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Information Profile Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-white/5 text-slate-300">
            <User className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-white truncate">
              {session?.user?.name || "System Administrator"}
            </span>
            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${roleBadgeColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full flex items-center justify-start gap-3 mt-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl px-4 py-3 h-10 border border-transparent hover:border-rose-500/10"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sm:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsMobileMenuOpen(true)}
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-bold tracking-tight text-white">
              {navItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))?.label || "School Bus Management"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-400 hover:text-white rounded-full h-9 w-9 border border-white/5 hover:bg-white/5"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 sm:p-10 relative z-10">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay Drawer for Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-sm">
          <div className="w-64 max-w-xs h-full relative">
            <SidebarContent />
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
    </div>
  )
}
