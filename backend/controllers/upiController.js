const { analyzeUpiId } = require("../utils/riskEngine");
const {
  verifyVpaLive,
  getVerificationConfig
} = require("../services/vpaVerificationService");

async function checkUpi(req, res, next) {
  try {
    const upiId = String(req.body?.upiId || "").trim();

    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: "Enter a UPI ID."
      });
    }

    // ---------------------------------------------------------
    // 1. Local suspicious-pattern/risk analysis
    // ---------------------------------------------------------
    const patternAssessment = analyzeUpiId(upiId);

    // ---------------------------------------------------------
    // 2. Optional live VPA verification
    // ---------------------------------------------------------
    const liveVerification = await verifyVpaLive(upiId);

    let finalScore = patternAssessment.score;
    let riskLevel = patternAssessment.riskLevel;

    const warnings = [...patternAssessment.warnings];
    const indicators = [...patternAssessment.matchedIndicators];

    // ---------------------------------------------------------
    // 3. If a real verification provider is available
    // ---------------------------------------------------------
    if (liveVerification.available) {
      if (liveVerification.verified) {
        warnings.unshift(
          `Live verification confirmed that this VPA is resolvable. Beneficiary name returned by the verification provider: ${
            liveVerification.accountName || "Not disclosed"
          }.`
        );

        indicators.unshift("Live VPA verified");

        // VPA resolution does NOT mean the recipient is trustworthy.
        finalScore = Math.min(finalScore, 35);
        riskLevel = finalScore >= 40 ? "MEDIUM" : "LOW";
      } else {
        warnings.unshift(
          "The configured live verification provider did not validate this VPA."
        );

        indicators.unshift("Live VPA not verified");

        finalScore = Math.max(finalScore, 70);
        riskLevel = "HIGH";
      }
    }

    // ---------------------------------------------------------
    // 4. No live provider
    // ---------------------------------------------------------
    else {
      // IMPORTANT:
      // Keep the LOCAL risk level.
      // Do NOT change LOW -> UNKNOWN.
      //
      // This means the user still gets a useful risk assessment,
      // while the UI clearly explains that bank-level VPA
      // verification is unavailable.

      warnings.unshift(
        "Live VPA verification is currently unavailable. This result is based only on local format and suspicious-pattern analysis and does not confirm that the account exists or is safe."
      );

      indicators.unshift("Live verification unavailable");
    }

    // ---------------------------------------------------------
    // 5. Recommendation
    // ---------------------------------------------------------
    let recommendation;

    if (liveVerification.available && liveVerification.verified) {
      recommendation =
        "The VPA was verified by the configured service. Still confirm the beneficiary name and payment purpose in your UPI app before authorizing the payment. Verification does not prove that the recipient is trustworthy.";
    } else if (liveVerification.available && !liveVerification.verified) {
      recommendation =
        "Do not pay yet. The configured verification service could not validate this VPA. Independently confirm the recipient through a trusted channel.";
    } else {
      recommendation = patternAssessment.recommendation;
    }

    // ---------------------------------------------------------
    // 6. Send result
    // ---------------------------------------------------------
    res.json({
      success: true,

      data: {
        ...patternAssessment,

        // Preserve local score and risk level when live
        // verification is unavailable.
        score: finalScore,
        riskLevel,

        warnings: [...new Set(warnings)],
        matchedIndicators: [...new Set(indicators)],

        recommendation,

        verification: liveVerification,

        assessmentScope: liveVerification.available
          ? "Live VPA verification plus local suspicious-pattern analysis"
          : "Local format and suspicious-pattern analysis only"
      }
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------
// Verification provider status
// ---------------------------------------------------------
function verificationStatus(req, res) {
  res.json({
    success: true,
    data: getVerificationConfig()
  });
}

module.exports = {
  checkUpi,
  verificationStatus
};