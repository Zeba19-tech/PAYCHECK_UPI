const express = require("express");
const router = express.Router();
const { checkUpi, verificationStatus } = require("../controllers/upiController");

router.get("/verification-status", verificationStatus);
router.post("/check", checkUpi);

module.exports = router;
