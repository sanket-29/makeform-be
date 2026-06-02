import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
     applicationId: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    markAsRead: {
      type: Boolean,
      default: false,
    },
    receivedBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Note", noteSchema);