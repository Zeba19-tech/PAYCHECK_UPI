const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    rating: Number,
    message: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
