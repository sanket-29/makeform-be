import { Request, Response } from "express";
import Admin from "../models/adminlogin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendEmail";

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ❗ Ensure email exists
    if (!admin.email) {
      return res.status(400).json({ message: "Email not configured for this user" });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Save OTP in DB
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
    await admin.save();

    // ✅ Send OTP via email
    await sendOtpEmail(admin.email, otp);

    return res.status(200).json({
      message: "OTP sent to your email",
      username: admin.username,
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { username, otp } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Check OTP
    if (
      admin.otp !== otp ||
      !admin.otpExpiry ||
      Date.now() > admin.otpExpiry
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Clear OTP
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    // ✅ NOW generate JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: admin._id,
        username: admin.username,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};