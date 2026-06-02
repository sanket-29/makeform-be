"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const permitController_1 = require("../controllers/permitController");
const router = express_1.default.Router();
router.post("/save", permitController_1.savePermit);
router.get("/:applicationId", permitController_1.getPermitByApplication);
exports.default = router;
