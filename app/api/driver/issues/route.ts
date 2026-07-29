import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["DRIVER"]);

    const driver = await db.driver.findFirst({
      where: { userId: session!.user.id, isArchived: false }
    });
    if (!driver) {
      return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
    }

    const { issueText } = await request.json();
    if (!issueText || issueText.trim().length === 0) {
      return NextResponse.json({ error: "Issue description cannot be empty" }, { status: 400 });
    }

    // Console-log stub for telemetry notification monitoring
    console.log(`[DRIVER DELAY ALERT] Driver "${driver.name}" (ID: ${driver.id}) reports: "${issueText}"`);

    return NextResponse.json({ success: true, message: "Issue logged successfully" });
  } catch (error: any) {
    console.error("POST /api/driver/issues error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to submit issue" }, { status: 500 });
  }
}
