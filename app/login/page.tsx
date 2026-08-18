"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence, Variants } from "framer-motion"
import {
  Loader2,
  Bus,
  CheckCircle2,
  ShieldCheck,
  Compass,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }).min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@route.com", icon: ShieldCheck },
  { role: "Manager", email: "manager@route.com", icon: Bus },
  { role: "Driver", email: "driver1@route.com", icon: Compass },
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleQuickDemoSelect = (email: string) => {
    setValue("email", email, { shouldValidate: true })
    setValue("password", "password123", { shouldValidate: true })
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
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        })
        setIsLoading(false)
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 800)
      }
    } catch (error) {
      toast.error("Connection failed", { description: "Unable to connect to the server." })
      setIsLoading(false)
    }
  }

  // Animation variants for staggered entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 15 } }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* Refined Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.3]" 
           style={{ backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // smooth custom cubic bezier
        className="w-full max-w-[1000px] bg-white rounded-[2rem] shadow-[0_24px_80px_-15px_rgba(0,0,0,0.08)] flex overflow-hidden border border-slate-200/80 relative z-10 min-h-[600px]"
      >
        
        {/* LEFT SIDE - BRANDING & CONTENT */}
        <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#0B1120] to-[#040814] p-12 flex-col relative overflow-hidden text-white border-r border-slate-800">
          {/* Abstract Background Elements - Very subtle */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute bottom-10 -right-10 w-64 h-64 rounded-full bg-blue-500/10 blur-[80px]" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40 border border-indigo-500/30">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Route</span>
          </div>

          {/* Marketing Content */}
          <div className="relative z-10 mt-auto mb-auto">
            <h2 className="text-[2.25rem] font-bold mb-5 leading-[1.15] tracking-tight">
              Intelligent routing for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-blue-400 to-indigo-300">modern fleets.</span>
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-10 max-w-[320px]">
              A comprehensive platform designed to streamline transportation, ensure safety, and optimize every journey.
            </p>

            {/* Floating Info Cards - Premium Glass Look */}
            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-colors cursor-default">
                 <div className="h-11 w-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                   <ShieldCheck className="h-5 w-5 text-emerald-400" />
                 </div>
                 <div>
                   <div className="text-sm font-semibold text-white tracking-tight">Bank-grade Security</div>
                   <div className="text-[13px] text-slate-400 mt-0.5">Your data is encrypted and secure.</div>
                 </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-colors cursor-default">
                 <div className="h-11 w-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                   <Compass className="h-5 w-5 text-blue-400" />
                 </div>
                 <div>
                   <div className="text-sm font-semibold text-white tracking-tight">Live Tracking</div>
                   <div className="text-[13px] text-slate-400 mt-0.5">Real-time GPS monitoring system.</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="relative z-10 flex items-center gap-4 mt-auto pt-8">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0B1120] flex items-center justify-center text-[10px] font-bold text-slate-300">JD</div>
              <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0B1120] flex items-center justify-center text-[10px] font-bold text-slate-200">AS</div>
              <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-[#0B1120] flex items-center justify-center text-[10px] font-bold text-white">MR</div>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Trusted by <span className="text-white font-semibold">500+</span> schools
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="w-full lg:w-[55%] p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Route</span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full max-w-[380px] mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-10">
              <h1 className="text-[1.75rem] font-bold text-slate-900 tracking-tight leading-tight">Sign in</h1>
              <p className="text-[15px] text-slate-500 mt-1.5">Welcome back. Please enter your details.</p>
            </motion.div>

            {/* Demo Accounts - Minimalist Pills */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px bg-slate-100 flex-grow" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Demo Access</span>
                <div className="h-px bg-slate-100 flex-grow" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => {
                        handleQuickDemoSelect(account.email);
                        setTimeout(() => handleSubmit(onSubmit)(), 300);
                      }}
                      className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all text-xs font-semibold text-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-100 group"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      {account.role}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            <motion.form variants={itemVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="h-11 bg-white border-slate-200 text-[15px] text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all px-4 shadow-sm placeholder:text-slate-400"
                  disabled={isLoading || isSuccess}
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-[11px] font-medium mt-1.5">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 bg-white border-slate-200 text-[15px] text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all px-4 shadow-sm placeholder:text-slate-400"
                  disabled={isLoading || isSuccess}
                  {...register("password")}
                />
                {errors.password && <p className="text-red-500 text-[11px] font-medium mt-1.5">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-[15px] shadow-[0_8px_20px_-8px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] mt-4 relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 text-white"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Success</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Sign in
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.form>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-10 text-center text-xs font-medium text-slate-400">
              <p>© 2026 Route Platform. All rights reserved.</p>
            </motion.div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
}

