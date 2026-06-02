"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChecklist = exports.finalizeChecklist = exports.verifyItem = exports.submitChecklist = void 0;
const checklist_1 = __importDefault(require("../models/checklist"));
// Create / Submit checklist (initial)
const submitChecklist = async (req, res) => {
    try {
        const { applicationId, items } = req.body;
        if (!applicationId || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid data" });
        }
        let checklist = await checklist_1.default.findOne({ applicationId });
        const cleanedItems = items.filter((item) => item?.text && item?.submitted);
        if (checklist) {
            // MERGE instead of overwrite
            const existingItems = checklist.items || [];
            const mergedItems = cleanedItems.map((newItem) => {
                const existing = existingItems.find((e) => e.text === newItem.text);
                return existing || newItem;
            });
            checklist.items = mergedItems;
            await checklist.save();
            return res.status(200).json({
                message: "Checklist updated successfully",
                data: checklist,
            });
        }
        // ✅ CREATE NEW
        checklist = await checklist_1.default.create({
            applicationId,
            items: cleanedItems,
        });
        return res.status(201).json({
            message: "Checklist created successfully",
            data: checklist,
        });
    }
    catch (error) {
        console.error("Submit Checklist Error:", error);
        return res.status(500).json({
            message: "Error submitting checklist",
            error,
        });
    }
};
exports.submitChecklist = submitChecklist;
// ✅ Verify item
const verifyItem = async (req, res) => {
    try {
        const { checklistId, itemId, verified } = req.body;
        if (!checklistId || !itemId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const checklist = await checklist_1.default.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: "Checklist not found" });
        }
        const item = checklist.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        item.verified = verified;
        await checklist.save();
        return res.status(200).json({
            message: "Item verified successfully",
            data: checklist,
        });
    }
    catch (error) {
        console.error("Verify Checklist Error:", error);
        return res.status(500).json({
            message: "Verification failed",
            error,
        });
    }
};
exports.verifyItem = verifyItem;
// ✅ Finalize verified items
const finalizeChecklist = async (req, res) => {
    try {
        const { checklistId } = req.body;
        if (!checklistId) {
            return res.status(400).json({ message: "Checklist ID required" });
        }
        const checklist = await checklist_1.default.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ message: "Checklist not found" });
        }
        checklist.items.forEach((item) => {
            if (item.verified) {
                item.finalized = true;
            }
        });
        await checklist.save();
        return res.status(200).json({
            message: "Checklist finalized successfully",
            data: checklist,
        });
    }
    catch (error) {
        console.error("Finalize Checklist Error:", error);
        return res.status(500).json({
            message: "Finalize failed",
            error,
        });
    }
};
exports.finalizeChecklist = finalizeChecklist;
// ✅ Get checklist
const getChecklist = async (req, res) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) {
            return res.status(400).json({ message: "Application ID required" });
        }
        const checklist = await checklist_1.default.findOne({ applicationId });
        // ✅ RETURN EMPTY STRUCTURE (like signoff)
        if (!checklist) {
            return res.status(200).json({
                applicationId,
                items: [],
            });
        }
        return res.status(200).json({
            message: "Checklist fetched successfully",
            data: checklist,
        });
    }
    catch (error) {
        console.error("Get Checklist Error:", error);
        return res.status(500).json({
            message: "Error fetching checklist",
            error,
        });
    }
};
exports.getChecklist = getChecklist;
