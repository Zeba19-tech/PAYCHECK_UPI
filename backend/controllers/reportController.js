const Report = require("../models/Report");

function generateReportId() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `PCU-${timestamp}-${random}`;
}

// CREATE REPORT
exports.createReport = async (req, res) => {
  try {
    const {
      reporterName,
      contact,
      scamType,
      suspiciousValue,
      amount,
      description,
      riskLevel,
      evidence
    } = req.body;

    if (!scamType) {
      return res.status(400).json({
        success: false,
        message: "Scam type is required"
      });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a detailed description"
      });
    }

    const report = await Report.create({
      reportId: generateReportId(),

      reporterName:
        reporterName?.trim() || "Anonymous",

      contact:
        contact?.trim() || "",

      scamType:
        scamType.trim(),

      suspiciousValue:
        suspiciousValue?.trim() || "",

      amount:
        Number(amount) || 0,

      description:
        description.trim(),

      riskLevel:
        ["LOW", "MEDIUM", "HIGH", "UNKNOWN"].includes(
          riskLevel
        )
          ? riskLevel
          : "UNKNOWN",

      evidence:
        evidence?.trim() || "",

      status: "Submitted"
    });

    return res.status(201).json({
      success: true,
      message: "Scam report submitted successfully",
      data: report
    });
  } catch (error) {
    console.error("Create report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit report"
    });
  }
};

// GET ALL REPORTS
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Get reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reports"
    });
  }
};

// GET SINGLE REPORT
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      reportId: req.params.reportId
    }).lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Get report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch report"
    });
  }
};

// UPDATE STATUS
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Submitted",
      "Under Review",
      "Resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status"
      });
    }

    const report = await Report.findOneAndUpdate(
      {
        reportId: req.params.reportId
      },
      {
        status
      },
      {
        new: true
      }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.json({
      success: true,
      message: "Report status updated",
      data: report
    });
  } catch (error) {
    console.error("Update report status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update report status"
    });
  }
};
