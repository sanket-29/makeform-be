import mongoose from "mongoose";

const linkUserSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("LinkUser", linkUserSchema);