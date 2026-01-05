import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
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
  if (
    clean.endsWith(".png") ||
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".webp")
  )
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
  const isFinalApproved = req?.status === "FINAL_APPROVED";

  const stepIndex = useMemo(() => {
    if (!req) return -1;
    if (req.status === "REJECTED") {
      return STEPS.indexOf("SUBMITTED");
    }
    return STEPS.indexOf(req.status);
  }, [req]);

  const fileInfo = useMemo(() => getFileType(req?.file_url), [req]);

  const activity = useMemo(() => {
    if (!req) return [];
    const out = [];

    if (req.created_at) {
      out.push({ ts: req.created_at, text: "Request created" });
    }

    const reviewedTs = req.responded_at || req.reviewed_at;
    if (reviewedTs) {
      const by =
        req.responded_by_username ||
        req.reviewed_by_username ||
        "Manager";
      const base = req.status === "REJECTED" ? "Rejected" : "Reviewed";
      out.push({
        ts: reviewedTs,
        text: `${base} by ${by}`
      });
    }

    out.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    return out;
  }, [req]);

  const confirmAction = (title, message) =>
    window.confirm(`${title}\n\n${message}`);

  const submitDraft = async () => {
    if (
      !confirmAction(
        "Submit Request",
        "This will send your request to your manager for review.\nOnce submitted, you can’t edit it."
      )
    )
      return;

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
    if (
      !confirmAction(
        "Final Approve",
        "Final approval is irreversible.\nProceed only if you are sure."
      )
    )
      return;

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

          {/* ===== STATUS TIMELINE ===== */}
          <div className={`status-timeline ${isRejected ? "rejected" : ""}`}>
            {STEPS.map((s, i) => {
              const isDone =
                isFinalApproved ? i <= stepIndex : i < stepIndex;

              const isActive =
                !isFinalApproved && !isRejected && i === stepIndex;

              const isFuture =
                !isFinalApproved && !isRejected && i > stepIndex;

              return (
                <motion.div
                  key={s}
                  className={[
                    "timeline-step",
                    isDone ? "done" : "",
                    isActive ? "active" : "",
                    isFuture ? "future" : ""
                  ].join(" ")}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.35,
                    ease: "easeOut"
                  }}
                >
                  <div className="step-dot" />
                  <div className="step-label">{humanStatus(s)}</div>
                </motion.div>
              );
            })}
          </div>

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

          {(req.responded_at || req.reviewed_at) && (
            <div className="field">
              <label>Responded On</label>
              <p>{fmtDateTime(req.responded_at || req.reviewed_at)}</p>
            </div>
          )}

          {/* ===== ACTIONS ===== */}
          <div className="actions">
            {isOwner && req.status === "DRAFT" && (
              <button className="submit-btn" onClick={submitDraft}>
                Submit Request
              </button>
            )}

            {isOwner && req.status === "MANAGER_APPROVED" && (
              <button className="save-btn" onClick={finalApprove}>
                Final Approve
              </button>
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
