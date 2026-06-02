"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const linkUserController_1 = require("../controllers/linkUserController");
const router = express_1.default.Router();
router.post("/link", linkUserController_1.linkUser);
router.get("/:applicationId", linkUserController_1.getLinkedUser);
exports.default = router;
