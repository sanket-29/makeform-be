"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signOffController_1 = require("../controllers/signOffController");
const router = (0, express_1.Router)();
router.post("/assign", signOffController_1.assignSignoffs);
router.post("/update", signOffController_1.updateSignoff);
router.get("/:applicationId", signOffController_1.getSignoffs);
exports.default = router;
