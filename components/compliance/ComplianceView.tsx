"use client"

import React, { useState, useMemo } from "react"
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Bus,
  Eye,
  Check,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export interface ComplianceDocument {
  id: string
  busNumber: string
  registrationNumber: string
  docType: "INSURANCE" | "PERMIT" | "FITNESS" | "PUC" | "ROAD_TAX"
  docNumber: string
  issuingAuthority: string
  issueDate: string
  expiryDate: string
  daysRemaining: number
  status: "VALID" | "EXPIRING" | "EXPIRED"
}

export function ComplianceView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const initialDocs: ComplianceDocument[] = [
    {
      id: "doc-1",
      busNumber: "BUS-105",
      registrationNumber: "KA-01-EQ-4433",
      docType: "PERMIT",
      docNumber: "STA/KA/2021/4092",
      issuingAuthority: "State Transport Authority",
      issueDate: "05 Aug 2021",
      expiryDate: "04 Aug 2026",
      daysRemaining: 3,
      status: "EXPIRED",
    },
    {
      id: "doc-2",
      busNumber: "BUS-103",
      registrationNumber: "KA-01-EQ-4425",
      docType: "INSURANCE",
      docNumber: "POL-ICICI-2025-8812",
      issuingAuthority: "ICICI Lombard General Insurance",
      issueDate: "14 Aug 2025",
      expiryDate: "13 Aug 2026",
      daysRemaining: 12,
      status: "EXPIRING",
    },
    {
      id: "doc-3",
      busNumber: "BUS-107",
      registrationNumber: "KA-01-EQ-4448",
      docType: "FITNESS",
      docNumber: "FIT/KA/2025/1109",
      issuingAuthority: "RTO Central Depot #4",
      issueDate: "20 Aug 2025",
      expiryDate: "19 Aug 2026",
      daysRemaining: 18,
      status: "EXPIRING",
    },
    {
      id: "doc-4",
      busNumber: "BUS-101",
      registrationNumber: "KA-01-EQ-4421",
      docType: "INSURANCE",
      docNumber: "POL-ICICI-2026-9912",
      issuingAuthority: "ICICI Lombard General Insurance",
      issueDate: "15 Jan 2026",
      expiryDate: "14 Jan 2027",
      daysRemaining: 166,
      status: "VALID",
    },
    {
      id: "doc-5",
      busNumber: "BUS-101",
      registrationNumber: "KA-01-EQ-4421",
      docType: "PERMIT",
      docNumber: "STA/KA/01/2023/8812",
      issuingAuthority: "State Transport Authority",
      issueDate: "01 Feb 2024",
      expiryDate: "31 Jan 2029",
      daysRemaining: 914,
      status: "VALID",
    },
    {
      id: "doc-6",
      busNumber: "BUS-102",
      registrationNumber: "KA-01-EQ-4422",
      docType: "FITNESS",
      docNumber: "FIT/KA/2026/0091",
      issuingAuthority: "RTO Central Depot #4",
      issueDate: "10 Mar 2026",
      expiryDate: "09 Mar 2027",
      daysRemaining: 220,
      status: "VALID",
    },
    {
      id: "doc-7",
      busNumber: "BUS-104",
      registrationNumber: "KA-01-EQ-4430",
      docType: "ROAD_TAX",
      docNumber: "TAX/KA/2026/9944",
      issuingAuthority: "Commercial Transport Department",
      issueDate: "01 Apr 2026",
      expiryDate: "31 Mar 2027",
      daysRemaining: 242,
      status: "VALID",
    },
    {
      id: "doc-8",
      busNumber: "BUS-106",
      registrationNumber: "KA-01-EQ-4440",
      docType: "PUC",
      docNumber: "PUC/EV/EXEMPT-2026",
      issuingAuthority: "Zero Emission EV Certification",
      issueDate: "01 Jan 2026",
      expiryDate: "31 Dec 2030",
      daysRemaining: 1613,
      status: "VALID",
    },
  ]

  const [documents] = useState<ComplianceDocument[]>(initialDocs)

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedTypeFilter === "ALL" || doc.docType === selectedTypeFilter
      const matchesStatus = selectedStatusFilter === "ALL" || doc.status === selectedStatusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [documents, searchQuery, selectedTypeFilter, selectedStatusFilter])

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Statutory Fleet Compliance Hub
            </h1>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
              3 Action Needed
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Commercial permit renewals, insurance policies, roadworthiness fitness certificates, and PUC checks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.success("Exported statutory compliance audit report as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit Report</span>
          </Button>

          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload Document Renewal
          </Button>
        </div>
      </div>

      {/* 4 Compliance Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Documents</span>
            <div className="text-2xl font-extrabold text-foreground mt-1">710</div>
            <span className="text-xs text-muted-foreground">142 buses × 5 statutory docs</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileText className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valid &amp; Current</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">692</div>
            <span className="text-xs text-muted-foreground">97.5% compliance rate</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiring (&lt;30d)</span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">15</div>
            <span className="text-xs text-muted-foreground">Renewals in progress</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm p-4 flex flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expired / Urgent</span>
            <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">3</div>
            <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Immediate action required</span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by bus number, doc number, or authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 rounded-xl border-border text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Document:</span>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Document Types</option>
                <option value="INSURANCE">Insurance Policy</option>
                <option value="PERMIT">State Permit</option>
                <option value="FITNESS">Fitness Certificate</option>
                <option value="PUC">Pollution (PUC)</option>
                <option value="ROAD_TAX">Road Tax</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
              >
                <option value="ALL">All Status</option>
                <option value="VALID">Valid</option>
                <option value="EXPIRING">Expiring Soon</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Compliance Data Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-3.5 px-4">Bus &amp; Registration</th>
                <th className="py-3.5 px-4">Document Type</th>
                <th className="py-3.5 px-4">Document Number &amp; Authority</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4 text-center">Days Remaining</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-mono font-bold text-foreground">{doc.busNumber}</div>
                    <div className="text-xs font-mono text-muted-foreground">{doc.registrationNumber}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-foreground px-2 py-0.5 rounded bg-muted/60 text-xs">
                      {doc.docType}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-mono font-bold text-foreground">{doc.docNumber}</div>
                    <div className="text-xs text-muted-foreground">{doc.issuingAuthority}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono">{doc.issueDate}</td>
                  <td className="py-4 px-4 text-xs font-mono font-bold text-foreground">{doc.expiryDate}</td>
                  <td className="py-4 px-4 text-center font-mono">
                    <span
                      className={`font-bold ${
                        doc.status === "EXPIRED"
                          ? "text-red-600 dark:text-red-400"
                          : doc.status === "EXPIRING"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {doc.daysRemaining} days
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        doc.status === "VALID"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : doc.status === "EXPIRING"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {doc.status === "VALID" && <CheckCircle2 className="h-3 w-3" />}
                      {doc.status === "EXPIRING" && <AlertTriangle className="h-3 w-3" />}
                      {doc.status === "EXPIRED" && <ShieldAlert className="h-3 w-3" />}
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {doc.status !== "VALID" && (
                        <Button
                          onClick={() => setIsUploadModalOpen(true)}
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Renew
                        </Button>
                      )}
                      <Button
                        onClick={() => toast.success(`Downloaded official copy of ${doc.docNumber}`)}
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-xs font-semibold"
                      >
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Document Renewal Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Statutory Document Renewal
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Attach renewed commercial certificate (PDF or scanned image)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Select Fleet Bus</label>
              <Input defaultValue="BUS-105 (KA-01-EQ-4433)" className="rounded-xl border-border h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Document Type</label>
                <select className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm">
                  <option>State Permit</option>
                  <option>Insurance Policy</option>
                  <option>Fitness Certificate</option>
                  <option>PUC Emission</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">New Expiry Date</label>
                <Input type="date" defaultValue="2027-08-04" className="rounded-xl border-border h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Certificate Number</label>
              <Input placeholder="e.g. STA/KA/2026/8841" className="rounded-xl border-border h-9 text-sm" />
            </div>
            <div className="p-6 rounded-2xl border-2 border-dashed border-border text-center hover:bg-muted/40 cursor-pointer transition-colors">
              <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-foreground block">Click to Upload or Drag &amp; Drop PDF</span>
              <span className="text-[11px] text-muted-foreground">Supports PDF, PNG, JPG (Max 10MB)</span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsUploadModalOpen(false)
                toast.success("Document renewal uploaded and verified successfully!")
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              Confirm Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
