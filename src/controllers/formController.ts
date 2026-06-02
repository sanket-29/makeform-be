import ApplicationForm from "../models/application";


export const submitApplicationForm = async (req: any, res: any) => {
  try {
    const { data, responseId, customData, status } = req.body;

    // console.log("customHeaders : ", customData);
    // console.log("request body : ", req.body);

    const formType = req.params.formType || "general";

    //  Convert array → object
    const formattedData = Object.fromEntries(
      data.map((item: any) => [
        item.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .split(/\s+/)
          .slice(0, 5)
          .join("_"),
        item.value,
      ])
    );

    // 🔥 Find existing form (for edit case)
    const existingForm = await ApplicationForm.findOne({ responseId });

    const formId =
      customData?.formId || existingForm?.formId || "";

    const formCode =
      customData?.formCode || existingForm?.formCode || "";

    if (!formId || !formCode) {
      return res.status(400).json({
        success: false,
        message: "Missing formId or formCode",
      });
    }

    // 🔥 UPSERT (update if exists, else create)
    const form = await ApplicationForm.findOneAndUpdate(
      { responseId },
      {
        formType,
        data: formattedData,
        rawData: data,
        responseId,
        formId,
        formCode,
        ...(req.user?.id && { userId: req.user.id }),
        status: typeof status === "string" ? status : null,
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Application saved successfully",
      form,
    });

  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Error saving application",
      error: error.message,
    });
  }
};


export const updateApplicationStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (typeof status !== "string") {
      return res.status(400).json({ success: false, message: "Status is required" });
    }
    const updated = await ApplicationForm.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, message: "Status updated", application: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

export const getForms = async (req:any, res:any) => {
  try {
    const forms = await ApplicationForm.find().sort({ createdAt: -1 });

    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
 
export const getFormById = async (req:any, res:any) => {
  try {
    const form = await ApplicationForm.findById(req.params.id);

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteForm = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deletedForm = await ApplicationForm.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting application",
      error: error.message,
    });
  }
};