import Chat from "../models/chat";
import { Request, Response } from "express";
import mongoose from "mongoose";

// ✅ Send message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { applicationId, sender, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ error: "Invalid applicationId" });
    }

    const chat = await Chat.create({
      applicationId,
      sender,
      message,
    });

    res.status(201).json(chat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get messages by application
export const getMessages = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.applicationId as string;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ error: "Invalid applicationId" });
    }

    const chats = await Chat.find({
      applicationId: applicationId,
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};