import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { BusService } from "@/server/services/BusService";
import { busSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const buses = await BusService.getAll();
    return NextResponse.json(buses);
  } catch (error: any) {
    console.error("GET /api/buses error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch buses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const body = await request.json();
    const result = busSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const bus = await BusService.create(result.data);
    return NextResponse.json(bus);
  } catch (error: any) {
    console.error("POST /api/buses error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to create bus" }, { status: 500 });
  }
}
