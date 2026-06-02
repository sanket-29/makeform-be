"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/register", userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.get("/profile", auth_middleware_1.verifyToken, userController_1.getUserProfile);
router.post("/establishment", auth_middleware_1.verifyToken, userController_1.saveEstablishment);
router.post("/affidavit", auth_middleware_1.verifyToken, userController_1.saveAffidavit);
router.post("/licenses", auth_middleware_1.verifyToken, userController_1.saveLicenses);
router.post("/designer", auth_middleware_1.verifyToken, userController_1.saveDesigner);
router.post("/installer", auth_middleware_1.verifyToken, userController_1.saveInstaller);
router.get("/", userController_1.getAllUsers);
exports.default = router;
