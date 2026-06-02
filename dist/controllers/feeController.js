"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentRecord = exports.getPaymentHistory = exports.payFee = exports.deleteFeeRecord = exports.getFeeRecords = exports.submitCalculator = void 0;
const feeRecord_1 = __importDefault(require("../models/feeRecord"));
const paymentRecord_1 = __importDefault(require("../models/paymentRecord"));
const application_1 = __importDefault(require("../models/application"));
const submitCalculator = async (req, res) => {
    try {
        const { applicationId, items, amount } = req.body;
        if (!applicationId || !items || !Array.isArray(items) || amount <= 0) {
            return res.status(400).json({ message: "Invalid data" });
        }
        // Get next id for all fee records
        const lastRecord = await feeRecord_1.default.findOne().sort({ id: -1 });
        const nextId = lastRecord ? lastRecord.id + 1 : 1;
        const newRecord = new feeRecord_1.default({
            applicationId,
            id: nextId,
            amount,
            items,
            paid: false,
        });
        await newRecord.save();
        res.status(201).json({ message: "Fee record created", record: newRecord });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.submitCalculator = submitCalculator;
const getFeeRecords = async (req, res) => {
    try {
        const { applicationId } = req.query;
        if (!applicationId || typeof applicationId !== 'string') {
            return res.status(400).json({ message: "Application ID required" });
        }
        const records = await feeRecord_1.default.find({ applicationId }).sort({ createdAt: -1 });
        res.json(records);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getFeeRecords = getFeeRecords;
const deleteFeeRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await feeRecord_1.default.findOneAndDelete({ id: Number(id) });
        res.json({ message: "Record deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteFeeRecord = deleteFeeRecord;
const getPaymentPrefix = (formType) => {
    switch (formType) {
        case "residential":
            return "RES";
        case "commercial":
            return "COMM";
        default:
            return "GEN";
    }
};
const formatPaymentNo = (prefix, year, seq) => {
    const number = String(seq).padStart(4, "0");
    return `${prefix}-${year}-${number}`;
};
const getNextPaymentSequence = async (prefix, year) => {
    const regex = new RegExp(`^${prefix}-${year}-(\\d{4})$`);
    const lastPayment = await paymentRecord_1.default.findOne({ paymentNo: regex }).sort({ createdAt: -1 });
    if (!lastPayment || !lastPayment.paymentNo) {
        return 1;
    }
    const match = lastPayment.paymentNo.match(regex);
    return match ? Number(match[1]) + 1 : 1;
};
const payFee = async (req, res) => {
    try {
        const { applicationId, transactionMethod, transactionNo, date, receivedBy, selectedIds } = req.body;
        const ids = Array.isArray(selectedIds) ? selectedIds.map(Number).filter((id) => !Number.isNaN(id)) : [];
        if (!applicationId || !transactionMethod || !date || !receivedBy || ids.length === 0) {
            return res.status(400).json({ message: "Invalid data" });
        }
        const application = await application_1.default.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        const prefix = getPaymentPrefix(application.formType);
        const year = String(new Date().getFullYear()).slice(-2);
        const sequence = await getNextPaymentSequence(prefix, year);
        const paymentNo = formatPaymentNo(prefix, year, sequence);
        const records = await feeRecord_1.default.find({ applicationId, id: { $in: ids }, receipt: "" });
        const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
        if (totalAmount === 0) {
            return res.status(400).json({ message: "No amount to pay" });
        }
        const newPayment = new paymentRecord_1.default({
            applicationId,
            id: Date.now(),
            paymentNo,
            transactionMethod,
            transactionNo: transactionNo || "",
            amount: totalAmount,
            date,
            receivedBy,
            receipt: paymentNo,
        });
        await newPayment.save();
        // Update fee records with receipt
        await feeRecord_1.default.updateMany({ applicationId, id: { $in: ids }, receipt: "" }, { receipt: paymentNo, paid: true });
        res.status(201).json({ message: "Payment recorded", payment: newPayment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.payFee = payFee;
const getPaymentHistory = async (req, res) => {
    try {
        const { applicationId } = req.query;
        if (!applicationId || typeof applicationId !== 'string') {
            return res.status(400).json({ message: "Application ID required" });
        }
        const history = await paymentRecord_1.default.find({ applicationId }).sort({ createdAt: -1 });
        res.json(history);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getPaymentHistory = getPaymentHistory;
const deletePaymentRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPayment = await paymentRecord_1.default.findOneAndDelete({ id: Number(id) });
        if (!deletedPayment) {
            return res.status(404).json({ message: "Payment record not found" });
        }
        // Remove receipt from associated fee records
        await feeRecord_1.default.updateMany({ receipt: deletedPayment.receipt }, { receipt: "" });
        res.json({ message: "Payment record deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deletePaymentRecord = deletePaymentRecord;
