"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteForm = exports.getFormById = exports.getForms = exports.updateApplicationStatus = exports.submitApplicationForm = void 0;
const application_1 = __importDefault(require("../models/application"));
const submitApplicationForm = async (req, res) => {
    try {
        const { data, responseId, customData, status } = req.body;
        // console.log("customHeaders : ", customData);
        // console.log("request body : ", req.body);
        const formType = req.params.formType || "general";
        //  Convert array → object
        const formattedData = Object.fromEntries(data.map((item) => [
            item.name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "")
                .split(/\s+/)
                .slice(0, 5)
                .join("_"),
            item.value,
        ]));
        // 🔥 Find existing form (for edit case)
        const existingForm = await application_1.default.findOne({ responseId });
        const formId = customData?.formId || existingForm?.formId || "";
        const formCode = customData?.formCode || existingForm?.formCode || "";
        if (!formId || !formCode) {
            return res.status(400).json({
                success: false,
                message: "Missing formId or formCode",
            });
        }
        // 🔥 UPSERT (update if exists, else create)
        const form = await application_1.default.findOneAndUpdate({ responseId }, {
            formType,
            data: formattedData,
            rawData: data,
            responseId,
            formId,
            formCode,
            ...(req.user?.id && { userId: req.user.id }),
            status: typeof status === "string" ? status : null,
        }, { new: true, upsert: true });
        res.json({
            success: true,
            message: "Application saved successfully",
            form,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Error saving application",
            error: error.message,
        });
    }
};
exports.submitApplicationForm = submitApplicationForm;
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (typeof status !== "string") {
            return res.status(400).json({ success: false, message: "Status is required" });
        }
        const updated = await application_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        res.json({ success: true, message: "Status updated", application: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error updating status", error: error.message });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
const getForms = async (req, res) => {
    try {
        const forms = await application_1.default.find().sort({ createdAt: -1 });
        res.json(forms);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getForms = getForms;
const getFormById = async (req, res) => {
    try {
        const form = await application_1.default.findById(req.params.id);
        res.json(form);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getFormById = getFormById;
const deleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedForm = await application_1.default.findByIdAndDelete(id);
        if (!deletedForm) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }
        res.json({
            success: true,
            message: "Application deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting application",
            error: error.message,
        });
    }
};
exports.deleteForm = deleteForm;
