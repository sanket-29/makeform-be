import signoffModel from "../models/signoff.model";
import Checklist from "../models/checklist";
import PayFee from "../models/paymentRecord";
import Inspection from "../models/inspection";
import IssuePermit from "../models/permit";

export const getTransactionDetails = async (req: any, res: any) => {
  try {
    const { applicationId } = req.params;

    // 🔹 Fetch all collections in parallel (faster 🚀)
    const [signoff, checklist, payment, permit, inspection] =
      await Promise.all([
        signoffModel.findOne({ applicationId: applicationId }),
        Checklist.findOne({ applicationId: applicationId }),
        PayFee.findOne({ applicationId: applicationId }),
        IssuePermit.findOne({ applicationId: applicationId }),
        Inspection.findOne({ applicationId: applicationId }),
      ]);

    // 🔹 Safe arrays (avoids TS errors ✅)
    const signoffList = signoff?.signoffs || [];
    const checklistItems = checklist?.items || [];

    // 🔹 Compute progress
    const progress = {
      signoffs:
        signoffList.length > 0 &&
        signoffList.every(
          (s: any) =>
            s.currentStatus && s.currentStatus !== "Pending"
        ),

      checklist:
        checklistItems.length > 0 &&
        checklistItems.every((i: any) => i.finalized === true),

      payfee: !!payment,

      permit: !!permit,

      inspection: !!inspection,
    };

    res.json({
      success: true,
      progress,

    });
  } catch (error: any) {
    console.error("Transaction Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching transaction progress",
      error: error.message,
    });
  }
};