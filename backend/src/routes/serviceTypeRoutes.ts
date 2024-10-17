// src/routes/serviceTypeRoutes.ts
import express from "express";
import * as serviceTypeController from "../controllers/serviceTypeController";

const router = express.Router();

router.post("/", serviceTypeController.createServiceType);
router.get("/", serviceTypeController.getAllServiceTypes);
router.get("/:id", serviceTypeController.getServiceTypeById);
router.put("/:id", serviceTypeController.updateServiceType);
router.delete("/:id", serviceTypeController.deleteServiceType);

export default router;
