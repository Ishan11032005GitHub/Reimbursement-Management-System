import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./ManagerRequests.css";

export default function ManagerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/manager/requests");
    setRequests(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const statusClass = (s) => (s || "").toLowerCase().replace(/_/g, "-");

  const action = async (id, type) => {
    if (type === "reject") {
      const comment = window.prompt("Enter rejection comment (required):");
      if (!comment || comment.trim().length < 3) return;

      await api.post(`/manager/requests/${id}/reject`, { comment: comment.trim() });
      load();
      return;
    }

    await api.post(`/manager/requests/${id}/approve`);
    load();
  };

  return (
    <>
      <Navbar />

      <div className="manager-container">
        <h2 className="manager-title">MANAGER APPROVAL PANEL</h2>

        {loading && <p className="manager-message">Loading requests…</p>}

        {!loading && requests.length === 0 && (
          <p className="empty-state">No pending requests for approval</p>
        )}

        <div className="manager-list">
          {requests.map((r) => (
            <div key={r.id} className="manager-card">
              <div className="manager-info">
                <span className="manager-request-title">{r.title}</span>

                <span style={{ fontFamily: "system-ui", fontSize: "1.5rem" }}>
                  <b>{r.username}</b> • ₹{r.amount}
                </span>

                <span className={`status-badge ${statusClass(r.status)}`}>
                  {r.status}
                </span>
              </div>

              <div className="manager-actions">
                <button className="approve-btn" onClick={() => action(r.id, "approve")}>
                  Approve
                </button>

                <button className="reject-btn" onClick={() => action(r.id, "reject")}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
