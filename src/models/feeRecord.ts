import mongoose from "mongoose";

const feeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  qty: { type: Number, default: 0 },
  checked: { type: Boolean, default: false },
  type: { type: String, enum: ["checkbox", "quantity"], required: true },
});

const feeRecordSchema = new mongoose.Schema({
  applicationId: { type: String, required: true },
  id: { type: Number, required: true, unique: true },
  amount: { type: Number, required: true },
  items: [feeItemSchema],
  paid: { type: Boolean, default: false },
  receipt: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("FeeRecord", feeRecordSchema);