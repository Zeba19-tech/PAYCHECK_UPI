import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  XCircle,
  QrCode,
  ArrowRight,
  TriangleAlert
} from "lucide-react";

import { RiskResult } from "./UpiChecker";
import { unlockSiren } from "../services/siren";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function extractUpiId(text = "") {
  if (!text) return "";

  const normalizedText = text
    .replace(/\s+/g, " ")
    .trim();

  const matches = normalizedText.match(
    /[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z0-9][a-zA-Z0-9.-]{1,63}/g
  );

  if (!matches || matches.length === 0) {
    return "";
  }

  return matches[0].replace(/[.,;:!?]+$/, "");
}

function cleanAmount(amount = "") {
  if (amount === null || amount === undefined) {
    return "";
  }

  return String(amount)
    .replace(/₹/g, "")
    .replace(/INR/gi, "")
    .replace(/[,\s]/g, "")
    .trim();
}

function formatAmount(amount = "") {
  const cleaned = cleanAmount(amount);

  if (!cleaned) {
    return "Not detected";
  }

  return `₹${cleaned}`;
}

function amountsMatch(first = "", second = "") {
  const a = cleanAmount(first);
  const b = cleanAmount(second);

  if (!a || !b) {
    return false;
  }

  return Number(a) === Number(b);
}

function getMismatchValues(data = {}) {
  const comparison = data.paymentComparison || {};

  let ocrAmount =
    data.ocrDetectedDetails?.amount ||
    comparison.ocrAmount ||
    "";

  let qrAmount =
    data.qrDetails?.amount ||
    comparison.qrAmount ||
    "";

  let ocrUpiId =
    data.ocrDetectedDetails?.upiId ||
    comparison.ocrUpiId ||
    "";

  let qrUpiId =
    data.qrDetails?.upiId ||
    comparison.qrUpiId ||
    "";

  if (
    !ocrAmount &&
    Array.isArray(comparison.mismatches)
  ) {
    const amountMismatch = comparison.mismatches.find(
      (item) =>
        String(item.field || "")
          .toLowerCase()
          .includes("amount")
    );

    if (amountMismatch) {
      ocrAmount =
        amountMismatch.ocrValue ||
        amountMismatch.ocrAmount ||
        amountMismatch.visibleValue ||
        "";

      qrAmount =
        amountMismatch.qrValue ||
        amountMismatch.qrAmount ||
        amountMismatch.encodedValue ||
        "";
    }
  }

  if (
    !ocrUpiId &&
    Array.isArray(comparison.mismatches)
  ) {
    const upiMismatch = comparison.mismatches.find(
      (item) => {
        const field = String(
          item.field || ""
        ).toLowerCase();

        return (
          field.includes("upi") ||
          field.includes("vpa")
        );
      }
    );

    if (upiMismatch) {
      ocrUpiId =
        upiMismatch.ocrValue ||
        upiMismatch.ocrUpiId ||
        upiMismatch.visibleValue ||
        "";

      qrUpiId =
        upiMismatch.qrValue ||
        upiMismatch.qrUpiId ||
        upiMismatch.encodedValue ||
        "";
    }
  }

  return {
    ocrAmount,
    qrAmount,
    ocrUpiId,
    qrUpiId
  };
}

function ScreenshotScanner({ onReport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  /*
    ====================================================
    CHATBOT → SCREENSHOT SCANNER
    ====================================================

    The chatbot can open this scanner, but it cannot
    automatically choose/upload a local file.

    The user must explicitly select the screenshot.
  */

  useEffect(() => {
    const handlePrefill = (event) => {
      const tool = event.detail?.tool;

      if (tool !== "screenshotScanner") {
        return;
      }

      setTimeout(() => {
        document
          .getElementById("screenshot-scanner")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        setTimeout(() => {
          fileInputRef.current?.focus();
        }, 500);
      }, 100);
    };

    window.addEventListener(
      "paycheck:prefill",
      handlePrefill
    );

    return () => {
      window.removeEventListener(
        "paycheck:prefill",
        handlePrefill
      );
    };
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    setError("");
    setResult(null);

    if (!selected) {
      setFile(null);
      setPreview("");
      return;
    }

    if (!selected.type.startsWith("image/")) {
      setFile(null);
      setPreview("");
      setError(
        "Please select a valid PNG, JPG, JPEG or WEBP image."
      );
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setPreview("");
      setError(
        "Screenshot must be 5 MB or smaller."
      );
      return;
    }

    setFile(selected);
    setPreview(
      URL.createObjectURL(selected)
    );
  };

  const analyzeScreenshot = async (e) => {
    e.preventDefault();

    await unlockSiren().catch(() => {});

    setError("");
    setResult(null);

    if (!file) {
      setError(
        "Please upload a screenshot first."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "screenshot",
        file
      );

      const response = await axios.post(
        "https://paycheck-upi.onrender.com/api/screenshot/analyze",
        formData,
        {
          timeout: 120000
        }
      );

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Unable to analyze the screenshot."
        );
        return;
      }

      const data =
        response.data.data || {};

      /*
        ----------------------------------------------------
        PRESERVE ORIGINAL OCR DETAILS
        ----------------------------------------------------
      */

      const originalDetectedDetails =
        data.detectedDetails || {};

      const ocrUpiId =
        originalDetectedDetails.upiId ||
        "";

      const ocrAmount =
        originalDetectedDetails.amount ||
        "";

      /*
        ----------------------------------------------------
        UPI ID DETECTION
        Priority:
        1. Backend checkedUpiId
        2. QR UPI ID
        3. Backend upiId
        4. Verification VPA
        5. OCR extraction
        ----------------------------------------------------
      */

      let detectedUpiId =
        data.checkedUpiId ||
        data.qrDetails?.upiId ||
        data.upiId ||
        data.verification?.vpa ||
        ocrUpiId ||
        "";

      if (
        !detectedUpiId &&
        data.extractedText
      ) {
        detectedUpiId =
          extractUpiId(
            data.extractedText
          );
      }

      /*
        ----------------------------------------------------
        PAYMENT AMOUNT
        QR amount is preferred because it is structured data.
        OCR amount remains available for comparison.
        ----------------------------------------------------
      */

      const qrAmount =
        data.qrDetails?.amount ||
        "";

      const detectedAmount =
        qrAmount ||
        ocrAmount ||
        "";

      /*
        ----------------------------------------------------
        PAYEE NAME
        ----------------------------------------------------
      */

      const detectedPayeeName =
        data.qrDetails?.payeeName ||
        "";

      /*
        ----------------------------------------------------
        UPI HANDLE
        ----------------------------------------------------
      */

      const upiHandle =
        detectedUpiId.includes("@")
          ? `@${detectedUpiId.split("@")[1]}`
          : "@Unknown";

      /*
        ----------------------------------------------------
        CONSISTENCY VALUES
        ----------------------------------------------------
      */

      const consistencyValues =
        getMismatchValues({
          ...data,

          ocrDetectedDetails: {
            ...originalDetectedDetails,

            upiId:
              ocrUpiId ||
              data.paymentComparison?.ocrUpiId ||
              "",

            amount:
              ocrAmount ||
              data.paymentComparison?.ocrAmount ||
              ""
          }
        });

      const finalOcrAmount =
        consistencyValues.ocrAmount ||
        ocrAmount ||
        "";

      const finalQrAmount =
        consistencyValues.qrAmount ||
        qrAmount ||
        "";

      const finalOcrUpiId =
        consistencyValues.ocrUpiId ||
        ocrUpiId ||
        "";

      const finalQrUpiId =
        consistencyValues.qrUpiId ||
        data.qrDetails?.upiId ||
        "";

      /*
        ----------------------------------------------------
        FRONTEND SAFETY CHECK
        ----------------------------------------------------
      */

      const amountMismatch =
        finalOcrAmount &&
        finalQrAmount &&
        !amountsMatch(
          finalOcrAmount,
          finalQrAmount
        );

      const upiMismatch =
        finalOcrUpiId &&
        finalQrUpiId &&
        finalOcrUpiId
          .trim()
          .toLowerCase() !==
          finalQrUpiId
            .trim()
            .toLowerCase();

      const backendMismatch =
        Boolean(
          data.paymentComparison?.mismatchDetected
        );

      const mismatchDetected =
        backendMismatch ||
        Boolean(amountMismatch) ||
        Boolean(upiMismatch);

      /*
        ----------------------------------------------------
        BUILD ENHANCED RESULT
        ----------------------------------------------------
      */

      const enhancedResult = {
        ...data,

        checkedUpiId:
          detectedUpiId || undefined,

        detectedDetails: {
          ...originalDetectedDetails,

          upiId:
            detectedUpiId ||
            originalDetectedDetails.upiId ||
            "",

          amount:
            detectedAmount ||
            originalDetectedDetails.amount ||
            ""
        },

        detectedPayeeName,

        upiHandle,

        upiSource:
          data.qrDetails?.upiId
            ? "QR"
            : detectedUpiId
              ? "OCR"
              : "",

        consistency: {
          mismatchDetected,

          ocrAmount:
            finalOcrAmount,

          qrAmount:
            finalQrAmount,

          ocrUpiId:
            finalOcrUpiId,

          qrUpiId:
            finalQrUpiId,

          amountMismatch:
            Boolean(amountMismatch),

          upiMismatch:
            Boolean(upiMismatch)
        }
      };

      setResult(enhancedResult);

      /*
        ----------------------------------------------------
        GLOBAL RISK EVENT
        ----------------------------------------------------
      */

      window.dispatchEvent(
        new CustomEvent(
          "paycheck:risk",
          {
            detail:
              enhancedResult
          }
        )
      );
    } catch (err) {
      console.error(
        "Screenshot analysis error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Screenshot analysis failed. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const report = () => {
    onReport?.({
      type: "Screenshot",

      value:
        file?.name ||
        "Uploaded screenshot",

      score:
        result?.score,

      riskLevel:
        result?.riskLevel,

      upiId:
        result?.checkedUpiId ||
        ""
    });
  };

  const consistency =
    result?.consistency;

  const showMismatch =
    Boolean(
      consistency?.mismatchDetected
    );

  return (
    <section
      className="checker-page screenshot-page"
      id="screenshot-scanner"
    >
      <div className="checker-header">

        <div className="checker-icon">
          <ImageIcon size={34} />
        </div>

        <div>
          <span>
            PAYCHECK UPI SAFETY CENTER
          </span>

          <h2>
            Analyze a Payment Screenshot
          </h2>
        </div>

      </div>

      <p className="checker-description">
        Upload a payment screenshot, transaction
        message or readable QR/payment image.
        OCR extracts visible text and checks it
        for suspicious scam indicators.
      </p>

      <form
        className="checker-form"
        onSubmit={
          analyzeScreenshot
        }
      >

        <label htmlFor="screenshot">
          Payment Screenshot
        </label>

        <label
          htmlFor="screenshot"
          className="upload-area"
        >

          {preview ? (
            <img
              src={preview}
              alt="Selected screenshot preview"
            />
          ) : (
            <Upload size={40} />
          )}

          <strong>
            {file
              ? file.name
              : "Choose a screenshot to analyze"}
          </strong>

          <span>
            PNG, JPG, JPEG or WEBP · Maximum 5 MB
          </span>

          <input
            ref={fileInputRef}
            id="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={
              handleFileChange
            }
            hidden
          />

        </label>

        <button
          type="submit"
          className="primary-action"
          disabled={loading}
        >

          {loading ? (
            <>
              <Loader2
                className="spin"
                size={19}
              />

              Analyzing Screenshot...
            </>
          ) : (
            <>
              Analyze Screenshot

              <ShieldCheck
                size={19}
              />
            </>
          )}

        </button>

      </form>

      {error && (
        <div className="error-box">

          <AlertTriangle
            size={20}
          />

          <span>
            {error}
          </span>

        </div>
      )}

      {result && (
        <>

          <RiskResult
            result={result}
            title="SCREENSHOT RISK ASSESSMENT"
            onReport={report}
          />

          {/* ==================================================
              OCR ↔ QR CONSISTENCY CHECK
             ================================================== */}

          {showMismatch && (
            <div
              className="payment-mismatch-card"
              style={{
                marginTop: "18px",
                marginBottom: "18px",
                padding: "20px",
                borderRadius: "18px",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                background:
                  "linear-gradient(135deg, rgba(254, 242, 242, 0.98), rgba(255, 247, 247, 0.98))",
                boxShadow:
                  "0 10px 30px rgba(220, 38, 38, 0.08)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px"
                }}
              >

                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fee2e2",
                    color: "#dc2626"
                  }}
                >
                  <TriangleAlert
                    size={24}
                  />
                </div>

                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "17px",
                      color: "#991b1b"
                    }}
                  >
                    PAYMENT DETAIL MISMATCH
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "3px",
                      fontSize: "13px",
                      color: "#7f1d1d"
                    }}
                  >
                    PayCheck UPI found conflicting payment information.
                  </span>
                </div>

              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr auto 1fr",
                  gap: "10px",
                  alignItems: "stretch"
                }}
              >

                {/* OCR SIDE */}

                <div
                  style={{
                    padding: "15px",
                    borderRadius: "14px",
                    background: "white",
                    border:
                      "1px solid #fecaca"
                  }}
                >

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#64748b",
                      marginBottom: "7px",
                      textTransform:
                        "uppercase"
                    }}
                  >
                    Visible / OCR
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "25px",
                      color: "#b91c1c"
                    }}
                  >
                    {formatAmount(
                      consistency?.ocrAmount
                    )}
                  </strong>

                  {consistency?.ocrUpiId && (
                    <span
                      style={{
                        display: "block",
                        marginTop: "7px",
                        fontSize: "13px",
                        color: "#475569",
                        wordBreak:
                          "break-word"
                      }}
                    >
                      {consistency.ocrUpiId}
                    </span>
                  )}

                </div>

                {/* ARROW */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#dc2626"
                  }}
                >
                  <ArrowRight
                    size={24}
                  />
                </div>

                {/* QR SIDE */}

                <div
                  style={{
                    padding: "15px",
                    borderRadius: "14px",
                    background: "white",
                    border:
                      "1px solid #bfdbfe"
                  }}
                >

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#64748b",
                      marginBottom: "7px",
                      textTransform:
                        "uppercase"
                    }}
                  >
                    QR Encoded
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "25px",
                      color: "#1d4ed8"
                    }}
                  >
                    {formatAmount(
                      consistency?.qrAmount
                    )}
                  </strong>

                  {consistency?.qrUpiId && (
                    <span
                      style={{
                        display: "block",
                        marginTop: "7px",
                        fontSize: "13px",
                        color: "#475569",
                        wordBreak:
                          "break-word"
                      }}
                    >
                      {consistency.qrUpiId}
                    </span>
                  )}

                </div>

              </div>

              <div
                style={{
                  marginTop: "14px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "#fff",
                  border:
                    "1px solid #fecaca",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px"
                }}
              >

                <XCircle
                  size={19}
                  color="#dc2626"
                />

                <span
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "#7f1d1d"
                  }}
                >
                  These payment details do not match.
                  Do not approve the payment until the
                  recipient and amount are independently
                  verified in your UPI app.
                </span>

              </div>

              <div
                style={{
                  marginTop: "13px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#991b1b"
                }}
              >
                OCR ↔ QR payment mismatch detected
              </div>

            </div>
          )}

          {result.detectedDetails && (
            <div className="screenshot-details-card">

              <div className="screenshot-details-header">

                <ShieldCheck
                  size={20}
                />

                <div>

                  <strong>
                    Payment Details Detected
                  </strong>

                  <span>
                    Information extracted from the uploaded screenshot
                  </span>

                </div>

              </div>

              {/* ==================================================
                  QR DETAILS
                 ================================================== */}

              {result.qrDetails?.detected && (
                <div className="qr-details-card">

                  <div className="qr-details-header">

                    <QrCode
                      size={21}
                    />

                    <div>

                      <strong>
                        QR Code Detected
                      </strong>

                      <span>
                        QR payload decoded from the uploaded screenshot
                      </span>

                    </div>

                  </div>

                  <div className="qr-type-badge">
                    {result.qrDetails.isUpiQr
                      ? "UPI QR"
                      : "QR Code"}
                  </div>

                  {result.qrDetails.isUpiQr && (
                    <div className="qr-detail-grid">

                      <div className="qr-detail-item">

                        <span>
                          UPI ID
                        </span>

                        <strong>
                          {result.qrDetails.upiId ||
                            "Not detected"}
                        </strong>

                      </div>

                      <div className="qr-detail-item">

                        <span>
                          Payee Name
                        </span>

                        <strong>
                          {result.qrDetails.payeeName ||
                            "Not detected"}
                        </strong>

                      </div>

                      <div className="qr-detail-item">

                        <span>
                          Amount
                        </span>

                        <strong>
                          {formatAmount(
                            result.qrDetails.amount
                          )}
                        </strong>

                      </div>

                      <div className="qr-detail-item">

                        <span>
                          Currency
                        </span>

                        <strong>
                          {result.qrDetails.currency ||
                            "Not specified"}
                        </strong>

                      </div>

                      {result.qrDetails.note && (
                        <div className="qr-detail-item qr-note-item">

                          <span>
                            Payment Note
                          </span>

                          <strong>
                            {result.qrDetails.note}
                          </strong>

                        </div>
                      )}

                    </div>
                  )}

                  <div className="qr-payload-box">

                    <span>
                      Decoded QR Payload
                    </span>

                    <p>
                      {result.qrDetails.data}
                    </p>

                  </div>

                  <div className="qr-safety-warning">

                    <AlertTriangle
                      size={19}
                    />

                    <div>

                      <strong>
                        Important safety check
                      </strong>

                      <span>
                        Decoding a QR code only reveals its contents.
                        It does not prove that the recipient, payment
                        request or destination is safe. Verify the
                        recipient independently before paying.
                      </span>

                    </div>

                  </div>

                </div>
              )}

              {/* ==================================================
                  GENERAL SCREENSHOT DETAILS
                 ================================================== */}

              <div className="screenshot-detail-grid">

                <div className="screenshot-detail-item">

                  <span>
                    UPI ID
                  </span>

                  <strong>
                    {result.detectedDetails.upiId ||
                      "Not detected"}
                  </strong>

                  {result.detectedDetails.upiId && (
                    <small className="detail-source">
                      {result.upiSource === "QR"
                        ? "Detected from QR"
                        : "Detected from OCR"}
                    </small>
                  )}

                </div>

                <div className="screenshot-detail-item">

                  <span>
                    Amount
                  </span>

                  <strong>
                    {formatAmount(
                      result.detectedDetails.amount
                    )}
                  </strong>

                </div>

                <div className="screenshot-detail-item">

                  <span>
                    Links
                  </span>

                  <strong>
                    {result.detectedDetails.links?.length
                      ? `${result.detectedDetails.links.length} detected`
                      : "None detected"}
                  </strong>

                </div>

                <div className="screenshot-detail-item">

                  <span>
                    Phone Numbers
                  </span>

                  <strong>
                    {result.detectedDetails.phoneNumbers?.length
                      ? `${result.detectedDetails.phoneNumbers.length} detected`
                      : "None detected"}
                  </strong>

                </div>

              </div>

              {/* ==================================================
                  DETECTED LINKS
                 ================================================== */}

              {result.detectedDetails.links?.length > 0 && (
                <div className="detected-list">

                  <strong>
                    🔗 Detected Links
                  </strong>

                  {result.detectedDetails.links.map(
                    (link, index) => (
                      <div
                        key={`${link}-${index}`}
                        className="detected-value"
                      >
                        {link}
                      </div>
                    )
                  )}

                </div>
              )}

              {/* ==================================================
                  PHONE NUMBERS
                 ================================================== */}

              {result.detectedDetails.phoneNumbers?.length > 0 && (
                <div className="detected-list">

                  <strong>
                    📱 Detected Phone Numbers
                  </strong>

                  {result.detectedDetails.phoneNumbers.map(
                    (number, index) => (
                      <div
                        key={`${number}-${index}`}
                        className="detected-value"
                      >
                        {number}
                      </div>
                    )
                  )}

                </div>
              )}

              {/* ==================================================
                  SUSPICIOUS PHRASES
                 ================================================== */}

              {result.detectedDetails.suspiciousPhrases?.length > 0 && (
                <div className="suspicious-phrases">

                  <div className="suspicious-phrases-title">

                    <AlertTriangle
                      size={19}
                    />

                    <strong>
                      Suspicious Phrases Detected
                    </strong>

                  </div>

                  <div className="phrase-list">

                    {result.detectedDetails.suspiciousPhrases.map(
                      (phrase, index) => (
                        <span
                          key={`${phrase}-${index}`}
                          className="phrase-badge"
                        >
                          {phrase}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ==================================================
              OCR CONFIDENCE
             ================================================== */}

          {result.ocrConfidence !== undefined && (
            <div className="ocr-meta">

              OCR confidence:{" "}

              <strong>
                {result.ocrConfidence}%
              </strong>

            </div>
          )}

          {/* ==================================================
              OCR TEXT
             ================================================== */}

          {result.extractedText && (
            <div className="extracted-text">

              <div>

                <ImageIcon
                  size={19}
                />

                <strong>
                  Text detected in screenshot
                </strong>

              </div>

              <p>
                {result.extractedText}
              </p>

            </div>
          )}

          {/* ==================================================
              DETECTED UPI
             ================================================== */}

          {result.checkedUpiId && (
            <div className="ocr-meta">

              <ShieldCheck
                size={17}
              />

              UPI ID detected from screenshot:{" "}

              <strong>
                {result.checkedUpiId}
              </strong>

            </div>
          )}

          {/* ==================================================
              HIGH RISK BANNER
             ================================================== */}

          {result.riskLevel === "HIGH" && (
            <div className="danger-banner">

              <XCircle
                size={22}
              />

              <div>

                <strong>
                  Suspicious payment screenshot detected.
                </strong>

                <span>
                  Do not make the payment until the
                  sender, recipient and reason are
                  independently verified.
                </span>

              </div>

            </div>
          )}

        </>
      )}

    </section>
  );
}

export default ScreenshotScanner;