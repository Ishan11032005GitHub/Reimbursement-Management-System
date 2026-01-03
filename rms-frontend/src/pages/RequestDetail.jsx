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
      .catch(() => navigate("/requests"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <p>Loading…</p>;
  if (!req) return null;

  return (
    <>
      <Navbar />

      <div className="request-detail-container">
        <div className="request-card">
          <h2>{req.title}</h2>

          <p><b>Status:</b> {req.status}</p>
          <p><b>Amount:</b> ₹{req.amount}</p>
          <p><b>Category:</b> {req.category}</p>
          <p><b>Date:</b> {req.date}</p>

          <div>
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

          {req.status === "DRAFT" && req.created_by === user.id && (
            <button onClick={() => api.post(`/requests/${id}/submit`)
              .then(() => navigate("/requests"))}>
              Submit
            </button>
          )}
        </div>
      </div>
    </>
  );
}
