import express from "express";
import { upload } from "../middleware/upload";
import { uploadFiles, getFiles, deleteAttachment } from "../controllers/attachmentController";
const router = express.Router();

router.post("/upload", upload.array("files"), uploadFiles);
router.get("/:applicationId", getFiles);
router.delete("/:id", deleteAttachment);

export default router;