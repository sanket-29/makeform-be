"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.loginAdmin = void 0;
const adminlogin_1 = __importDefault(require("../models/adminlogin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../utils/sendEmail");
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await adminlogin_1.default.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: "User not found" });
        }
        // ✅ compare password
        const isMatch = await bcryptjs_1.default.compare(password, admin.password);
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
        await (0, sendEmail_1.sendOtpEmail)(admin.email, otp);
        return res.status(200).json({
            message: "OTP sent to your email",
            username: admin.username,
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};
exports.loginAdmin = loginAdmin;
const verifyOtp = async (req, res) => {
    try {
        const { username, otp } = req.body;
        const admin = await adminlogin_1.default.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: "User not found" });
        }
        // ✅ Check OTP
        if (admin.otp !== otp ||
            !admin.otpExpiry ||
            Date.now() > admin.otpExpiry) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        // ✅ Clear OTP
        admin.otp = undefined;
        admin.otpExpiry = undefined;
        await admin.save();
        // ✅ NOW generate JWT
        const token = jsonwebtoken_1.default.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            token,
            user: {
                id: admin._id,
                username: admin.username,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error",
        });
    }
};
exports.verifyOtp = verifyOtp;
