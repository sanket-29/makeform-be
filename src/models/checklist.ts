import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  selected: { type: Boolean, default: false },
  submitted: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  finalized: { type: Boolean, default: false },
  attachment: { type: String, default: "" }, // file path or URL
  isCustom: { type: Boolean, default: false },
}, { timestamps: true });

const checklistSchema = new mongoose.Schema({
  applicationId: { type: String, required: true },
  items: [checklistItemSchema],
}, { timestamps: true });

export default mongoose.model("Checklist", checklistSchema);