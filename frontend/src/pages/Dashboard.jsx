import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Activity,
  TrendingUp,
  Clock3,
  BarChart3,
  RefreshCw
} from "lucide-react";

const STORAGE_KEY = "paycheck_dashboard_activity";

function loadActivity() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getRiskClass(level) {
  return String(level || "UNKNOWN").toLowerCase();
}

function getRiskIcon(level) {
  const normalized = String(level || "").toUpperCase();

  if (normalized === "HIGH") {
    return <XCircle size={20} />;
  }

  if (normalized === "MEDIUM") {
    return <AlertTriangle size={20} />;
  }

  return <CheckCircle2 size={20} />;
}

function formatTime(timestamp) {
  if (!timestamp) {
    return "Just now";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function Dashboard() {
  const [activity, setActivity] = useState(loadActivity);

  useEffect(() => {
    const handleRisk = (event) => {
      const detail = event.detail || {};

      const level = String(
        detail.riskLevel || "UNKNOWN"
      ).toUpperCase();

      const score = Math.min(
        100,
        Math.max(
          0,
          Number(detail.score || detail.riskScore || 0)
        )
      );

      const item = {
        id: `${Date.now()}-${Math.random()}`,
        riskLevel: level,
        score,
        source: detail.source || "Safety Check",
        timestamp: new Date().toISOString()
      };

      setActivity((previous) => {
        const updated = [
          item,
          ...previous
        ].slice(0, 20);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updated)
        );

        return updated;
      });
    };

    window.addEventListener(
      "paycheck:risk",
      handleRisk
    );

    return () => {
      window.removeEventListener(
        "paycheck:risk",
        handleRisk
      );
    };
  }, []);

  const stats = useMemo(() => {
    const total = activity.length;

    const high = activity.filter(
      (item) =>
        String(item.riskLevel).toUpperCase() === "HIGH"
    ).length;

    const medium = activity.filter(
      (item) =>
        String(item.riskLevel).toUpperCase() === "MEDIUM"
    ).length;

    const low = activity.filter(
      (item) =>
        String(item.riskLevel).toUpperCase() === "LOW"
    ).length;

    const unknown = activity.filter(
      (item) =>
        String(item.riskLevel).toUpperCase() === "UNKNOWN"
    ).length;

    const average =
      total > 0
        ? Math.round(
            activity.reduce(
              (sum, item) =>
                sum + Number(item.score || 0),
              0
            ) / total
          )
        : 0;

    return {
      total,
      high,
      medium,
      low,
      unknown,
      average
    };
  }, [activity]);

  const safetyStatus =
    stats.high > 0
      ? "Attention Required"
      : stats.medium > 0
      ? "Stay Alert"
      : stats.total > 0
      ? "Looking Good"
      : "Ready to Check";

  const safetyDescription =
    stats.high > 0
      ? "High-risk activity was detected. Review recent results before making a payment."
      : stats.medium > 0
      ? "Some suspicious signals were detected. Verify payment details carefully."
      : stats.total > 0
      ? "No high-risk activity has been recorded in your recent checks."
      : "Run a safety check to start building your activity overview.";

  const clearDashboard = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActivity([]);
  };

  return (
    <section
      className="dashboard-section"
      id="dashboard"
    >
      <div className="dashboard-container">

        {/* HEADER */}
        <div className="dashboard-header">

          <div>
            <span className="dashboard-eyebrow">
              PAYCHECK UPI SECURITY DASHBOARD
            </span>

            <h2>
              Your Safety Overview
            </h2>

            <p>
              A quick view of recent payment-safety
              checks and detected risk signals.
            </p>
          </div>

          <button
            className="dashboard-refresh"
            onClick={() =>
              setActivity(loadActivity())
            }
            type="button"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {/* SAFETY STATUS */}
        <div
          className={`dashboard-status-card ${
            stats.high > 0
              ? "dashboard-status-high"
              : stats.medium > 0
              ? "dashboard-status-medium"
              : "dashboard-status-safe"
          }`}
        >

          <div className="dashboard-status-icon">
            {stats.high > 0 ? (
              <AlertTriangle size={28} />
            ) : (
              <ShieldCheck size={28} />
            )}
          </div>

          <div className="dashboard-status-copy">

            <span>
              CURRENT SAFETY STATUS
            </span>

            <h3>
              {safetyStatus}
            </h3>

            <p>
              {safetyDescription}
            </p>

          </div>

          <div className="dashboard-score">

            <strong>
              {stats.average}
            </strong>

            <span>
              Avg. Risk
            </span>

          </div>

        </div>

        {/* STAT CARDS */}
        <div className="dashboard-stats">

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Activity size={21} />
            </div>

            <span>
              Total Checks
            </span>

            <strong>
              {stats.total}
            </strong>

            <small>
              Recent safety activity
            </small>
          </div>

          <div className="dashboard-stat-card high">
            <div className="dashboard-stat-icon">
              <XCircle size={21} />
            </div>

            <span>
              High Risk
            </span>

            <strong>
              {stats.high}
            </strong>

            <small>
              Requires attention
            </small>
          </div>

          <div className="dashboard-stat-card medium">
            <div className="dashboard-stat-icon">
              <AlertTriangle size={21} />
            </div>

            <span>
              Medium Risk
            </span>

            <strong>
              {stats.medium}
            </strong>

            <small>
              Verify carefully
            </small>
          </div>

          <div className="dashboard-stat-card low">
            <div className="dashboard-stat-icon">
              <CheckCircle2 size={21} />
            </div>

            <span>
              Low Risk
            </span>

            <strong>
              {stats.low}
            </strong>

            <small>
              No major warning
            </small>
          </div>

        </div>

        {/* LOWER DASHBOARD */}
        <div className="dashboard-grid">

          {/* RISK DISTRIBUTION */}
          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <span>
                  RISK DISTRIBUTION
                </span>

                <h3>
                  Recent Risk Signals
                </h3>
              </div>

              <BarChart3 size={21} />

            </div>

            <div className="risk-distribution">

              <div className="distribution-row">

                <div className="distribution-label">
                  <span className="distribution-dot high"></span>
                  <span>High</span>
                </div>

                <div className="distribution-track">
                  <div
                    className="distribution-fill high"
                    style={{
                      width: `${
                        stats.total
                          ? Math.max(
                              stats.high / stats.total * 100,
                              stats.high ? 8 : 0
                            )
                          : 0
                      }%`
                    }}
                  />
                </div>

                <strong>
                  {stats.high}
                </strong>

              </div>

              <div className="distribution-row">

                <div className="distribution-label">
                  <span className="distribution-dot medium"></span>
                  <span>Medium</span>
                </div>

                <div className="distribution-track">
                  <div
                    className="distribution-fill medium"
                    style={{
                      width: `${
                        stats.total
                          ? Math.max(
                              stats.medium / stats.total * 100,
                              stats.medium ? 8 : 0
                            )
                          : 0
                      }%`
                    }}
                  />
                </div>

                <strong>
                  {stats.medium}
                </strong>

              </div>

              <div className="distribution-row">

                <div className="distribution-label">
                  <span className="distribution-dot low"></span>
                  <span>Low</span>
                </div>

                <div className="distribution-track">
                  <div
                    className="distribution-fill low"
                    style={{
                      width: `${
                        stats.total
                          ? Math.max(
                              stats.low / stats.total * 100,
                              stats.low ? 8 : 0
                            )
                          : 0
                      }%`
                    }}
                  />
                </div>

                <strong>
                  {stats.low}
                </strong>

              </div>

            </div>

            <div className="dashboard-insight">

              <TrendingUp size={18} />

              <span>
                PayCheck UPI keeps risk explanations
                visible so users can understand why
                a result needs attention.
              </span>

            </div>

          </div>

          {/* RECENT ACTIVITY */}
          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <span>
                  RECENT ACTIVITY
                </span>

                <h3>
                  Latest Checks
                </h3>
              </div>

              <Clock3 size={21} />

            </div>

            {activity.length === 0 ? (

              <div className="dashboard-empty">

                <ShieldCheck size={34} />

                <strong>
                  No checks yet
                </strong>

                <p>
                  Your recent safety results will
                  appear here after you use a checker.
                </p>

              </div>

            ) : (

              <div className="dashboard-activity-list">

                {activity
                  .slice(0, 6)
                  .map((item) => (

                    <div
                      className={`dashboard-activity-item ${getRiskClass(
                        item.riskLevel
                      )}`}
                      key={item.id}
                    >

                      <div className="activity-icon">
                        {getRiskIcon(
                          item.riskLevel
                        )}
                      </div>

                      <div className="activity-copy">

                        <strong>
                          {item.riskLevel || "UNKNOWN"} Risk
                        </strong>

                        <span>
                          {item.source}
                        </span>

                      </div>

                      <div className="activity-meta">

                        <strong>
                          {item.score}/100
                        </strong>

                        <small>
                          {formatTime(
                            item.timestamp
                          )}
                        </small>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

        </div>

        {/* FOOTER ACTION */}
        {activity.length > 0 && (
          <div className="dashboard-footer">

            <span>
              Showing the latest {Math.min(
                activity.length,
                6
              )} safety checks.
            </span>

            <button
              type="button"
              onClick={clearDashboard}
            >
              Clear Activity
            </button>

          </div>
        )}

      </div>
    </section>
  );
}