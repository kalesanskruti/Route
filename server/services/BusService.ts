import { db } from "@/lib/db";
import { BusStatus } from "@prisma/client";

export class BusService {
  static async getAll(institutionId?: string | null) {
    const where: any = { isArchived: false };
    if (institutionId) {
      where.institutionId = institutionId;
    }
    return db.bus.findMany({
      where,
      include: {
        drivers: true,
        routes: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string, institutionId?: string | null) {
    const where: any = { id, isArchived: false };
    if (institutionId) {
      where.institutionId = institutionId;
    }
    return db.bus.findFirst({
      where,
      include: {
        drivers: true,
        routes: true,
      }
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
    gpsProvider?: string | null;
    status?: BusStatus;
    institutionId?: string | null;
    routeId?: string | null;
  }) {
    const { routeId, ...busData } = data;

    if (routeId) {
      const route = await db.route.findFirst({ where: { id: routeId } });
      if (route?.busId) {
        throw new Error(`Route "${route.name}" already has an assigned bus (ID: ${route.busId}).`);
      }
    }

    return db.$transaction(async (tx) => {
      const bus = await tx.bus.create({
        data: {
          ...busData,
          isArchived: false,
        },
      });

      if (routeId) {
        await tx.route.update({
          where: { id: routeId },
          data: { busId: bus.id },
        });
      }

      return bus;
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
