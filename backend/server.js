const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDatabase = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const upiRoutes = require("./routes/upiRoutes");
const linkRoutes = require("./routes/linkRoutes");
const messageRoutes = require("./routes/messageRoutes");
const screenshotRoutes = require("./routes/screenshotRoutes");
const reportRoutes = require("./routes/reportRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PayCheck UPI Backend is Running 🚀",
    team: "SecureSix",
    project: "PayCheck UPI"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ONLINE",
    service: "PayCheck UPI Backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/upi", upiRoutes);
app.use("/api/link", linkRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/screenshot", screenshotRoutes);


app.use("/api/report", reportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 PayCheck UPI Backend running on port ${PORT}`);
});
}

startServer();
