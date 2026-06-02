"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = void 0;
const chat_1 = __importDefault(require("../models/chat"));
const mongoose_1 = __importDefault(require("mongoose"));
// ✅ Send message
const sendMessage = async (req, res) => {
    try {
        const { applicationId, sender, message } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ error: "Invalid applicationId" });
        }
        const chat = await chat_1.default.create({
            applicationId,
            sender,
            message,
        });
        res.status(201).json(chat);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.sendMessage = sendMessage;
// ✅ Get messages by application
const getMessages = async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        if (!mongoose_1.default.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ error: "Invalid applicationId" });
        }
        const chats = await chat_1.default.find({
            applicationId: applicationId,
        }).sort({ createdAt: 1 });
        res.json(chats);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMessages = getMessages;
