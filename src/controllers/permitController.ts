import { Request, Response } from "express";
import Permit from "../models/permit";
import Application from "../models/application";
import PaymentRecord from "../models/paymentRecord";


const generatePermitNo = async (applicationId: string, seq: number) => {
  const app = await Application.findById(applicationId);

  const formType = app?.formType || "general";

  let prefix = "GEN";
  if (formType === "building") prefix = "B";
  if (formType === "residential") prefix = "RES";
  if (formType === "commercial") prefix = "COM";

  const year = new Date().getFullYear().toString().slice(-2);

  const number = seq.toString().padStart(4, "0");

  return `${prefix}-${year}-${number}`;
};
// ✅ SAVE / UPDATE PERMIT
export const savePermit = async (req: Request, res: Response) => {
  try {
    const { applicationId, remarks, issueDate, signature } = req.body;

     let permit = await Permit.findOne({ applicationId });

    // ✅ IF NEW → GENERATE SEQUENCE
    if (!permit) {
      const lastPermit = await Permit.findOne().sort({ sequenceNumber: -1 });

      const nextSeq = lastPermit?.sequenceNumber
        ? lastPermit.sequenceNumber + 1
        : 1;

      const permitNo = await generatePermitNo(applicationId, nextSeq);

      permit = await Permit.create({
        applicationId,
        sequenceNumber: nextSeq,
        permitNo,
        remarks,
        issueDate,
        signature,
      });
    }else {

     permit = await Permit.findOneAndUpdate(
      { applicationId },
      {
        remarks,
        issueDate,
        signature,
      },
      { new: true }
    );
}

    res.json({
      success: true,
      permit,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ GET PERMIT + APPLICATION DATA (for autofill)
export const getPermitByApplication = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // ✅ Normalize IDs
    const responseId = application.responseId;
    const mongoId = application._id.toString();

    
    const permit = await Permit.findOne({ applicationId });

    
    const payment = await PaymentRecord.findOne({ applicationId })
    .sort({ createdAt: -1 });

    console.log("REQ ID:", applicationId);
    console.log("RESPONSE ID:", responseId);
    console.log("MONGO ID:", mongoId);
    console.log("PAYMENT:", payment);

    res.json({
      success: true,
      permit,
      application,
      payment,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};