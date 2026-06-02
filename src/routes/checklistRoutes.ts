import express from "express";
import {
  submitChecklist,
  verifyItem,
  finalizeChecklist,
  getChecklist,
} from "../controllers/checklistController";

const router = express.Router();

router.post("/submit", submitChecklist);
router.get("/:applicationId", getChecklist);
router.post("/verify", verifyItem);
router.post("/finalize", finalizeChecklist);

export default router;