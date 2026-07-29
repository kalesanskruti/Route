import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate session
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    // 2. Fetch Timezone Settings
    const settings = await db.transportSettings.findUnique({
      where: { id: "default" },
    });
    const timezone = settings?.timezone || "Asia/Kolkata";

    // 3. Derive Today's Date String in school timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.format(new Date());
    const [month, day, year] = parts.split("/");
    const todayStr = `${year}-${month}-${day}`;

    // 4. Fetch Metrics
    const [
      totalBuses,
      activeRoutes,
      driversOnDuty,
      totalStudents,
      boardedCount,
      droppedCount,
      activeBusesCount,
      maintenanceBusesCount,
    ] = await Promise.all([
      // Total non-archived buses
      db.bus.count({ where: { isArchived: false } }),
      // Active non-archived routes
      db.route.count({ where: { isArchived: false } }),
      // Drivers currently assigned to a bus
      db.driver.count({ where: { isArchived: false, busId: { not: null } } }),
      // Total non-archived students mapped to a route
      db.student.count({ where: { routeId: { not: null } } }),
      // Attendance boarded today
      db.attendanceRecord.count({
        where: { date: todayStr, status: "BOARDED" },
      }),
      // Attendance dropped today
      db.attendanceRecord.count({
        where: { date: todayStr, status: "DROPPED" },
      }),
      // Active buses
      db.bus.count({ where: { status: "ACTIVE", isArchived: false } }),
      // Maintenance buses
      db.bus.count({ where: { status: "MAINTENANCE", isArchived: false } }),
    ]);

    // 5. Fetch Recent Scans for Feed
    const recentScans = await db.attendanceRecord.findMany({
      take: 5,
      orderBy: { timestamp: "desc" },
      include: {
        student: {
          select: { name: true, classSection: true },
        },
        route: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      metrics: {
        totalBuses,
        activeRoutes,
        driversOnDuty,
        totalStudents,
        attendanceToday: {
          boarded: boardedCount,
          dropped: droppedCount,
        },
        busOverview: {
          active: activeBusesCount,
          maintenance: maintenanceBusesCount,
        },
      },
      recentScans,
      timezone,
      todayDate: todayStr,
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
