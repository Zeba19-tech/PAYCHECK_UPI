import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Flag,
  BadgeCheck,
  DatabaseZap
} from "lucide-react";
import API from "../services/api";
import { unlockSiren } from "../services/siren";

function RiskIcon({ level }) {
  if (level === "HIGH") return <XCircle size={42} />;
  if (level === "MEDIUM") return <AlertTriangle size={42} />;
  if (level === "UNKNOWN") return <AlertTriangle size={42} />;
  return <CheckCircle size={42} />;
}

function UpiChecker({ onReport }) {
  const [upiId, setUpiId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationConfig, setVerificationConfig] = useState(null);

  const upiInputRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * CHATBOT → UPI CHECKER PREFILL
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const handlePrefill = (event) => {
      const tool = event.detail?.tool;
      const value = String(
        event.detail?.value || ""
      ).trim();

      if (tool !== "upiChecker" || !value) {
        return;
      }

      console.log(
        "🤖 Chatbot → UPI Checker:",
        value
      );

      setUpiId(value);
      setResult(null);
      setError("");

      setTimeout(() => {
  upiInputRef.current?.focus();
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

  /*
   * ---------------------------------------------------------
   * LIVE VERIFICATION STATUS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    API.get("/upi/verification-status")
      .then((response) => {
        setVerificationConfig(
          response.data.data
        );
      })
      .catch(() => {
        setVerificationConfig(null);
      });
  }, []);

  /*
   * ---------------------------------------------------------
   * CHECK UPI
   * ---------------------------------------------------------
   */
  const checkUpi = async (e) => {
    e.preventDefault();

    // Unlock browser audio during the user's click/tap.
    await unlockSiren().catch(() => {});

    setError("");
    setResult(null);

    const value = upiId.trim();

    if (!value) {
      setError(
        "Please enter a UPI ID."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/upi/check",
        {
          upiId: value
        }
      );

      const data = response.data.data;

      setResult({
        ...data,
        checkedUpiId: value
      });

      /*
       * Send the result to the global
       * PayCheck risk system.
       */
      window.dispatchEvent(
        new CustomEvent(
          "paycheck:risk",
          {
            detail: {
              riskLevel:
                data.riskLevel,
              score: data.score
            }
          }
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to check the UPI ID. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const report = () =>
    onReport?.({
      type: "UPI ID",
      value: upiId,
      score: result?.score,
      riskLevel:
        result?.riskLevel
    });

  return (
    <section
      className="checker-page"
      id="upi-checker"
    >
      <div className="checker-header">
        <div className="checker-icon">
          <Search size={34} />
        </div>

        <div>
          <span>
            PAYCHECK UPI SAFETY CENTER
          </span>

          <h2>
            UPI ID Risk Checker
          </h2>
        </div>
      </div>

      <p className="checker-description">
        Check a UPI ID for suspicious
        patterns before making a payment.
        PayCheck UPI explains the detected
        risk instead of simply showing a
        score.
      </p>

      <form
        className="checker-form"
        onSubmit={checkUpi}
      >
        <label htmlFor="upiId">
          UPI ID / VPA
        </label>

        <div className="input-wrap">
          <Search size={20} />

          <input
            ref={upiInputRef}
            id="upiId"
            value={upiId}
            onChange={(e) =>
              setUpiId(e.target.value)
            }
            placeholder="example@bank"
            autoComplete="off"
          />
        </div>

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
              Checking...
            </>
          ) : (
            <>
              Check UPI ID
              <ShieldCheck size={19} />
            </>
          )}
        </button>
      </form>

      <div className="verification-note">
        <DatabaseZap size={17} />

        <span>
          {verificationConfig?.configured
            ? `Live VPA verification is active (${String(
                verificationConfig.provider
              ).toUpperCase()}).`
            : "Local risk analysis active. Bank-level VPA verification is not configured."}
        </span>
      </div>

      {error && (
        <div className="error-box">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <RiskResult
          result={result}
          title="UPI SECURITY RESULT"
          onReport={report}
        />
      )}
    </section>
  );
}

export function RiskResult({
  result,
  title,
  onReport
}) {
  const level =
    result.riskLevel || "UNKNOWN";

  const score = Number(
    result.score || 0
  );

  const verification =
    result.verification || {};

  const heading =
    level === "HIGH"
      ? "High Risk"
      : level === "MEDIUM"
      ? "Suspicious"
      : level === "UNKNOWN"
      ? "Unable to Fully Assess"
      : "Low Risk";

  const upiId =
    result.checkedUpiId ||
    result.verification?.vpa ||
    "UPI ID not available";

  const provider =
    upiId.includes("@")
      ? upiId.split("@")[1]
      : "Unknown";

  const formatValid =
    /^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i.test(
      upiId
    );

  const getVerificationText =
    () => {
      if (verification.available) {
        return verification.verified
          ? "Verified by configured provider"
          : "Provider could not verify this VPA";
      }

      return "Live verification unavailable";
    };

  const getMainFinding = () => {
    if (level === "HIGH") {
      return (
        result.warnings?.[1] ||
        result.warnings?.[0] ||
        "Multiple suspicious indicators were detected."
      );
    }

    if (level === "MEDIUM") {
      return (
        result.warnings?.[1] ||
        result.warnings?.[0] ||
        "Suspicious patterns were detected in this UPI ID."
      );
    }

    if (level === "LOW") {
      return "No strong suspicious pattern was detected in this UPI ID.";
    }

    return (
      result.warnings?.[0] ||
      "The UPI ID could not be fully assessed."
    );
  };

  const visibleIndicators = (
    result.matchedIndicators ||
    []
  ).filter(
    (item) =>
      item !==
      "Live verification unavailable"
  );

  return (
    <div
      className={`risk-result ${level.toLowerCase()}`}
    >
      {/* RESULT HEADER */}

      <div className="risk-summary">
        <div className="risk-icon">
          <RiskIcon level={level} />
        </div>

        <div className="risk-summary-content">
          <span className="risk-label">
            {title}
          </span>

          <h3>{heading}</h3>

          <p className="risk-score">
            Risk Score:
            <strong>
              {level === "UNKNOWN"
                ? " —"
                : ` ${score}/100`}
            </strong>
          </p>
        </div>
      </div>

      {/* RISK BAR */}

      {level !== "UNKNOWN" && (
        <div className="risk-bar">
          <div
            className="risk-bar-fill"
            style={{
              width: `${Math.min(
                Math.max(score, 0),
                100
              )}%`
            }}
          />
        </div>
      )}

      {/* UPI DETAILS */}

      <div className="upi-details">
        <h4>
          <ShieldCheck size={18} />
          UPI Details
        </h4>

        <div className="detail-grid">
          <div className="detail-card">
            <span>UPI ID</span>

            <strong>
              {upiId}
            </strong>
          </div>

          <div className="detail-card">
            <span>Format</span>

            <strong>
              {formatValid
                ? "Valid-looking"
                : "Invalid"}
            </strong>
          </div>

          <div className="detail-card">
            <span>UPI Handle</span>

            <strong>
              @{provider}
            </strong>
          </div>

          <div className="detail-card">
            <span>Verification</span>

            <strong>
              {getVerificationText()}
            </strong>
          </div>
        </div>
      </div>

      {/* LIVE VERIFICATION */}

      {verification.available && (
        <div
          className={`verification-banner ${
            verification.verified
              ? "verified"
              : "not-verified"
          }`}
        >
          {verification.verified ? (
            <BadgeCheck size={22} />
          ) : (
            <XCircle size={22} />
          )}

          <div>
            <strong>
              {verification.verified
                ? "LIVE VPA VERIFIED"
                : "LIVE VPA NOT VERIFIED"}
            </strong>

            <p>
              {verification.verified
                ? `Beneficiary: ${
                    verification.accountName ||
                    "Name not disclosed"
                  }`
                : "The configured verification provider could not validate this VPA."}
            </p>
          </div>
        </div>
      )}

      {/* WHAT WE FOUND */}

      <div className="risk-section">
        <h4>
          <Search size={18} />
          What we found
        </h4>

        <div className="finding-card">
          {level === "LOW" ? (
            <CheckCircle size={20} />
          ) : level === "HIGH" ? (
            <XCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}

          <p>
            {getMainFinding()}
          </p>
        </div>
      </div>

      {/* INDICATORS */}

      {visibleIndicators.length >
        0 && (
        <div className="indicator-section">
          <span>
            Detected indicators
          </span>

          <div className="indicator-row">
            {visibleIndicators.map(
              (item) => (
                <span key={item}>
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* RECOMMENDATION */}

      <div className="recommendation">
        <div className="recommendation-title">
          <ShieldCheck size={18} />

          <strong>
            Safety Recommendation
          </strong>
        </div>

        <p>
          {result.recommendation}
        </p>
      </div>

      {/* REPORT */}

      {level === "HIGH" && (
        <button
          className="report-button"
          onClick={onReport}
        >
          <Flag size={17} />
          Report Scam
        </button>
      )}

      {/* SAFETY NOTE */}

      <div className="safety-note">
        <ShieldCheck size={18} />

        <span>
          {result.assessmentScope ||
            "Local risk analysis only."}{" "}
          A risk check does not prove
          that a recipient is trustworthy.
          Always confirm the recipient name
          and payment purpose in your UPI
          app.
        </span>
      </div>
    </div>
  );
}

export default UpiChecker;