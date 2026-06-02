import { Router } from "express";
import {
  assignSignoffs,
  updateSignoff,
  getSignoffs,
} from "../controllers/signOffController";

const router = Router();

router.post("/assign", assignSignoffs);
router.post("/update", updateSignoff);
router.get("/:applicationId", getSignoffs);

export default router;