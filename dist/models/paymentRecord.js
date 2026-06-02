"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const paymentRecordSchema = new mongoose_1.default.Schema({
    applicationId: { type: String, required: true },
    id: { type: Number, required: true, unique: true },
    paymentNo: { type: String, required: true, unique: true },
    transactionMethod: { type: String, required: true },
    transactionNo: { type: String, default: "" },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    receivedBy: { type: String, required: true },
    receipt: { type: String, required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model("PaymentRecord", paymentRecordSchema);
