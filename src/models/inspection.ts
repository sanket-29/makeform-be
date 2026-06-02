import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
    },
    inspectorName: { type: String, required: true },
    inspectionType: { type: String, required: true },
    date: { type: String, required: true },
    result: { type: String, required: true },
    comment: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Inspection", inspectionSchema);
