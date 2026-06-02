"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const noteSchema = new mongoose_1.default.Schema({
    applicationId: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        default: "",
    },
    markAsRead: {
        type: Boolean,
        default: false,
    },
    receivedBy: {
        type: String,
        default: "Admin",
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Note", noteSchema);
