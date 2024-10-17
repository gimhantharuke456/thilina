// src/controllers/serviceTypeController.ts
import { Request, Response } from "express";
import * as serviceTypeService from "../services/serviceTypeService";
import { ServiceTypeSchema } from "../models/ServiceType";
import { ZodError } from "zod";

export const createServiceType = async (req: Request, res: Response) => {
  try {
    const validatedData = ServiceTypeSchema.parse(req.body);
    const serviceType = await serviceTypeService.createServiceType(validatedData);
    res.status(201).json(serviceType);
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error creating service type" });
    }
  }
};

export const getAllServiceTypes = async (req: Request, res: Response) => {
  try {
    const serviceTypes = await serviceTypeService.getAllServiceTypes();
    res.json(serviceTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service types" });
  }
};

export const getServiceTypeById = async (req: Request, res: Response) => {
  try {
    const serviceType = await serviceTypeService.getServiceTypeById(req.params.id);
    if (!serviceType) {
      return res.status(404).json({ message: "Service type not found" });
    }
    res.json(serviceType);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service type" });
  }
};

export const updateServiceType = async (req: Request, res: Response) => {
  try {
    const validatedData = ServiceTypeSchema.parse(req.body);
    const serviceType = await serviceTypeService.updateServiceType(req.params.id, validatedData);
    if (!serviceType) {
      return res.status(404).json({ message: "Service type not found" });
    }
    res.json(serviceType);
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Error updating service type" });
    }
  }
};

export const deleteServiceType = async (req: Request, res: Response) => {
  try {
    const serviceType = await serviceTypeService.deleteServiceType(req.params.id);
    if (!serviceType) {
      return res.status(404).json({ message: "Service type not found" });
    }
    res.json({ message: "Service type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service type" });
  }
};
