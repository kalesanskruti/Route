"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  ArrowUpDown,
  Download,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export interface ComplianceAlert {
  id: string
  bus: {
    id: string
    busNumber: string
    registrationNumber: string
  }
  type: "Insurance" | "Fitness Certificate"
  status: "EXPIRING" | "EXPIRED"
  expiryDate: string
}

export function ComplianceManagement() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [sortField, setSortField] = useState<keyof ComplianceAlert>("expiryDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Fetch Compliance Alerts
  const { data: alerts = [], isLoading } = useQuery<ComplianceAlert[]>({
    queryKey: ["compliance"],
    queryFn: async () => {
      const response = await fetch("/api/compliance")
      if (!response.ok) throw new Error("Failed to fetch compliance alerts")
      return response.json()
    },
  })

  // Filter & Sort computation
  const filteredAndSortedAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        const matchesSearch =
          alert.bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.bus.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.type.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus =
          selectedStatusFilter === "ALL" || alert.status === selectedStatusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let valA: any = a[sortField]
        let valB: any = b[sortField]
        
        if (sortField === "bus") {
          valA = a.bus.busNumber
          valB = b.bus.busNumber
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1
        if (valA > valB) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [alerts, searchQuery, selectedStatusFilter, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedAlerts.length / itemsPerPage) || 1
  const paginatedAlerts = filteredAndSortedAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: keyof ComplianceAlert | "bus") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field as keyof ComplianceAlert)
      setSortOrder("asc")
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Statutory Compliance & Alerts
            </h1>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `${alerts.length} Action Required`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track urgent statutory renewals, insurance, and fitness certificates across the fleet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.success("Exported compliance audit records as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit Logs</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Bus Number or Document Type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 h-9 rounded-xl border-border text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
            >
              <option value="ALL">All Alerts</option>
              <option value="EXPIRING">Expiring &lt;30 days</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Enterprise Data Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort("bus")}
                  className="py-3.5 px-6 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Vehicle</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("type")}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Document Type</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("expiryDate")}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>Expiry Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Scanning fleet records for compliance...
                  </td>
                </tr>
              ) : paginatedAlerts.length > 0 ? (
                paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span className="font-mono">{alert.bus.busNumber}</span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-0.5">
                        {alert.bus.registrationNumber}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                        {alert.type}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">
                        {new Date(alert.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          alert.status === "EXPIRED"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {alert.status === "EXPIRED" ? (
                          <ShieldAlert className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Renewal request sent for ${alert.bus.busNumber}`)}
                        className="h-8 rounded-xl text-xs font-semibold border-border hover:bg-muted text-blue-600 dark:text-blue-400"
                      >
                        Upload Renewal
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    No compliance alerts found. All documents are valid.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <div className="text-xs font-medium text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {filteredAndSortedAlerts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedAlerts.length)}
            </span>{" "}
            of <span className="font-bold text-foreground">{filteredAndSortedAlerts.length}</span>{" "}
            alerts
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
