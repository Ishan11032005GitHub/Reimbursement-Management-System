import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./RequestDetail.css";

/* ===== Date helpers ===== */
const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-IN") : "—";

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

  useEffect(() => {
    api
      .get(`/requests/${id}`)
      .then((res) => setReq(res.data))
      .catch(() => navigate("/requests"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <p className="page-loading">Loading…</p>;
  if (!req) return null;

  const showResponseInfo =
    req.status !== "DRAFT" && req.status !== "SUBMITTED";

  return (
    <>
      <Navbar />

      <div className="request-detail-container">
        <div className="request-card">
          <h2 className="request-detail-title">{req.title}</h2>

          <span className={`status-badge ${req.status.toLowerCase().replace(/_/g, "-")}`}>
            {req.status.replace(/_/g, " ")}
          </span>

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
            <p>{formatDateTime(req.created_at)}</p>
          </div>

          <div className="field">
            <label>Expense Date</label>
            <p>{formatDate(req.date)}</p>
          </div>

          {showResponseInfo && (
            <div className="field">
              <label>Responded On</label>
              <p>{formatDateTime(req.responded_at)}</p>
            </div>
          )}

          {showResponseInfo && req.manager_comment && (
            <div className="rejection-box">
              <b>Manager Comment</b>
              <p>{req.manager_comment}</p>
            </div>
          )}

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

          {/* ===== ACTIONS ===== */}
          {(req.status === "DRAFT" || req.status === "MANAGER_APPROVED") &&
            req.created_by === user.id && (
              <div className="actions">
                <button
                  className="submit-btn"
                  onClick={() =>
                    api
                      .post(`/requests/${id}/submit`)
                      .then(() => navigate("/requests"))
                  }
                >
                  Submit Request
                </button>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
