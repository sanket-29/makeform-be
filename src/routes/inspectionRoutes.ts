import express from "express";
import {
  createSchedule,
  getSchedules,
  createInspection,
  getInspections,
} from "../controllers/inspectionController";

const router = express.Router();

/* Schedule */
router.post("/schedule", createSchedule);
router.get("/schedule", getSchedules);

/* Inspection */
router.post("/inspection", createInspection);
router.get("/inspection", getInspections);

export default router;