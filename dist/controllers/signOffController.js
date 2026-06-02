"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignoffs = exports.updateSignoff = exports.assignSignoffs = void 0;
const signoff_model_1 = __importDefault(require("../models/signoff.model"));
// 1. ASSIGN SIGNOFFS (Create or Add Departments)
const assignSignoffs = async (req, res) => {
    try {
        const { applicationId, departments } = req.body;
        if (!applicationId || !departments) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        let signoff = await signoff_model_1.default.findOne({ applicationId });
        // IF EXISTS → MERGE (DO NOT DELETE OLD DATA)
        if (signoff) {
            const updated = departments.map((dept) => {
                const existing = signoff.signoffs.find((s) => s.department === dept);
                return (existing || {
                    department: dept,
                    status: "Pending",
                    comment: "",
                    date: null,
                    history: [],
                    currentStatus: "Pending",
                });
            });
            signoff.signoffs = updated;
            await signoff.save();
            return res.status(200).json({
                message: "Signoffs updated successfully",
                data: signoff,
            });
        }
        // IF NOT EXISTS → CREATE NEW
        const newItems = departments.map((dept) => ({
            department: dept,
            status: "Pending",
            comment: "",
            date: null,
            history: [],
            currentStatus: "Pending",
        }));
        signoff = await signoff_model_1.default.create({
            applicationId,
            signoffs: newItems,
        });
        return res.status(201).json({
            message: "Signoffs assigned successfully",
            data: signoff,
        });
    }
    catch (error) {
        console.error("Assign Signoff Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.assignSignoffs = assignSignoffs;
//  2. UPDATE SIGNOFF (Approve / Reject / Comment)
const updateSignoff = async (req, res) => {
    try {
        const { applicationId, department, status, comment } = req.body;
        if (!applicationId || !department || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const signoff = await signoff_model_1.default.findOne({ applicationId });
        if (!signoff) {
            return res.status(404).json({ message: "Signoff not found" });
        }
        const item = signoff.signoffs.find((s) => s.department === department);
        if (!item) {
            return res.status(404).json({ message: "Department not found" });
        }
        // ✅ INIT history if missing (important for old data)
        if (!item.history)
            item.history = [];
        // ✅ PUSH NEW RECORD (NO REPLACE)
        item.history.push({
            status,
            comment,
            date: new Date(),
        });
        // ✅ UPDATE CURRENT STATUS
        item.currentStatus = status;
        await signoff.save();
        return res.status(200).json({
            message: "Signoff updated successfully",
            data: signoff,
        });
    }
    catch (error) {
        console.error("Update Signoff Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.updateSignoff = updateSignoff;
// 3. GET SIGNOFFS (for tabs + history)
const getSignoffs = async (req, res) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) {
            return res.status(400).json({ message: "Application ID required" });
        }
        const signoff = await signoff_model_1.default.findOne({ applicationId });
        if (!signoff) {
            return res.status(200).json({
                applicationId,
                signoffs: [],
            });
        }
        return res.status(200).json(signoff);
    }
    catch (error) {
        console.error("Get Signoff Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getSignoffs = getSignoffs;
