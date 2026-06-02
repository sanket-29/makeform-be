"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionDetails = void 0;
const signoff_model_1 = __importDefault(require("../models/signoff.model"));
const checklist_1 = __importDefault(require("../models/checklist"));
const paymentRecord_1 = __importDefault(require("../models/paymentRecord"));
const inspection_1 = __importDefault(require("../models/inspection"));
const permit_1 = __importDefault(require("../models/permit"));
const getTransactionDetails = async (req, res) => {
    try {
        const { applicationId } = req.params;
        // 🔹 Fetch all collections in parallel (faster 🚀)
        const [signoff, checklist, payment, permit, inspection] = await Promise.all([
            signoff_model_1.default.findOne({ applicationId: applicationId }),
            checklist_1.default.findOne({ applicationId: applicationId }),
            paymentRecord_1.default.findOne({ applicationId: applicationId }),
            permit_1.default.findOne({ applicationId: applicationId }),
            inspection_1.default.findOne({ applicationId: applicationId }),
        ]);
        // 🔹 Safe arrays (avoids TS errors ✅)
        const signoffList = signoff?.signoffs || [];
        const checklistItems = checklist?.items || [];
        // 🔹 Compute progress
        const progress = {
            signoffs: signoffList.length > 0 &&
                signoffList.every((s) => s.currentStatus && s.currentStatus !== "Pending"),
            checklist: checklistItems.length > 0 &&
                checklistItems.every((i) => i.finalized === true),
            payfee: !!payment,
            permit: !!permit,
            inspection: !!inspection,
        };
        res.json({
            success: true,
            progress,
        });
    }
    catch (error) {
        console.error("Transaction Progress Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching transaction progress",
            error: error.message,
        });
    }
};
exports.getTransactionDetails = getTransactionDetails;
