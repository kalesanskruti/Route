import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    const buses = await db.bus.findMany({
      where: {
        institutionId: session.user.institutionId,
        isArchived: false,
      },
      select: {
        id: true,
        busNumber: true,
        registrationNumber: true,
        insuranceExpiry: true,
        fitnessExpiry: true,
      },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const complianceAlerts = buses.flatMap((bus) => {
      const alerts = [];
      
      if (bus.insuranceExpiry) {
        const insExpiry = new Date(bus.insuranceExpiry);
        if (insExpiry < now) {
          alerts.push({ id: `${bus.id}-ins`, bus, type: "Insurance", status: "EXPIRED", expiryDate: insExpiry });
        } else if (insExpiry <= thirtyDaysFromNow) {
          alerts.push({ id: `${bus.id}-ins`, bus, type: "Insurance", status: "EXPIRING", expiryDate: insExpiry });
        }
      }

      if (bus.fitnessExpiry) {
        const fitExpiry = new Date(bus.fitnessExpiry);
        if (fitExpiry < now) {
          alerts.push({ id: `${bus.id}-fit`, bus, type: "Fitness Certificate", status: "EXPIRED", expiryDate: fitExpiry });
        } else if (fitExpiry <= thirtyDaysFromNow) {
          alerts.push({ id: `${bus.id}-fit`, bus, type: "Fitness Certificate", status: "EXPIRING", expiryDate: fitExpiry });
        }
      }

      return alerts;
    });

    // Sort so EXPIRED are first, then nearest EXPIRING
    complianceAlerts.sort((a, b) => {
      if (a.status === "EXPIRED" && b.status !== "EXPIRED") return -1;
      if (b.status === "EXPIRED" && a.status !== "EXPIRED") return 1;
      return a.expiryDate.getTime() - b.expiryDate.getTime();
    });

    return NextResponse.json(complianceAlerts);
  } catch (error: any) {
    console.error("GET /api/compliance error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch compliance alerts" }, { status: 500 });
  }
}
