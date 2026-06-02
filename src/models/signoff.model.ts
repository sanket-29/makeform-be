import mongoose, { Schema, Document } from "mongoose";

interface IHistory {
  status: string;
  comment: string;
  date: Date;
}

interface ISignoffItem {
  department: string;
  status: string;
  comment: string;
  date: Date | null;

  // ✅ ADD THESE
  history: IHistory[];
  currentStatus: string;
}

export interface ISignoff extends Document {
  applicationId: string;
  signoffs: ISignoffItem[];
}

const HistorySchema = new Schema<IHistory>({
  status: String,
  comment: String,
  date: Date,
});

const SignoffItemSchema = new Schema<ISignoffItem>({
  department: { type: String, required: true },
  status: { type: String, default: "Pending" },
  comment: { type: String, default: "" },
  date: { type: Date, default: null },

  // ✅ ADD THESE
  history: [HistorySchema],
  currentStatus: { type: String, default: "Pending" },
});

const SignoffSchema = new Schema<ISignoff>(
  {
    applicationId: { type: String, required: true },
    signoffs: [SignoffItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ISignoff>("Signoff", SignoffSchema);