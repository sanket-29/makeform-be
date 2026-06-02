import mongoose from "mongoose";

const scheduleInspectionSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
    },
    inspectorName: { type: String, required: true },
    inspectionType: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    comment: { type: String },
    status: {
      type: String,
      default: "Scheduled",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ScheduleInspection", scheduleInspectionSchema);
