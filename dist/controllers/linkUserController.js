"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkedUser = exports.linkUser = void 0;
const linkUser_1 = __importDefault(require("../models/linkUser"));
// ✅ LINK USER
const linkUser = async (req, res) => {
    try {
        const { applicationId, userId } = req.body;
        if (!applicationId || !userId) {
            return res.status(400).json({ message: "Missing fields" });
        }
        let existing = await linkUser_1.default.findOne({ applicationId });
        if (existing) {
            existing.userId = userId;
            await existing.save();
            return res.status(200).json({
                message: "User updated successfully",
                data: existing,
            });
        }
        const newLink = await linkUser_1.default.create({
            applicationId,
            userId,
        });
        return res.status(201).json({
            message: "User linked successfully",
            data: newLink,
        });
    }
    catch (error) {
        console.error("Link User Error:", error);
        return res.status(500).json({
            message: "Error linking user",
            error,
        });
    }
};
exports.linkUser = linkUser;
// ✅ GET LINKED USER
const getLinkedUser = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const data = await linkUser_1.default.findOne({ applicationId });
        return res.status(200).json({
            applicationId,
            userId: data?.userId || null,
        });
    }
    catch (error) {
        console.error("Get Link User Error:", error);
        return res.status(500).json({
            message: "Error fetching linked user",
            error,
        });
    }
};
exports.getLinkedUser = getLinkedUser;
