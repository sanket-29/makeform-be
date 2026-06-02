import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return ["general", "residential", "commercial"].includes(v);
        },
        message: "Invalid form type",
      },

    },

    data: {
      type: Object,
      required: true,
    },

    rawData: {
      type: Array,
      required: true,
    },

    responseId: {
      type: String,
      required: true,
    },

    formId: {
      type: String,
      required: true,
    },

    formCode: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);