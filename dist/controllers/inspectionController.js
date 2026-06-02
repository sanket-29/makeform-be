"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInspections = exports.createInspection = exports.getSchedules = exports.createSchedule = void 0;
const scheduleInspection_1 = __importDefault(require("../models/scheduleInspection"));
const inspection_1 = __importDefault(require("../models/inspection"));
/* ---------------- SCHEDULE ---------------- */
// CREATE
const createSchedule = async (req, res) => {
    try {
        const data = await scheduleInspection_1.default.create(req.body);
        res.status(201).json(data);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating schedule", err });
    }
};
exports.createSchedule = createSchedule;
// GET ALL (History)
const getSchedules = async (req, res) => {
    try {
        const applicationId = req.query.applicationId;
        const data = await scheduleInspection_1.default.find({
            applicationId,
        }).sort({ createdAt: -1 });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching schedules", err });
    }
};
exports.getSchedules = getSchedules;
/* ---------------- INSPECTION ---------------- */
// CREATE
const createInspection = async (req, res) => {
    try {
        const data = await inspection_1.default.create(req.body);
        // 🔥 mark schedule as completed
        if (req.body.scheduleId) {
            await scheduleInspection_1.default.findByIdAndUpdate(req.body.scheduleId, {
                status: "Completed",
            });
        }
        res.status(201).json(data);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating inspection", err });
    }
};
exports.createInspection = createInspection;
// GET ALL (History)
const getInspections = async (req, res) => {
    try {
        const applicationId = req.query.applicationId;
        const data = await inspection_1.default.find({
            applicationId,
        }).sort({ createdAt: -1 });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching inspections", err });
    }
};
exports.getInspections = getInspections;
