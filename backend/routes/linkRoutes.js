const express = require("express");
const router = express.Router();
const { checkLink } = require("../controllers/linkController");

router.post("/check", checkLink);

module.exports = router;
