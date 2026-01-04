import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "./RequestDetail.css";

/* ===== Date helpers ===== */
const formatDate = (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "—");
const formatDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "—";

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwner = useMemo(() => {
    if (!user || !req) return false;
    return Number(req.created_by) === Number(user.id);
  }, [user, req]);

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

  const statusClass = (s) => (s || "").toLowerCase().replace(/_/g, "-");

  const submitDraft = async () => {
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

  const showResponseInfo =
    req.status !== "DRAFT" && req.status !== "SUBMITTED";

  return (
    <>
      <Navbar />

      <div className="request-detail-container">
        <div className="request-card">
          {/* Title */}
          <h2 className="request-detail-title">{req.title}</h2>

          {/* Status */}
          <span className={`status-badge ${statusClass(req.status)}`}>
            {req.status.replace(/_/g, " ")}
          </span>

          {/* Amount */}
          <div className="field">
            <label>Amount</label>
            <p>₹{req.amount}</p>
          </div>

          {/* Category */}
          <div className="field">
            <label>Category</label>
            <p>{req.category}</p>
          </div>

          {/* Created On */}
          <div className="field">
            <label>Created On</label>
            <p>{formatDateTime(req.created_at)}</p>
          </div>

          {/* Expense Date */}
          <div className="field">
            <label>Expense Date</label>
            <p>{formatDate(req.date)}</p>
          </div>

          {/* Responded On */}
          {showResponseInfo && (
            <div className="field">
              <label>Responded On</label>
              <p>{formatDateTime(req.responded_at || req.reviewed_at)}</p>
            </div>
          )}

          {/* Manager Comment */}
          {showResponseInfo && req.manager_comment && (
            <div className="manager-comment">
              <b>Manager Comment</b>
              <p>{req.manager_comment}</p>
            </div>
          )}

          {/* Attachment */}
          <div className="field">
            <label>Attachment</label>
            {req.file_url ? (
              <a
                href={req.file_url}
                target="_blank"
                rel="noreferrer"
                className="file-link"
              >
                View uploaded file
              </a>
            ) : (
              <p>No attachment</p>
            )}
          </div>

          {/* Actions */}
          <div className="actions">
            {isOwner && req.status === "DRAFT" && (
              <button
                className="submit-btn"
                disabled={actionLoading}
                onClick={submitDraft}
              >
                {actionLoading ? "Submitting..." : "Submit Request"}
              </button>
            )}

            {isOwner && req.status === "MANAGER_APPROVED" && (
              <button
                className="save-btn"
                disabled={actionLoading}
                onClick={finalApprove}
              >
                {actionLoading ? "Approving..." : "Final Approve"}
              </button>
            )}

            <Link className="back-link" to="/requests">
              Back
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
