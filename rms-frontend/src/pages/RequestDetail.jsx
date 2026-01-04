import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "./RequestDetail.css";

/* ===== Status Steps ===== */
const STEPS = ["DRAFT", "SUBMITTED", "MANAGER_APPROVED", "FINAL_APPROVED"];

const humanStatus = (s) => String(s || "").replace(/_/g, " ");
const statusClass = (s) => String(s || "").toLowerCase().replace(/_/g, "-");

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "—";

const fmtDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "—";

const getFileType = (url) => {
  if (!url) return { kind: "none" };
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".pdf")) return { kind: "pdf", label: "PDF" };
  if (clean.endsWith(".png") || clean.endsWith(".jpg") || clean.endsWith(".jpeg") || clean.endsWith(".webp"))
    return { kind: "image", label: "Image" };
  return { kind: "file", label: "File" };
};

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/requests/${id}`)
      .then((res) => setReq(res.data))
      .catch(() => {
        toast.error("Failed to load request");
        navigate("/requests");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const isOwner = useMemo(() => {
    if (!user || !req) return false;
    return Number(req.created_by) === Number(user.id);
  }, [user, req]);

  const isRejected = req?.status === "REJECTED";
  const stepIndex = useMemo(() => {
    if (!req) return -1;
    if (req.status === "REJECTED") {
      // if rejected, treat it as at least SUBMITTED for timeline clarity
      const base = STEPS.indexOf("SUBMITTED");
      return base >= 0 ? base : 1;
    }
    return STEPS.indexOf(req.status);
  }, [req]);

  const fileInfo = useMemo(() => getFileType(req?.file_url), [req]);

  const activity = useMemo(() => {
    if (!req) return [];
    const out = [];

    // We only show events we can back with timestamps. No fake timeline.
    if (req.created_at) {
      out.push({
        ts: req.created_at,
        text: "Request created"
      });
    }

    // If backend sends reviewed_at/responded_at, show it
    const reviewedTs = req.responded_at || req.reviewed_at;
    if (reviewedTs) {
      const by = req.responded_by_username || req.reviewed_by_username || "Manager";
      const base = req.status === "REJECTED" ? "Rejected" : "Reviewed";
      out.push({
        ts: reviewedTs,
        text: `${base} by ${by}${req.status === "REJECTED" ? "" : ""}`
      });
    }

    // Final Approved has no timestamp in your payload, so don’t fabricate it.
    // We still show status line elsewhere.

    // Sort by time if multiple
    out.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    return out;
  }, [req]);

  const confirmAction = (title, message) => {
    // Minimal modal without adding new dependencies
    return window.confirm(`${title}\n\n${message}`);
  };

  const submitDraft = async () => {
    if (!confirmAction("Submit Request", "This will send your request to your manager for review.\nOnce submitted, you can’t edit it.")) {
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/requests/${id}/submit`);
      toast.success("Request submitted");
      navigate("/requests");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit failed");
    } finally {
      setActionLoading(false);
    }
  };

  const finalApprove = async () => {
    if (!confirmAction("Final Approve", "Final approval is irreversible.\nProceed only if you are sure.")) {
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/requests/${id}/final-approve`);
      toast.success("Final approval done");
      navigate("/requests");
    } catch (err) {
      toast.error(err.response?.data?.message || "Final approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="page-loading">Loading…</p>;
  if (!req) return null;

  return (
    <>
      <Navbar />

      <div className="request-detail-container">
        <div className="request-card">
          {/* ===== HEADER ===== */}
          <div className="request-header">
            <h2 className="request-detail-title">{req.title}</h2>

            <span className={`status-badge ${statusClass(req.status)}`}>
              {humanStatus(req.status)}
            </span>
          </div>

          {/* ===== TIER 1: STATUS TIMELINE ===== */}
          <div className={`status-timeline ${isRejected ? "rejected" : ""}`}>
            {STEPS.map((s, i) => {
              const isDone = i < stepIndex;
              const isActive = i === stepIndex && !isRejected;
              const isFuture = i > stepIndex && !isRejected;
              return (
                <div
                  key={s}
                  className={[
                    "timeline-step",
                    isDone ? "done" : "",
                    isActive ? "active" : "",
                    isFuture ? "future" : ""
                  ].join(" ")}
                >
                  <div className="step-dot" />
                  <div className="step-label">{humanStatus(s)}</div>
                </div>
              );
            })}
          </div>

          {isRejected && (
            <div className="rejection-banner">
              <b>Rejected.</b> Open details below to see manager comment (if any).
            </div>
          )}

          {/* ===== DETAILS ===== */}
          <div className="field-grid">
            <div className="field">
              <label>Amount</label>
              <p>₹{req.amount}</p>
            </div>

            <div className="field">
              <label>Category</label>
              <p>{req.category}</p>
            </div>

            <div className="field">
              <label>Created On</label>
              <p>{fmtDateTime(req.created_at)}</p>
            </div>

            <div className="field">
              <label>Expense Date</label>
              <p>{fmtDate(req.date)}</p>
            </div>
          </div>

          {/* ===== RESPONSE INFO ===== */}
          {(req.responded_at || req.reviewed_at) && (
            <div className="field">
              <label>Responded On</label>
              <p>{fmtDateTime(req.responded_at || req.reviewed_at)}</p>
            </div>
          )}

          {req.manager_comment && (
            <div className="manager-comment">
              <div className="manager-comment-title">Manager Comment</div>
              <p>{req.manager_comment}</p>
            </div>
          )}

          {/* ===== TIER 2: FILE PREVIEW META ===== */}
          <div className="attachment-row">
            <div className="attachment-left">
              <div className="attachment-title">Attachment</div>
              <div className="attachment-sub">
                {req.file_url ? `${fileInfo.label} attached` : "No attachment"}
              </div>
            </div>

            <div className="attachment-right">
              {req.file_url ? (
                <>
                  <a
                    href={req.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="file-link"
                  >
                    View
                  </a>
                  <a
                    href={req.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="file-link secondary"
                  >
                    Download
                  </a>
                </>
              ) : (
                <span className="muted">—</span>
              )}
            </div>
          </div>

          {/* ===== TIER 3: ACTIVITY LOG (NO BACKEND CHANGES) ===== */}
          <div className="activity">
            <div className="activity-title">Activity</div>
            {activity.length === 0 ? (
              <div className="activity-empty">No activity yet.</div>
            ) : (
              <ul className="activity-list">
                {activity.map((a, idx) => (
                  <li key={idx} className="activity-item">
                    <span className="activity-ts">{fmtDateTime(a.ts)}</span>
                    <span className="activity-text">{a.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ===== TIER 1/2/3/4: ACTIONS ===== */}
          <div className="actions">
            {isOwner && req.status === "DRAFT" && (
              <div className="action-block">
                <button
                  className="submit-btn"
                  disabled={actionLoading}
                  onClick={submitDraft}
                >
                  {actionLoading ? "Submitting…" : "Submit Request"}
                </button>
                <div className="action-hint">
                  This sends your request to your manager for review. After submitting, editing is locked.
                </div>
              </div>
            )}

            {isOwner && req.status === "MANAGER_APPROVED" && (
              <div className="action-block">
                <button
                  className="save-btn"
                  disabled={actionLoading}
                  onClick={finalApprove}
                >
                  {actionLoading ? "Approving…" : "Final Approve"}
                </button>
                <div className="action-hint">
                  Final approval closes the request. This action is irreversible.
                </div>
              </div>
            )}

            {/* Disabled buttons for invalid states (Tier 1 clarity) */}
            {isOwner && (req.status === "SUBMITTED" || req.status === "FINAL_APPROVED") && (
              <div className="action-block">
                <button className="disabled-btn" disabled>
                  No actions available
                </button>
                <div className="action-hint">
                  {req.status === "SUBMITTED"
                    ? "Waiting for manager review."
                    : "This request is already finalized."}
                </div>
              </div>
            )}

            <Link className="back-link" to="/requests">
              Back to My Requests
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
