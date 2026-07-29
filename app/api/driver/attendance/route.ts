import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { AttendanceService } from "@/server/services/AttendanceService";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["DRIVER"]);

    // Find linked driver
    const driver = await db.driver.findFirst({
      where: { userId: session!.user.id, isArchived: false }
    });
    if (!driver) {
      return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
    }

    // Find driver's active route
    const activeRoute = await db.route.findFirst({
      where: { driverId: driver.id, isArchived: false }
    });
    if (!activeRoute) {
      return NextResponse.json({ error: "Driver is not assigned to any active route" }, { status: 403 });
    }

    const { studentId, status } = await request.json();
    if (!studentId || !status || !["BOARDED", "DROPPED"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload parameters" }, { status: 400 });
    }

    // Verify student belongs to this route
    const student = await db.student.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    if (student.routeId !== activeRoute.id) {
      return NextResponse.json(
        { error: "Access Denied: Student is not assigned to your route" },
        { status: 403 }
      );
    }

    // Invoke Attendance Service to write and trigger notifications
    const attendance = await AttendanceService.markAttendance({
      studentId,
      status: status as any,
      type: status === "BOARDED" ? "PICKUP" : "DROP",
      markedByUserId: session!.user.id,
      busId: activeRoute.busId || student.busId || "default-bus",
      routeId: activeRoute.id
    });

    return NextResponse.json(attendance);
  } catch (error: any) {
    console.error("POST /api/driver/attendance error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to log attendance" }, { status: 500 });
  }
}
