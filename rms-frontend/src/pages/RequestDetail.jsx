import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./RequestDetail.css";

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [form, setForm] = useState({ title: "", amount: "", category: "", date: "" });
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReq = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/requests/${id}`);
      setReq(res.data);
      setForm({
        title: res.data.title || "",
        amount: res.data.amount || "",
        category: res.data.category || "",
        date: res.data.date ? String(res.data.date).slice(0, 10) : ""
      });
    } catch {
      setError("Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReq();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusClass = (s) => (s || "").toLowerCase().replace(/_/g, "-");

  const submit = async () => {
    try {
      await api.post(`/requests/${id}/submit`);
      navigate("/requests");
    } catch (e) {
      alert(e?.response?.data?.message || "Submit failed");
    }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/requests/${id}`, {
        title: form.title,
        amount: form.amount,
        category: form.category,
        date: form.date
      });
      setEdit(false);
      await fetchReq();
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed");
    }
  };

  const finalApprove = async () => {
    try {
      await api.post(`/requests/${id}/final-approve`);
      navigate("/requests");
    } catch (e) {
      alert(e?.response?.data?.message || "Final approval failed");
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="page-loading">Loading…</p>
      </>
    );
  }

  if (error || !req) {
    return (
      <>
        <Navbar />
        <p className="error-msg">{error || "Not found"}</p>
        <p style={{ textAlign: "center" }}>
          <Link to="/requests">Back</Link>
        </p>
      </>
    );
  }

  const isOwner = req.created_by === user.id;

  return (
    <>
      <Navbar />

      <div className="request-detail-container">
        <div className="request-card">
          <h2 className="request-detail-title">
            {edit ? (
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            ) : (
              req.title
            )}
          </h2>

          <span className={`status-badge ${statusClass(req.status)}`}>{req.status}</span>

          <div className="field">
            <label>Amount</label>
            {edit ? (
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            ) : (
              <p>₹{req.amount}</p>
            )}
          </div>

          <div className="field">
            <label>Category</label>
            {edit ? (
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            ) : (
              <p>{req.category}</p>
            )}
          </div>

          <div className="field">
            <label>Date</label>
            {edit ? (
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            ) : (
              <p>{req.date ? String(req.date).slice(0, 10) : "—"}</p>
            )}
          </div>

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

          {req.status === "REJECTED" && (
            <div className="rejection-box">
              <p>
                <b>Rejected by:</b> {req.reviewed_by_username || "Manager"}
              </p>
              <p>
                <b>Rejected at:</b>{" "}
                {req.reviewed_at ? new Date(req.reviewed_at).toLocaleString() : "—"}
              </p>
              <p>
                <b>Comment:</b> {req.manager_comment || "No comment"}
              </p>
            </div>
          )}

          <div className="actions">
            {req.status === "DRAFT" && isOwner && !edit && (
              <>
                <button className="edit-btn" onClick={() => setEdit(true)}>
                  Edit
                </button>
                <button className="submit-btn" onClick={submit}>
                  Submit
                </button>
              </>
            )}

            {edit && (
              <button className="save-btn" onClick={saveEdit}>
                Save
              </button>
            )}

            {req.status === "MANAGER_APPROVED" && isOwner && (
              <button className="save-btn" onClick={finalApprove}>
                Final Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
