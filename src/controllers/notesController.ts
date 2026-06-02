import { Request, Response } from "express";
import Note from "../models/notes";

/* =========================
   CREATE NOTE
========================= */
export const createNote = async (req: Request, res: Response) => {
  try {
    const {applicationId, note, markAsRead } = req.body;

     if (!applicationId) {
      return res.status(400).json({
        message: "Application ID required",
      });
    }
    if (!note && markAsRead) {
      return res.status(200).json({
        message: "Marked as read (no DB entry)",
      });
    }

    if (!note) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    const newNote = await Note.create({
      applicationId,
      note,
      markAsRead,
    
    });

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error });
  }
};


export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note, markAsRead  } = req.body;

    const updated = await Note.findByIdAndUpdate(
      id,
      { note, markAsRead },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error });
  }
};
/* =========================
   GET ALL NOTES
========================= */
export const getNotes = async (req: Request, res: Response) => {
  try {
     const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        message: "Application ID required",
      });
    }
   const notes = await Note.find({ applicationId }).sort({
      createdAt: -1,
    });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error });
  }
};

/* =========================
   DELETE NOTE
========================= */
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Note.findByIdAndDelete(id);

    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error });
  }
};