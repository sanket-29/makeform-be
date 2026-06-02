"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const checklistItemSchema = new mongoose_1.default.Schema({
    text: { type: String, required: true },
    selected: { type: Boolean, default: false },
    submitted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    finalized: { type: Boolean, default: false },
    attachment: { type: String, default: "" }, // file path or URL
    isCustom: { type: Boolean, default: false },
}, { timestamps: true });
const checklistSchema = new mongoose_1.default.Schema({
    applicationId: { type: String, required: true },
    items: [checklistItemSchema],
}, { timestamps: true });
exports.default = mongoose_1.default.model("Checklist", checklistSchema);
