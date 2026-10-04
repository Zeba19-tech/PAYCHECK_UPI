const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["upi", "link", "message", "screenshot"],
      required: true
    },
    inputPreview: {
      type: String,
      default: ""
    },
    riskLevel: {
      type: String,
      default: "UNKNOWN"
    },
    score: {
      type: Number,
      default: 0
    },
    warnings: {
      type: [String],
      default: []
    },
    matchedIndicators: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", AnalysisSchema);
