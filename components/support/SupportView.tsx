"use client"

import React, { useState } from "react"
import {
  Headphones,
  LifeBuoy,
  BookOpen,
  Send,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export function SupportView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketCategory, setTicketCategory] = useState("GPS Telemetry & Hardware")
  const [ticketPriority, setTicketPriority] = useState("NORMAL")
  const [ticketDescription, setTicketDescription] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  const faqs = [
    {
      question: "How do I configure custom GPS geo-fences for new university campuses?",
      answer:
        "Navigate to Global Settings -> Telemetry Configuration. Select 'Add Campus Geo-Fence' and draw a polygon around the campus perimeter. Set the buffer radius in meters (default 100m) to automatically trigger stop arrivals and departure alerts.",
    },
    {
      question: "How do I issue or replace a student RFID smart card in the attendance hub?",
      answer:
        "Open Student Management, select the student profile, and click 'Update RFID Serial'. Tap the new card on any connected administrator USB reader or manually input the 8-digit hexadecimal RFID serial number.",
    },
    {
      question: "How do I export statutory permit and insurance dossiers for RTO inspection?",
      answer:
        "Go to the Reports Generation Center, select 'Compliance Expiry Dossier', pick your required date window, and choose PDF format. This produces an ISO-audited document with digital signatures for all 142 fleet vehicles.",
    },
    {
      question: "How do I enable or customize automated parent SMS boarding notifications?",
      answer:
        "In Global Settings -> SMS & Notifications, ensure 'Automated Parent Boarding SMS' is toggled ON. You can customize the SMS template using dynamic tags like {{student_name}}, {{stop_name}}, and {{timestamp}}.",
    },
    {
      question: "What is the SLA response time for P1 Critical GPS Telemetry outages?",
      answer:
        "As an Enterprise SmartBus subscriber, your contract guarantees a 15-minute response time for Priority 1 Critical Telemetry incidents and a 99.9% IoT socket gateway availability SLA.",
    },
  ]

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please fill in both subject and issue description")
      return
    }
    toast.success(
      "Support ticket created! Ticket #SB-2026-9912 assigned to Senior Transport Engineer."
    )
    setTicketSubject("")
    setTicketDescription("")
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              24/7 Enterprise Dedicated Support &amp; Knowledge Base
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              15-Min SLA Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Direct access to dedicated transportation telemetry engineers, system documentation, and priority ticketing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.info("Connecting to 24/7 Enterprise Emergency Hotline: +91 80000 11223")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Emergency Hotline</span>
          </Button>
        </div>
      </div>

      {/* 3 Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border bg-card shadow-sm p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
              <Headphones className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Dedicated Account Engineer</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Your assigned transportation systems specialist is available for architecture reviews and driver app onboarding.
            </p>
          </div>
          <Button
            onClick={() => toast.success("Scheduled video conference with Dedicated Account Engineer")}
            variant="outline"
            size="sm"
            className="mt-6 w-full text-xs font-semibold rounded-xl h-9 border-border"
          >
            Schedule Consultation
          </Button>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Live Telemetry Chat Support</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Instant messaging channel for GPS device troubleshooting, RFID reader calibration, and route corridor updates.
            </p>
          </div>
          <Button
            onClick={() => toast.success("Connecting to live chat with telemetry engineer...")}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl h-9"
          >
            Start Live Chat
          </Button>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Official Documentation &amp; API</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Comprehensive REST API references, Webhook schemas, hardware wiring diagrams, and ISO compliance manuals.
            </p>
          </div>
          <Button
            onClick={() => toast.info("Opening SmartBus Developer & API Documentation Portal")}
            variant="outline"
            size="sm"
            className="mt-6 w-full text-xs font-semibold rounded-xl h-9 border-border"
          >
            Open Docs Portal
          </Button>
        </Card>
      </div>

      {/* Main Support Grid: Left Ticket Form (5 cols) | Right Knowledge Base (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Support Ticket Form */}
        <Card className="lg:col-span-5 rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-blue-600" />
              Create Priority Enterprise Ticket
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              15-minute SLA for P1 Critical telemetry or safety issues
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Subject / Summary
                </label>
                <Input
                  placeholder="e.g. BUS-105 GPS telemetry ping intermittent"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="rounded-xl border-border h-9 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    System Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
                  >
                    <option>GPS Telemetry &amp; Hardware</option>
                    <option>RFID Reader &amp; Smart Cards</option>
                    <option>Driver Mobile App</option>
                    <option>Route &amp; GIS Map</option>
                    <option>Billing &amp; Enterprise License</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Priority Level
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
                  >
                    <option value="NORMAL">Normal (4 Hour SLA)</option>
                    <option value="URGENT">Urgent (1 Hour SLA)</option>
                    <option value="CRITICAL">P1 Critical (15 Min SLA)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Detailed Issue Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the steps to reproduce, vehicle number, and any error codes..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10 shadow-sm"
              >
                <Send className="h-3.5 w-3.5 mr-2" />
                Submit Enterprise Support Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enterprise Knowledge Base Accordion */}
        <Card className="lg:col-span-7 rounded-2xl border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-emerald-500" />
                  Knowledge Base &amp; FAQ
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Top administrative solutions for transportation operations
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-xl border-border text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx
                return (
                  <div
                    key={idx}
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-sm font-bold text-foreground">
                      <span>{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>

                    {isExpanded && (
                      <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed pt-2.5 border-t border-border/80">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No matching FAQ articles found.
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t border-border bg-muted/20 text-center text-xs text-muted-foreground">
            Can&apos;t find an answer? Submit a ticket above for immediate SLA assistance.
          </div>
        </Card>
      </div>
    </div>
  )
}
