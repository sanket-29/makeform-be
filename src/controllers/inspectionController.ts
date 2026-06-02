import { Request, Response } from "express";
import ScheduleInspection from "../models/scheduleInspection";
import Inspection from "../models/inspection";

/* ---------------- SCHEDULE ---------------- */

// CREATE
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const data = await ScheduleInspection.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error creating schedule", err });
  }
};

// GET ALL (History)
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.query;

    const data = await ScheduleInspection.find({ applicationId })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching schedules", err });
  }
};

/* ---------------- INSPECTION ---------------- */

// CREATE
export const createInspection = async (req: Request, res: Response) => {
  try {
    const data = await Inspection.create(req.body);

    // 🔥 mark schedule as completed
    if (req.body.scheduleId) {
      await ScheduleInspection.findByIdAndUpdate(req.body.scheduleId, {
        status: "Completed",
      });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error creating inspection", err });
  }
};

// GET ALL (History)
export const getInspections = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.query;

    const data = await Inspection.find({ applicationId })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching inspections", err });
  }
};