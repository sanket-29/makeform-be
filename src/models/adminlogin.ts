import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Number },
});

export default mongoose.model("AdminLogin", adminSchema);