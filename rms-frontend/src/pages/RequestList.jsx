import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "./RequestList.css";

const fmtDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

export default function RequestList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/requests")
      .then((res) => setList(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const statusClass = useMemo(
    () => (s) => (s || "").toLowerCase().replace(/_/g, "-"),
    []
  );

  return (
    <>
      <Navbar />

      <div className="requestlist-container">
        <h2 className="requestlist-title">MY REQUESTS</h2>

        {loading && <p className="empty-state">Loading…</p>}

        {!loading && list.length === 0 && (
          <p className="empty-state">No requests created yet</p>
        )}

        <div className="requestlist-grid">
          {list.map((r) => (
            <div key={r.id} className="requestlist-card">
              <div className="requestlist-main">
                <Link to={`/requests/${r.id}`} className="requestlist-link">
                  {r.title}
                </Link>

                <span className={`status-badge ${statusClass(r.status)}`}>
                  {String(r.status || "").replace(/_/g, " ")}
                </span>
              </div>

              <div className="requestlist-meta">
                <span className="meta-item">
                  <b>Created:</b> {fmtDateTime(r.created_at)}
                </span>
              </div>

              {r.status === "REJECTED" && (
                <div className="requestlist-rejected-hint">
                  Rejected — tap to see details
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
