import fs from "fs";
import path from "path";
import { io } from "socket.io-client";

// Load .env manually for standalone script database connectivity
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.trim().match(/^DATABASE_URL\s*=\s*(.+)$/);
    if (match) {
      process.env.DATABASE_URL = match[1].replace(/^["']|["']$/g, "");
    }
  }
}

// Coordinate interpolation helper
function interpolatePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  steps: number
) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = lat1 + (lat2 - lat1) * fraction;
    const lon = lon1 + (lon2 - lon1) * fraction;
    points.push({ latitude: lat, longitude: lon });
  }
  return points;
}

async function runSimulator() {
  console.log("=== STARTING GPS TELEMETRY SIMULATOR ===");

  // Dynamically import database to prevent premature client instantiation
  const { db } = await import("../lib/db");

  // Connect to the standalone Socket.io server
  const socket = io("http://localhost:3001");

  socket.on("connect", () => {
    console.log("[GPS SIMULATOR] Connected to Socket server at port 3001");
  });

  socket.on("connect_error", (err) => {
    console.error("[GPS SIMULATOR] Connection error:", err.message);
  });

  // Query all active routes and their sequenced stops
  const routes = await db.route.findMany({
    where: { isArchived: false },
    include: {
      stops: {
        orderBy: { stopOrder: "asc" },
      },
    },
  });

  const activeRoutes = routes.filter(
    (r) => r.busId && r.stops && r.stops.length >= 2
  );

  if (activeRoutes.length === 0) {
    console.warn(
      "[GPS SIMULATOR] No active routes found with at least 2 stops. Create some first."
    );
    db.$disconnect();
    return;
  }

  console.log(
    `[GPS SIMULATOR] Found ${activeRoutes.length} route(s) for simulation.`
  );

  // Build coordinate paths for each route
  const routesPaths: Array<{
    busId: string;
    routeName: string;
    points: Array<{ latitude: number; longitude: number }>;
    currentIndex: number;
  }> = [];

  for (const route of activeRoutes) {
    const points: Array<{ latitude: number; longitude: number }> = [];
    const stops = route.stops;

    // Interpolate path segments between sequential stops
    for (let i = 0; i < stops.length - 1; i++) {
      const stopA = stops[i];
      const stopB = stops[i + 1];
      const segment = interpolatePoints(
        stopA.latitude,
        stopA.longitude,
        stopB.latitude,
        stopB.longitude,
        8 // 8 steps between each stop
      );
      points.push(...segment);
    }

    // Add path segment returning back to source for loop simplicity
    const returnSegment = interpolatePoints(
      stops[stops.length - 1].latitude,
      stops[stops.length - 1].longitude,
      stops[0].latitude,
      stops[0].longitude,
      8
    );
    points.push(...returnSegment);

    routesPaths.push({
      busId: route.busId!,
      routeName: route.name,
      points,
      currentIndex: 0,
    });

    console.log(
      `[GPS SIMULATOR] Pre-calculated path for Route "${route.name}" (Bus ID: ${route.busId}): ${points.length} nodes.`
    );
  }

  // Simulation Loop
  console.log("\n[GPS SIMULATOR] Dispatching coordinates. Press Ctrl+C to terminate.\n");
  
  const intervalId = setInterval(() => {
    for (const pathObj of routesPaths) {
      const { busId, routeName, points, currentIndex } = pathObj;
      const currentPoint = points[currentIndex];

      // Emit coordinates
      socket.emit("gps-ping", {
        busId,
        latitude: currentPoint.latitude,
        longitude: currentPoint.longitude,
        speed: 35 + Math.random() * 15, // random speed
      });

      console.log(
        `[GPS SIMULATOR] Emitted coordinates for Route "${routeName}" (Bus: ${busId}): (${currentPoint.latitude.toFixed(
          5
        )}, ${currentPoint.longitude.toFixed(5)})`
      );

      // Increment index (looping back to start at end of path)
      pathObj.currentIndex = (currentIndex + 1) % points.length;
    }
  }, 4000); // ping every 4 seconds

  process.on("SIGINT", () => {
    clearInterval(intervalId);
    socket.disconnect();
    db.$disconnect();
    console.log("\n[GPS SIMULATOR] Simulator stopped.");
    process.exit(0);
  });
}

runSimulator().catch((err) => {
  console.error("[GPS SIMULATOR] Runtime error:", err);
});
