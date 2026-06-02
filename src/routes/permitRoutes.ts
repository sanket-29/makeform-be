import express from "express";
import {
  savePermit,
  getPermitByApplication,
} from "../controllers/permitController";

const router = express.Router();

router.post("/save", savePermit);
router.get("/:applicationId", getPermitByApplication);

export default router;