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
    employeeId?: string | null;
    email?: string | null;
    phone?: string | null;
    joiningDate?: Date | null;
    licenseNumber: string;
    licenseType?: string | null;
    licenseExpiry: Date;
    contactDetails?: string | null;
    userId?: string | null;
    busId?: string | null;
    institutionId?: string | null;
  }) {
    const { busId, ...driverData } = data;

    return db.$transaction(async (tx) => {
      const driver = await tx.driver.create({
        data: {
          ...driverData,
          isArchived: false,
          busId,
        },
      });

      if (busId) {
        const route = await tx.route.findFirst({ where: { busId, isArchived: false } });
        if (route) {
          await tx.route.update({
            where: { id: route.id },
            data: { driverId: driver.id },
          });
        }
      }

      return driver;
    });
  }

  static async update(
    id: string,
    data: Partial<{
      name: string;
      employeeId?: string | null;
      email?: string | null;
      phone?: string | null;
      joiningDate?: Date | null;
      licenseNumber: string;
      licenseType?: string | null;
      licenseExpiry: Date;
      contactDetails?: string | null;
      userId?: string | null;
      busId?: string | null;
    }>
  ) {
    const { busId, ...sanitizedData } = data as any;

    return db.$transaction(async (tx) => {
      const driver = await tx.driver.update({
        where: { id },
        data: {
          ...sanitizedData,
          ...(busId !== undefined ? { busId } : {}),
        },
      });

      if (busId !== undefined) {
        // Clear this driver from any old routes
        await tx.route.updateMany({
          where: { driverId: id },
          data: { driverId: null },
        });

        if (busId) {
          const newRoute = await tx.route.findFirst({ where: { busId, isArchived: false } });
          if (newRoute) {
            await tx.route.update({
              where: { id: newRoute.id },
              data: { driverId: driver.id },
            });
          }
        }
      }

      return driver;
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
