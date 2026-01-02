import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./RequestDetail.css";

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/requests/${id}`)
      .then(res => setReq(res.data))
      .catch(() => setReq(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (!req) return <p>Request not found</p>;

  const statusClass = s => s.toLowerCase().replace(/_/g, "-");

  return (
    <>
      <Navbar />
      <div className="request-detail-container">
        <div className="request-card">
          <h2>{req.title}</h2>
          <span className={`status-badge ${statusClass(req.status)}`}>
            {req.status}
          </span>

          <p><b>Amount:</b> ₹{req.amount}</p>
          <p><b>Category:</b> {req.category}</p>

          <div>
            <b>Attachment:</b>{" "}
            {req.file_url ? (
              <a href={req.file_url} target="_blank" rel="noreferrer">
                View uploaded file
              </a>
            ) : (
              "No attachment"
            )}
          </div>

          {req.status === "DRAFT" && req.created_by === user.id && (
            <button onClick={() => navigate(`/requests/${id}/edit`)}>
              Edit
            </button>
          )}
        </div>
      </div>
    </>
  );
}
