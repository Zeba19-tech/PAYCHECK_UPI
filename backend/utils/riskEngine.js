function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function analyzeTextRisk(input = "") {
  const text = String(input).replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  if (!text) {
    return {
      riskLevel: "UNKNOWN",
      score: 0,
      warnings: [
        "No readable text was provided for analysis."
      ],
      matchedIndicators: [],
      recommendation:
        "Provide clearer text or a better-quality screenshot before making a payment."
    };
  }

  let score = 0;
  const warnings = [];
  const matchedIndicators = [];

  const add = (name, points, warning) => {
    score += points;
    matchedIndicators.push(name);
    warnings.push(warning);
  };

  const rules = [
    {
      name: "Credential request",
      pattern:
        /\b(otp|one[- ]time password|upi pin|upi mpin|cvv|card pin|password|passcode)\b/i,
      points: 35,
      warning:
        "The content appears to request a sensitive authentication credential."
    },

    {
      name: "Urgency or pressure",
      pattern:
        /\b(urgent|immediately|act now|do it now|within \d+\s*(minutes?|hours?)|last warning|final warning|today)\b/i,
      points: 15,
      warning:
        "The message uses urgency or pressure to push the user into quick action."
    },

    {
      name: "KYC or account threat",
      pattern:
        /\b(kyc|account blocked|account suspended|account will be closed|verify your account|reactivate your account|account will be blocked)\b/i,
      points: 20,
      warning:
        "The content uses KYC or account-status claims that can be used in phishing scams."
    },

    {
      name: "Refund or reward lure",
      pattern:
        /\b(refund|cashback|reward|prize|lottery|bonus|free money|cash prize|gift voucher)\b/i,
      points: 15,
      warning:
        "The content uses a reward, refund or prize as a reason to take payment-related action."
    },

    {
      name: "Remote access request",
      pattern:
        /\b(anydesk|teamviewer|remote access|screen sharing|screen share|remote desktop)\b/i,
      points: 35,
      warning:
        "The content requests or suggests remote device access."
    },

    {
      name: "Threat or impersonation",
      pattern:
        /\b(police|arrest|digital arrest|legal action|income tax|customs officer|bank officer|cyber crime officer)\b/i,
      points: 25,
      warning:
        "The content uses authority or threat-based language that is common in impersonation scams."
    },

    {
      name: "Payment action request",
      pattern:
        /\b(pay(?:\s+(?:now|immediately|today))?|send money|transfer money|make payment|scan qr|scan this qr|collect request|payment request|pay\s+(?:rs|inr|₹)?\s*[\d,]+(?:\.\d+)?\s+to)\b/i,
      points: 10,
      warning:
        "The content asks the user to perform a payment action."
    },

    {
      name: "Suspicious support or verification",
      pattern:
        /\b(customer care|customer support|verify now|verification link|support number|helpline number)\b/i,
      points: 10,
      warning:
        "The content contains support or verification language that should be independently verified."
    },

    {
      name: "Investment or multiplication promise",
      pattern:
        /\b(double your money|guaranteed return|guaranteed profit|investment opportunity|crypto profit|quick profit)\b/i,
      points: 20,
      warning:
        "The content promises unusually quick or guaranteed financial returns."
    }
  ];

  for (const rule of rules) {
    if (rule.pattern.test(lower)) {
      add(rule.name, rule.points, rule.warning);
    }
  }

  /* =========================
     UPI ID DETECTION
  ========================= */

  const upiIds =
    text.match(
      /\b[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}\b/g
    ) || [];

  if (upiIds.length > 0) {
    add(
      "UPI ID detected",
      5,
      "A UPI ID was detected in the message. Verify the recipient independently before making a payment."
    );
  }

  /* =========================
     PAYMENT AMOUNT DETECTION
  ========================= */

  const amounts = [];

  const amountPatterns = [
    /₹\s*[\d,]+(?:\.\d+)?/gi,
    /\b(?:rs|inr)\.?\s*[\d,]+(?:\.\d+)?\b/gi,
    /\b[\d,]+(?:\.\d+)?\s*(?:rupees|rs|inr)\b/gi
  ];

  for (const pattern of amountPatterns) {
    amounts.push(...(text.match(pattern) || []));
  }

  const uniqueAmounts = [
    ...new Set(
      amounts.map((amount) => amount.trim())
    )
  ];

  if (uniqueAmounts.length > 0) {
    add(
      "Payment amount detected",
      10,
      "A payment amount was detected in the message. Confirm the amount and payment purpose before authorizing any transaction."
    );
  }

  /* =========================
     UPI + PAYMENT COMBINATION
  ========================= */

  const paymentRequestPattern =
    /\b(pay|send|transfer|payment|collect|scan)\b/i;

  if (
    upiIds.length > 0 &&
    paymentRequestPattern.test(lower)
  ) {
    add(
      "UPI ID involved in payment request",
      5,
      "The message combines a UPI ID with payment-related language. Verify the recipient before sending money."
    );
  }

  /* =========================
     EXTERNAL LINKS
  ========================= */

  const urls =
    text.match(
      /https?:\/\/[^\s<>"']+/gi
    ) || [];

  if (urls.length > 0) {
    add(
      "External link",
      8,
      "The content contains an external web link. Verify the destination independently before opening it."
    );

    const shorteners = [
      "bit.ly",
      "tinyurl.com",
      "t.co",
      "goo.gl",
      "cutt.ly",
      "is.gd",
      "rb.gy",
      "shorturl.at"
    ];

    if (
      urls.some((url) =>
        shorteners.some((domain) =>
          url.toLowerCase().includes(domain)
        )
      )
    ) {
      add(
        "URL shortener",
        20,
        "A URL-shortening service was detected, which can hide the final destination."
      );
    }

    if (
      urls.some((url) =>
        /https?:\/\/\d{1,3}(?:\.\d{1,3}){3}/i.test(url)
      )
    ) {
      add(
        "IP-address URL",
        15,
        "A web address uses a numeric IP address instead of a normal domain name."
      );
    }

    if (
      urls.some((url) =>
        /(verify|kyc|refund|cashback|reward|support|claim|prize)/i.test(url)
      )
    ) {
      add(
        "Sensitive-action URL",
        18,
        "The URL contains terms associated with verification, rewards, refunds or account actions."
      );
    }
  }

  /* =========================
     FINAL RISK CALCULATION
  ========================= */

  const uniqueIndicators = [
    ...new Set(matchedIndicators)
  ];

  score = clamp(score);

  let riskLevel = "LOW";

  if (score >= 70) {
    riskLevel = "HIGH";
  } else if (score >= 40) {
    riskLevel = "MEDIUM";
  }

  if (uniqueIndicators.length === 0) {
    warnings.push(
      "No obvious scam indicators were detected in the supplied content."
    );
  }

  let recommendation =
    "No major warning signs were detected. Still verify the sender and payment details independently before paying.";

  if (riskLevel === "MEDIUM") {
    recommendation =
      "Be cautious. Do not share OTPs, UPI PINs or passwords, and verify the sender through an official channel before taking action.";
  }

  if (riskLevel === "HIGH") {
    recommendation =
      "Do not pay, click links, share credentials or grant remote access. Independently verify the request and report suspected fraud.";
  }

  return {
    riskLevel,
    score,
    warnings: [
      ...new Set(warnings)
    ],
    matchedIndicators: uniqueIndicators,
    recommendation,
    entities: {
      upiIds,
      amounts: uniqueAmounts,
      urls
    }
  };
}
/* =========================================================
   UPI ID ANALYSIS
   ========================================================= */

function analyzeUpiId(upiId = "") {
  const original = String(upiId).trim();
  const value = original.toLowerCase();

  if (!value) {
    return {
      riskLevel: "UNKNOWN",
      score: 0,
      warnings: ["Enter a UPI ID to perform the check."],
      matchedIndicators: [],
      recommendation:
        "Enter a complete UPI ID such as name@provider."
    };
  }

  /*
   * IMPORTANT:
   * This is a format and suspicious-pattern assessment.
   * It does NOT prove that the UPI account exists.
   * It does NOT prove that the account is safe or fraudulent.
   */

  const validFormat =
    /^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i.test(value);

  if (!validFormat) {
    return {
      riskLevel: "UNKNOWN",
      score: 0,
      warnings: [
        "The value does not match the expected UPI ID structure (username@provider).",
        "This check cannot determine whether an incomplete or malformed value belongs to a real account."
      ],
      matchedIndicators: ["Invalid or incomplete format"],
      recommendation:
        "Check the UPI ID shown by your official payment app and enter the complete ID before paying."
    };
  }

  let score = 0;
  const warnings = [];
  const matchedIndicators = [];

  const add = (name, points, warning) => {
    score += points;
    matchedIndicators.push(name);
    warnings.push(warning);
  };

  const [local, provider] = value.split("@");

  /* ---------------------------------------------------------
     1. Sensitive / suspicious username
     --------------------------------------------------------- */

  const sensitiveWords = [
    "refund",
    "cashback",
    "reward",
    "prize",
    "claim",
    "verify",
    "kyc",
    "support",
    "helpdesk",
    "customer",
    "admin",
    "service"
  ];

  const foundSensitiveWords = sensitiveWords.filter((word) =>
    local.includes(word)
  );

  if (foundSensitiveWords.length > 0) {
    add(
      "Sensitive-action username",
      20,
      "The UPI username contains wording commonly associated with refund, reward, verification or support-themed requests."
    );
  }

  /* ---------------------------------------------------------
     2. Urgency
     --------------------------------------------------------- */

  const urgencyWords = [
    "urgent",
    "immediate",
    "immediately",
    "now",
    "quick",
    "fast",
    "alert"
  ];

  const foundUrgencyWords = urgencyWords.filter((word) =>
    local.includes(word)
  );

  if (foundUrgencyWords.length > 0) {
    add(
      "Urgency-related username",
      15,
      "The UPI username contains urgency-related wording that can be used to pressure users into quick payment decisions."
    );
  }

  /* ---------------------------------------------------------
     3. KYC / verification
     --------------------------------------------------------- */

  const verificationWords = [
    "kyc",
    "verify",
    "verification",
    "account",
    "activate",
    "reactivate"
  ];

  const foundVerificationWords = verificationWords.filter((word) =>
    local.includes(word)
  );

  if (foundVerificationWords.length > 0) {
    add(
      "Verification or account theme",
      20,
      "The UPI username contains account or verification-related wording. Verify the payment purpose independently."
    );
  }

  /* ---------------------------------------------------------
     4. Refund / reward / prize
     --------------------------------------------------------- */

  const rewardWords = [
    "refund",
    "cashback",
    "reward",
    "prize",
    "lottery",
    "bonus",
    "gift"
  ];

  const foundRewardWords = rewardWords.filter((word) =>
    local.includes(word)
  );

  if (foundRewardWords.length > 0) {
    add(
      "Refund or reward theme",
      20,
      "The UPI username contains refund, cashback, reward or prize-related wording that should be independently verified."
    );
  }

  /* ---------------------------------------------------------
     5. Excessive digits
     --------------------------------------------------------- */

  const digitCount = (local.match(/\d/g) || []).length;

  if (digitCount >= 6) {
    add(
      "High numeric density",
      10,
      "The UPI username contains an unusually high number of digits. Verify the recipient name carefully before paying."
    );
  }

  /* ---------------------------------------------------------
     6. Repeated characters
     --------------------------------------------------------- */

  if (/(.)\1{3,}/i.test(local)) {
    add(
      "Repeated-character pattern",
      8,
      "The username contains an unusual repeated-character pattern. Verify the recipient name carefully."
    );
  }

  /* ---------------------------------------------------------
     7. Unusual identifier pattern
     --------------------------------------------------------- */

  if (
    value.includes("..") ||
    local.startsWith(".") ||
    local.endsWith(".")
  ) {
    add(
      "Unusual identifier pattern",
      10,
      "The UPI username contains an unusual identifier pattern."
    );
  }

  /* ---------------------------------------------------------
     8. Suspicious combination
     --------------------------------------------------------- */

  const independentThemes = [
    foundSensitiveWords.length > 0,
    foundUrgencyWords.length > 0,
    foundVerificationWords.length > 0,
    foundRewardWords.length > 0,
    digitCount >= 6
  ].filter(Boolean).length;

  if (independentThemes >= 3) {
    add(
      "Multiple suspicious themes",
      15,
      "Multiple suspicious themes appear together in the UPI username. Verify the recipient and payment purpose before taking action."
    );
  }

  /* ---------------------------------------------------------
     9. Provider recognition
     --------------------------------------------------------- */

  const commonProviders = [
    "okaxis",
    "oksbi",
    "okicici",
    "okhdfcbank",
    "ybl",
    "ibl",
    "axl",
    "paytm",
    "upi",
    "apl",
    "sbi",
    "icici",
    "hdfcbank",
    "okyesbank"
  ];

  const knownProvider = commonProviders.some(
    (item) => provider === item || provider.endsWith(item)
  );

  if (!knownProvider) {
    warnings.push(
      "The provider handle is not in PayCheck UPI's local reference list. This is not, by itself, evidence that the UPI ID is fraudulent."
    );
  }

  score = clamp(score);

  /* ---------------------------------------------------------
     Final risk classification
     --------------------------------------------------------- */

  let riskLevel = "LOW";

  if (score >= 70) {
    riskLevel = "HIGH";
  } else if (score >= 40) {
    riskLevel = "MEDIUM";
  }

  if (matchedIndicators.length === 0) {
    warnings.unshift(
      "The UPI ID has a valid-looking structure and no strong suspicious pattern was detected by this local check."
    );
  }

  let recommendation =
  "No strong suspicious pattern was detected. This does not prove that the UPI ID is safe. Before paying, open your trusted UPI app and confirm that the recipient name matches the person or business you intend to pay. Also verify the amount and payment purpose carefully before authorizing the transaction.";
  if (riskLevel === "MEDIUM") {
    recommendation =
      "Proceed cautiously. Verify the recipient name and payment purpose through an independent channel. Do not share your UPI PIN or OTP.";
  }

  if (riskLevel === "HIGH") {
    recommendation =
      "Do not pay yet. Multiple suspicious patterns were detected. Independently verify the recipient and payment request before taking action.";
  }

  return {
    riskLevel,
    score,
    warnings: [...new Set(warnings)],
    matchedIndicators: [...new Set(matchedIndicators)],
    recommendation,
    assessmentScope: "Format and suspicious-pattern analysis only",
    providerKnownLocally: knownProvider
  };
}


/* =========================================================
   LINK ANALYSIS
   ========================================================= */

function analyzeLink(url = "") {
  const value = String(url).trim();

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    return {
      riskLevel: "HIGH",
      score: 85,
      warnings: [
        "The supplied value is not a valid web URL."
      ],
      matchedIndicators: [
        "Invalid URL"
      ],
      recommendation:
        "Do not open this value. Verify the original message and sender through a trusted channel."
    };
  }

  let score = 0;
  const warnings = [];
  const matchedIndicators = [];

  const add = (name, points, warning) => {
    score += points;
    matchedIndicators.push(name);
    warnings.push(warning);
  };

  const hostname = parsed.hostname.toLowerCase();
  const fullPath = `${hostname}${parsed.pathname}${parsed.search}`.toLowerCase();

  // --------------------------------------------------
  // 1. HTTPS CHECK
  // --------------------------------------------------

  if (parsed.protocol !== "https:") {
    add(
      "Non-HTTPS connection",
      25,
      "The link does not use HTTPS. Avoid entering sensitive information on an unsecured connection."
    );
  }

  // --------------------------------------------------
  // 2. URL SHORTENER CHECK
  // --------------------------------------------------

  const shorteners = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "cutt.ly",
    "is.gd",
    "rb.gy",
    "shorturl.at"
  ];

  if (
    shorteners.some(
      (domain) =>
        hostname === domain ||
        hostname.endsWith(`.${domain}`)
    )
  ) {
    add(
      "URL shortener",
      25,
      "The link uses a URL-shortening service that can hide its final destination."
    );
  }

  // --------------------------------------------------
  // 3. IP ADDRESS HOST
  // --------------------------------------------------

  if (
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  ) {
    add(
      "IP-address host",
      20,
      "The link uses a numeric IP address instead of a normal domain name. Verify the destination carefully."
    );
  }

  // --------------------------------------------------
  // 4. SENSITIVE ACTION WORDING
  // --------------------------------------------------

  const sensitiveWords = [
    "verify",
    "verification",
    "kyc",
    "refund",
    "cashback",
    "reward",
    "prize",
    "claim",
    "support",
    "login",
    "signin",
    "secure",
    "update",
    "account",
    "payment",
    "upi",
    "bank"
  ];

  const matchedSensitiveWords = sensitiveWords.filter(
    (word) => fullPath.includes(word)
  );

  if (matchedSensitiveWords.length > 0) {
    add(
      "Sensitive-action wording",
      25,
      "The address contains wording commonly associated with verification, rewards, refunds, account access or payment actions."
    );
  }

  // --------------------------------------------------
  // 5. DEEP SUBDOMAIN CHECK
  // --------------------------------------------------

  const domainParts = hostname.split(".");

  if (
  domainParts.length >= 4 &&
  !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)
) {
    add(
      "Deep subdomain structure",
      10,
      "The address contains several subdomain levels. Check the actual registered domain carefully before trusting it."
    );
  }

  // --------------------------------------------------
  // 6. EMBEDDED CREDENTIALS
  // --------------------------------------------------

  if (parsed.username || parsed.password) {
    add(
      "Embedded credentials",
      30,
      "The URL contains embedded username or password information, which is unusual for a normal payment or support link."
    );
  }

  // --------------------------------------------------
  // 7. SUSPICIOUS DOMAIN CHARACTERS
  // --------------------------------------------------

  if (
    hostname.includes("--") ||
    /[^\x00-\x7F]/.test(hostname)
  ) {
    add(
      "Unusual domain structure",
      20,
      "The domain contains unusual characters or structure. Verify the domain independently before opening it."
    );
  }

  // --------------------------------------------------
  // 8. EXCESSIVE URL LENGTH
  // --------------------------------------------------

  if (value.length > 180) {
    add(
      "Very long URL",
      10,
      "The link is unusually long. Long URLs can make it harder to identify the actual destination."
    );
  }

  // --------------------------------------------------
  // 9. SUSPICIOUS FILE EXTENSIONS
  // --------------------------------------------------

  if (
    /\.(exe|apk|scr|bat|cmd|msi|zip|rar)(?:$|[?#])/i.test(
      parsed.pathname
    )
  ) {
    add(
      "Executable or archive download",
      30,
      "The link appears to point to an executable or archive file. Do not download unknown files from suspicious messages."
    );
  }

  // --------------------------------------------------
  // 10. PAYMENT / CREDENTIAL QUERY PARAMETERS
  // --------------------------------------------------

  const suspiciousParameters = [
    "password",
    "passwd",
    "pin",
    "otp",
    "cvv",
    "card",
    "upi",
    "account"
  ];

  const parameterText = parsed.search.toLowerCase();

  if (
    suspiciousParameters.some((parameter) =>
      parameterText.includes(parameter)
    )
  ) {
    add(
      "Sensitive query parameter",
      20,
      "The URL contains a parameter associated with payment or account credentials. Do not submit sensitive information through an untrusted link."
    );
  }

  // --------------------------------------------------
  // FINAL SCORE
  // --------------------------------------------------

  score = clamp(score);

  let riskLevel = "LOW";

  if (score >= 70) {
    riskLevel = "HIGH";
  } else if (score >= 40) {
    riskLevel = "MEDIUM";
  }

  // --------------------------------------------------
  // NO WARNING CASE
  // --------------------------------------------------

  if (matchedIndicators.length === 0) {
    warnings.push(
      "No obvious structural warning pattern was detected."
    );
  }

  // --------------------------------------------------
  // RECOMMENDATION
  // --------------------------------------------------

  let recommendation =
    "No major structural warning signs were detected. This does not prove that the website is safe. Verify the domain independently and avoid entering UPI, banking or login credentials unless you trust the source.";

  if (riskLevel === "MEDIUM") {
    recommendation =
      "Be cautious with this link. Verify the domain independently through an official source and avoid entering UPI, banking, OTP or login details until the destination is trusted.";
  }

  if (riskLevel === "HIGH") {
    recommendation =
      "Do not open or use this link for payment or credential entry. Verify the sender and website through an official channel instead.";
  }

  return {
    riskLevel,
    score,
    warnings: [...new Set(warnings)],
    matchedIndicators: [...new Set(matchedIndicators)],
    recommendation,
    normalizedUrl: parsed.toString()
  };
}
/* =========================================================
   QR / SCREENSHOT COMBINED ANALYSIS
   ========================================================= */

function analyzeQrDetails(qrDetails = {}) {
  const {
    detected = false,
    isUpiQr = false,
    upiId = "",
    payeeName = "",
    amount = "",
    currency = "",
    note = "",
    data = ""
  } = qrDetails;

  if (!detected) {
    return {
      riskLevel: "UNKNOWN",
      score: 0,
      warnings: ["No QR code was detected in the uploaded image."],
      matchedIndicators: [],
      recommendation:
        "No QR information was available for analysis."
    };
  }

  /*
   * A decoded QR code is not automatically safe.
   * We only analyze its contents and, when available,
   * pass the embedded UPI ID through our existing UPI
   * suspicious-pattern engine.
   */

  let score = 0;
  const warnings = [];
  const matchedIndicators = [];

  const add = (name, points, warning) => {
    score += points;
    matchedIndicators.push(name);
    warnings.push(warning);
  };

  if (isUpiQr && upiId) {
    const upiAnalysis = analyzeUpiId(upiId);

    score = Math.max(score, upiAnalysis.score);

    if (upiAnalysis.matchedIndicators?.length) {
      matchedIndicators.push(...upiAnalysis.matchedIndicators);
    }

    if (upiAnalysis.warnings?.length) {
      warnings.push(...upiAnalysis.warnings);
    }
  }

  /*
   * Analyze the QR payment note separately.
   * This catches suspicious instructions that may not
   * appear in the visible screenshot text.
   */

  if (note) {
    const noteAnalysis = analyzeTextRisk(note);

    score = Math.max(score, noteAnalysis.score);

    if (noteAnalysis.matchedIndicators?.length) {
      matchedIndicators.push(...noteAnalysis.matchedIndicators);
    }

    if (noteAnalysis.warnings?.length) {
      warnings.push(...noteAnalysis.warnings);
    }
  }

  /*
   * Generic QR payload checks.
   */

  if (!isUpiQr && data) {
    if (/https?:\/\//i.test(data)) {
      add(
        "QR contains external link",
        15,
        "The QR code contains an external web address. Verify the destination before opening it."
      );
    }

    if (
      /(verify|kyc|refund|cashback|reward|claim|prize|login|support)/i.test(
        data
      )
    ) {

      add(
        "QR contains sensitive-action wording",
        20,
        "The QR payload contains wording associated with verification, rewards, refunds, support or account actions."
      );
    }
  }

  score = clamp(score);

  let riskLevel = "LOW";

  if (score >= 70) {
    riskLevel = "HIGH";
  } else if (score >= 40) {
    riskLevel = "MEDIUM";
  }

  if (matchedIndicators.length === 0) {
    warnings.push(
      "The QR contents did not contain strong suspicious patterns in this local analysis."
    );
  }

  let recommendation =
    "The QR code was decoded successfully, but decoding does not prove that the recipient is trustworthy. Verify the recipient name and payment purpose in your UPI app before paying.";

  if (riskLevel === "MEDIUM") {
    recommendation =
      "Be cautious. Suspicious patterns were found in the QR contents. Verify the recipient and payment purpose independently before approving the payment.";
  }

  if (riskLevel === "HIGH") {
    recommendation =
      "Do not approve the payment yet. Suspicious patterns were detected in the QR contents. Independently verify the recipient and payment request.";
  }

  return {
    riskLevel,
    score,
    warnings: [...new Set(warnings)],
    matchedIndicators: [...new Set(matchedIndicators)],
    recommendation,
    assessmentScope:
      "QR payload and suspicious-pattern analysis only"
  };
}


/* =========================================================
   COMBINED SCREENSHOT RISK ANALYSIS
   ========================================================= */

function combineScreenshotRisk(textAnalysis, qrAnalysis) {
  const text = textAnalysis || {
    riskLevel: "UNKNOWN",
    score: 0,
    warnings: [],
    matchedIndicators: [],
    recommendation: ""
  };

  const qr = qrAnalysis || {
    riskLevel: "UNKNOWN",
    score: 0,
    warnings: [],
    matchedIndicators: [],
    recommendation: ""
  };

  const textAvailable = text.riskLevel !== "UNKNOWN";
  const qrAvailable = qr.riskLevel !== "UNKNOWN";

  /*
   * If only OCR analysis is available, preserve the
   * existing screenshot behaviour.
   */
  if (textAvailable && !qrAvailable) {
    return {
      ...text,
      analysisSources: ["OCR"],
      combinedScore: text.score
    };
  }

  /*
   * If only QR analysis is available, use QR analysis.
   */
  if (!textAvailable && qrAvailable) {
    return {
      ...qr,
      analysisSources: ["QR"],
      combinedScore: qr.score
    };
  }

  /*
   * If neither source produced usable analysis.
   */
  if (!textAvailable && !qrAvailable) {
    return {
      riskLevel: "UNKNOWN",
      score: 0,
      warnings: [
        "No usable text or QR information was available for risk analysis."
      ],
      matchedIndicators: [],
      recommendation:
        "Upload a clearer payment screenshot or QR image and verify the recipient directly in your UPI app.",
      analysisSources: [],
      combinedScore: 0
    };
  }

  /*
   * Both OCR and QR are available.
   *
   * We use the stronger score rather than simply adding both
   * scores. This prevents the same suspicious wording from
   * being counted twice when it appears both visually and
   * inside the QR payload.
   */
  let combinedScore = Math.max(text.score, qr.score);

  /*
   * If both independent sources identify meaningful risk,
   * add a small corroboration bonus.
   */
  if (text.score >= 40 && qr.score >= 40) {
    combinedScore += 10;
  }

  combinedScore = clamp(combinedScore);

  let riskLevel = "LOW";

  if (combinedScore >= 70) {
    riskLevel = "HIGH";
  } else if (combinedScore >= 40) {
    riskLevel = "MEDIUM";
  }

  const matchedIndicators = [
    ...(text.matchedIndicators || []),
    ...(qr.matchedIndicators || [])
  ];

  const warnings = [
    ...(text.warnings || []),
    ...(qr.warnings || [])
  ];

  let recommendation =
    "No major warning signs were detected across the available screenshot and QR information. Still verify the recipient and payment details independently before paying.";

  if (riskLevel === "MEDIUM") {
    recommendation =
      "Be cautious. Suspicious patterns were detected in the screenshot or QR contents. Verify the recipient and payment purpose independently before approving the payment.";
  }

  if (riskLevel === "HIGH") {
    recommendation =
      "Do not approve the payment yet. Multiple suspicious indicators were detected across the screenshot and QR contents. Independently verify the recipient and payment request.";
  }

  return {
    riskLevel,
    score: combinedScore,
    combinedScore,
    warnings: [...new Set(warnings)],
    matchedIndicators: [...new Set(matchedIndicators)],
    recommendation,
    analysisSources: ["OCR", "QR"],
    assessmentScope:
      "Combined OCR text and QR payload suspicious-pattern analysis"
  };
}
/* =========================================================
   QR CODE ANALYSIS
   ========================================================= */

function analyzeQrDetails(qrDetails = {}) {
  const {
    detected = false,
    isUpiQr = false,
    upiId = "",
    note = "",
    data = ""
  } = qrDetails;

  if (!detected) {
    return {
      riskLevel: "UNKNOWN",
      score: 0,
      warnings: [
        "No QR code was detected in the uploaded image."
      ],
      matchedIndicators: [],
      recommendation:
        "No QR information was available for analysis."
    };
  }

  let score = 0;
  const warnings = [];
  const matchedIndicators = [];

  const add = (name, points, warning) => {
    score += points;
    matchedIndicators.push(name);
    warnings.push(warning);
  };

  /*
   * If the QR contains a UPI ID, send that ID through
   * the existing PayCheck UPI analysis engine.
   */
  if (isUpiQr && upiId) {
    const upiAnalysis = analyzeUpiId(upiId);

    score = Math.max(score, upiAnalysis.score);

    if (upiAnalysis.matchedIndicators?.length) {
      matchedIndicators.push(
        ...upiAnalysis.matchedIndicators
      );
    }

    if (upiAnalysis.warnings?.length) {
      warnings.push(
        ...upiAnalysis.warnings
      );
    }
  }

  /*
   * Analyze the payment note inside the QR.
   */
  if (note) {
    const noteAnalysis = analyzeTextRisk(note);

    score = Math.max(score, noteAnalysis.score);

    if (noteAnalysis.matchedIndicators?.length) {
      matchedIndicators.push(
        ...noteAnalysis.matchedIndicators
      );
    }

    if (noteAnalysis.warnings?.length) {
      warnings.push(
        ...noteAnalysis.warnings
      );
    }
  }

  /*
   * Generic QR payload analysis.
   */
  if (!isUpiQr && data) {
    if (/https?:\/\//i.test(data)) {
      add(
        "QR contains external link",
        15,
        "The QR code contains an external web address. Verify the destination before opening it."
      );
    }

    if (
      /(verify|kyc|refund|cashback|reward|claim|prize|login|support)/i.test(
        data
      )
    ) {
      add(
        "QR contains sensitive-action wording",
        20,
        "The QR payload contains wording associated with verification, rewards, refunds, support or account actions."
      );
    }
  }

  score = clamp(score);

  let riskLevel = "LOW";

  if (score >= 70) {
    riskLevel = "HIGH";
  } else if (score >= 40) {
    riskLevel = "MEDIUM";
  }

  if (matchedIndicators.length === 0) {
    warnings.push(
      "The QR contents did not contain strong suspicious patterns in this local analysis."
    );
  }

  let recommendation =
    "The QR code was decoded successfully, but decoding does not prove that the recipient is trustworthy. Verify the recipient name and payment purpose in your UPI app before paying.";

  if (riskLevel === "MEDIUM") {
    recommendation =
      "Be cautious. Suspicious patterns were found in the QR contents. Verify the recipient and payment purpose independently before approving the payment.";
  }

  if (riskLevel === "HIGH") {
    recommendation =
      "Do not approve the payment yet. Suspicious patterns were detected in the QR contents. Independently verify the recipient and payment request.";
  }

  return {
    riskLevel,
    score,
    warnings: [...new Set(warnings)],
    matchedIndicators: [
      ...new Set(matchedIndicators)
    ],
    recommendation,
    assessmentScope:
      "QR payload and suspicious-pattern analysis only"
  };
}


/* =========================================================
   COMBINED OCR + QR SCREENSHOT ANALYSIS
   ========================================================= */

function combineScreenshotRisk(
  textAnalysis,
  qrAnalysis
) {
  const text = textAnalysis || {
    riskLevel: "UNKNOWN",
    score: 0,
    warnings: [],
    matchedIndicators: [],
    recommendation: ""
  };

  const qr = qrAnalysis || {
    riskLevel: "UNKNOWN",
    score: 0,
    warnings: [],
    matchedIndicators: [],
    recommendation: ""
  };

  const textAvailable =
    text.riskLevel !== "UNKNOWN";

  const qrAvailable =
    qr.riskLevel !== "UNKNOWN";

  /*
   * OCR exists but QR does not.
   * Preserve the existing screenshot behaviour.
   */
  if (textAvailable && !qrAvailable) {
    return {
      ...text,
      analysisSources: ["OCR"],
      combinedScore: text.score
    };
  }

  /*
   * QR exists but OCR does not.
   */
  if (!textAvailable && qrAvailable) {
    return {
      ...qr,
      analysisSources: ["QR"],
      combinedScore: qr.score
    };
  }

  /*
   * Neither OCR nor QR produced usable information.
   */
  if (!textAvailable && !qrAvailable) {
    return {
      riskLevel: "UNKNOWN",
      score: 0,
      warnings: [
        "No usable text or QR information was available for risk analysis."
      ],
      matchedIndicators: [],
      recommendation:
        "Upload a clearer payment screenshot or QR image and verify the recipient directly in your UPI app.",
      analysisSources: [],
      combinedScore: 0
    };
  }

  /*
   * Both OCR and QR are available.
   *
   * Use the stronger score instead of simply adding both.
   * This prevents the same suspicious wording from being
   * counted twice when it appears in both OCR and QR data.
   */
  let combinedScore = Math.max(
    text.score,
    qr.score
  );

  /*
   * Independent corroboration.
   *
   * If both OCR and QR independently indicate meaningful
   * risk, add a small bonus.
   */
  if (
    text.score >= 40 &&
    qr.score >= 40
  ) {
    combinedScore += 10;
  }

  combinedScore = clamp(combinedScore);

  let riskLevel = "LOW";

  if (combinedScore >= 70) {
    riskLevel = "HIGH";
  } else if (combinedScore >= 40) {
    riskLevel = "MEDIUM";
  }

  const matchedIndicators = [
    ...(text.matchedIndicators || []),
    ...(qr.matchedIndicators || [])
  ];

  const warnings = [
    ...(text.warnings || []),
    ...(qr.warnings || [])
  ];

  let recommendation =
    "No major warning signs were detected across the available screenshot and QR information. Still verify the recipient and payment details independently before paying.";

  if (riskLevel === "MEDIUM") {
    recommendation =
      "Be cautious. Suspicious patterns were detected in the screenshot or QR contents. Verify the recipient and payment purpose independently before approving the payment.";
  }

  if (riskLevel === "HIGH") {
    recommendation =
      "Do not approve the payment yet. Multiple suspicious indicators were detected across the screenshot and QR contents. Independently verify the recipient and payment request.";
  }

  return {
    riskLevel,
    score: combinedScore,
    combinedScore,
    warnings: [...new Set(warnings)],
    matchedIndicators: [
      ...new Set(matchedIndicators)
    ],
    recommendation,
    analysisSources: ["OCR", "QR"],
    assessmentScope:
      "Combined OCR text and QR payload suspicious-pattern analysis"
  };
}


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  analyzeTextRisk,
  analyzeUpiId,
  analyzeLink,
  analyzeQrDetails,
  combineScreenshotRisk
};