import { z } from "zod";
import { BusStatus, StopType } from "@prisma/client";

// Helper set of supported IANA timezones in Node.js
const ianaTimezones = new Set(Intl.supportedValuesOf("timeZone"));

const dateSchema = (requiredMessage: string) =>
  z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date({
      error: (issue) =>
        issue.input === undefined || issue.input === null
          ? requiredMessage
          : "Invalid date format",
    })
  );

// 1. Bus Validation Schema
export const busSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  registrationNumber: z
    .string()
    .regex(/^[A-Z0-9 -]+$/i, "Invalid registration number format")
    .min(1, "Registration number is required"),
  seatingCapacity: z.coerce.number().int().min(1, "Seating capacity must be at least 1"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  insuranceNumber: z.string().min(1, "Insurance number is required"),
  insuranceExpiry: dateSchema("Insurance expiry date is required"),
  insuranceDocumentUrl: z.string().optional().nullable(),
  fitnessExpiry: dateSchema("Fitness expiry date is required"),
  fitnessCertificateUrl: z.string().optional().nullable(),
  gpsDeviceId: z.string().min(1, "GPS Device ID is required"),
  status: z.nativeEnum(BusStatus).default(BusStatus.ACTIVE),
});

// 2. Driver Validation Schema
export const driverSchema = z.object({
  name: z.string().min(1, "Driver name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: dateSchema("License expiry date is required"),
  contactDetails: z.string().min(1, "Contact details are required"),
  userId: z.string().optional().nullable(),
  busId: z.string().optional().nullable(),
});

// 3. Student Validation Schema
export const studentSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  classSection: z.string().min(1, "Class & section is required"),
  parentName: z.string().min(1, "Parent name is required"),
  parentMobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile phone number format (e.g. +919999999999)"),
  busId: z.string().optional().nullable(),
  routeId: z.string().optional().nullable(),
  pickupStopId: z.string().optional().nullable(),
});

// 4. Route Validation Schema
export const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  estimatedTime: z.string().min(1, "Estimated time is required"),
  busId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  stops: z
    .array(
      z.object({
        stopName: z.string().min(1, "Stop name is required"),
        stopOrder: z.coerce.number().int().min(1),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        type: z.nativeEnum(StopType).optional(),
      })
    )
    .optional(),
});

// 5. TransportSettings Validation Schema
export const settingsSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  notificationBoardedTemplate: z
    .string()
    .min(1, "Notification template is required")
    .refine((val) => val.includes("{student}"), {
      message: "Template must contain '{student}' placeholder",
    }),
  notificationDroppedTemplate: z
    .string()
    .min(1, "Notification template is required")
    .refine((val) => val.includes("{student}"), {
      message: "Template must contain '{student}' placeholder",
    }),
  defaultTripStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format"),
  defaultTripEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format"),
  timezone: z.string().refine((val) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: val });
      return true;
    } catch (e) {
      return false;
    }
  }, {
    message: "Invalid IANA timezone string (e.g., Asia/Kolkata)",
  }),
  smsEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
});
