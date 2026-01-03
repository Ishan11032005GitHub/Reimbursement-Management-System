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

  const statusClass = (s) =>
    `status-${(s || "").toLowerCase().replace(/_/g, "-")}`;

  return (
    <>
      <Navbar />

      <div className="requestlist-container">
        <h2>My Requests</h2>

        {list.length === 0 && <p>No requests yet</p>}

        {list.map((r) => (
          <div key={r.id} className="request-card">
            <Link to={`/requests/${r.id}`} className="request-title">
              {r.title}
            </Link>

            <span className={`status-badge ${statusClass(r.status)}`}>
              {r.status.replace(/_/g, " ")}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
