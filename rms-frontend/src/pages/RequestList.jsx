import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "./RequestList.css";

export default function RequestList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/requests").then((res) => setList(res.data));
  }, []);

  // FIX: handle STATUS_WITH_UNDERSCORES
  const statusClass = (s) =>
    (s || "").toLowerCase().replace(/_/g, "-");

  return (
    <>
      <Navbar />

      <div className="requestlist-container">
        <h2 className="requestlist-title">MY REQUESTS</h2>

        {list.length === 0 && (
          <p className="empty-state">No requests created yet</p>
        )}

        <div className="requestlist-grid">
          {list.map((r) => (
            <div key={r.id} className="requestlist-card">
              <div className="requestlist-main">
                <Link
                  to={`/requests/${r.id}`}
                  className="requestlist-link"
                >
                  {r.title}
                </Link>

                <span
                  className={`status-badge ${statusClass(r.status)}`}
                >
                  {r.status}
                </span>
              </div>

              {/* Optional hint for rejected */}
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
