"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sendEmail_1 = require("../utils/sendEmail");
const router = express_1.default.Router();
router.post("/send", async (req, res) => {
    try {
        const { to, cc, subject, message } = req.body;
        if (!to || !subject || !message) {
            return res.status(400).json({
                error: "Missing required fields: to, subject, message"
            });
        }
        const result = await (0, sendEmail_1.sendEmail)(to, cc, subject, message);
        if (result.success) {
            res.json({ success: true, message: "Email sent successfully" });
        }
        else {
            res.status(500).json({ error: "Failed to send email" });
        }
    }
    catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});
exports.default = router;
