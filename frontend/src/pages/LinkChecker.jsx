import { useEffect, useRef, useState } from "react";
import {
  Link as LinkIcon,
  Search,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Lock
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

function LinkChecker({ onReport }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const linkInputRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * CHATBOT → LINK SCANNER PREFILL
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const handlePrefill = (event) => {
      const tool = event.detail?.tool;
      const value = String(
        event.detail?.value || ""
      ).trim();

      if (tool !== "linkScanner" || !value) {
        return;
      }

      console.log(
        "🤖 Chatbot → Link Scanner:",
        value
      );

      setUrl(value);
      setResult(null);
      setError("");

      setTimeout(() => {
        linkInputRef.current?.focus();

        document
          .getElementById("link-checker")
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

  const checkLink = async (e) => {
    e.preventDefault();

    await unlockSiren().catch(() => {});

    setError("");
    setResult(null);

    if (!url.trim()) {
      setError(
        "Please enter a link to check."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/link/check",
        {
          url: url.trim()
        }
      );

      const data =
        response.data.data;

      setResult(data);

      const riskLevel = String(
        data?.riskLevel || ""
      )
        .trim()
        .toUpperCase();

      const score = Number(
        data?.score || 0
      );

      console.log(
        "🔗 Link Scanner Risk:",
        {
          riskLevel,
          score
        }
      );

      window.dispatchEvent(
        new CustomEvent(
          "paycheck:risk",
          {
            detail: {
              riskLevel,
              score
            }
          }
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to analyze the link. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const report = () => {
    onReport?.({
      type: "Link",
      value: url,
      score: result?.score,
      riskLevel:
        result?.riskLevel
    });
  };

  const getRiskHeading = () => {
    if (result?.riskLevel === "HIGH") {
      return "High Risk";
    }

    if (result?.riskLevel === "MEDIUM") {
      return "Suspicious";
    }

    return "Low Risk";
  };

  const getProtocol = () => {
    try {
      return new URL(url)
        .protocol
        .replace(":", "")
        .toUpperCase();
    } catch {
      return "Unknown";
    }
  };

  const getDomain = () => {
    try {
      return new URL(url)
        .hostname;
    } catch {
      return "Unable to determine";
    }
  };

  return (
    <section
      className="checker-page"
      id="link-checker"
    >
      {/* HEADER */}

      <div className="checker-header">
        <div className="checker-icon">
          <LinkIcon size={34} />
        </div>

        <div>
          <span>
            PAYCHECK UPI SAFETY CENTER
          </span>

          <h2>
            Link Risk Scanner
          </h2>
        </div>
      </div>

      <p className="checker-description">
        Check a link for suspicious URL
        patterns before opening it.
        PayCheck UPI explains why a
        link may be risky instead of
        showing only a score.
      </p>

      {/* INPUT */}

      <form
        className="checker-form"
        onSubmit={checkLink}
      >
        <label htmlFor="url">
          Website / Link
        </label>

        <div className="input-wrap">
          <Search size={20} />

          <input
            ref={linkInputRef}
            id="url"
            type="url"
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            placeholder="https://example.com"
            autoComplete="off"
          />
        </div>

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
              Check Link
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
                LINK SECURITY RESULT
              </span>

              <h3>
                {getRiskHeading()}
              </h3>

              <p className="risk-score">
                Risk Score:{" "}
                <strong>
                  {result.score}/100
                </strong>
              </p>
            </div>
          </div>

          {/* RISK BAR */}

          <div className="risk-bar">
            <div
              className="risk-bar-fill"
              style={{
                width: `${Math.min(
                  Math.max(
                    result.score,
                    0
                  ),
                  100
                )}%`
              }}
            />
          </div>

          {/* LINK DETAILS */}

          <div className="upi-details">
            <h4>
              <Globe size={17} />
              Link Details
            </h4>

            <div className="detail-grid">
              <div className="detail-card">
                <span>
                  Domain
                </span>

                <strong>
                  {getDomain()}
                </strong>
              </div>

              <div className="detail-card">
                <span>
                  Protocol
                </span>

                <strong>
                  {getProtocol() ===
                  "HTTPS" ? (
                    <>
                      <Lock size={13} />
                      HTTPS
                    </>
                  ) : (
                    getProtocol()
                  )}
                </strong>
              </div>

              <div className="detail-card url-card">
                <span>
                  URL
                </span>

                <strong>
                  {result.normalizedUrl ||
                    url}
                </strong>
              </div>
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
                  No obvious
                  suspicious URL
                  patterns were
                  detected.
                </p>
              </div>
            )}
          </div>

          {/* INDICATORS */}

          {result.matchedIndicators
            ?.length > 0 && (
            <div className="indicator-section">
              <span>
                Detected indicators
              </span>

              <div className="indicator-row">
                {result.matchedIndicators.map(
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
            <strong>
              <ShieldCheck size={17} />
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
                  Dangerous link
                  pattern detected.
                </strong>

                <span>
                  Do not enter UPI,
                  banking, OTP or
                  password
                  information on
                  this page.
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
              A structural link check
              cannot guarantee that a
              website is legitimate.
              Verify the sender and
              actual domain before
              entering payment,
              banking or login
              information.
            </span>
          </div>
        </div>
      )}

      {/* DEFAULT SAFETY MESSAGE */}

      {!result && !error && (
        <div className="safety-note standalone-note">
          <ShieldCheck size={18} />

          <span>
            Never trust a link only
            because it contains a
            bank, UPI or
            government-looking word.
          </span>
        </div>
      )}
    </section>
  );
}

export default LinkChecker;