const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const url = require("url");
require("dotenv").config();

// 1. Prisma Client Setup with MariaDB Adapter (Prisma v7 constraint)
const connectionString = process.env.DATABASE_URL?.replace(/^mysql:/, "mariadb:");
if (!connectionString) {
  console.error("[GPS SOCKET SERVER] Error: DATABASE_URL env variable is not set.");
  process.exit(1);
}

const getAdapter = () => {
  const dbUrl = new url.URL(connectionString);
  return new PrismaMariaDb({
    host: dbUrl.hostname,
    port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ""),
    connectionLimit: 5,
  });
};

const prisma = new PrismaClient({
  adapter: getAdapter(),
  log: ["error"]
});

// 2. HTTP Server and Socket.io Initialization
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Route GPS Tracking Server Running\n");
});

const io = new Server(server, {
  cors: {
    origin: "*", // Allow tracking clients to connect from anywhere
    methods: ["GET", "POST"]
  }
});

// 3. Socket Event Handlers
io.on("connection", (socket) => {
  console.log(`[GPS SOCKET SERVER] Client connected: ${socket.id}`);

  // Track room joins (e.g. for dashboard live view)
  socket.on("join-bus-room", (busId) => {
    if (busId) {
      socket.join(`bus:${busId}`);
      console.log(`[GPS SOCKET SERVER] Client ${socket.id} joined room: bus:${busId}`);
    }
  });

  // Handle GPS coordinate pings from simulator or hardware stubs
  socket.on("gps-ping", async (payload) => {
    const { busId, latitude, longitude, speed } = payload;
    if (!busId || latitude === undefined || longitude === undefined) {
      console.warn(`[GPS SOCKET SERVER] Warning: Invalid ping payload received from client ${socket.id}`);
      return;
    }

    try {
      // Append ping to append-only BusLocation table
      const location = await prisma.busLocation.create({
        data: {
          busId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          speed: speed ? parseFloat(speed) : 0,
        }
      });

      // Broadcast update to tracking clients in the bus's specific room
      io.to(`bus:${busId}`).emit("location-update", {
        busId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        timestamp: location.timestamp
      });

      console.log(`[GPS SOCKET SERVER] Logged ping for Bus "${busId}" at (${latitude}, ${longitude})`);
    } catch (err) {
      console.error(`[GPS SOCKET SERVER] Error writing bus location ping:`, err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[GPS SOCKET SERVER] Client disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`[GPS SOCKET SERVER] Tracking server listening on http://localhost:${PORT}`);
});
