import { db } from "@/lib/db";

export class StudentService {
  static async getAll() {
    return db.student.findMany({
      include: {
        bus: true,
        route: true,
        pickupStop: true,
      },
    });
  }

  static async getById(id: string) {
    return db.student.findUnique({
      where: { id },
      include: {
        bus: true,
        route: true,
        pickupStop: true,
      },
    });
  }

  static async create(data: {
    name: string;
    admissionNumber: string;
    classSection: string;
    parentName: string;
    parentMobileNumber: string;
    busId?: string | null;
    routeId?: string | null;
    pickupStopId?: string | null;
  }) {
    return db.student.create({
      data,
    });
  }

  static async update(
    id: string,
    data: Partial<{
      name: string;
      admissionNumber: string;
      classSection: string;
      parentName: string;
      parentMobileNumber: string;
      busId: string | null;
      routeId: string | null;
      pickupStopId: string | null;
    }>
  ) {
    return db.student.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return db.student.delete({
      where: { id },
    });
  }
}
