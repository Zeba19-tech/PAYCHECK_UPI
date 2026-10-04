const Feedback = require("../models/Feedback");

async function createFeedback(req, res, next) {
  try {
    const { name, email, rating, message } = req.body || {};

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Feedback message is required."
      });
    }

    if (Feedback.db?.readyState === 1) {
      await Feedback.create({
        name: name || "Anonymous",
        email: email || "",
        rating: Number(rating || 5),
        message: message.trim()
      });
    }

    res.json({
      success: true,
      message: "Thank you. Your feedback has been recorded."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createFeedback };
