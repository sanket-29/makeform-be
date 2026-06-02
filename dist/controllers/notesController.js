"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.getNotes = exports.updateNote = exports.createNote = void 0;
const notes_1 = __importDefault(require("../models/notes"));
/* =========================
   CREATE NOTE
========================= */
const createNote = async (req, res) => {
    try {
        const { applicationId, note, markAsRead } = req.body;
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
        const newNote = await notes_1.default.create({
            applicationId,
            note,
            markAsRead,
        });
        res.status(201).json(newNote);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating note", error });
    }
};
exports.createNote = createNote;
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note, markAsRead } = req.body;
        const updated = await notes_1.default.findByIdAndUpdate(id, { note, markAsRead }, { new: true });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating note", error });
    }
};
exports.updateNote = updateNote;
/* =========================
   GET ALL NOTES
========================= */
const getNotes = async (req, res) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) {
            return res.status(400).json({
                message: "Application ID required",
            });
        }
        const notes = await notes_1.default.find({ applicationId }).sort({
            createdAt: -1,
        });
        res.status(200).json(notes);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching notes", error });
    }
};
exports.getNotes = getNotes;
/* =========================
   DELETE NOTE
========================= */
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        await notes_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Note deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting note", error });
    }
};
exports.deleteNote = deleteNote;
