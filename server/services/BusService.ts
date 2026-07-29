import { db } from "@/lib/db";
import { BusStatus } from "@prisma/client";

export class BusService {
  static async getAll() {
    return db.bus.findMany({
      where: { isArchived: false },
    });
  }

  static async getById(id: string) {
    return db.bus.findFirst({
      where: { id, isArchived: false },
    });
  }

  static async create(data: {
    busNumber: string;
    registrationNumber: string;
    seatingCapacity: number;
    vehicleType: string;
    insuranceNumber: string;
    insuranceExpiry: Date;
    insuranceDocumentUrl?: string | null;
    fitnessExpiry: Date;
    fitnessCertificateUrl?: string | null;
    gpsDeviceId: string;
    status?: BusStatus;
  }) {
    return db.bus.create({
      data: {
        ...data,
        isArchived: false,
      },
    });
  }

  static async update(
    id: string,
    data: Partial<{
      busNumber: string;
      registrationNumber: string;
      seatingCapacity: number;
      vehicleType: string;
      insuranceNumber: string;
      insuranceExpiry: Date;
      insuranceDocumentUrl?: string | null;
      fitnessExpiry: Date;
      fitnessCertificateUrl?: string | null;
      gpsDeviceId: string;
      status: BusStatus;
    }>
  ) {
    return db.bus.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    // 1. Check if assigned on any active (non-archived) Route
    const activeRoute = await db.route.findFirst({
      where: { busId: id, isArchived: false },
    });

    if (activeRoute) {
      throw new Error(`Cannot archive — currently assigned to active Route "${activeRoute.name}". Unassign first.`);
    }

    // 2. Check if active AttendanceRecords exist for this bus
    const recordCount = await db.attendanceRecord.count({
      where: { busId: id },
    });

    if (recordCount > 0) {
      throw new Error("Cannot archive bus because active attendance records reference it.");
    }

    return db.bus.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
