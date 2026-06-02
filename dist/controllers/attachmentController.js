"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.getFiles = exports.uploadFiles = void 0;
const attachment_1 = __importDefault(require("../models/attachment"));
const uploadFiles = async (req, res) => {
    try {
        const files = req.files;
        const { applicationId, attName } = req.body;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        if (!applicationId) {
            return res.status(400).json({ message: "applicationId required" });
        }
        const savedFiles = await Promise.all(files.map((file) => attachment_1.default.create({
            applicationId,
            attName: attName || "attachment",
            fileName: file.originalname,
            filePath: file.path,
        })));
        res.status(200).json(savedFiles);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload failed" });
    }
};
exports.uploadFiles = uploadFiles;
const getFiles = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const files = await attachment_1.default.find({ applicationId })
            .sort({ createdAt: -1 });
        res.status(200).json(files);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch files" });
    }
};
exports.getFiles = getFiles;
const deleteAttachment = async (req, res) => {
    try {
        const { id } = req.params;
        await attachment_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};
exports.deleteAttachment = deleteAttachment;
