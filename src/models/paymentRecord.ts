import mongoose from "mongoose";

const paymentRecordSchema = new mongoose.Schema({
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

export default mongoose.model("PaymentRecord", paymentRecordSchema);