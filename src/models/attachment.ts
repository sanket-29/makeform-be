import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
    },
    attName: {
      type: String,
      default: "attachment",
    },
    fileName: String,
    filePath: String,
    uploadedOn: { type: Date, default: Date.now },
    origin: { type: String, default: "User Upload" },
  },
  { timestamps: true }
);

export default mongoose.model("Attachment", attachmentSchema);