import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  saveEstablishment,
  saveLicenses,
  saveDesigner,
  saveInstaller,
  saveAffidavit,
  getAllUsers
} from "../controllers/userController";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getUserProfile);
router.post("/establishment", verifyToken, saveEstablishment);
router.post("/affidavit", verifyToken, saveAffidavit);
router.post("/licenses", verifyToken, saveLicenses);
router.post("/designer", verifyToken, saveDesigner);
router.post("/installer", verifyToken, saveInstaller);
router.get("/", getAllUsers);

export default router;