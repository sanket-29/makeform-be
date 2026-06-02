import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import AdminLogin from "./models/adminlogin";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);

  const hashedPassword = await bcrypt.hash("123", 10);

  await AdminLogin.create({
    username: "admin",
    password: hashedPassword,
  });

  console.log("Admin inserted ✅");
  process.exit();
};

seed();