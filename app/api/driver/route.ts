import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["DRIVER"]);

    // Find driver profile linked to current authenticated user
    const driver = await db.driver.findFirst({
      where: { userId: session!.user.id, isArchived: false }
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Linked driver profile not found for this user account" },
        { status: 404 }
      );
    }

    // Find active route assigned to this driver
    const route = await db.route.findFirst({
      where: { driverId: driver.id, isArchived: false },
      include: {
        bus: {
          select: { id: true, busNumber: true }
        },
        stops: {
          orderBy: { stopOrder: "asc" }
        },
        students: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            classSection: true,
            pickupStopId: true,
            pickupStop: {
              select: { stopName: true }
            }
          }
        }
      }
    });

    // Get today's attendance logs to pre-populate scan checks
    // Determine local school timezone
    const settings = await db.transportSettings.findUnique({
      where: { id: "default" }
    });
    const timezone = settings?.timezone || "Asia/Kolkata";
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.format(new Date());
    const [month, day, year] = parts.split("/");
    const todayStr = `${year}-${month}-${day}`;

    let attendanceRecords: Array<{ studentId: string; status: "BOARDED" | "DROPPED" }> = [];
    if (route) {
      attendanceRecords = await db.attendanceRecord.findMany({
        where: {
          routeId: route.id,
          date: todayStr
        },
        select: {
          studentId: true,
          status: true
        }
      });
    }

    return NextResponse.json({
      driver,
      route: route || null,
      todayDate: todayStr,
      attendanceRecords
    });
  } catch (error: any) {
    console.error("GET /api/driver error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch driver logistics" }, { status: 500 });
  }
}
