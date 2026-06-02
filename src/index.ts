import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import formRoutes from "./routes/formRoutes";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import signoffRoutes from "./routes/signOffRoutes";
import feeRoutes from "./routes/feeRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import userRoutes from "./routes/userRoutes";
import inspectionRoutes from "./routes/inspectionRoutes";
import permitRoutes from "./routes/permitRoutes";
import transactionRoutes from "./routes/transactionRoutes"
import noteRoutes from "./routes/notesRoutes";
import attachmentRoutes from "./routes/attachmentRoutes";
import chatRoutes from "./routes/chatRoutes";
import emailRoutes from "./routes/emailRoutes";
import linkUserRoutes from "./routes/linkUserRoutes";
import overviewRoutes from "./routes/overviewRoutes";
import reportRoutes from "./routes/reportRoutes";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/form", formRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", protectedRoutes);
app.use("/api/signoffs", signoffRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/inspection", inspectionRoutes);
app.use("/api/permit", permitRoutes);
app.use("/api/transactions",transactionRoutes)
app.use("/api/notes", noteRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/chat", chatRoutes);
app.use("/api/email", emailRoutes);

app.use("/api/link-user", linkUserRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
