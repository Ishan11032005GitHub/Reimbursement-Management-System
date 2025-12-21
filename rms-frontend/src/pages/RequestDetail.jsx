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
  const [form, setForm] = useState({});
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/requests/${id}`)
      .then(res => {
        setReq(res.data);
        setForm(res.data);
      })
      .catch(() => setError("Failed to load request"))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async () => {
    try {
      await api.post(`/requests/${id}/submit`);
      navigate("/requests");
    } catch {
      alert("Submit failed");
    }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/requests/${id}`, form);
      setEdit(false);
      navigate(0);
    } catch {
      alert("Update failed");
    }
  };

  const finalApprove = async () => {
    try {
      await api.post(`/requests/${id}/final-approve`);
      navigate("/requests");
    } catch {
      alert("Final approval failed");
    }
  };

  if (loading) return <p>Loading…</p>;

  if (error)
    return (
      <>
        <Navbar />
        <p className="error-msg">{error}</p>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="request-detail-container">
        <div className="request-card">
          <h2 className="request-detail-title">
            {edit ? (
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            ) : (
              req.title
            )}
          </h2>

          <span className={`status-badge ${req.status.toLowerCase()}`}>
            {req.status}
          </span>

          <div className="field">
            <label>Amount</label>
            {edit ? (
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
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
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
            ) : (
              <p>{req.category}</p>
            )}
          </div>

          <div className="actions">
            {req.status === "DRAFT" && req.created_by === user.id && !edit && (
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

            {req.status === "MANAGER_APPROVED" &&
              req.created_by === user.id && (
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
