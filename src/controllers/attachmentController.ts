import { Request, Response } from "express";
import Attachment from "../models/attachment";

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { applicationId, attName } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (!applicationId) {
      return res.status(400).json({ message: "applicationId required" });
    }

    const savedFiles = await Promise.all(
      files.map((file) =>
        Attachment.create({
          applicationId,
          attName: attName || "attachment",
          fileName: file.originalname,
          filePath: file.path,
        })
      )
    );

    res.status(200).json(savedFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    const files = await Attachment.find({ applicationId })
      .sort({ createdAt: -1 });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files" });
  }
};


export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Attachment.findByIdAndDelete(id);

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};