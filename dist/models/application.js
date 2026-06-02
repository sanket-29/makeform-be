"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const applicationSchema = new mongoose_1.default.Schema({
    formType: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return ["general", "residential", "commercial"].includes(v);
            },
            message: "Invalid form type",
        },
    },
    data: {
        type: Object,
        required: true,
    },
    rawData: {
        type: Array,
        required: true,
    },
    responseId: {
        type: String,
        required: true,
    },
    formId: {
        type: String,
        required: true,
    },
    formCode: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    status: {
        type: String,
        default: "pending",
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Application", applicationSchema);
