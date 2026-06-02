"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, cc, subject, html) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            cc: cc || undefined,
            subject,
            html,
        });
        console.log("✅ Email sent successfully");
        return { success: true };
    }
    catch (error) {
        console.log("❌ Email error:", error);
        return { success: false, error };
    }
};
exports.sendEmail = sendEmail;
const sendOtpEmail = async (to, otp) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: "Your OTP Code",
            html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
        });
        console.log("✅ OTP email sent");
    }
    catch (error) {
        console.log("❌ Email error:", error);
    }
};
exports.sendOtpEmail = sendOtpEmail;
