const knowledge = [
  {
    id: "upi-payment",
    keywords: [
      "how to pay",
      "make payment",
      "send money",
      "pay using upi",
      "upi payment",
      "how can i pay",
      "how do i pay"
    ],
    answer:
      "To make a UPI payment, open your trusted UPI app, verify the receiver's UPI ID or QR details, enter the amount, review the payment screen carefully, and authorize it with your UPI PIN. Never enter your UPI PIN on a website, form, message link, or screen shared by someone else."
  },

  {
    id: "receive-money",
    keywords: [
      "receive money",
      "get money",
      "someone will send",
      "receive payment",
      "receive rs",
      "receive rupees"
    ],
    answer:
      "To receive money through UPI, you normally do not need to enter your UPI PIN. Be especially careful if someone tells you to scan a QR code or enter your UPI PIN to receive money. Scanning a QR code and entering a UPI PIN is generally used to authorize a payment, not to receive money."
  },

  {
    id: "upi-pin",
    keywords: [
      "what is upi pin",
      "upi pin",
      "what is pin",
      "pin meaning",
      "pin required",
      "pin safe"
    ],
    answer:
      "Your UPI PIN is the authentication code used to authorize UPI transactions. Never share it with anyone, including bank employees, customer-care agents, police officers or PayCheck UPI. Enter it only inside your trusted UPI application when you are intentionally authorizing a transaction."
  },

  {
    id: "otp",
    keywords: [
      "otp",
      "one time password",
      "verification code",
      "share code",
      "send otp"
    ],
    answer:
      "Never share an OTP with another person. A genuine support representative should not ask you to disclose your OTP. If someone pressures you to provide one urgently, stop the conversation and verify through your bank's official channel."
  },

  {
    id: "qr-scam",
    keywords: [
      "qr code",
      "scan qr",
      "scan this qr",
      "qr to receive",
      "qr payment",
      "qr scam"
    ],
    answer:
      "Be careful with unexpected QR codes. Scanning a QR code can initiate a payment flow. If someone says you must scan a QR and enter your UPI PIN to receive money, treat it as a major warning sign. Verify the transaction details inside your trusted UPI app before authorizing anything."
  },

  {
    id: "upi-id",
    keywords: [
      "upi id",
      "vpa",
      "check upi",
      "upi address"
    ],
    answer:
      "A UPI ID identifies a UPI account for sending or receiving payments. Before paying, verify the displayed recipient name and transaction details in your UPI app. PayCheck UPI can analyze a UPI ID for suspicious patterns, but local pattern analysis cannot prove that an account exists or is safe."
  },

  {
    id: "kyc-scam",
    keywords: [
      "kyc",
      "account blocked",
      "account will be blocked",
      "bank blocked",
      "pan update",
      "kyc expired",
      "verify account",
      "update kyc",
      "verify kyc"
    ],
    answer:
      "Unexpected KYC or account-blocking messages are a common scam pattern. Do not open suspicious links or provide banking credentials. Contact your bank using the official app, website or number printed on your card, not the contact information supplied in the suspicious message."
  },

  {
    id: "remote-access",
    keywords: [
      "anydesk",
      "teamviewer",
      "remote access",
      "screen sharing",
      "remote app",
      "install app",
      "fix my upi",
      "support asked me to install"
    ],
    answer:
      "Do not install a remote-access application because an unexpected caller claims to be from your bank. Remote-access software can allow another person to view or control your device. Stop the interaction and contact your bank through its official channel."
  },

  {
    id: "fake-bank",
    keywords: [
      "bank called",
      "bank employee",
      "bank officer",
      "customer care",
      "customer support",
      "bank representative",
      "fake bank"
    ],
    answer:
      "Do not trust a caller only because they claim to represent your bank. Never disclose your UPI PIN, OTP, CVV, password or other authentication credentials. End the call and independently contact your bank using an official number."
  },

  {
    id: "refund-scam",
    keywords: [
      "refund",
      "cashback",
      "cash back",
      "reward",
      "prize",
      "refund link"
    ],
    answer:
      "Unexpected refunds, cashback or prize messages can be used to trick users into opening malicious links or authorizing payments. Verify the transaction independently through the official merchant or bank application."
  },

  {
    id: "investment-scam",
    keywords: [
      "investment",
      "double money",
      "double my money",
      "guaranteed profit",
      "guaranteed return",
      "guaranteed returns",
      "profit",
      "trading scheme",
      "crypto profit"
    ],
    answer:
      "Guaranteed or unusually high returns, especially when combined with pressure to send money immediately, are major scam indicators. Do not transfer money based only on a message, social-media profile or unknown investment platform."
  },

  {
    id: "job-scam",
    keywords: [
      "online job",
      "part time job",
      "work from home",
      "job offer",
      "registration fee",
      "job payment",
      "captcha job"
    ],
    answer:
      "Be careful with online jobs that promise unusually high earnings and then demand registration fees, deposits or other payments. Verify the company independently before sending money or documents."
  },

  {
    id: "message-scam",
    keywords: [
      "message scam",
      "sms scam",
      "suspicious sms",
      "whatsapp scam",
      "telegram scam",
      "text message",
      "message link"
    ],
    answer:
      "Treat unexpected messages asking you to click a link, make a payment, share OTP/PIN details or act urgently as suspicious. Do not reply or open the link. You can use PayCheck UPI's Message Analyzer to inspect the message."
  },

  {
    id: "link-scam",
    keywords: [
      "suspicious link",
      "fake link",
      "phishing link",
      "website link",
      "url scam",
      "link safe",
      "check link"
    ],
    answer:
      "Do not open suspicious payment or KYC links. Look for urgency, unusual domains, shortened URLs, requests for credentials and unexpected payment instructions. PayCheck UPI's Link Scanner can analyze the URL for suspicious indicators."
  },

  {
    id: "screenshot-scam",
    keywords: [
      "screenshot",
      "payment screenshot",
      "fake screenshot",
      "payment proof",
      "qr screenshot",
      "transaction screenshot"
    ],
    answer:
      "A payment screenshot is not proof that money actually reached your account. Verify the transaction inside your own bank or UPI app. PayCheck UPI's Screenshot Scanner can extract payment details, inspect QR data and identify inconsistencies such as mismatched amounts."
  },

  {
    id: "after-scam",
    keywords: [
      "money stolen",
      "money lost",
      "already paid",
      "already sent",
      "scammed",
      "fraud happened",
      "lost money",
      "money gone",
      "upi fraud",
      "unauthorized transaction",
      "fraudulent transaction"
    ],
    answer:
      "If you have suffered a cyber financial fraud, act immediately. Call India's cyber-fraud helpline 1930 and report the incident through the National Cyber Crime Reporting Portal. Also contact your bank/payment provider through its official channel, preserve transaction records and screenshots, and do not send additional money to the scammer."
  },

  {
    id: "report-scam",
    keywords: [
      "where to report",
      "report scam",
      "report fraud",
      "government complaint",
      "cyber crime",
      "police complaint",
      "government helpline",
      "1930"
    ],
    answer:
      "For cyber financial fraud in India, call 1930 immediately and report the incident through the National Cyber Crime Reporting Portal. The portal also provides facilities for reporting suspicious identifiers such as URLs, phone numbers, email IDs, SMS numbers and social-media identifiers."
  },

  {
    id: "safe-payment",
    keywords: [
      "safe payment",
      "payment safety",
      "how to stay safe",
      "upi safety",
      "safe upi",
      "digital payment safety"
    ],
    answer:
      "Before paying, verify the recipient, amount and purpose. Never share your UPI PIN or OTP. Do not trust unexpected QR codes or links. Do not install remote-access apps because of an unsolicited support call. If something feels urgent or unusually profitable, stop and verify independently."
  }
];


/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeMessage(message = "") {
  return String(message)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


/* =========================================================
   ENTITY EXTRACTION
========================================================= */

function extractUpiIds(text = "") {
  const matches =
    String(text).match(
      /\b[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}\b/g
    ) || [];

  return [...new Set(matches)].slice(0, 10);
}


function extractUrls(text = "") {
  const matches =
    String(text).match(
      /\bhttps?:\/\/[^\s<>"']+|\bwww\.[^\s<>"']+|\b[a-zA-Z0-9.-]+\.(?:com|in|org|net|co|xyz|site|online)\b/gi
    ) || [];

  return [
    ...new Set(
      matches.map((url) =>
        url.replace(/[.,;:!?]+$/, "")
      )
    )
  ].slice(0, 10);
}


function extractPhoneNumbers(text = "") {
  const matches =
    String(text).match(
      /(?:\+91[\s-]?)?[6-9]\d{9}\b/g
    ) || [];

  return [
    ...new Set(
      matches.map((number) =>
        number.replace(/[\s-]/g, "")
      )
    )
  ].slice(0, 10);
}

function extractAmounts(text = "") {
  const input = String(text);
  const matches = [];

  const patterns = [
    /₹\s*[\d,]+(?:\.\d+)?/gi,
    /\b(?:rs|inr)\.?\s*[\d,]+(?:\.\d+)?\b/gi,
    /\b[\d,]+(?:\.\d+)?\s*(?:rupees|rs|inr)\b/gi
  ];

  for (const pattern of patterns) {
    matches.push(...(input.match(pattern) || []));
  }

  return [
    ...new Set(
      matches.map((amount) => amount.trim())
    )
  ].slice(0, 10);
}


/* =========================================================
   INTENT DETECTION
========================================================= */

function detectIntent(message = "") {
  const text = normalizeMessage(message);

  /*
     COMPLETED FRAUD
  */

  const completedFraudPatterns = [
    "money stolen",
    "money lost",
    "money gone",
    "already sent",
    "already paid",
    "already transferred",
    "scammed",
    "fraud happened",
    "upi fraud",
    "unauthorized transaction",
    "fraudulent transaction"
  ];

  if (
    completedFraudPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "after-scam";
  }


  /*
     REMOTE ACCESS
  */

  const remotePatterns = [
    "anydesk",
    "teamviewer",
    "remote access",
    "screen sharing",
    "remote app",
    "support asked me to install",
    "install remote"
  ];

  if (
    remotePatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "remote-access";
  }


  /*
     KYC
  */

  const kycPatterns = [
    "kyc expired",
    "update kyc",
    "verify kyc",
    "kyc",
    "account will be blocked",
    "account blocked",
    "verify account",
    "pan update"
  ];

  if (
    kycPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "kyc-scam";
  }


  /*
     INVESTMENT
  */

  const investmentPatterns = [
    "double my money",
    "double money",
    "guaranteed profit",
    "guaranteed return",
    "guaranteed returns",
    "send money for profit",
    "risk free profit"
  ];

  if (
    investmentPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "investment-scam";
  }


  /*
     JOB SCAM
  */

  const jobPatterns = [
    "registration fee",
    "pay to get job",
    "captcha job",
    "job deposit",
    "send money for job",
    "job payment"
  ];

  if (
    jobPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "job-scam";
  }


  /*
     QR
  */

  const qrPatterns = [
    "qr code",
    "scan qr",
    "scan this qr",
    "qr to receive",
    "qr scam"
  ];

  if (
    qrPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "qr-scam";
  }


  /*
     SCREENSHOT
  */

  const screenshotPatterns = [
    "payment screenshot",
    "fake screenshot",
    "payment proof",
    "qr screenshot",
    "transaction screenshot",
    "scan screenshot",
    "check screenshot"
  ];

  if (
    screenshotPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "screenshot-scam";
  }
  /*
   SCREENSHOT / QR MISMATCH
   Detect when a screenshot contains one amount
   while the QR/payment data contains another.
*/

const hasScreenshotContext =
  /\b(screenshot|payment screenshot|fake screenshot|payment proof|transaction screenshot|qr screenshot)\b/i.test(
    text
  );

const screenshotAmounts =
  extractAmounts(message);

const hasMismatchLanguage =
  /\b(mismatch|mismatched|doesn.?t match|does not match|different|conflict|conflicting|discrepancy|but the qr|qr.*(?:says|shows|contains)|screenshot.*(?:says|shows)|amount.*(?:vs|versus|but))\b/i.test(
    text
  );

if (
  hasScreenshotContext &&
  screenshotAmounts.length >= 2 &&
  hasMismatchLanguage
) {
  return "screenshot-scam";
}


  /*
     LINK
  */

  const linkPatterns = [
    "suspicious link",
    "fake link",
    "phishing link",
    "check this link",
    "link safe",
    "url scam",
    "check url"
  ];

  if (
    linkPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "link-scam";
  }


  /*
     MESSAGE
  */

  const messagePatterns = [
    "message scam",
    "sms scam",
    "suspicious sms",
    "whatsapp scam",
    "telegram scam",
    "message link",
    "analyze this message",
    "check this message"
  ];

  if (
    messagePatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "message-scam";
  }


  /*
     REFUND
  */

  const refundPatterns = [
    "refund",
    "cashback",
    "cash back",
    "reward",
    "prize"
  ];

  if (
    refundPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "refund-scam";
  }


  /*
     BANK IMPERSONATION
  */

  const bankPatterns = [
    "bank called",
    "bank employee",
    "bank officer",
    "customer care",
    "customer support",
    "bank representative",
    "fake bank"
  ];

  if (
    bankPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "fake-bank";
  }


  /*
     REPORT
  */

  const reportPatterns = [
    "where to report",
    "report scam",
    "report fraud",
    "government complaint",
    "government helpline",
    "cyber crime",
    "police complaint",
    "1930"
  ];

  if (
    reportPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "report-scam";
  }


  /*
     RECEIVE MONEY
  */

  const receivePatterns = [
    "receive money",
    "receive payment",
    "get money",
    "someone will send"
  ];

  if (
    receivePatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "receive-money";
  }


  /*
     UPI PIN
  */

  const pinPatterns = [
    "what is upi pin",
    "upi pin",
    "pin safe",
    "pin required"
  ];

  if (
    pinPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "upi-pin";
  }


  /*
     OTP
  */

  const otpPatterns = [
    "otp",
    "one time password",
    "verification code"
  ];

  if (
    otpPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "otp";
  }


  /*
     IMPORTANT:
     Detect an actual payment request BEFORE
     falling back to UPI ID.
  */

  const hasPaymentVerb =
    /\b(send|pay|transfer|deposit|payment)\b/i.test(text);

  const hasMoneyContext =
    extractAmounts(message).length > 0 ||
    /\b(money|rupees|rs|inr)\b/i.test(text);

  const hasUpiId =
    extractUpiIds(message).length > 0;

  if (
    hasPaymentVerb &&
    (hasMoneyContext || hasUpiId)
  ) {
    return "upi-payment";
  }


  /*
     GENERAL UPI PAYMENT QUESTIONS
  */

  const paymentPatterns = [
    "how to pay",
    "make payment",
    "send money",
    "pay using upi",
    "upi payment",
    "how can i pay",
    "how do i pay"
  ];

  if (
    paymentPatterns.some((pattern) =>
      text.includes(pattern)
    )
  ) {
    return "upi-payment";
  }


  /*
     UPI ID CHECK
  */

  if (
    hasUpiId
  ) {
    return "upi-id";
  }


  /*
     URL CHECK
  */

  if (
    extractUrls(message).length > 0
  ) {
    return "link-scam";
  }


  return "general";
}


/* =========================================================
   SCAM SIGNALS
========================================================= */

function detectSignals(message = "") {
  const text = normalizeMessage(message);

  const indicators = [];
  let score = 0;

  const add = (points, label) => {
    score += points;
    indicators.push(label);
  };


  /*
     URGENCY
  */

  if (
    /\b(urgent|urgently|immediately|now|today|act fast|hurry|asap)\b/i.test(
      text
    )
  ) {
    add(
      15,
      "Urgency or pressure tactic"
    );
  }


  /*
     CREDENTIALS
  */

  if (
    /\b(upi pin|pin|otp|password|cvv|card number|bank details|account details)\b/i.test(
      text
    )
  ) {
    add(
      30,
      "Sensitive credential request"
    );
  }


  /*
     KYC
  */

  if (
    /\b(kyc|account blocked|account will be blocked|verify account|pan update)\b/i.test(
      text
    )
  ) {
    add(
      25,
      "KYC or account-blocking threat"
    );
  }


  /*
     QR RECEIVE SCAM
  */

  if (
    /\b(qr|scan this|scan the qr)\b/i.test(text) &&
    /\b(receive|get|claim|refund|cashback|reward)\b/i.test(text)
  ) {
    add(
      30,
      "QR-based payment deception"
    );
  }


  /*
     REMOTE ACCESS
  */

  if (
    /\b(anydesk|teamviewer|remote access|screen sharing|remote app)\b/i.test(
      text
    )
  ) {
    add(
      35,
      "Remote-access request"
    );
  }


  /*
     IMPERSONATION
  */

  if (
    /\b(bank|police|government|rbi|upi support|customer care|customer support)\b/i.test(
      text
    ) &&
    /\b(called|call|calling|message|sms|contacted|saying|asked)\b/i.test(
      text
    )
  ) {
    add(
      20,
      "Possible impersonation"
    );
  }


  /*
     GUARANTEED RETURNS
  */

  if (
    /\b(double my money|guaranteed profit|guaranteed return|guaranteed returns|double money|risk free)\b/i.test(
      text
    )
  ) {
    add(
      35,
      "Unrealistic guaranteed-return promise"
    );
  }


  /*
     JOB PAYMENT
  */

  if (
    /\b(job|work from home|part time)\b/i.test(text) &&
    /\b(pay|send|deposit|fee|registration)\b/i.test(text)
  ) {
    add(
      25,
      "Job scam payment request"
    );
  }


  /*
     REFUND / REWARD
  */

  if (
    /\b(refund|cashback|reward|prize|gift)\b/i.test(text) &&
    /\b(link|qr|pay|payment|pin|otp)\b/i.test(text)
  ) {
    add(
      25,
      "Fake refund or reward pattern"
    );
  }


  /*
     SUSPICIOUS LINK
  */

  if (
    (
      extractUrls(message).length > 0 ||
      /\b(link|url|website|http|https|www\.)\b/i.test(text)
    ) &&
    /\b(kyc|verify|payment|refund|reward|account|login|otp|pin)\b/i.test(
      text
    )
  ) {
    add(
      25,
      "Suspicious link with sensitive action"
    );
  }


  /*
     PAYMENT REQUEST
  */

  if (
    /\b(send|pay|transfer|deposit)\b/i.test(text) &&
    (
      extractAmounts(message).length > 0 ||
      /\b(money|rupees|rs|inr)\b/i.test(text)
    )
  ) {
    add(
      15,
      "Payment request"
    );
  }


  /*
     AMOUNT DETECTED
  */

  if (
    extractAmounts(message).length > 0
  ) {
    add(
      10,
      "Payment amount detected"
    );
  }

/*
   SCREENSHOT / QR PAYMENT MISMATCH
*/

const hasScreenshotContextForRisk =
  /\b(screenshot|payment screenshot|payment proof|transaction screenshot|qr screenshot)\b/i.test(
    text
  );

const screenshotAmountValues =
  extractAmounts(message);

const hasMismatchLanguageForRisk =
  /\b(mismatch|mismatched|doesn.?t match|does not match|different|conflict|conflicting|discrepancy|but the qr|qr.*(?:says|shows|contains)|screenshot.*(?:says|shows)|amount.*(?:vs|versus|but))\b/i.test(
    text
  );

if (
  hasScreenshotContextForRisk &&
  screenshotAmountValues.length >= 2 &&
  hasMismatchLanguageForRisk
) {
  score = Math.max(score, 60);

  indicators.push(
    "OCR ↔ QR payment mismatch"
  );
}
  /*
     UPI ID IN PAYMENT CONTEXT
  */

  if (
    extractUpiIds(message).length > 0 &&
    /\b(send|pay|transfer|payment)\b/i.test(text)
  ) {
    add(
      5,
      "UPI ID involved in payment request"
    );
  }


  return {
    score: Math.min(score, 100),
    indicators: [
      ...new Set(indicators)
    ]
  };
}


/* =========================================================
   RISK CLASSIFICATION
========================================================= */

function getRiskLevel(score) {
  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  return "LOW";
}


/* =========================================================
   CRITICAL SCAM DETECTION
========================================================= */

function detectCriticalSituation(message = "") {
  const text = normalizeMessage(message);

  const criticalPatterns = [
    /already\s+(sent|paid|transferred)/i,
    /money\s+(is\s+)?(gone|lost|stolen)/i,
    /i\s+(was|am)\s+scammed/i,
    /upi fraud/i,
    /bank account.*debit/i,
    /unauthorized transaction/i,
    /fraudulent transaction/i
  ];

  return criticalPatterns.some(
    (pattern) =>
      pattern.test(text)
  );
}


/* =========================================================
   SPECIAL SCAM COMBINATIONS
========================================================= */

function applyCombinationRules(
  message,
  score,
  indicators
) {
  const text = normalizeMessage(message);


  /*
     KYC + LINK
  */

  const hasLink =
    extractUrls(message).length > 0 ||
    /\b(link|url|website)\b/i.test(text);

  const hasKyc =
    /\b(kyc|account blocked|account will be blocked|verify account|pan update)\b/i.test(
      text
    );

  if (hasLink && hasKyc) {
    score = Math.max(score, 75);

    indicators.push(
      "KYC threat combined with suspicious link"
    );
  }


  /*
     INVESTMENT + PAYMENT
  */

  const hasInvestment =
    /\b(double my money|guaranteed profit|guaranteed return|guaranteed returns|double money)\b/i.test(
      text
    );

  const hasPayment =
    /\b(send|pay|transfer)\b/i.test(text) &&
    (
      extractAmounts(message).length > 0 ||
      /\b(money|rupees|rs|inr)\b/i.test(text)
    );

  if (
    hasInvestment &&
    hasPayment
  ) {
    score = Math.max(score, 80);

    indicators.push(
      "Guaranteed investment promise combined with payment request"
    );
  }


  /*
     QR + RECEIVE + PIN
  */

  const hasQr =
    /\b(qr|scan)\b/i.test(text);

  const hasReceive =
    /\b(receive|get|claim)\b/i.test(text);

  const hasPin =
    /\b(pin|upi pin)\b/i.test(text);

  if (
    hasQr &&
    hasReceive &&
    hasPin
  ) {
    score = Math.max(score, 85);

    indicators.push(
      "QR + receiving-money claim + UPI PIN request"
    );
  }


  /*
     BANK + REMOTE ACCESS
  */

  const hasRemote =
    /\b(anydesk|teamviewer|remote access|screen sharing|remote app)\b/i.test(
      text
    );

  const hasBank =
    /\b(bank|upi support|customer care|customer support|bank employee|bank officer)\b/i.test(
      text
    );

  if (
    hasRemote &&
    hasBank
  ) {
    score = Math.max(score, 90);

    indicators.push(
      "Bank impersonation combined with remote-access request"
    );
  }


  /*
     URGENCY + PAYMENT + UPI
     
     This is the important new combination
     for messages such as:
     "Pay ₹5000 to rahul@ybl urgently."
  */

  const hasUrgency =
    /\b(urgent|urgently|immediately|now|today|asap|hurry|act fast)\b/i.test(
      text
    );

  const hasPaymentRequest =
    /\b(send|pay|transfer|deposit|payment)\b/i.test(text);

  const hasPaymentAmount =
    extractAmounts(message).length > 0;

  const hasPaymentUpi =
    extractUpiIds(message).length > 0;

  if (
    hasUrgency &&
    hasPaymentRequest &&
    hasPaymentAmount &&
    hasPaymentUpi
  ) {
    score = Math.max(score, 45);

    indicators.push(
      "Urgent payment request involving a UPI ID"
    );
  }


  /*
     URGENCY + PAYMENT + AMOUNT
  */

  if (
    hasUrgency &&
    hasPaymentRequest &&
    hasPaymentAmount
  ) {
    score = Math.max(score, 40);

    indicators.push(
      "Urgent payment request with a specified amount"
    );
  }


  return {
    score: Math.min(score, 100),
    indicators: [
      ...new Set(indicators)
    ]
  };
}


/* =========================================================
   RESPONSE ACTIONS
========================================================= */

function getActions(
  intent,
  riskLevel
) {
  const actions = [];


  if (
    intent === "upi-payment" ||
    intent === "upi-id"
  ) {
    actions.push(
      "Verify the recipient name and UPI ID before authorizing payment.",
      "Review the amount carefully.",
      "Do not pay only because someone is creating urgency or pressure.",
      "Enter your UPI PIN only inside your trusted UPI application."
    );
  }


  if (
    intent === "receive-money"
  ) {
    actions.push(
      "You normally do not need your UPI PIN to receive money.",
      "Do not scan an unexpected QR code to receive money.",
      "Verify incoming payments in your own bank or UPI app."
    );
  }


  if (
    intent === "qr-scam"
  ) {
    actions.push(
      "Do not scan an unexpected QR code.",
      "Never enter your UPI PIN just to receive money.",
      "Verify the payment request inside your UPI app."
    );
  }


  if (
    intent === "link-scam" ||
    intent === "message-scam"
  ) {
    actions.push(
      "Do not open the suspicious link.",
      "Do not enter your OTP, UPI PIN or banking credentials.",
      "Use PayCheck UPI's Link Scanner or Message Analyzer."
    );
  }


  if (
    intent === "screenshot-scam"
  ) {
    actions.push(
      "Do not trust a screenshot as proof of payment.",
      "Check your own bank or UPI transaction history.",
      "Use PayCheck UPI's Screenshot Scanner to inspect the screenshot."
    );
  }


  if (
    intent === "remote-access"
  ) {
    actions.push(
      "Do not install AnyDesk, TeamViewer or another remote-access app because of an unsolicited call.",
      "End the call.",
      "Contact your bank through its official channel."
    );
  }


  if (
    intent === "kyc-scam"
  ) {
    actions.push(
      "Do not open links from unexpected KYC messages.",
      "Do not provide OTP, UPI PIN or banking credentials.",
      "Contact your bank using its official app or website."
    );
  }


  if (
    intent === "fake-bank"
  ) {
    actions.push(
      "Do not trust an unexpected caller claiming to be your bank.",
      "Never disclose OTP, UPI PIN, CVV or passwords.",
      "Contact your bank using an independently verified official number."
    );
  }


  if (
    intent === "investment-scam"
  ) {
    actions.push(
      "Do not transfer money based on guaranteed-profit promises.",
      "Verify the investment platform independently.",
      "Do not share banking credentials or OTPs."
    );
  }


  if (
    intent === "job-scam"
  ) {
    actions.push(
      "Do not pay a registration or deposit fee for an unverified job.",
      "Verify the company independently.",
      "Do not share sensitive banking information."
    );
  }


  if (
    intent === "refund-scam"
  ) {
    actions.push(
      "Do not use unexpected refund links or QR codes.",
      "Verify the refund through the official merchant or bank app.",
      "Do not disclose OTP or UPI PIN."
    );
  }


  if (
    riskLevel === "HIGH" ||
    intent === "after-scam"
  ) {
    actions.push(
      "Call 1930 immediately if money has been lost through cyber financial fraud.",
      "Report the incident at the National Cyber Crime Reporting Portal.",
      "Contact your bank/payment provider through its official channel.",
      "Preserve screenshots, transaction IDs, URLs, phone numbers and messages."
    );
  }


  return [
    ...new Set(actions)
  ];
}


/* =========================================================
   GOVERNMENT REPORTING RESPONSE
========================================================= */

function getGovernmentReportingResponse() {
  return [
    "For cyber financial fraud in India:",
    "",
    "1. Call 1930 immediately.",
    "2. Report the incident at the National Cyber Crime Reporting Portal: https://www.cybercrime.gov.in/",
    "3. Contact your bank or payment provider using its official contact channel.",
    "4. Preserve transaction IDs/UTRs, screenshots, messages, URLs, phone numbers and other evidence.",
    "",
    "The NCRP also has a Report Suspect facility for suspicious URLs, phone numbers, email IDs, SMS numbers, WhatsApp/Telegram identifiers and social-media URLs."
  ].join("\n");
}


/* =========================================================
   TOOL SUGGESTIONS
========================================================= */

function getToolSuggestions(
  intent,
  entities
) {
  return {
    upiChecker:
      entities.upiIds.length > 0 ||
      intent === "upi-id" ||
      intent === "upi-payment",

    linkScanner:
      entities.urls.length > 0 ||
      intent === "link-scam",

    messageAnalyzer:
      intent === "message-scam",

    screenshotScanner:
      intent === "screenshot-scam"
  };
}


/* =========================================================
   MAIN CHAT CONTROLLER
========================================================= */

exports.chat = async (
  req,
  res
) => {
  try {
    const message =
      String(
        req.body?.message || ""
      ).trim();


    if (!message) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a message."
      });
    }


    /*
       INTENT
    */

    const intent =
      detectIntent(message);


    /*
       BASE ANSWER
    */

    let answer =
      knowledge.find(
        (item) =>
          item.id === intent
      )?.answer ||
      "I can help you check UPI payments, suspicious messages, links, QR codes, screenshots and common digital-payment scams.";


    /*
       ENTITIES
    */

    const entities = {
      upiIds:
        extractUpiIds(message),

      urls:
        extractUrls(message),

      phoneNumbers:
        extractPhoneNumbers(message),

      amounts:
        extractAmounts(message)
    };


    /*
       SIGNALS
    */

    let {
      score,
      indicators
    } = detectSignals(message);


    /*
       COMBINATION RULES
    */

    const combination =
      applyCombinationRules(
        message,
        score,
        indicators
      );

    score =
      combination.score;

    indicators =
      combination.indicators;
      /*
   SCREENSHOT MISMATCH RESPONSE
*/

const screenshotMismatch =
  /\b(screenshot|payment screenshot|payment proof|transaction screenshot|qr screenshot)\b/i.test(
    message
  ) &&
  extractAmounts(message).length >= 2 &&
  /\b(mismatch|mismatched|doesn.?t match|does not match|different|conflict|conflicting|discrepancy|but the qr|qr.*(?:says|shows|contains)|screenshot.*(?:says|shows)|amount.*(?:vs|versus|but))\b/i.test(
    normalizeMessage(message)
  );

if (screenshotMismatch) {
  score = Math.max(score, 70);

  if (
    !indicators.includes(
      "OCR ↔ QR payment mismatch"
    )
  ) {
    indicators.push(
      "OCR ↔ QR payment mismatch"
    );
  }

  answer =
    "🚨 Payment details appear to conflict. A screenshot is not proof that money was received, and a QR code may contain different payment data. Do not approve the payment until the recipient and amount are independently verified in your own UPI app.";
}


    /*
       CRITICAL FRAUD
    */

    const critical =
      detectCriticalSituation(
        message
      );

    if (critical) {
      score = 95;

      answer =
        "🚨 This may be a cyber financial fraud situation.\n\n" +
        "Act immediately:\n" +
        "• Call 1930, India's cyber-fraud helpline.\n" +
        "• Report the incident at the National Cyber Crime Reporting Portal.\n" +
        "• Contact your bank/payment provider through its official channel.\n" +
        "• Preserve transaction IDs, screenshots, messages, URLs and phone numbers.\n" +
        "• Do not send any additional money to the scammer.";

      indicators.push(
        "Possible completed financial fraud"
      );
    }


    /*
       REPORTING
    */

    if (
      intent === "report-scam"
    ) {
      answer =
        getGovernmentReportingResponse();
    }


    /*
       RISK LEVEL
    */

    const riskLevel =
      getRiskLevel(score);


    /*
       HIGH RISK RESPONSE
    */

    if (
      riskLevel === "HIGH" &&
      !critical &&
      intent !== "report-scam"
    ) {
      answer =
        "⚠️ HIGH RISK detected.\n\n" +
        answer +
        "\n\nDo not continue the requested payment or share sensitive information until the situation has been independently verified.";
    }


    /*
       MEDIUM RISK RESPONSE
    */

    if (
      riskLevel === "MEDIUM" &&
      !critical &&
      intent !== "report-scam"
    ) {
      answer =
        "⚠️ Be careful.\n\n" +
        answer +
        "\n\nVerify the situation independently before taking any payment-related action.";
    }


    /*
       RECOMMENDED ACTIONS
    */

    const recommendedActions =
      getActions(
        intent,
        riskLevel
      );


    /*
       CONFIDENCE
    */

    let confidence = 70;

    if (
      intent !== "general"
    ) {
      confidence += 15;
    }

    if (
      indicators.length >= 2
    ) {
      confidence += 10;
    }

    if (
      entities.upiIds.length > 0
    ) {
      confidence += 5;
    }

    if (
      entities.urls.length > 0
    ) {
      confidence += 5;
    }

    if (
      entities.amounts.length > 0
    ) {
      confidence += 5;
    }

    confidence =
      Math.min(
        confidence,
        98
      );


    /*
       TOOL SUGGESTIONS
    */

    const toolSuggestions =
      getToolSuggestions(
        intent,
        entities
      );


    /*
       RESPONSE
    */

    return res.json({
      success: true,

      data: {
        answer,

        assistant:
          "PayCheck AI Safety Assistant",

        intent,

        riskLevel,

        riskScore:
          score,

        confidence,

        scamType:
          riskLevel === "LOW"
            ? "No strong scam indicators detected"
            : intent,

        indicators: [
          ...new Set(indicators)
        ],

        recommendedActions,

        entities,

        toolSuggestions
      }
    });

  } catch (error) {
    console.error(
      "Chat controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "The safety assistant is temporarily unavailable."
    });
  }
};    