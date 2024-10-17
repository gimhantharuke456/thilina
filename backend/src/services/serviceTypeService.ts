// src/services/serviceTypeService.ts
import ServiceType, { ServiceTypeType, ServiceTypeSchema } from "../models/ServiceType";

export const createServiceType = async (serviceTypeData: ServiceTypeType) => {
  const validatedData = ServiceTypeSchema.parse(serviceTypeData);
  const serviceType = new ServiceType(validatedData);
  return await serviceType.save();
};

export const getAllServiceTypes = async () => {
  return await ServiceType.find();
};

export const getServiceTypeById = async (id: string) => {
  return await ServiceType.findById(id);
};

export const updateServiceType = async (id: string, serviceTypeData: Partial<ServiceTypeType>) => {
  const validatedData = ServiceTypeSchema.partial().parse(serviceTypeData);
  return await ServiceType.findByIdAndUpdate(id, validatedData, {
    new: true,
  });
};

export const deleteServiceType = async (id: string) => {
  return await ServiceType.findByIdAndDelete(id);
};
