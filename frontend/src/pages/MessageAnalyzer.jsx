import { useEffect, useRef, useState } from "react";
import {
  MessageSquareText,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import API from "../services/api";
import { unlockSiren } from "../services/siren";

function RiskIcon({ level }) {
  if (level === "HIGH") {
    return <XCircle size={42} />;
  }

  if (level === "MEDIUM") {
    return <AlertTriangle size={42} />;
  }

  return <CheckCircle size={42} />;
}

function MessageAnalyzer({ onReport }) {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messageInputRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * CHATBOT → MESSAGE ANALYZER PREFILL
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const handlePrefill = (event) => {
      const tool = event.detail?.tool;
      const value = String(
        event.detail?.value || ""
      ).trim();

      if (
        tool !== "messageAnalyzer" ||
        !value
      ) {
        return;
      }

      console.log(
        "🤖 Chatbot → Message Analyzer:",
        value
      );

      setMessage(value);
      setResult(null);
      setError("");

      setTimeout(() => {
        messageInputRef.current?.focus();

        document
          .getElementById("message-analyzer")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
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

  const analyzeMessage = async (e) => {
    e.preventDefault();

    await unlockSiren().catch(() => {});

    setError("");
    setResult(null);

    if (!message.trim()) {
      setError(
        "Please paste a message to analyze."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/message/analyze",
        {
          message: message.trim()
        }
      );

      const data =
        response.data.data;

      setResult(data);

      window.dispatchEvent(
        new CustomEvent(
          "paycheck:risk",
          {
            detail: data
          }
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to analyze the message. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const report = () => {
    onReport?.({
      type: "Message",
      value: message,
      score: result?.score,
      riskLevel:
        result?.riskLevel
    });
  };

  const getRiskHeading = () => {
    if (
      result?.riskLevel === "HIGH"
    ) {
      return "High Risk";
    }

    if (
      result?.riskLevel === "MEDIUM"
    ) {
      return "Suspicious";
    }

    if (
      result?.riskLevel === "UNKNOWN"
    ) {
      return "Unable to Fully Assess";
    }

    return "Low Risk";
  };

  return (
    <section
      className="checker-page"
      id="message-analyzer"
    >
      {/* HEADER */}

      <div className="checker-header">
        <div className="checker-icon">
          <MessageSquareText
            size={34}
          />
        </div>

        <div>
          <span>
            PAYCHECK UPI SAFETY CENTER
          </span>

          <h2>
            Message Risk Analyzer
          </h2>
        </div>
      </div>

      <p className="checker-description">
        Paste an SMS, WhatsApp message,
        email or payment-related message
        to detect common scam patterns
        before you respond or pay.
      </p>

      {/* MESSAGE INPUT */}

      <form
        className="checker-form"
        onSubmit={analyzeMessage}
      >
        <label htmlFor="message">
          Suspicious Message
        </label>

        <textarea
          ref={messageInputRef}
          id="message"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Paste the suspicious message here..."
          rows={8}
        />

        <button
          className="primary-action"
          disabled={loading}
          type="submit"
        >
          {loading ? (
            <>
              <Loader2
                className="spin"
                size={19}
              />
              Analyzing...
            </>
          ) : (
            <>
              Analyze Message
              <ShieldCheck size={19} />
            </>
          )}
        </button>
      </form>

      {/* ERROR */}

      {error && (
        <div className="error-box">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* RESULT */}

      {result && (
        <div
          className={`risk-result ${result.riskLevel.toLowerCase()}`}
        >
          {/* RISK SUMMARY */}

          <div className="risk-summary">
            <div className="risk-icon">
              <RiskIcon
                level={
                  result.riskLevel
                }
              />
            </div>

            <div>
              <span className="risk-label">
                MESSAGE SECURITY RESULT
              </span>

              <h3>
                {getRiskHeading()}
              </h3>

              <p className="risk-score">
                Risk Score:{" "}
                <strong>
                  {result.riskLevel ===
                  "UNKNOWN"
                    ? "—"
                    : `${result.score}/100`}
                </strong>
              </p>
            </div>
          </div>

          {/* RISK BAR */}

          {result.riskLevel !==
            "UNKNOWN" && (
            <div className="risk-bar">
              <div
                className="risk-bar-fill"
                style={{
                  width: `${Math.min(
                    Math.max(
                      Number(
                        result.score ||
                          0
                      ),
                      0
                    ),
                    100
                  )}%`
                }}
              />
            </div>
          )}

          {/* MESSAGE PREVIEW */}

          <div className="upi-details">
            <h4>
              <MessageSquareText
                size={17}
              />
              Message Preview
            </h4>

            <div className="detail-card message-preview-card">
              <span>
                Analyzed content
              </span>

              <strong>
                {message}
              </strong>
            </div>
          </div>

          {/* WHAT WE FOUND */}

          <div className="risk-section">
            <h4>
              <AlertCircle size={17} />
              What we found
            </h4>

            {result.warnings?.length >
            0 ? (
              <ul>
                {result.warnings.map(
                  (
                    warning,
                    index
                  ) => (
                    <li
                      key={index}
                    >
                      <span>
                        •
                      </span>

                      {warning}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="finding-card">
                <CheckCircle
                  size={20}
                />

                <p>
                  No obvious scam
                  indicators were
                  detected in the
                  supplied message.
                </p>
              </div>
            )}
          </div>

          {/* DETECTED INDICATORS */}

          {result.matchedIndicators
            ?.length > 0 && (
            <div className="indicator-section">
              <span>
                Detected indicators
              </span>

              <div className="indicator-row">
                {result.matchedIndicators.map(
                  (item) => (
                    <span
                      key={item}
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* RECOMMENDATION */}

          <div className="recommendation">
            <strong>
              <ShieldCheck
                size={17}
              />
              Safety Recommendation
            </strong>

            <p>
              {result.recommendation}
            </p>
          </div>

          {/* HIGH RISK WARNING */}

          {result.riskLevel ===
            "HIGH" && (
            <div className="danger-banner">
              <AlertTriangle
                size={21}
              />

              <div>
                <strong>
                  High-risk message
                  detected.
                </strong>

                <span>
                  Do not share OTPs,
                  UPI PINs, passwords
                  or banking
                  information in
                  response to this
                  message.
                </span>
              </div>
            </div>
          )}

          {/* REPORT */}

          {result.riskLevel ===
            "HIGH" && (
            <button
              className="report-button"
              onClick={report}
              type="button"
            >
              <Flag size={17} />
              Report Scam
            </button>
          )}

          {/* SAFETY NOTE */}

          <div className="safety-note">
            <ShieldCheck size={18} />

            <span>
              Message analysis
              identifies common scam
              patterns. It cannot prove
              who sent a message or
              guarantee that a request is
              legitimate.
            </span>
          </div>
        </div>
      )}

      {/* DEFAULT SAFETY MESSAGE */}

      {!result && !error && (
        <div className="safety-note standalone-note">
          <ShieldCheck size={18} />

          <span>
            Never share OTPs, UPI PINs,
            passwords or card credentials
            through messages or chat.
          </span>
        </div>
      )}
    </section>
  );
}

export default MessageAnalyzer;