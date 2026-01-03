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

  if (loading) return <p>Loading…</p>;
  if (!req) return null;

  const showResponseInfo =
    req.status !== "DRAFT" && req.status !== "SUBMITTED";

  return (
    <>
      <Navbar />

      <div className="request-detail-container">
        <div className="request-card">
          <h2>{req.title}</h2>

          <p><b>Status:</b> {req.status.replace(/_/g, " ")}</p>
          <p><b>Amount:</b> ₹{req.amount}</p>
          <p><b>Category:</b> {req.category}</p>

          {/* Creation time */}
          <p>
            <b>Created On:</b>{" "}
            {formatDateTime(req.created_at)}
          </p>

          {/* Expense date */}
          <p>
            <b>Expense Date:</b>{" "}
            {formatDate(req.date)}
          </p>

          {/* Manager response time */}
          {showResponseInfo && (
            <p>
              <b>Responded On:</b>{" "}
              {formatDateTime(req.responded_at)}
            </p>
          )}

          {/* Manager comment (approve + reject) */}
          {showResponseInfo && req.manager_comment && (
            <div className="manager-comment">
              <b>Manager Comment:</b>
              <p>{req.manager_comment}</p>
            </div>
          )}

          {/* Attachment */}
          <div style={{ marginTop: "8px" }}>
            <b>Attachment:</b>{" "}
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
              "No attachment"
            )}
          </div>

          {/* Submit button */}
          {req.status === "DRAFT" &&
            req.created_by === user.id && (
              <button
                onClick={() =>
                  api
                    .post(`/requests/${id}/submit`)
                    .then(() => navigate("/requests"))
                }
              >
                Submit
              </button>
            )}
        </div>
      </div>
    </>
  );
}
