import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { z } from "zod";

const maintenanceSchema = z.object({
  busId: z.string().min(1, "Bus is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  scheduledDate: z.preprocess((val) => (val ? new Date(val as string) : undefined), z.date()),
  cost: z.coerce.number().optional().nullable(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const records = await db.maintenance.findMany({
      where: {
        institutionId: session.user.institutionId,
      },
      include: {
        bus: true,
      },
      orderBy: { scheduledDate: "asc" },
    });
    return NextResponse.json(records);
  } catch (error: any) {
    console.error("GET /api/maintenance error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch maintenance records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const body = await request.json();
    const result = maintenanceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const record = await db.maintenance.create({
      data: {
        ...result.data,
        institutionId: session.user.institutionId,
      },
      include: {
        bus: true,
      }
    });
    return NextResponse.json(record);
  } catch (error: any) {
    console.error("POST /api/maintenance error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to schedule maintenance" }, { status: 500 });
  }
}
