import { db } from "@/lib/db";
import { StopType } from "@prisma/client";

export class RouteService {
  static async getAll() {
    return db.route.findMany({
      where: { isArchived: false },
      include: {
        stops: true,
        bus: true,
        driver: true,
      },
    });
  }

  static async getById(id: string) {
    return db.route.findFirst({
      where: { id, isArchived: false },
      include: {
        stops: true,
        bus: true,
        driver: true,
      },
    });
  }

  static async create(data: {
    name: string;
    source: string;
    destination: string;
    estimatedTime: string;
    busId?: string | null;
    driverId?: string | null;
    stops?: {
      stopName: string;
      stopOrder: number;
      latitude: number;
      longitude: number;
      type?: StopType;
    }[];
  }) {
    const { stops, ...routeData } = data;

    // 1. Enforce double-assignment constraints
    await this.checkDoubleAssignment(routeData.busId, routeData.driverId);

    // 2. Create route and its stops in a transaction
    const route = await db.route.create({
      data: {
        ...routeData,
        isArchived: false,
        stops: stops
          ? {
              create: stops.map((s) => ({
                stopName: s.stopName,
                stopOrder: s.stopOrder,
                latitude: s.latitude,
                longitude: s.longitude,
                type: s.type || StopType.BOTH,
              })),
            }
          : undefined,
      },
    });

    // 3. Sync driver bus cache
    await this.syncDriverBusCaches(null, route);

    return route;
  }

  static async update(
    id: string,
    data: Partial<{
      name: string;
      source: string;
      destination: string;
      estimatedTime: string;
      busId: string | null;
      driverId: string | null;
      stops: {
        stopName: string;
        stopOrder: number;
        latitude: number;
        longitude: number;
        type?: StopType;
      }[];
    }>
  ) {
    const oldRoute = await db.route.findUnique({
      where: { id },
    });

    if (!oldRoute) {
      throw new Error(`Route with ID ${id} not found.`);
    }

    const { stops, ...routeData } = data;

    // 1. Check double assignment rules if bus or driver changes
    const busIdToCheck = routeData.busId !== undefined ? routeData.busId : oldRoute.busId;
    const driverIdToCheck = routeData.driverId !== undefined ? routeData.driverId : oldRoute.driverId;
    await this.checkDoubleAssignment(busIdToCheck, driverIdToCheck, id);

    // 2. Execute update
    // If stops are supplied, we replace them (standard route management flow)
    const updatedRoute = await db.$transaction(async (tx) => {
      if (stops !== undefined) {
        // Drop existing stops
        await tx.routeStop.deleteMany({
          where: { routeId: id },
        });

        // Insert new ones
        if (stops.length > 0) {
          await tx.routeStop.createMany({
            data: stops.map((s) => ({
              routeId: id,
              stopName: s.stopName,
              stopOrder: s.stopOrder,
              latitude: s.latitude,
              longitude: s.longitude,
              type: s.type || StopType.BOTH,
            })),
          });
        }
      }

      return tx.route.update({
        where: { id },
        data: routeData,
      });
    });

    // 3. Sync driver bus caches
    await this.syncDriverBusCaches(oldRoute, updatedRoute);

    return updatedRoute;
  }

  static async delete(id: string) {
    const oldRoute = await db.route.findUnique({
      where: { id },
    });

    if (!oldRoute) {
      throw new Error(`Route with ID ${id} not found.`);
    }

    // 1. Soft delete the route
    const archivedRoute = await db.route.update({
      where: { id },
      data: { isArchived: true },
    });

    // 2. Sync caches (clears driver's bus cache)
    await this.syncDriverBusCaches(oldRoute, archivedRoute);

    return archivedRoute;
  }

  // --- Helper Methods ---

  private static async checkDoubleAssignment(
    busId?: string | null,
    driverId?: string | null,
    excludeRouteId?: string
  ) {
    if (busId) {
      const activeBusRoute = await db.route.findFirst({
        where: {
          busId,
          isArchived: false,
          id: excludeRouteId ? { not: excludeRouteId } : undefined,
        },
      });
      if (activeBusRoute) {
        throw new Error(
          `Bus (ID: ${busId}) is already assigned to active route: "${activeBusRoute.name}"`
        );
      }
    }

    if (driverId) {
      const activeDriverRoute = await db.route.findFirst({
        where: {
          driverId,
          isArchived: false,
          id: excludeRouteId ? { not: excludeRouteId } : undefined,
        },
      });
      if (activeDriverRoute) {
        throw new Error(
          `Driver (ID: ${driverId}) is already assigned to active route: "${activeDriverRoute.name}"`
        );
      }
    }
  }

  private static async syncDriverBusCaches(oldRoute: any, newRoute: any) {
    // Case 1: Route is deleted or archived
    if (newRoute === null || newRoute.isArchived) {
      if (oldRoute?.driverId) {
        await db.driver.updateMany({
          where: { id: oldRoute.driverId },
          data: { busId: null },
        });
      }
      return;
    }

    // Case 2: Route is created or updated
    const oldDriverId = oldRoute?.driverId || null;
    const newDriverId = newRoute.driverId || null;
    const oldBusId = oldRoute?.busId || null;
    const newBusId = newRoute.busId || null;

    if (oldDriverId !== newDriverId) {
      // Clear old driver's cache
      if (oldDriverId) {
        await db.driver.updateMany({
          where: { id: oldDriverId },
          data: { busId: null },
        });
      }
      // Populate new driver's cache
      if (newDriverId) {
        await db.driver.updateMany({
          where: { id: newDriverId },
          data: { busId: newBusId },
        });
      }
    } else if (oldBusId !== newBusId && newDriverId) {
      // Driver stayed the same, but bus was updated
      await db.driver.updateMany({
        where: { id: newDriverId },
        data: { busId: newBusId },
      });
    }
  }
}
