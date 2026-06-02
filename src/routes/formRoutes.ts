import express from "express";
import { submitApplicationForm, getForms, getFormById, deleteForm, updateApplicationStatus } from "../controllers/formController";
import ApplicationForm from "../models/application";

const router = express.Router();

// Specific routes first - order matters!
router.post("/application/:formType", submitApplicationForm);
router.post("/application/:id/status", updateApplicationStatus);

// Get application by ID - for frontend to fetch and generate email templates
router.get("/application/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const application = await ApplicationForm.findById(id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    
    res.json({ success: true, application });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error fetching application", error: error.message });
  }
});

router.get("/getForms", getForms);

router.get("/:id", getFormById);
router.delete("/delete/:id", deleteForm);

export default router;