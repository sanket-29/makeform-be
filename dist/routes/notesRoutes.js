"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notesController_1 = require("../controllers/notesController");
const router = express_1.default.Router();
router.post("/", notesController_1.createNote);
router.get("/:applicationId", notesController_1.getNotes);
router.delete("/:id", notesController_1.deleteNote);
router.put("/:id", notesController_1.updateNote);
exports.default = router;
