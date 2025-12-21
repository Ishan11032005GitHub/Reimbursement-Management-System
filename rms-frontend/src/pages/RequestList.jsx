import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "./RequestList.css";

export default function RequestList() {
  const [list, setList] = useState([]);

  useEffect(() => {
  api.get("/requests").then(res => setList(res.data));
}, []);

  return (
    <>
      <Navbar />

      <div className="requestlist-container">
        <h2 className="requestlist-title">MY REQUESTS</h2>

        {list.length === 0 && (
          <p className="empty-state">No requests created yet</p>
        )}

        <div className="requestlist-grid">
          {list.map(r => (
            <div key={r.id} className="requestlist-card">
              <Link
                to={`/requests/${r.id}`}
                className="requestlist-link"
              >
                {r.title}
              </Link>

              <span className={`status-badge ${r.status.toLowerCase()}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
