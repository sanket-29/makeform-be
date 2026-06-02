"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("../middleware/upload");
const attachmentController_1 = require("../controllers/attachmentController");
const router = express_1.default.Router();
router.post("/upload", upload_1.upload.array("files"), attachmentController_1.uploadFiles);
router.get("/:applicationId", attachmentController_1.getFiles);
router.delete("/:id", attachmentController_1.deleteAttachment);
exports.default = router;
