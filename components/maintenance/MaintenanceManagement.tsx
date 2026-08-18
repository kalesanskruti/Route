"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Search,
  ArrowUpDown,
  Plus,
  Download,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  IndianRupee
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export interface MaintenanceRecord {
  id: string
  busId: string
  bus: {
    busNumber: string
    registrationNumber: string
  }
  type: string
  description: string
  scheduledDate: string
  cost: number | null
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
}

export function MaintenanceManagement() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [sortField, setSortField] = useState<keyof MaintenanceRecord>("scheduledDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const itemsPerPage = 8

  // New record form state
  const [formData, setFormData] = useState({
    busId: "",
    type: "Routine Service",
    description: "",
    scheduledDate: "",
    cost: "",
  })

  // 1. Fetch Maintenance Records
  const { data: records = [], isLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance")
      if (!response.ok) throw new Error("Failed to fetch maintenance records")
      return response.json()
    },
  })

  // 2. Fetch Buses (for the dropdown in Add Modal)
  const { data: buses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: async () => {
      const response = await fetch("/api/buses")
      if (!response.ok) throw new Error("Failed to fetch buses")
      return response.json()
    },
  })

  // 3. Create Maintenance Mutation
  const createMutation = useMutation({
    mutationFn: async (newRecord: any) => {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to schedule maintenance")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] })
      setIsAddModalOpen(false)
      toast.success("Maintenance scheduled successfully!")
      setFormData({ busId: "", type: "Routine Service", description: "", scheduledDate: "", cost: "" })
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  // Filter & Sort computation
  const filteredAndSortedRecords = useMemo(() => {
    return records
      .filter((record) => {
        const matchesSearch =
          record.bus?.busNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus =
          selectedStatusFilter === "ALL" || record.status === selectedStatusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let valA: any = a[sortField]
        let valB: any = b[sortField]
        
        if (sortField === "busId") {
          valA = a.bus?.busNumber
          valB = b.bus?.busNumber
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1
        if (valA > valB) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [records, searchQuery, selectedStatusFilter, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage) || 1
  const paginatedRecords = filteredAndSortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: keyof MaintenanceRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(paginatedRecords.map((r) => r.id))
    } else {
      setSelectedRecordIds([])
    }
  }

  const toggleSelectRecord = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!formData.busId || !formData.scheduledDate || !formData.type || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }
    
    createMutation.mutate({
      ...formData,
      cost: formData.cost ? Number(formData.cost) : undefined,
    })
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Fleet Maintenance Hub
            </h1>
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `${records.length} Records`}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track vehicle servicing, repair workflows, and maintenance costs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => toast.success("Exported maintenance logs as XLSX")}
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Logs</span>
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm shadow-orange-600/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Schedule Service
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Bus, Type, or Description..."
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
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
                <th className="py-3.5 px-4 w-12 text-center">
                  <Checkbox
                    checked={
                      paginatedRecords.length > 0 &&
                      paginatedRecords.every((r) => selectedRecordIds.includes(r.id))
                    }
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  />
                </th>
                <th
                  onClick={() => handleSort("busId")}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
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
                    <span>Service Type</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Description</th>
                <th
                  onClick={() => handleSort("scheduledDate")}
                  className="py-3.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>Scheduled Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
                    Loading maintenance logs...
                  </td>
                </tr>
              ) : paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => {
                  const isSelected = selectedRecordIds.includes(record.id)
                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-orange-600/5" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRecord(record.id)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <span className="font-mono">{record.bus?.busNumber}</span>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">
                          {record.bus?.registrationNumber}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5 text-orange-500" />
                          {record.type}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {record.description}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">
                          {new Date(record.scheduledDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            record.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : record.status === "IN_PROGRESS"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : record.status === "SCHEDULED"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          {record.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
                          {record.status === "SCHEDULED" && <AlertTriangle className="h-3 w-3" />}
                          {record.status === "IN_PROGRESS" && <RefreshCw className="h-3 w-3 animate-spin" />}
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {record.cost !== null ? (
                          <div className="font-mono font-bold text-foreground flex items-center justify-end">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {record.cost.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Pending</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    No maintenance records found.
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
              {filteredAndSortedRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedRecords.length)}
            </span>{" "}
            of <span className="font-bold text-foreground">{filteredAndSortedRecords.length}</span>{" "}
            records
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

      {/* Add New Maintenance Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Schedule Maintenance
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a new service record or repair task for a fleet vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Select Vehicle *
              </label>
              <select
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="" disabled>Select a bus...</option>
                {buses.map((bus: any) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.busNumber} ({bus.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Service Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="Routine Service">Routine Service</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Parts Replacement">Parts Replacement</option>
                  <option value="Emergency Breakdown">Emergency Breakdown</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Scheduled Date *
                </label>
                <Input 
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="rounded-xl border-border h-9 text-sm" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Description *
              </label>
              <Input 
                placeholder="e.g. 10,000km full engine service & oil change" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl border-border h-9 text-sm" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Estimated Cost (₹)
              </label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="rounded-xl border-border h-9 text-sm" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl text-xs font-semibold h-9"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold h-9 px-5"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Schedule Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
