"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.saveInstaller = exports.saveDesigner = exports.saveAffidavit = exports.saveEstablishment = exports.saveLicenses = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const application_1 = __importDefault(require("../models/application"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const user = new user_1.default({
            name,
            email,
            password: hashedPassword,
        });
        await user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await user_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Compare password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};
exports.loginUser = loginUser;
const getUserProfile = async (req, res) => {
    try {
        const decodedUser = req.user;
        if (!decodedUser || !decodedUser.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await user_1.default.findById(decodedUser.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Fetch user's applications
        const applications = await application_1.default.find({ userId: decodedUser.id }).sort({ createdAt: -1 });
        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            establishment: user.establishment,
            license: user.license,
            affidavit: user.affidavit,
            designer: user.designer,
            installer: user.installer,
            applications: applications,
        });
    }
    catch (error) {
        console.error("Profile Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getUserProfile = getUserProfile;
const saveLicenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { businessName, licenses, license } = req.body;
        const licenseItems = Array.isArray(licenses) ? licenses : license;
        if (!licenseItems || !Array.isArray(licenseItems) || licenseItems.length === 0) {
            return res.status(400).json({ message: "At least one license required" });
        }
        for (const lic of licenseItems) {
            if (!lic.licenseType || !lic.licenseNumber || !lic.licenseExpiration) {
                return res.status(400).json({ message: "License fields missing" });
            }
        }
        const user = await user_1.default.findByIdAndUpdate(userId, {
            license: {
                businessName,
                licenses: licenseItems,
            },
        }, { returnDocument: "after" });
        return res.json({ message: "Licenses saved", data: user });
    }
    catch (error) {
        console.error("License Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.saveLicenses = saveLicenses;
const saveEstablishment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { establishment, propertyOwner, businessOwner } = req.body;
        // ❗ Required validation
        if (!establishment?.name ||
            !establishment?.streetName ||
            !establishment?.streetNumber ||
            !establishment?.city ||
            !establishment?.state ||
            !establishment?.zip ||
            establishment?.manualAddressEntry === undefined) {
            return res.status(400).json({ message: "Establishment required fields missing" });
        }
        if (!businessOwner?.name ||
            !businessOwner?.streetNumber ||
            !businessOwner?.streetName ||
            !businessOwner?.city ||
            !businessOwner?.state ||
            !businessOwner?.zip ||
            businessOwner?.sameAsPropertyOwner === undefined) {
            return res.status(400).json({ message: "Business Owner required fields missing" });
        }
        const establishmentObj = {
            establishmentDetails: establishment,
            businessOwner,
        };
        if (propertyOwner &&
            Object.values(propertyOwner).some((v) => v)) {
            establishmentObj.propertyOwner = propertyOwner;
        }
        const user = await user_1.default.findByIdAndUpdate(userId, { establishment: establishmentObj }, { returnDocument: "after" });
        return res.json({ message: "Establishment saved", data: user });
    }
    catch (error) {
        console.error("Establishment Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.saveEstablishment = saveEstablishment;
const saveAffidavit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { isSoleProprietor, employerStatus, insuranceCompany, policyNumber, policyExpiration, employerEmployeeCount, } = req.body;
        if (typeof isSoleProprietor !== "boolean" || !employerStatus) {
            return res.status(400).json({ message: "Affidavit required fields missing" });
        }
        const affidavitData = {
            isSoleProprietor,
            employerStatus,
        };
        if (employerStatus === "employer") {
            if (!insuranceCompany ||
                !policyNumber ||
                !policyExpiration ||
                employerEmployeeCount === undefined ||
                employerEmployeeCount === null) {
                return res.status(400).json({ message: "Affidavit insurance fields missing for employer" });
            }
            affidavitData.insuranceCompany = insuranceCompany;
            affidavitData.policyNumber = policyNumber;
            affidavitData.policyExpiration = policyExpiration;
            affidavitData.employerEmployeeCount = employerEmployeeCount;
        }
        else {
            if (insuranceCompany || policyNumber || policyExpiration || employerEmployeeCount !== undefined) {
                affidavitData.insuranceCompany = insuranceCompany;
                affidavitData.policyNumber = policyNumber;
                affidavitData.policyExpiration = policyExpiration;
                affidavitData.employerEmployeeCount = employerEmployeeCount;
            }
        }
        const user = await user_1.default.findByIdAndUpdate(userId, { affidavit: affidavitData }, { returnDocument: "after" });
        return res.json({ message: "Affidavit saved", data: user });
    }
    catch (error) {
        console.error("Affidavit Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.saveAffidavit = saveAffidavit;
const saveDesigner = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sameAsApplicant, designer } = req.body;
        const updateData = {};
        if (designer && Object.keys(designer).length > 0) {
            updateData.designer = {
                sameAsApplicant,
                data: designer,
            };
        }
        const user = await user_1.default.findByIdAndUpdate(userId, updateData, { returnDocument: "after" });
        return res.json({ message: "Designer saved", data: user });
    }
    catch (error) {
        console.error("Designer Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.saveDesigner = saveDesigner;
const saveInstaller = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sameAsApplicant, installer } = req.body;
        const updateData = {};
        if (installer && Object.keys(installer).length > 0) {
            updateData.installer = {
                sameAsApplicant,
                data: installer,
            };
        }
        const user = await user_1.default.findByIdAndUpdate(userId, updateData, { returnDocument: "after" });
        return res.json({ message: "Installer saved", data: user });
    }
    catch (error) {
        console.error("Installer Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.saveInstaller = saveInstaller;
const getAllUsers = async (req, res) => {
    try {
        const users = await user_1.default.find().select("_id name email establishment");
        // 🔥 map clean response (important for UI)
        const formattedUsers = users.map((user) => ({
            _id: user._id,
            name: user.name,
            username: user.name, // since you don't have username field
            email: user.email,
            address: user.establishment
                ? `${user.establishment.establishmentDetails?.streetNumber || ""} 
           ${user.establishment.establishmentDetails?.streetName || ""}`
                : "N/A",
        }));
        res.json(formattedUsers);
    }
    catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
};
exports.getAllUsers = getAllUsers;
