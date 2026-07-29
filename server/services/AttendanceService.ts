import { db } from "@/lib/db";
import { AttendanceStatus, AttendanceType } from "@prisma/client";
import { NotificationService } from "./NotificationService";

export class AttendanceService {
  static async getRecords(filters?: {
    studentId?: string;
    routeId?: string;
    busId?: string;
    date?: string;
  }) {
    return db.attendanceRecord.findMany({
      where: filters,
      include: {
        student: true,
        route: true,
        bus: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });
  }

  static async markAttendance(data: {
    studentId: string;
    busId: string;
    routeId: string;
    status: AttendanceStatus;
    type: AttendanceType;
    markedByUserId: string;
    gpsLatitude?: number | null;
    gpsLongitude?: number | null;
    scanCode?: string | null;
  }) {
    // 1. Fetch system timezone from global settings
    const settings = await db.transportSettings.findUnique({
      where: { id: "default" },
    });
    const timezone = settings?.timezone || "Asia/Kolkata";

    // 2. Derive date string (YYYY-MM-DD) based on settings timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.format(new Date()); // Returns MM/DD/YYYY
    const [month, day, year] = parts.split("/");
    const dateStr = `${year}-${month}-${day}`;

    // 3. Write attendance record directly and catch unique constraint checks (race-condition safe)
    try {
      const record = await db.attendanceRecord.create({
        data: {
          ...data,
          date: dateStr,
          timestamp: new Date(),
        },
      });

      // 4. Fire parent notification dispatch alert (runs asynchronously)
      const notificationType = data.type === "PICKUP" ? "BOARDED" : "DROPPED";
      NotificationService.sendNotification(data.studentId, notificationType).catch((err) => {
        console.error(`[Notification Callback Error] Failed to send student alert:`, err.message);
      });

      return record;
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error(
          `Attendance already marked for this student (${data.studentId}) for ${data.type} on date ${dateStr}.`
        );
      }
      throw error;
    }
  }
}
