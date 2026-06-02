"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const scheduleInspectionSchema = new mongoose_1.default.Schema({
    applicationId: {
        type: String,
        required: true,
    },
    inspectorName: { type: String, required: true },
    inspectionType: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    comment: { type: String },
    status: {
        type: String,
        default: "Scheduled",
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("ScheduleInspection", scheduleInspectionSchema);
