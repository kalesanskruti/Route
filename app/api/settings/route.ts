import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { settingsSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    let settings = await db.transportSettings.findUnique({
      where: { id: "default" },
    });

    // Seed defaults if not present
    if (!settings) {
      settings = await db.transportSettings.create({
        data: {
          id: "default",
          schoolName: "Springdale Public School",
          notificationBoardedTemplate: "Dear parent, your child {student} has boarded the bus for the trip.",
          notificationDroppedTemplate: "Dear parent, your child {student} has been safely dropped off.",
          defaultTripStartTime: "07:30",
          defaultTripEndTime: "16:30",
          timezone: "Asia/Kolkata",
          smsEnabled: false,
          whatsappEnabled: false,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET Settings error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN"]);

    const body = await request.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const updatedSettings = await db.transportSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...result.data,
      },
      update: result.data,
    });

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error("POST Settings error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
