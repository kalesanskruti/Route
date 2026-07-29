import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { BusService } from "@/server/services/BusService";
import { busSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const { id } = await params;
    const body = await request.json();
    const result = busSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const bus = await BusService.update(id, result.data);
    return NextResponse.json(bus);
  } catch (error: any) {
    console.error("PUT /api/buses/[id] error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to update bus" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const { id } = await params;
    const bus = await BusService.delete(id);
    return NextResponse.json(bus);
  } catch (error: any) {
    console.error("DELETE /api/buses/[id] error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || "Failed to delete bus" }, { status: 500 });
  }
}
