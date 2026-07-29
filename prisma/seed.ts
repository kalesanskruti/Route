import { PrismaClient, Role, BusStatus, StopType, AttendanceStatus, AttendanceType } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL?.replace(/^mysql:/, 'mariadb:');
console.log('Seed DATABASE_URL:', process.env.DATABASE_URL);
console.log('Seed connectionString:', connectionString);

const dbUrl = new URL(connectionString || '');
const poolConfig = {
  host: dbUrl.hostname,
  port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ''),
  connectionLimit: 10,
};

const adapter = new PrismaMariaDb(poolConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database...');
  // Delete in reverse dependency order
  await prisma.attendanceRecord.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.busLocation.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.transportSettings.deleteMany();

  console.log('Seeding database...');

  // 1. Seed TransportSettings
  const settings = await prisma.transportSettings.create({
    data: {
      id: 'default',
      schoolName: 'Springdale Public School',
      notificationBoardedTemplate: 'Dear parent, your child {student} has boarded the bus for the trip.',
      notificationDroppedTemplate: 'Dear parent, your child {student} has been safely dropped off.',
      defaultTripStartTime: '07:30',
      defaultTripEndTime: '16:30',
      timezone: 'Asia/Kolkata',
      smsEnabled: false,
      whatsappEnabled: false,
    },
  });
  console.log('Seeded TransportSettings:', settings.id);

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Seed Users (SUPER_ADMIN and TRANSPORT_MANAGER)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@route.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@route.com',
      name: 'Manager User',
      password: hashedPassword,
      role: Role.TRANSPORT_MANAGER,
    },
  });
  console.log('Seeded Admin & Manager accounts');

  // 3. Seed 5 Buses
  const busesData = [
    { busNumber: 'BUS-01', registrationNumber: 'DL-1C-A-1111', seatingCapacity: 40, vehicleType: 'Standard Bus', insuranceNumber: 'INS-001', insuranceExpiry: new Date('2027-01-01'), fitnessExpiry: new Date('2027-06-01'), gpsDeviceId: 'GPS-001', status: BusStatus.ACTIVE },
    { busNumber: 'BUS-02', registrationNumber: 'DL-1C-B-2222', seatingCapacity: 30, vehicleType: 'Mini Bus', insuranceNumber: 'INS-002', insuranceExpiry: new Date('2027-02-01'), fitnessExpiry: new Date('2027-07-01'), gpsDeviceId: 'GPS-002', status: BusStatus.ACTIVE },
    { busNumber: 'BUS-03', registrationNumber: 'DL-1C-C-3333', seatingCapacity: 50, vehicleType: 'Double Decker', insuranceNumber: 'INS-003', insuranceExpiry: new Date('2027-03-01'), fitnessExpiry: new Date('2027-08-01'), gpsDeviceId: 'GPS-003', status: BusStatus.ACTIVE },
    { busNumber: 'BUS-04', registrationNumber: 'DL-1C-D-4444', seatingCapacity: 40, vehicleType: 'Standard Bus', insuranceNumber: 'INS-004', insuranceExpiry: new Date('2027-04-01'), fitnessExpiry: new Date('2027-09-01'), gpsDeviceId: 'GPS-004', status: BusStatus.MAINTENANCE },
    { busNumber: 'BUS-05', registrationNumber: 'DL-1C-E-5555', seatingCapacity: 30, vehicleType: 'Mini Bus', insuranceNumber: 'INS-005', insuranceExpiry: new Date('2027-05-01'), fitnessExpiry: new Date('2027-10-01'), gpsDeviceId: 'GPS-005', status: BusStatus.ACTIVE },
  ];

  const buses = [];
  for (const b of busesData) {
    const bus = await prisma.bus.create({ data: b });
    buses.push(bus);
  }
  console.log(`Seeded ${buses.length} Buses`);

  // 4. Seed 5 Drivers and link to Users
  const drivers = [];
  for (let i = 1; i <= 5; i++) {
    const driverUser = await prisma.user.create({
      data: {
        email: `driver${i}@route.com`,
        name: `Driver ${i}`,
        password: hashedPassword,
        role: Role.DRIVER,
      },
    });

    const driver = await prisma.driver.create({
      data: {
        name: `Driver ${i}`,
        licenseNumber: `DL-DRIVER-0${i}`,
        licenseExpiry: new Date('2030-01-01'),
        contactDetails: `+91 987654321${i}`,
        userId: driverUser.id,
        busId: buses[i - 1].id,
      },
    });
    drivers.push(driver);
  }
  console.log(`Seeded ${drivers.length} Drivers`);

  // 5. Seed 5 Routes
  const routesData = [
    { name: 'Route 101', source: 'Noida Sector 62', destination: 'Springdale School', estimatedTime: '45 mins' },
    { name: 'Route 102', source: 'Indirapuram', destination: 'Springdale School', estimatedTime: '30 mins' },
    { name: 'Route 103', source: 'Vasundhara', destination: 'Springdale School', estimatedTime: '35 mins' },
    { name: 'Route 104', source: 'Noida Sector 15', destination: 'Springdale School', estimatedTime: '50 mins' },
    { name: 'Route 105', source: 'Mayur Vihar', destination: 'Springdale School', estimatedTime: '40 mins' },
  ];

  const routes = [];
  for (let i = 0; i < 5; i++) {
    const route = await prisma.route.create({
      data: {
        ...routesData[i],
        busId: buses[i].id,
        driverId: drivers[i].id,
      },
    });
    routes.push(route);
  }
  console.log(`Seeded ${routes.length} Routes`);

  // 6. Seed RouteStops for each Route (3 to 5 stops per route)
  const stops = [];
  const coords = [
    { lat: 28.6282, lng: 77.3898 }, // Noida Sec 62 area
    { lat: 28.6369, lng: 77.3712 }, // Indirapuram
    { lat: 28.6610, lng: 77.3571 }, // Vasundhara
    { lat: 28.5800, lng: 77.3225 }, // Noida Sec 15
    { lat: 28.6015, lng: 77.2970 }, // Mayur Vihar
  ];

  for (let r = 0; r < 5; r++) {
    const route = routes[r];
    const numStops = 4; // 4 stops per route
    for (let s = 1; s <= numStops; s++) {
      const stop = await prisma.routeStop.create({
        data: {
          routeId: route.id,
          stopName: `Stop ${s} on ${route.name}`,
          stopOrder: s,
          latitude: coords[r].lat + (s * 0.005),
          longitude: coords[r].lng + (s * 0.005),
          type: StopType.BOTH,
        },
      });
      stops.push(stop);
    }
  }
  console.log(`Seeded ${stops.length} Route Stops`);

  // 7. Seed 30 Students distributed across routes and stops
  const students = [];
  const firstNames = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Ishaan', 'Aanya', 'Myra', 'Kavya', 'Siddharth', 'Rohan', 'Reyansh', 'Pranav', 'Aditi', 'Sai', 'Kiara', 'Aaradhya', 'Aryan', 'Ishita', 'Riya', 'Rahul', 'Arjun', 'Meera', 'Karan', 'Dev', 'Neha', 'Pooja', 'Shreya'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Reddy', 'Rao'];

  for (let i = 1; i <= 30; i++) {
    const routeIdx = (i - 1) % 5;
    const route = routes[routeIdx];
    const bus = buses[routeIdx];
    
    // Filter stops belonging to this route
    const routeStops = stops.filter(s => s.routeId === route.id);
    const pickupStop = routeStops[Math.floor(Math.random() * routeStops.length)];

    const fName = firstNames[i - 1];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const student = await prisma.student.create({
      data: {
        name: `${fName} ${lName}`,
        admissionNumber: `ADM2026${String(i).padStart(3, '0')}`,
        classSection: `${Math.floor(Math.random() * 5) + 6}-${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`, // Grade 6-10, A-C
        parentName: `Parent of ${fName}`,
        parentMobileNumber: `+91 99999${String(10000 + i)}`,
        busId: bus.id,
        routeId: route.id,
        pickupStopId: pickupStop.id,
      },
    });
    students.push(student);
  }
  console.log(`Seeded ${students.length} Students`);

  // 8. Seed AttendanceRecords from the past 3 days (15 records total)
  const attendanceRecords = [];
  const days = ['2026-07-28', '2026-07-27', '2026-07-26'];
  
  for (let i = 0; i < 15; i++) {
    const student = students[i];
    const date = days[i % 3];
    const type = i % 2 === 0 ? AttendanceType.PICKUP : AttendanceType.DROP;
    const status = i % 10 === 0 ? AttendanceStatus.DROPPED : AttendanceStatus.BOARDED; // mostly boarded for test variety

    try {
      const record = await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          busId: student.busId!,
          routeId: student.routeId!,
          status: status,
          type: type,
          date: date,
          timestamp: new Date(`${date}T08:00:00Z`),
          markedByUserId: drivers[0].userId!, // marked by driver 1
        },
      });
      attendanceRecords.push(record);
    } catch (e) {
      // Catch duplicate unique constraints if any
      console.log(`Duplicate record skipped for student ${student.name} on ${date}`);
    }
  }
  console.log(`Seeded ${attendanceRecords.length} Attendance Records`);

  console.log('\n--- Seeding Summary ---');
  console.log(`TransportSettings  : 1`);
  console.log(`Users              : ${await prisma.user.count()}`);
  console.log(`Buses              : ${await prisma.bus.count()}`);
  console.log(`Drivers            : ${await prisma.driver.count()}`);
  console.log(`Routes             : ${await prisma.route.count()}`);
  console.log(`RouteStops         : ${await prisma.routeStop.count()}`);
  console.log(`Students           : ${await prisma.student.count()}`);
  console.log(`AttendanceRecords  : ${await prisma.attendanceRecord.count()}`);
  console.log('-----------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
