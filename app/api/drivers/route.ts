import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { DriverService } from "@/server/services/DriverService";
import { driverSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    // Include routes and linked user roles
    const drivers = await db.driver.findMany({
      where: { isArchived: false },
      include: {
        routes: {
          where: { isArchived: false },
          include: {
            bus: {
              select: { busNumber: true }
            }
          }
        },
        user: {
          select: { email: true }
        }
      },
    });

    return NextResponse.json(drivers);
  } catch (error: any) {
    console.error("GET /api/drivers error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const body = await request.json();
    const result = driverSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const driver = await DriverService.create(result.data);
    return NextResponse.json(driver);
  } catch (error: any) {
    console.error("POST /api/drivers error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to create driver" }, { status: 500 });
  }
}
