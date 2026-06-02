import express from "express";
import {
getTransactionDetails
} from "../controllers/transactionController";

const router = express.Router();

router.get("/:applicationId", getTransactionDetails);

export default router;