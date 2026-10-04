const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },

    reporterName: {
      type: String,
      trim: true,
      default: "Anonymous"
    },

    contact: {
      type: String,
      trim: true,
      default: ""
    },

    scamType: {
      type: String,
      required: true,
      trim: true
    },

    suspiciousValue: {
      type: String,
      trim: true,
      default: ""
    },

    amount: {
      type: Number,
      default: 0
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "UNKNOWN"],
      default: "UNKNOWN"
    },

    evidence: {
      type: String,
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Resolved"],
      default: "Submitted"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Report", reportSchema);