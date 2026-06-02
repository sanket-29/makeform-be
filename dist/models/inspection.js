"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const inspectionSchema = new mongoose_1.default.Schema({
    applicationId: {
        type: String,
        required: true,
    },
    inspectorName: { type: String, required: true },
    inspectionType: { type: String, required: true },
    date: { type: String, required: true },
    result: { type: String, required: true },
    comment: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Inspection", inspectionSchema);
