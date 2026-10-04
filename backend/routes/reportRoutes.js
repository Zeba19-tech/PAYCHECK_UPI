const express = require("express");

const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus
} = require("../controllers/reportController");

const router = express.Router();

router.post("/", createReport);

router.get("/", getReports);

router.get("/:reportId", getReportById);

router.patch("/:reportId/status", updateReportStatus);

module.exports = router;