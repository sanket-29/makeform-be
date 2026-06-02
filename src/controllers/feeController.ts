import { Request, Response } from "express";
import FeeRecord from "../models/feeRecord";
import PaymentRecord from "../models/paymentRecord";
import Application from "../models/application";

export const submitCalculator = async (req: Request, res: Response) => {
  try {
    const { applicationId, items, amount } = req.body;

    if (!applicationId || !items || !Array.isArray(items) || amount <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // Get next id for all fee records
    const lastRecord = await FeeRecord.findOne().sort({ id: -1 });
    const nextId = lastRecord ? lastRecord.id + 1 : 1;

    const newRecord = new FeeRecord({
      applicationId,
      id: nextId,
      amount,
      items,
      paid: false,
    });

    await newRecord.save();

    res.status(201).json({ message: "Fee record created", record: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeeRecords = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.query;

    if (!applicationId || typeof applicationId !== 'string') {
      return res.status(400).json({ message: "Application ID required" });
    }

    const records = await FeeRecord.find({ applicationId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFeeRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await FeeRecord.findOneAndDelete({ id: Number(id) });
    res.json({ message: "Record deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPaymentPrefix = (formType: string) => {
  switch (formType) {
    case "residential":
      return "RES";
    case "commercial":
      return "COMM";
    default:
      return "GEN";
  }
};

const formatPaymentNo = (prefix: string, year: string, seq: number) => {
  const number = String(seq).padStart(4, "0");
  return `${prefix}-${year}-${number}`;
};

const getNextPaymentSequence = async (prefix: string, year: string) => {
  const regex = new RegExp(`^${prefix}-${year}-(\\d{4})$`);
  const lastPayment = await PaymentRecord.findOne({ paymentNo: regex }).sort({ createdAt: -1 });
  if (!lastPayment || !lastPayment.paymentNo) {
    return 1;
  }
  const match = lastPayment.paymentNo.match(regex);
  return match ? Number(match[1]) + 1 : 1;
};

export const payFee = async (req: Request, res: Response) => {
  try {
    const { applicationId, transactionMethod, transactionNo, date, receivedBy, selectedIds } = req.body;
    const ids = Array.isArray(selectedIds) ? selectedIds.map(Number).filter((id: number) => !Number.isNaN(id)) : [];

    if (!applicationId || !transactionMethod || !date || !receivedBy || ids.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const prefix = getPaymentPrefix(application.formType);
    const year = String(new Date().getFullYear()).slice(-2);
    const sequence = await getNextPaymentSequence(prefix, year);
    const paymentNo = formatPaymentNo(prefix, year, sequence);

    const records = await FeeRecord.find({ applicationId, id: { $in: ids }, receipt: "" });
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

    if (totalAmount === 0) {
      return res.status(400).json({ message: "No amount to pay" });
    }

    const newPayment = new PaymentRecord({
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
    await FeeRecord.updateMany({ applicationId, id: { $in: ids }, receipt: "" }, { receipt: paymentNo, paid: true });

    res.status(201).json({ message: "Payment recorded", payment: newPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.query;

    if (!applicationId || typeof applicationId !== 'string') {
      return res.status(400).json({ message: "Application ID required" });
    }

    const history = await PaymentRecord.find({ applicationId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePaymentRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedPayment = await PaymentRecord.findOneAndDelete({ id: Number(id) });
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
    // Remove receipt from associated fee records
    await FeeRecord.updateMany({ receipt: deletedPayment.receipt }, { receipt: "" });
    res.json({ message: "Payment record deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};