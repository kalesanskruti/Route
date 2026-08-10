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
      activeRoutes,
      driversOnDuty,
      totalStudents,
      busStatusCounts,
      attendanceCounts,
    ] = await Promise.all([
      // Active non-archived routes
      db.route.count({ where: { isArchived: false } }),
      // Drivers currently assigned to a bus
      db.driver.count({ where: { isArchived: false, busId: { not: null } } }),
      // Total non-archived students mapped to a route
      db.student.count({ where: { routeId: { not: null } } }),
      // Group bus counts by status
      db.bus.groupBy({
        by: ["status"],
        where: { isArchived: false },
        _count: { _all: true },
      }),
      // Group attendance by status for today
      db.attendanceRecord.groupBy({
        by: ["status"],
        where: { date: todayStr },
        _count: { _all: true },
      }),
    ]);

    const activeBusesCount = busStatusCounts.find(b => b.status === "ACTIVE")?._count._all || 0;
    const maintenanceBusesCount = busStatusCounts.find(b => b.status === "MAINTENANCE")?._count._all || 0;
    const totalBuses = busStatusCounts.reduce((acc, curr) => acc + curr._count._all, 0);

    const boardedCount = attendanceCounts.find(a => a.status === "BOARDED")?._count._all || 0;
    const droppedCount = attendanceCounts.find(a => a.status === "DROPPED")?._count._all || 0;

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
