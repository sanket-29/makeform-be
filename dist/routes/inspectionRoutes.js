"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inspectionController_1 = require("../controllers/inspectionController");
const router = express_1.default.Router();
/* Schedule */
router.post("/schedule", inspectionController_1.createSchedule);
router.get("/schedule", inspectionController_1.getSchedules);
/* Inspection */
router.post("/inspection", inspectionController_1.createInspection);
router.get("/inspection", inspectionController_1.getInspections);
exports.default = router;
