import express from "express";
import {
  submitCalculator,
  getFeeRecords,
  deleteFeeRecord,
  payFee,
  getPaymentHistory,
  deletePaymentRecord,
} from "../controllers/feeController";

const router = express.Router();

router.post("/calculator", submitCalculator);
router.get("/records", getFeeRecords);
router.delete("/records/:id", deleteFeeRecord);
router.post("/pay", payFee);
router.get("/history", getPaymentHistory);
router.delete("/history/:id", deletePaymentRecord);

export default router;