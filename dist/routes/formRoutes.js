"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const formController_1 = require("../controllers/formController");
const application_1 = __importDefault(require("../models/application"));
const router = express_1.default.Router();
// Specific routes first - order matters!
router.post("/application/:formType", formController_1.submitApplicationForm);
router.post("/application/:id/status", formController_1.updateApplicationStatus);
// Get application by ID - for frontend to fetch and generate email templates
router.get("/application/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const application = await application_1.default.findById(id);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        res.json({ success: true, application });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching application", error: error.message });
    }
});
router.get("/getForms", formController_1.getForms);
router.get("/:id", formController_1.getFormById);
router.delete("/delete/:id", formController_1.deleteForm);
exports.default = router;
