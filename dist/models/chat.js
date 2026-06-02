"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    applicationId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
    },
    sender: {
        type: String,
        enum: ["staff", "user"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Chat", chatSchema);
