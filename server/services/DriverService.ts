import { db } from "@/lib/db";

export class DriverService {
  static async getAll() {
    return db.driver.findMany({
      where: { isArchived: false },
    });
  }

  static async getById(id: string) {
    return db.driver.findFirst({
      where: { id, isArchived: false },
    });
  }

  static async create(data: {
    name: string;
    licenseNumber: string;
    licenseExpiry: Date;
    contactDetails: string;
    userId?: string | null;
  }) {
    return db.driver.create({
      data: {
        ...data,
        isArchived: false,
        busId: null, // System-assigned via RouteService only
      },
    });
  }

  static async update(
    id: string,
    data: Partial<{
      name: string;
      licenseNumber: string;
      licenseExpiry: Date;
      contactDetails: string;
      userId?: string | null;
    }>
  ) {
    // Remove busId from inputs if present to avoid direct updates
    const { busId, ...sanitizedData } = data as any;

    return db.driver.update({
      where: { id },
      data: sanitizedData,
    });
  }

  static async delete(id: string) {
    // 1. Check if assigned on any active (non-archived) Route
    const activeRoute = await db.route.findFirst({
      where: { driverId: id, isArchived: false },
    });

    if (activeRoute) {
      throw new Error(`Cannot archive — currently assigned to active Route "${activeRoute.name}". Unassign first.`);
    }

    // 2. Fetch current driver
    const driver = await db.driver.findUnique({
      where: { id },
    });

    if (driver?.busId) {
      // Clean driver's bus cache on deletion
      await db.driver.update({
        where: { id },
        data: { busId: null },
      });
    }

    return db.driver.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
