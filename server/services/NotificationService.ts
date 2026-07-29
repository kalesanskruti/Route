import { db } from "@/lib/db";
import { NotificationType } from "@prisma/client";

export class NotificationService {
  static async sendNotification(studentId: string, type: NotificationType) {
    // 1. Fetch template settings
    const settings = await db.transportSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      throw new Error("Global settings not found. Cannot dispatch notification.");
    }

    // 2. Fetch student details
    const student = await db.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }

    // 3. Resolve the template message
    const template =
      type === "BOARDED"
        ? settings.notificationBoardedTemplate
        : settings.notificationDroppedTemplate;

    const message = template.replace("{student}", student.name);

    // 4. Output mock transmission details to console log
    console.log(`\n--- [NOTIFICATION TRANSMISSION STUB] ---`);
    console.log(`Recipient (Phone): ${student.parentMobileNumber}`);
    console.log(`Template Type    : ${type}`);
    console.log(`Message Body     : "${message}"`);
    console.log(`Status           : SENT (MOCK SUCCESS)`);
    console.log(`----------------------------------------\n`);

    // 5. Create database log entry
    return db.notificationLog.create({
      data: {
        studentId,
        message,
        status: "SENT",
        sentTo: student.parentMobileNumber,
        type,
      },
    });
  }

  static async getLogs(filters?: { studentId?: string; type?: NotificationType }) {
    return db.notificationLog.findMany({
      where: filters,
      orderBy: {
        timestamp: "desc",
      },
    });
  }
}
