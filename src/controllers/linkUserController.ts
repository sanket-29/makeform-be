import { Request, Response } from "express";
import LinkUser from "../models/linkUser";

// ✅ LINK USER
export const linkUser = async (req: Request, res: Response) => {
  try {
    const { applicationId, userId } = req.body;

    if (!applicationId || !userId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let existing = await LinkUser.findOne({ applicationId });

    if (existing) {
      existing.userId = userId;
      await existing.save();

      return res.status(200).json({
        message: "User updated successfully",
        data: existing,
      });
    }

    const newLink = await LinkUser.create({
      applicationId,
      userId,
    });

    return res.status(201).json({
      message: "User linked successfully",
      data: newLink,
    });
  } catch (error) {
    console.error("Link User Error:", error);
    return res.status(500).json({
      message: "Error linking user",
      error,
    });
  }
};

// ✅ GET LINKED USER
export const getLinkedUser = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    const data = await LinkUser.findOne({ applicationId });

    return res.status(200).json({
      applicationId,
      userId: data?.userId || null,
    });
  } catch (error) {
    console.error("Get Link User Error:", error);
    return res.status(500).json({
      message: "Error fetching linked user",
      error,
    });
  }
};