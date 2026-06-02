import express from "express";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: "Welcome Admin ✅" });
});

export default router;