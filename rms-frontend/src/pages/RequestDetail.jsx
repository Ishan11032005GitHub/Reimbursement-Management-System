import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "./RequestDetail.css";

const STEPS = ["DRAFT", "SUBMITTED", "MANAGER_APPROVED", "FINAL_APPROVED"];

const humanStatus = (s) => String(s || "").replace(/_/g, " ");
const statusClass = (s) => String(s || "").toLowerCase().replace(/_/g, "-");

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "—";

const fmtDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
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

  const stepIndex = useMemo(() => {
    if (!req) return -1;
    return STEPS.indexOf(req.status);
  }, [req]);

  const activity = useMemo(() => {
    if (!req) return [];
    const out = [];
    if (req.created_at)
      out.push({ ts: req.created_at, text: "Request created" });
    if (req.responded_at || req.reviewed_at)
      out.push({
        ts: req.responded_at || req.reviewed_at,
        text: "Request reviewed",
      });
    return out;
  }, [req]);

  const submitDraft = async () => {
    if (!window.confirm("Submit this request?")) return;
    try {
      setActionLoading(true);
      await api.post(`/requests/${id}/submit`);
      toast.success("Request submitted");
      navigate("/requests");
    } catch {
      toast.error("Submit failed");
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
          {/* TITLE + STATUS */}
          <section className="rd-section">
            <div className="rd-header">
              <h2 className="rd-title">{req.title}</h2>
              <span className={`status-pill ${statusClass(req.status)}`}>
                {humanStatus(req.status)}
              </span>
            </div>
          </section>

          {/* STATES */}
          <section className="rd-section rd-states">
            <div className="status-timeline">
              {STEPS.map((s, i) => {
                const isFinal = req.status === "FINAL_APPROVED";
                const isDone = i < stepIndex || (isFinal && i === stepIndex);
                const isActive = i === stepIndex && !isFinal;
                const isFuture = i > stepIndex;

                return (
                  <motion.div
                    key={s}
                    className={[
                      "timeline-step",
                      isDone && "done",
                      isActive && "active",
                      isFuture && "future",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="step-dot" />
                    <div className="step-label">{humanStatus(s)}</div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* DETAILS */}
          <section className="rd-section">
            <h3 className="rd-section-title">Details</h3>
            <div className="rd-panel">
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
                {(req.responded_at || req.reviewed_at) && (
                  <div className="field">
                    <label>Responded On</label>
                    <p>{fmtDateTime(req.responded_at || req.reviewed_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ATTACHMENT */}
          <section className="rd-section">
            <h3 className="rd-section-title">Attachment</h3>
            <div className="rd-panel">
              {req.file_url ? (
                <a
                  href={req.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  📄 View Uploaded File
                </a>
              ) : (
                <span className="no-file">No attachment</span>
              )}
            </div>
          </section>

          {/* ACTIVITY */}
          <section className="rd-section">
            <h3 className="rd-section-title">Activity</h3>
            <div className="rd-panel">
              <ul className="activity-list">
                {activity.map((a, idx) => (
                  <li key={idx} className="activity-item">
                    <span className="activity-ts">
                      {fmtDateTime(a.ts)}
                    </span>
                    <span className="activity-text">{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ACTIONS */}
          <section className="rd-section rd-footer">
            {isOwner && req.status === "DRAFT" && (
              <button
                className="submit-btn"
                disabled={actionLoading}
                onClick={submitDraft}
              >
                {actionLoading ? "Submitting…" : "Submit Request"}
              </button>
            )}
            <Link className="back-link" to="/requests">
              ← Back to My Requests
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
