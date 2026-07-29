import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER", "DRIVER"]);

    const { id } = await params;

    // Fetch last known location ping sorted by timestamp desc
    const location = await db.busLocation.findFirst({
      where: { busId: id },
      orderBy: { timestamp: "desc" },
    });

    if (!location) {
      return NextResponse.json(
        { error: "No location records found for this bus" },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error: any) {
    console.error("GET /api/buses/[id]/location error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch bus location" }, { status: 500 });
  }
}
