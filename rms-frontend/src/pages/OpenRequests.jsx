import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "./OpenRequests.css";

export default function OpenRequests() {
  const [list, setList] = useState([]);

  useEffect(() => {
  api.get("/requests").then(res => {
    const open = res.data.filter(r =>
      ["SUBMITTED", "MANAGER_APPROVED"].includes(r.status)
    );
    setList(open);
  });
}, []);

  return (
    <>
      <Navbar />

      <div className="open-requests-container">
        <h2 className="open-requests-title">OPEN REQUESTS</h2>

        {list.length === 0 && (
          <p className="empty-state">No open requests</p>
        )}

        <div className="request-list">
          {list.map(r => (
            <div key={r.id} className="request-card">
              <Link to={`/requests/${r.id}`} className="request-title">
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
