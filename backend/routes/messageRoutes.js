const express = require("express");
const router = express.Router();
const { analyzeMessage } = require("../controllers/messageController");

router.post("/analyze", analyzeMessage);

module.exports = router;
