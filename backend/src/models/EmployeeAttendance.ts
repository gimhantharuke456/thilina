// src/models/EmployeeAttendance.ts
import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

// Zod schema for validation
export const EmployeeAttendanceSchema = z.object({
  employeeId: z.string().min(1),
  arrivalTime: z
    .string()
    .refine((val) => /^\d{2}:\d{2}$/.test(val), { message: "Invalid time format" }), // HH:mm format
  departureTime: z
    .string()
    .refine((val) => /^\d{2}:\d{2}$/.test(val), { message: "Invalid time format" }), // HH:mm format
  shiftType: z.enum(["over_time", "in_time", "half_time"]),
});

// Type inference
export type EmployeeAttendanceType = z.infer<typeof EmployeeAttendanceSchema>;

interface IEmployeeAttendance extends Document, EmployeeAttendanceType {}

// Mongoose schema definition
const employeeAttendanceSchema = new Schema<IEmployeeAttendance>(
  {
    employeeId: { type: String, required: true },
    arrivalTime: { type: String, required: true }, // Keeping as String
    departureTime: { type: String, required: true }, // Keeping as String
    shiftType: {
      type: String,
      enum: ["over_time", "in_time", "half_time"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployeeAttendance>(
  "EmployeeAttendance",
  employeeAttendanceSchema
);
