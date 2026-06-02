"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const adminlogin_1 = __importDefault(require("./models/adminlogin"));
dotenv_1.default.config();
const seed = async () => {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    const hashedPassword = await bcryptjs_1.default.hash("123", 10);
    await adminlogin_1.default.create({
        username: "admin",
        password: hashedPassword,
    });
    console.log("Admin inserted ✅");
    process.exit();
};
seed();
