const { extractTextFromImage } = require("../services/ocrService");
const { decodeQrFromImage } = require("../services/qrService");

const {
  analyzeTextRisk,
  analyzeQrDetails,
  combineScreenshotRisk
} = require("../utils/riskEngine");

/* =========================================================
   OCR EXTRACTION HELPERS
   ========================================================= */

function extractUpiId(text = "") {
  const matches = text.match(
    /[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z0-9][a-zA-Z0-9.-]{1,63}/g
  );

  if (!matches || matches.length === 0) {
    return "";
  }

  return matches[0].replace(/[.,;:!?]+$/, "");
}

/* =========================================================
   AMOUNT HELPERS
   ========================================================= */

function normalizeAmount(value = "") {
  if (!value) return "";

  return String(value)
    .replace(/₹/g, "")
    .replace(/¥/g, "")
    .replace(/\bINR\b/gi, "")
    .replace(/\bRs\.?\b/gi, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();
}

function formatAmount(value = "") {
  const normalized = normalizeAmount(value);

  if (!normalized) {
    return "";
  }

  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return `₹${numericValue}`;
}

/* =========================================================
   NUMBER WORD PARSER
   Handles:
   "Nine Thousand"
   "Five Hundred"
   "Two Thousand Five Hundred"
   etc.
   ========================================================= */

function wordsToNumber(text = "") {
  if (!text) return null;

  const smallNumbers = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19
  };

  const tens = {
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90
  };

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z\s-]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let current = 0;
  let total = 0;
  let found = false;

  for (const token of tokens) {
    if (Object.prototype.hasOwnProperty.call(smallNumbers, token)) {
      current += smallNumbers[token];
      found = true;
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(tens, token)) {
      current += tens[token];
      found = true;
      continue;
    }

    if (token === "hundred") {
      if (current === 0) {
        current = 1;
      }

      current *= 100;
      found = true;
      continue;
    }

    if (token === "thousand") {
      if (current === 0) {
        current = 1;
      }

      total += current * 1000;
      current = 0;
      found = true;
      continue;
    }

    if (token === "lakh" || token === "lakhs") {
      if (current === 0) {
        current = 1;
      }

      total += current * 100000;
      current = 0;
      found = true;
      continue;
    }

    if (token === "crore" || token === "crores") {
      if (current === 0) {
        current = 1;
      }

      total += current * 10000000;
      current = 0;
      found = true;
    }
  }

  if (!found) {
    return null;
  }

  const result = total + current;

  return result > 0 ? result : null;
}

/* =========================================================
   EXTRACT AMOUNT FROM NUMBER WORDS
   Example:
   "Rupees Nine Thousand Only"
   -> ₹9000
   ========================================================= */

function extractAmountFromWords(text = "") {
  if (!text) return "";

  const match = text.match(
    /\brupees?\s+([a-z\s-]+?)\s+(?:only|only\.)\b/i
  );

  if (!match) {
    return "";
  }

  const number = wordsToNumber(match[1]);

  if (
    number === null ||
    !Number.isFinite(number)
  ) {
    return "";
  }

  return `₹${number}`;
}

/* =========================================================
   EXTRACT AMOUNT
   ========================================================= */

function extractAmount(text = "") {
  if (!text) return "";

  const normalized = text
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "\n")
    .trim();

  /*
    ---------------------------------------------------------
    PRIORITY 1
    Number written in words.

    This is extremely useful when OCR corrupts the
    currency symbol or digits.

    Example:
    Rupees Nine Thousand Only
    -> ₹9000
    ---------------------------------------------------------
  */

  const wordAmount =
    extractAmountFromWords(normalized);

  if (wordAmount) {
    return wordAmount;
  }

  /*
    ---------------------------------------------------------
    PRIORITY 2
    Currency-prefixed amounts.

    Examples:
    ₹9000
    ₹9,000
    Rs. 9000
    INR 9000
    ---------------------------------------------------------
  */

  const currencyMatches = normalized.match(
    /(?:₹|¥|Rs\.?|INR)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi
  );

  if (currencyMatches?.length) {
    const candidates = currencyMatches
      .map((value) => normalizeAmount(value))
      .filter((value) => {
        const number = Number(value);

        return (
          Number.isFinite(number) &&
          number >= 1 &&
          number <= 10000000
        );
      });

    if (candidates.length) {
      const best = candidates.sort(
        (a, b) => Number(b) - Number(a)
      )[0];

      return formatAmount(best);
    }
  }

  /*
    ---------------------------------------------------------
    PRIORITY 3
    Amount / Total / Paid lines.

    IMPORTANT:
    We only inspect the SAME LINE.

    This prevents:

    "Payment Successful
     Transaction ID: 428753619482"

    from treating the transaction ID as the amount.
    ---------------------------------------------------------
  */

  const lines = normalized
    .split(/\n+/)
    .map((line) =>
      line.replace(/\s+/g, " ").trim()
    )
    .filter(Boolean);

  const amountCandidates = [];

  for (const line of lines) {
    /*
      Ignore transaction-ID lines completely.
    */

    if (
      /\b(transaction\s*id|transactionid|txn\s*id|reference\s*id|ref\s*no|reference\s*no)\b/i.test(
        line
      )
    ) {
      continue;
    }

    /*
      Only use strong amount labels.
    */

    if (
      !/\b(amount|total|paid|payable|price|value)\b/i.test(
        line
      )
    ) {
      continue;
    }

    const numbers = line.match(
      /\b[0-9][0-9,]*(?:\.[0-9]{1,2})?\b/g
    );

    if (!numbers) {
      continue;
    }

    for (const value of numbers) {
      const normalizedValue =
        normalizeAmount(value);

      const numericValue =
        Number(normalizedValue);

      if (
        Number.isFinite(numericValue) &&
        numericValue >= 10 &&
        numericValue <= 10000000
      ) {
        amountCandidates.push(
          numericValue
        );
      }
    }
  }

  if (amountCandidates.length) {
    const best = Math.max(
      ...amountCandidates
    );

    return `₹${best}`;
  }

  /*
    ---------------------------------------------------------
    PRIORITY 4
    Conservative fallback.

    Ignore:
      - transaction IDs
      - phone numbers
      - timestamps
      - tiny OCR garbage

    ---------------------------------------------------------
  */

  const fallbackNumbers =
    normalized.match(
      /\b[0-9][0-9,]*(?:\.[0-9]{1,2})?\b/g
    );

  if (!fallbackNumbers?.length) {
    return "";
  }

  const candidates = fallbackNumbers
    .map((value) =>
      normalizeAmount(value)
    )
    .map((value) => Number(value))
    .filter(
      (number) =>
        Number.isFinite(number) &&
        number >= 100 &&
        number <= 10000000
    );

  /*
    Prefer shorter numbers so long transaction IDs
    don't become payment amounts.
  */

  const reasonable =
    candidates.filter(
      (number) =>
        String(Math.trunc(number)).length <= 7
    );

  if (!reasonable.length) {
    return "";
  }

  /*
    If multiple candidates remain, use the largest
    reasonable payment value.
  */

  return `₹${Math.max(...reasonable)}`;
}

/* =========================================================
   LINKS
   ========================================================= */

function extractLinks(text = "") {
  const matches = text.match(
    /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi
  );

  if (!matches) {
    return [];
  }

  return [
    ...new Set(
      matches.map((url) =>
        url.replace(/[.,;:!?]+$/, "")
      )
    )
  ].slice(0, 10);
}

/* =========================================================
   PHONE NUMBERS
   ========================================================= */

function extractPhoneNumbers(text = "") {
  if (!text) {
    return [];
  }

  const lines = text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const safeLines = lines.filter(
    (line) =>
      !/\b(transaction\s*id|transactionid|txn\s*id|reference\s*id|ref\s*no|reference\s*no)\b/i.test(
        line
      )
  );

  const cleanedText = safeLines.join(" ");

  const matches = cleanedText.match(
    /(?:\+91[\s-]?)?[6-9]\d{9}\b/g
  );

  if (!matches) {
    return [];
  }

  return [
    ...new Set(
      matches.map((number) =>
        number.replace(/[\s-]/g, "")
      )
    )
  ].slice(0, 10);
}
/* =========================================================
   SUSPICIOUS PHRASES
   ========================================================= */

function extractSuspiciousPhrases(text = "") {
  const patterns = [
    {
      label: "Urgent payment request",
      pattern:
        /\b(urgent|immediately|right now|act now|hurry|quickly)\b/i
    },

    {
      label: "Credential request",
      pattern:
        /\b(upi\s*pin|pin|password|otp|passcode|cvv)\b/i
    },

    {
      label: "KYC request",
      pattern:
        /\b(kyc|verify your account|verification required|account verification)\b/i
    },

    {
      label: "Refund or reward lure",
      pattern:
        /\b(refund|cashback|reward|prize|winner|bonus|claim)\b/i
    },

    {
      label: "Payment action request",
      pattern:
        /\b(pay|payment|send money|transfer|collect|approve|request money)\b/i
    },

    {
      label: "Threat or account pressure",
      pattern:
        /\b(blocked|suspended|deactivated|legal action|police|penalty|fine)\b/i
    }
  ];

  return patterns
    .filter((item) =>
      item.pattern.test(text)
    )
    .map((item) =>
      item.label
    );
}

/* =========================================================
   SCREENSHOT DETAILS
   ========================================================= */

function extractScreenshotDetails(text = "") {
  return {
    upiId: extractUpiId(text),
    amount: extractAmount(text),
    links: extractLinks(text),
    phoneNumbers: extractPhoneNumbers(text),
    suspiciousPhrases:
      extractSuspiciousPhrases(text)
  };
}

/* =========================================================
   OCR ↔ QR CONSISTENCY CHECK
   ========================================================= */

function normalizeUpiId(value = "") {
  return String(value)
    .trim()
    .toLowerCase();
}

function comparePaymentDetails(
  detectedDetails = {},
  qrDetails = {}
) {
  const mismatches = [];
  const matches = [];

  const ocrUpiId =
    normalizeUpiId(
      detectedDetails.upiId
    );

  const qrUpiId =
    normalizeUpiId(
      qrDetails.upiId
    );

  const ocrAmount =
    normalizeAmount(
      detectedDetails.amount
    );

  const qrAmount =
    normalizeAmount(
      qrDetails.amount
    );

  /* -------------------------------------------------------
     UPI ID
     ------------------------------------------------------- */

  if (ocrUpiId && qrUpiId) {
    if (ocrUpiId === qrUpiId) {
      matches.push({
        field: "UPI ID",
        ocrValue:
          detectedDetails.upiId,
        qrValue:
          qrDetails.upiId
      });
    } else {
      mismatches.push({
        field: "UPI ID",
        ocrValue:
          detectedDetails.upiId,
        qrValue:
          qrDetails.upiId,
        message:
          "The UPI ID visible in the screenshot does not match the UPI ID encoded in the QR code."
      });
    }
  }

  /* -------------------------------------------------------
     AMOUNT
     ------------------------------------------------------- */

  if (ocrAmount && qrAmount) {
    if (
      Number(ocrAmount) ===
      Number(qrAmount)
    ) {
      matches.push({
        field: "Amount",
        ocrValue:
          detectedDetails.amount,
        qrValue:
          qrDetails.amount
      });
    } else {
      mismatches.push({
        field: "Amount",
        ocrValue:
          detectedDetails.amount,
        qrValue:
          qrDetails.amount,
        message:
          "The payment amount visible in the screenshot does not match the amount encoded in the QR code."
      });
    }
  }

  return {
    mismatchDetected:
      mismatches.length > 0,

    matchDetected:
      matches.length > 0,

    mismatches,
    matches
  };
}

/* =========================================================
   SCREENSHOT ANALYSIS
   ========================================================= */

async function analyzeScreenshot(
  req,
  res,
  next
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a screenshot image."
      });
    }

    console.log(
      `🖼️ Screenshot analysis started: ${req.file.originalname}`
    );

    const [ocr, qrDetails] =
      await Promise.all([
        extractTextFromImage(
          req.file.buffer
        ),

        decodeQrFromImage(
          req.file.buffer
        )
      ]);

    console.log(
      `📱 QR detection: ${
        qrDetails.detected
          ? "DETECTED"
          : "NOT DETECTED"
      }`
    );

    const detectedDetails =
      extractScreenshotDetails(
        ocr.text || ""
      );

    console.log(
      "🔎 Screenshot details:",
      detectedDetails
    );

    if (
      (!ocr.text ||
        ocr.text.length < 4) &&
      !qrDetails.detected
    ) {
      return res.json({
        success: true,

        data: {
          riskLevel: "UNKNOWN",
          score: 0,

          warnings: [
            "No readable text or QR code was detected in this screenshot.",
            "The image may be blurred, too small, low contrast or unsupported."
          ],

          matchedIndicators: [],

          recommendation:
            "Upload a clearer payment screenshot or QR image, or verify the recipient directly in your UPI app.",

          extractedText: "",

          ocrConfidence:
            ocr.confidence,

          detectedDetails,

          qrDetails,

          analysisSources: []
        }
      });
    }

    const textAnalysis =
      ocr.text &&
      ocr.text.length >= 4
        ? analyzeTextRisk(
            ocr.text
          )
        : null;

    const qrAnalysis =
      qrDetails.detected
        ? analyzeQrDetails(
            qrDetails
          )
        : null;

    const paymentComparison =
      comparePaymentDetails(
        detectedDetails,
        qrDetails
      );

    console.log(
      "🔍 OCR ↔ QR comparison:",
      paymentComparison
    );

    const combinedAnalysis =
      combineScreenshotRisk(
        textAnalysis,
        qrAnalysis
      );

    let finalScore =
      combinedAnalysis.score || 0;

    const finalWarnings = [
      ...(combinedAnalysis.warnings || [])
    ];

    const finalIndicators = [
      ...(combinedAnalysis.matchedIndicators || [])
    ];

    if (
      paymentComparison.mismatchDetected
    ) {
      finalScore = Math.max(
        finalScore,
        70
      );

      finalWarnings.push(
        "Payment details mismatch detected between the visible screenshot information and the QR payload."
      );

      finalIndicators.push(
        "OCR ↔ QR payment mismatch"
      );
    }

    finalScore = Math.min(
      100,
      Math.max(
        0,
        finalScore
      )
    );

    let finalRiskLevel =
      "LOW";

    if (finalScore >= 70) {
      finalRiskLevel =
        "HIGH";
    } else if (
      finalScore >= 40
    ) {
      finalRiskLevel =
        "MEDIUM";
    }

    let finalRecommendation =
      combinedAnalysis.recommendation;

    if (
      paymentComparison.mismatchDetected
    ) {
      finalRecommendation =
        "Do not approve this payment yet. The information visible in the screenshot does not match the QR payment data. Verify the recipient and amount directly in your UPI app before paying.";
    }

    console.log(
      `🛡️ Final screenshot risk: ${finalRiskLevel} (${finalScore}/100)`
    );

    return res.json({
      success: true,

      data: {
        ...combinedAnalysis,

        riskLevel:
          finalRiskLevel,

        score:
          finalScore,

        warnings: [
          ...new Set(
            finalWarnings
          )
        ],

        matchedIndicators: [
          ...new Set(
            finalIndicators
          )
        ],

        recommendation:
          finalRecommendation,

        extractedText:
          ocr.text
            ? ocr.text.slice(
                0,
                5000
              )
            : "",

        ocrConfidence:
          ocr.confidence,

        detectedDetails,

        qrDetails,

        paymentComparison,

        analysisSources: [
          ...(
            combinedAnalysis.analysisSources ||
            []
          )
        ]
      }
    });
  } catch (error) {
    console.error(
      "❌ Screenshot analysis error:",
      error
    );

    next(error);
  }
}

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  analyzeScreenshot
};