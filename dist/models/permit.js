"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const permitSchema = new mongoose_1.default.Schema({
    applicationId: {
        type: String,
        required: true,
    },
    // ✅ NEW AUTO INCREMENT FIELD
    sequenceNumber: {
        type: Number,
    },
    permitNo: String,
    remarks: String,
    issueDate: String,
    signature: String,
    fee: String,
}, { timestamps: true });
exports.default = mongoose_1.default.model("Permit", permitSchema);
