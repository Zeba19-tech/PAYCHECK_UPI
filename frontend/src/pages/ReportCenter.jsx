import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ShieldAlert,
  Send,
  Search,
  FileWarning,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://paycheck-upi.onrender.com/api";

const scamTypes = [
  "UPI Scam",
  "Fake Payment Request",
  "Phishing Link",
  "KYC Scam",
  "Fake Bank Call",
  "Refund Scam",
  "Investment Scam",
  "Job Scam",
  "QR Code Scam",
  "Other"
];

function RiskBadge({ level }) {
  const value = String(level || "UNKNOWN").toUpperCase();

  const symbol =
    value === "HIGH"
      ? "!"
      : value === "MEDIUM"
      ? "▲"
      : value === "LOW"
      ? "✓"
      : "•";

  return (
    <span className={`report-risk ${value.toLowerCase()}`}>
      <span className="report-risk-symbol">{symbol}</span>
      {value}
    </span>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "Submitted");

  const symbol =
    value === "Resolved"
      ? "✓"
      : value === "Under Review"
      ? "◷"
      : "•";

  return (
    <span className="report-status">
      <span className="report-status-symbol">{symbol}</span>
      {value}
    </span>
  );
}
function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function ReportCenter() {
  const [activeTab, setActiveTab] = useState("report");

  const [form, setForm] = useState({
    reporterName: "",
    contact: "",
    scamType: "",
    suspiciousValue: "",
    amount: "",
    description: "",
    riskLevel: "UNKNOWN",
    evidence: ""
  });

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const [successReport, setSuccessReport] = useState(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [copied, setCopied] = useState(false);

  const loadReports = async () => {
    try {
      setLoadingReports(true);

      const response = await axios.get(
        `${API_BASE}/report`
      );

      if (response.data?.success) {
        setReports(response.data.data || []);
      }
    } catch (err) {
      console.error("Unable to load reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessReport(null);

    if (!form.scamType) {
      setError("Please select a scam type.");
      return;
    }

    if (form.description.trim().length < 10) {
      setError(
        "Please describe what happened in at least 10 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE}/report`,
        {
          ...form,
          amount: Number(form.amount) || 0
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to submit report"
        );
      }

      setSuccessReport(response.data.data);

      setForm({
        reporterName: "",
        contact: "",
        scamType: "",
        suspiciousValue: "",
        amount: "",
        description: "",
        riskLevel: "UNKNOWN",
        evidence: ""
      });

      await loadReports();

      setActiveTab("report");
    } catch (err) {
      console.error("Report submission error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit report."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyReportId = async () => {
    if (!successReport?.reportId) return;

    try {
      await navigator.clipboard.writeText(
        successReport.reportId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      console.warn("Unable to copy report ID");
    }
  };

  const filteredReports = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return reports;
    }

    return reports.filter((report) =>
      [
        report.reportId,
        report.scamType,
        report.suspiciousValue,
        report.status,
        report.riskLevel
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [reports, search]);

  const statistics = useMemo(() => {
    return {
      total: reports.length,

      high: reports.filter(
        (item) => item.riskLevel === "HIGH"
      ).length,

      underReview: reports.filter(
        (item) => item.status === "Under Review"
      ).length,

      resolved: reports.filter(
        (item) => item.status === "Resolved"
      ).length
    };
  }, [reports]);

  return (
    <section
      id="report-center"
      className="report-center-section"
    >
      <div className="report-container">

        {/* HEADER */}
        <div className="report-header">
          <div>
            <div className="report-eyebrow">
              <ShieldAlert size={17} />
              PAYCHECK UPI SAFETY CENTER
            </div>

            <h2>
              Report a <span>Scam</span>
            </h2>

            <p>
              Report suspicious UPI activity, payment
              requests, phishing attempts and other
              digital-payment scams.
            </p>
          </div>

          <div className="report-header-icon">
            <ShieldCheck size={42} />
          </div>
        </div>

        {/* STATISTICS */}
        <div className="report-stats">

          <div className="report-stat-card">
            <div className="report-stat-icon">
              <FileWarning size={21} />
            </div>

            <div>
              <strong>{statistics.total}</strong>
              <span>Total Reports</span>
            </div>
          </div>

          <div className="report-stat-card danger">
            <div className="report-stat-icon">
              <XCircle size={21} />
            </div>

            <div>
              <strong>{statistics.high}</strong>
              <span>High Risk</span>
            </div>
          </div>

          <div className="report-stat-card warning">
            <div className="report-stat-icon">
              <Clock3 size={21} />
            </div>

            <div>
              <strong>{statistics.underReview}</strong>
              <span>Under Review</span>
            </div>
          </div>

          <div className="report-stat-card success">
            <div className="report-stat-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <strong>{statistics.resolved}</strong>
              <span>Resolved</span>
            </div>
          </div>

        </div>

        {/* TABS */}
        <div className="report-tabs">

          <button
            type="button"
            className={
              activeTab === "report"
                ? "active"
                : ""
            }
            onClick={() => setActiveTab("report")}
          >
            <ShieldAlert size={17} />
            Report Scam
          </button>

          <button
            type="button"
            className={
              activeTab === "history"
                ? "active"
                : ""
            }
            onClick={() => setActiveTab("history")}
          >
            <FileWarning size={17} />
            Report History
          </button>

        </div>

        {/* SUCCESS */}
        {successReport && (
          <div className="report-success">

            <div className="report-success-icon">
              <CheckCircle2 size={30} />
            </div>

            <div className="report-success-content">
              <h3>Report submitted successfully</h3>

              <p>
                Your suspicious activity report has
                been recorded by PayCheck UPI.
              </p>

              <div className="report-id-box">
                <span>Report ID</span>

                <strong>
  {successReport?.reportId || "Report ID unavailable"}
</strong>
                <button
                  type="button"
                  onClick={copyReportId}
                  title="Copy report ID"
                >
                  {copied ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={17} />
                  )}
                </button>
              </div>

              <small>
                Keep this Report ID for future reference.
              </small>
            </div>

          </div>
        )}

        {/* REPORT FORM */}
        {activeTab === "report" && (
          <div className="report-layout">

            <form
              className="report-form-card"
              onSubmit={handleSubmit}
            >

              <div className="form-card-title">
                <div>
                  <h3>Submit a Safety Report</h3>

                  <p>
                    Tell us what happened. Do not share
                    passwords, PINs or OTPs.
                  </p>
                </div>

                <FileWarning size={25} />
              </div>

              <div className="report-form-grid">

                <div className="report-field">
                  <label>
                    Your Name
                  </label>

                  <input
                    type="text"
                    name="reporterName"
                    value={form.reporterName}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div className="report-field">
                  <label>
                    Contact
                  </label>

                  <input
                    type="text"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    placeholder="Phone or email (optional)"
                  />
                </div>

                <div className="report-field">
                  <label>
                    Scam Type *
                  </label>

                  <select
                    name="scamType"
                    value={form.scamType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select scam type
                    </option>

                    {scamTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="report-field">
                  <label>
                    Risk Level
                  </label>

                  <select
                    name="riskLevel"
                    value={form.riskLevel}
                    onChange={handleChange}
                  >
                    <option value="UNKNOWN">
                      Unknown
                    </option>

                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>
                  </select>
                </div>

                <div className="report-field full">
                  <label>
                    Suspicious UPI ID / Link / Phone
                  </label>

                  <input
                    type="text"
                    name="suspiciousValue"
                    value={form.suspiciousValue}
                    onChange={handleChange}
                    placeholder="Example: suspicious UPI ID, URL or phone number"
                  />
                </div>

                <div className="report-field">
                  <label>
                    Amount Involved
                  </label>

                  <input
                    type="number"
                    name="amount"
                    min="0"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="₹ 0"
                  />
                </div>

                <div className="report-field">
                  <label>
                    Evidence Reference
                  </label>

                  <input
                    type="text"
                    name="evidence"
                    value={form.evidence}
                    onChange={handleChange}
                    placeholder="Optional screenshot/reference"
                  />
                </div>

                <div className="report-field full">
                  <label>
                    What happened? *
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the suspicious activity, message, payment request or scam attempt..."
                    rows={6}
                    required
                  />

                  <small>
                    Never enter your UPI PIN, OTP,
                    password or banking credentials.
                  </small>
                </div>

              </div>

              {error && (
                <div className="report-error">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="report-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Scam Report
                  </>
                )}
              </button>

            </form>

            {/* SIDE SAFETY CARD */}
            <aside className="report-safety-card">

              <div className="report-safety-icon">
                <ShieldCheck size={28} />
              </div>

              <h3>
                Stay Safe While Reporting
              </h3>

              <ul>
                <li>
                  <CheckCircle2 size={17} />
                  Never share your UPI PIN.
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  Never share OTPs or passwords.
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  Preserve screenshots and messages.
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  Contact your bank if money was lost.
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  Report serious cybercrime promptly.
                </li>
              </ul>

              <div className="report-emergency">
                <strong>
                  Suspect an active scam?
                </strong>

                <span>
                  Stop the payment and contact your
                  bank immediately.
                </span>
              </div>

            </aside>

          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="report-history">

            <div className="history-toolbar">

              <div className="history-search">
                <Search size={18} />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search report ID, scam type, status..."
                />
              </div>

              <button
                type="button"
                className="refresh-reports"
                onClick={loadReports}
                disabled={loadingReports}
              >
                <RefreshCw
                  size={17}
                  className={
                    loadingReports
                      ? "spin"
                      : ""
                  }
                />
                Refresh
              </button>

            </div>

            {loadingReports ? (
              <div className="report-empty">
                <RefreshCw
                  size={30}
                  className="spin"
                />

                <p>
                  Loading reports...
                </p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="report-empty">
                <FileWarning size={38} />

                <h3>
                  No reports found
                </h3>

                <p>
                  Submitted scam reports will appear here.
                </p>
              </div>
            ) : (
              <div className="report-list">

                {filteredReports.map((report) => (
                  <article
                    className="report-history-card"
                    key={report._id || report.reportId}
                  >

                    <div className="history-card-top">

                      <div>
                        <span className="history-label">
                          REPORT ID
                        </span>

                        <strong>
                          {report.reportId}
                        </strong>
                      </div>

                      <div className="history-badges">
                        <RiskBadge
                          level={report.riskLevel}
                        />

                        <StatusBadge
                          status={report.status}
                        />
                      </div>

                    </div>

                    <div className="history-card-grid">

                      <div>
                        <span>
                          Scam Type
                        </span>

                        <strong>
  {report.scamType || "Scam type not provided"}
</strong>
                      </div>

                      <div>
                        <span>
                          Suspicious Value
                        </span>

                        <strong>
                          {report.suspiciousValue ||
                            "Not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Amount
                        </span>

                        <strong>
                          {report.amount
                            ? `₹${Number(
                                report.amount
                              ).toLocaleString("en-IN")}`
                            : "Not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Submitted
                        </span>

                        <strong>
                          {formatDate(
                            report.createdAt
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="history-description">
                      <span>
                        Description
                      </span>

                      <p>
                        {report.description}
                      </p>
                    </div>

                  </article>
                ))}

              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}