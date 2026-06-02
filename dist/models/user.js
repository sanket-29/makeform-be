"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    establishment: {
        _id: false,
        establishmentDetails: {
            name: String,
            dba: String,
            streetName: String,
            streetNumber: String,
            mapBlockLot: String,
            city: String,
            state: String,
            zip: String,
            telephone: String,
            fax: String,
            manualAddressEntry: Boolean,
        },
        propertyOwner: {
            name: String,
            streetNumber: String,
            streetName: String,
            city: String,
            state: String,
            zip: String,
            telephone: String,
        },
        businessOwner: {
            sameAsPropertyOwner: Boolean,
            name: String,
            streetNumber: String,
            streetName: String,
            city: String,
            state: String,
            zip: String,
            telephone: String,
            email: String,
        },
    },
    license: {
        businessName: String,
        licenses: [
            {
                _id: false,
                licenseType: String,
                licenseNumber: String,
                licenseExpiration: Date,
            },
        ],
    },
    affidavit: {
        isSoleProprietor: Boolean,
        employerStatus: String,
        insuranceCompany: String,
        policyNumber: String,
        policyExpiration: Date,
        employerEmployeeCount: Number,
    },
    designer: {
        sameAsApplicant: Boolean,
        data: mongoose_1.default.Schema.Types.Mixed,
    },
    installer: {
        sameAsApplicant: Boolean,
        data: mongoose_1.default.Schema.Types.Mixed,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", userSchema);
