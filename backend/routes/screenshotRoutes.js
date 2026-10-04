const express = require("express");
const multer = require("multer");
const router = express.Router();

const { analyzeScreenshot } = require("../controllers/screenshotController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPG, JPEG or WEBP images are allowed."));
    }

    cb(null, true);
  }
});

router.post("/analyze", (req, res, next) => {
  upload.single("screenshot")(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Screenshot must be 5 MB or smaller."
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Invalid screenshot upload."
      });
    }

    next();
  });
}, analyzeScreenshot);

module.exports = router;
