"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const attachmentSchema = new mongoose_1.default.Schema({
    applicationId: {
        type: String,
        required: true,
    },
    attName: {
        type: String,
        default: "attachment",
    },
    fileName: String,
    filePath: String,
    uploadedOn: { type: Date, default: Date.now },
    origin: { type: String, default: "User Upload" },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Attachment", attachmentSchema);
