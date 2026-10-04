const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log("ℹ️ MongoDB URI not configured. Running without database persistence.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log("🍃 MongoDB Connected");
    return true;
  } catch (error) {
    console.warn("⚠️ MongoDB connection unavailable. Server will continue without DB.");
    console.warn(error.message);
    return false;
  }
}

module.exports = connectDatabase;
