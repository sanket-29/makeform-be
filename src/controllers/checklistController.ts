import { Request, Response } from "express";
import Checklist from "../models/checklist";

// Create / Submit checklist (initial)
export const submitChecklist = async (req: Request, res: Response) => {
  try {
    const { applicationId, items } = req.body;

    if (!applicationId || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    let checklist = await Checklist.findOne({ applicationId });

    const cleanedItems = items.filter(
      (item: any) => item?.text && item?.submitted
    );

    if (checklist) {
      // MERGE instead of overwrite
      const existingItems = checklist.items || [];

      const mergedItems = cleanedItems.map((newItem: any) => {
        const existing = existingItems.find(
          (e: any) => e.text === newItem.text
        );

        return existing || newItem;
      });

      checklist.items = mergedItems as any;

      await checklist.save();

      return res.status(200).json({
        message: "Checklist updated successfully",
        data: checklist,
      });
    }

    // ✅ CREATE NEW
    checklist = await Checklist.create({
      applicationId,
      items: cleanedItems,
    });

    return res.status(201).json({
      message: "Checklist created successfully",
      data: checklist,
    });
  } catch (error) {
    console.error("Submit Checklist Error:", error);
    return res.status(500).json({
      message: "Error submitting checklist",
      error,
    });
  }
};

// ✅ Verify item
export const verifyItem = async (req: Request, res: Response) => {
  try {
    const { checklistId, itemId, verified } = req.body;

    if (!checklistId || !itemId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const checklist = await Checklist.findById(checklistId);

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    const item = checklist.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.verified = verified;

    await checklist.save();

    return res.status(200).json({
      message: "Item verified successfully",
      data: checklist,
    });
  } catch (error) {
    console.error("Verify Checklist Error:", error);
    return res.status(500).json({
      message: "Verification failed",
      error,
    });
  }
};

// ✅ Finalize verified items
export const finalizeChecklist = async (req: Request, res: Response) => {
  try {
    const { checklistId } = req.body;

    if (!checklistId) {
      return res.status(400).json({ message: "Checklist ID required" });
    }

    const checklist = await Checklist.findById(checklistId);

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    checklist.items.forEach((item: any) => {
      if (item.verified) {
        item.finalized = true;
      }
    });

    await checklist.save();

    return res.status(200).json({
      message: "Checklist finalized successfully",
      data: checklist,
    });
  } catch (error) {
    console.error("Finalize Checklist Error:", error);
    return res.status(500).json({
      message: "Finalize failed",
      error,
    });
  }
};

// ✅ Get checklist
export const getChecklist = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID required" });
    }

    const checklist = await Checklist.findOne({ applicationId });

    // ✅ RETURN EMPTY STRUCTURE (like signoff)
    if (!checklist) {
      return res.status(200).json({
        applicationId,
        items: [],
      });
    }

    return res.status(200).json({
      message: "Checklist fetched successfully",
      data: checklist,
    });
  } catch (error) {
    console.error("Get Checklist Error:", error);
    return res.status(500).json({
      message: "Error fetching checklist",
      error,
    });
  }
};