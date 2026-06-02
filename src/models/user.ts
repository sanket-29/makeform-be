import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
      data: mongoose.Schema.Types.Mixed,
    },

    installer: {
      sameAsApplicant: Boolean,
      data: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);