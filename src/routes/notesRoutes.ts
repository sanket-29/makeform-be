import express from "express";
import {
  createNote,
  getNotes,
  deleteNote,
  updateNote,
} from "../controllers/notesController";

const router = express.Router();

router.post("/", createNote);
router.get("/:applicationId", getNotes);
router.delete("/:id", deleteNote);
router.put("/:id", updateNote);

export default router;