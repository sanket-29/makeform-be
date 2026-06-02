"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const feeItemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    qty: { type: Number, default: 0 },
    checked: { type: Boolean, default: false },
    type: { type: String, enum: ["checkbox", "quantity"], required: true },
});
const feeRecordSchema = new mongoose_1.default.Schema({
    applicationId: { type: String, required: true },
    id: { type: Number, required: true, unique: true },
    amount: { type: Number, required: true },
    items: [feeItemSchema],
    paid: { type: Boolean, default: false },
    receipt: { type: String, default: "" },
}, { timestamps: true });
exports.default = mongoose_1.default.model("FeeRecord", feeRecordSchema);
