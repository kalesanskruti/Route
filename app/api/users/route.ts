import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const users = await db.user.findMany({
      where: { 
        role: "DRIVER",
        driver: null
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
