import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const tenantFilter = session.user.institutionId ? { institutionId: session.user.institutionId } : {};

    // Parallel fetch of required records
    const [
      buses,
      routes,
      drivers,
      maintenances,
      attendanceRecords,
    ] = await Promise.all([
      db.bus.findMany({ where: { isArchived: false, ...tenantFilter } }),
      db.route.findMany({ 
        where: { isArchived: false, ...tenantFilter },
        include: { 
          bus: { select: { registrationNumber: true, vehicleType: true } },
          students: { select: { id: true } }
        }
      }),
      db.driver.findMany({ 
        where: { isArchived: false, ...tenantFilter },
        include: { 
          incidents: true,
          bus: { select: { busNumber: true } }
        }
      }),
      db.maintenance.findMany({ 
        where: tenantFilter,
        include: { bus: { select: { busNumber: true } } },
        orderBy: { scheduledDate: 'desc' },
        take: 4
      }),
      db.attendanceRecord.findMany({
        where: {
          student: tenantFilter,
          timestamp: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } // Last 30 days
        },
        include: { route: { select: { name: true } } }
      })
    ]);

    // 1. ATTENDANCE PREVIEW ROWS
    // Group by Date + Route
    const attendanceMap: Record<string, { totalEnrolled: number; boarded: number; dropped: number }> = {};
    attendanceRecords.forEach(record => {
      const routeName = record.route?.name || "Unknown Route";
      const key = `${record.date}|${routeName}`;
      if (!attendanceMap[key]) {
        const routeObj = routes.find(r => r.name === routeName);
        attendanceMap[key] = {
          totalEnrolled: routeObj ? routeObj.students.length : 0,
          boarded: 0,
          dropped: 0
        };
      }
      if (record.status === "BOARDED") attendanceMap[key].boarded++;
      if (record.status === "DROPPED") attendanceMap[key].dropped++;
    });

    const attendanceRows = Object.entries(attendanceMap)
      .slice(0, 4) // Only take 4 preview rows
      .map(([key, data]) => {
        const [dateStr, route] = key.split("|");
        const dateObj = new Date(dateStr);
        const formattedDate = dateObj.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
        const pct = data.totalEnrolled > 0 ? ((data.boarded / data.totalEnrolled) * 100).toFixed(1) + "%" : "0.0%";
        return [formattedDate, route, data.totalEnrolled, data.boarded, data.dropped, pct];
      });

    // Fallback if no attendance records exist
    if (attendanceRows.length === 0) {
      attendanceRows.push(["No Data", "-", 0, 0, 0, "0%"]);
    }

    // 2. ROUTE_UTILIZATION PREVIEW ROWS
    const routeUtilRows = routes.slice(0, 4).map(r => {
      const scheduledMins = parseInt(r.estimatedTime) || 45;
      const actualMins = scheduledMins + Math.floor(Math.random() * 5 - 1); // Mocked actuals for preview
      const sla = actualMins <= scheduledMins + 5 ? "100% On-Time" : "Delayed";
      return [
        r.routeNumber || r.id.substring(0, 8).toUpperCase(),
        r.name,
        r.bus ? `${r.bus.registrationNumber} (${r.bus.vehicleType})` : "Unassigned",
        `${scheduledMins} mins`,
        `${actualMins} mins`,
        sla
      ];
    });
    if (routeUtilRows.length === 0) routeUtilRows.push(["-", "No Routes Found", "-", "-", "-", "-"]);

    // 3. FUEL_ANALYSIS PREVIEW ROWS (Keep Mocked)
    const fuelRows = [
      ["July 2026", "Electric (Tata Starbus EV)", "18,400 km", "4,820 kWh", "₹4.20 / km", "₹42,000"],
      ["July 2026", "Diesel (Ashok Leyland)", "14,200 km", "3,800 Litres", "₹24.80 / km", "₹12,400"],
      ["June 2026", "Electric (Tata Starbus EV)", "19,100 km", "4,980 kWh", "₹4.18 / km", "₹44,500"],
      ["June 2026", "Diesel (Ashok Leyland)", "13,900 km", "3,750 Litres", "₹25.10 / km", "₹11,800"],
    ];

    // 4. DRIVER_AUDIT PREVIEW ROWS
    const driverRows = drivers.slice(0, 4).map(d => {
      const alerts = d.incidents.length;
      const score = Math.max(1, 5.0 - (alerts * 0.2)).toFixed(1);
      return [
        d.employeeId || d.id.substring(0, 8).toUpperCase(),
        d.name,
        d.bus?.busNumber || "Unassigned",
        "12,000 km", // Mocked km since we don't track mileage
        `${alerts} Alert${alerts === 1 ? '' : 's'}`,
        `${score} / 5.0`
      ];
    });
    if (driverRows.length === 0) driverRows.push(["-", "No Drivers Found", "-", "-", "-", "-"]);

    // 5. COMPLIANCE_DOSSIER PREVIEW ROWS
    const complianceRows: any[] = [];
    buses.slice(0, 4).forEach(b => {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      const checkDoc = (docType: string, id: string, expiry: Date | null) => {
        if (!expiry) return [b.busNumber, b.registrationNumber, docType, id, "No Date", "EXPIRED"];
        const expDateStr = new Date(expiry).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
        let status = "VALID";
        if (expiry < now) status = "EXPIRED";
        else if (expiry < thirtyDays) status = "EXPIRING";
        return [b.busNumber, b.registrationNumber, docType, id, expDateStr, status];
      };

      if (b.insuranceExpiry) complianceRows.push(checkDoc("Comprehensive Insurance", b.insuranceNumber || "N/A", b.insuranceExpiry));
      else if (b.fitnessExpiry) complianceRows.push(checkDoc("Fitness Certificate", "N/A", b.fitnessExpiry));
      else if (b.permitExpiry) complianceRows.push(checkDoc("State Route Permit", "N/A", b.permitExpiry));
      else complianceRows.push([b.busNumber, b.registrationNumber, "All Documents", "N/A", "Missing", "EXPIRED"]);
    });
    // Ensure we only return max 4 rows for preview
    const finalComplianceRows = complianceRows.slice(0, 4);
    if (finalComplianceRows.length === 0) finalComplianceRows.push(["-", "-", "No Buses Found", "-", "-", "-"]);

    // 6. MAINTENANCE_COST PREVIEW ROWS
    const maintRows = maintenances.map(m => {
      const dateStr = new Date(m.scheduledDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
      return [
        m.id.substring(0, 11).toUpperCase(),
        m.bus?.busNumber || "Unknown",
        m.type,
        dateStr, // Put date in workshop column since we don't have workshop field
        m.description.substring(0, 30) + (m.description.length > 30 ? "..." : ""),
        m.cost ? `₹${m.cost.toLocaleString()}` : "₹0"
      ];
    });
    if (maintRows.length === 0) maintRows.push(["-", "-", "No Maintenance Records", "-", "-", "-"]);

    const previewRows = {
      ATTENDANCE: attendanceRows,
      ROUTE_UTILIZATION: routeUtilRows,
      FUEL_ANALYSIS: fuelRows,
      DRIVER_AUDIT: driverRows,
      COMPLIANCE_DOSSIER: finalComplianceRows,
      MAINTENANCE_COST: maintRows,
    };

    return NextResponse.json(previewRows);
  } catch (error: any) {
    console.error("Reports API error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
