"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermitByApplication = exports.savePermit = void 0;
const permit_1 = __importDefault(require("../models/permit"));
const application_1 = __importDefault(require("../models/application"));
const paymentRecord_1 = __importDefault(require("../models/paymentRecord"));
const generatePermitNo = async (applicationId, seq) => {
    const app = await application_1.default.findById(applicationId);
    const formType = app?.formType || "general";
    let prefix = "GEN";
    if (formType === "building")
        prefix = "B";
    if (formType === "residential")
        prefix = "RES";
    if (formType === "commercial")
        prefix = "COM";
    const year = new Date().getFullYear().toString().slice(-2);
    const number = seq.toString().padStart(4, "0");
    return `${prefix}-${year}-${number}`;
};
// ✅ SAVE / UPDATE PERMIT
const savePermit = async (req, res) => {
    try {
        const { applicationId, remarks, issueDate, signature } = req.body;
        let permit = await permit_1.default.findOne({ applicationId });
        // ✅ IF NEW → GENERATE SEQUENCE
        if (!permit) {
            const lastPermit = await permit_1.default.findOne().sort({ sequenceNumber: -1 });
            const nextSeq = lastPermit?.sequenceNumber
                ? lastPermit.sequenceNumber + 1
                : 1;
            const permitNo = await generatePermitNo(applicationId, nextSeq);
            permit = await permit_1.default.create({
                applicationId,
                sequenceNumber: nextSeq,
                permitNo,
                remarks,
                issueDate,
                signature,
            });
        }
        else {
            permit = await permit_1.default.findOneAndUpdate({ applicationId }, {
                remarks,
                issueDate,
                signature,
            }, { new: true });
        }
        res.json({
            success: true,
            permit,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.savePermit = savePermit;
// ✅ GET PERMIT + APPLICATION DATA (for autofill)
const getPermitByApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await application_1.default.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }
        // ✅ Normalize IDs
        const responseId = application.responseId;
        const mongoId = application._id.toString();
        const permit = await permit_1.default.findOne({ applicationId });
        const payment = await paymentRecord_1.default.findOne({ applicationId })
            .sort({ createdAt: -1 });
        console.log("REQ ID:", applicationId);
        console.log("RESPONSE ID:", responseId);
        console.log("MONGO ID:", mongoId);
        console.log("PAYMENT:", payment);
        res.json({
            success: true,
            permit,
            application,
            payment,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.getPermitByApplication = getPermitByApplication;
