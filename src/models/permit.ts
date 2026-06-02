import mongoose from "mongoose";

const permitSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
    },

    // ✅ NEW AUTO INCREMENT FIELD
    sequenceNumber: {
      type: Number,
    },

    permitNo: String,

    remarks: String,
    issueDate: String,
    signature: String,
    fee: String,
  },
  { timestamps: true }
);

export default mongoose.model("Permit", permitSchema);