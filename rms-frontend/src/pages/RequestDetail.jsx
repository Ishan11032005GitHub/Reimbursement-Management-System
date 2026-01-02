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
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    api
      .get(`/requests/${id}`)
      .then((res) => {
        setReq(res.data);
        setForm(res.data);
      })
      .catch(() => setError("Request not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const statusClass = (s) =>
    (s || "").toLowerCase().replace(/_/g, "-");

  const submit = async () => {
    await api.post(`/requests/${id}/submit`);
    navigate("/requests");
  };

  const saveEdit = async () => {
    await api.put(`/requests/${id}`, {
      title: form.title,
      amount: form.amount,
      category: form.category,
      date: form.date
    });
    setEdit(false);
    navigate(0);
  };

  const finalApprove = async () => {
    await api.post(`/requests/${id}/final-approve`);
    navigate("/requests");
  };

  if (loading) return <p className="page-loading">Loading...</p>;

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
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            ) : (
              req.title
            )}
          </h2>

          <span className={`status-badge ${statusClass(req.status)}`}>
            {req.status}
          </span>

          <div className="field">
            <label>Amount</label>
            {edit ? (
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />
            ) : (
              <p>₹{req.amount}</p>
            )}
          </div>

          <div className="field">
            <label>Category</label>
            <p>{req.category}</p>
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
              <p><b>Comment:</b> {req.manager_comment || "—"}</p>
            </div>
          )}

          <div className="actions">
            {req.status === "DRAFT" &&
              req.created_by === user.id &&
              !edit && (
                <>
                  <button onClick={() => setEdit(true)}>Edit</button>
                  <button onClick={submit}>Submit</button>
                </>
              )}

            {edit && <button onClick={saveEdit}>Save</button>}

            {req.status === "MANAGER_APPROVED" &&
              req.created_by === user.id && (
                <button onClick={finalApprove}>Final Approve</button>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
