"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feeController_1 = require("../controllers/feeController");
const router = express_1.default.Router();
router.post("/calculator", feeController_1.submitCalculator);
router.get("/records", feeController_1.getFeeRecords);
router.delete("/records/:id", feeController_1.deleteFeeRecord);
router.post("/pay", feeController_1.payFee);
router.get("/history", feeController_1.getPaymentHistory);
router.delete("/history/:id", feeController_1.deletePaymentRecord);
exports.default = router;
