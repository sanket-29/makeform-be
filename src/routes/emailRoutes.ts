import express from "express";
import { sendEmail } from "../utils/sendEmail";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { to, cc, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ 
        error: "Missing required fields: to, subject, message" 
      });
    }

    const result = await sendEmail(to, cc, subject, message);

    if (result.success) {
      res.json({ success: true, message: "Email sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;