import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { StudentService } from "@/server/services/StudentService";
import { studentSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    // Query directly to get detailed relation mappings for the UI list view
    const students = await db.student.findMany({
      include: {
        bus: { select: { busNumber: true } },
        route: { select: { name: true, stops: true } },
        pickupStop: { select: { stopName: true } }
      }
    });

    return NextResponse.json(students);
  } catch (error: any) {
    console.error("GET /api/students error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const body = await request.json();
    const result = studentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const student = await StudentService.create(result.data);
    return NextResponse.json(student);
  } catch (error: any) {
    console.error("POST /api/students error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}
