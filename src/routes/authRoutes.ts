import express from "express";
import { loginAdmin, verifyOtp } from "../controllers/authController";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/verify-otp", verifyOtp);

export default router;