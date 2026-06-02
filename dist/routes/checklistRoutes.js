"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checklistController_1 = require("../controllers/checklistController");
const router = express_1.default.Router();
router.post("/submit", checklistController_1.submitChecklist);
router.get("/:applicationId", checklistController_1.getChecklist);
router.post("/verify", checklistController_1.verifyItem);
router.post("/finalize", checklistController_1.finalizeChecklist);
exports.default = router;
