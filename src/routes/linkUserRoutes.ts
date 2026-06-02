import express from "express";
import { linkUser, getLinkedUser } from "../controllers/linkUserController";

const router = express.Router();

router.post("/link", linkUser);
router.get("/:applicationId", getLinkedUser);

export default router;