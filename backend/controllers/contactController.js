const Contact = require("../models/Contact");

async function createContact(req, res, next) {
  try {
    const { name, email, message } = req.body || {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required."
      });
    }

    if (Contact.db?.readyState === 1) {
      await Contact.create({
        name: name.trim(),
        email: email.trim(),
        message: message.trim()
      });
    }

    res.json({
      success: true,
      message: "Your message has been received."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createContact };
