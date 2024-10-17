// src/models/ServiceType.ts
import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

export const ServiceTypeSchema = z.object({
  name: z.string().min(2).max(50),
  price: z.number().positive(),
});

export type ServiceTypeType = z.infer<typeof ServiceTypeSchema>;

interface IServiceType extends Document, ServiceTypeType {}

const serviceTypeSchema = new Schema<IServiceType>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export default mongoose.model<IServiceType>("ServiceType", serviceTypeSchema);
