import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "./RequestList.css";

const fmtDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

const humanStatus = (s) => String(s || "").replace(/_/g, " ");
const statusClass = (s) => String(s || "").toLowerCase().replace(/_/g, "-");

const FILTERS = ["ALL", "DRAFT", "SUBMITTED", "MANAGER_APPROVED", "FINAL_APPROVED", "REJECTED"];

export default function RequestList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/requests")
      .then((res) => setList(res.data || []))
      .catch(() => {
        setList([]);
        toast.error("Failed to load requests");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (list || [])
      .filter((r) => (filter === "ALL" ? true : r.status === filter))
      .filter((r) => (needle ? String(r.title || "").toLowerCase().includes(needle) : true));
  }, [list, filter, q]);

  return (
    <>
      <Navbar />

      <div className="requestlist-container">
        <h2 className="requestlist-title">MY REQUESTS</h2>

        {/* Tier 3: Filter + Search */}
        <div className="requestlist-controls">
          <div className="requestlist-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`tab-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                type="button"
              >
                {f === "ALL" ? "All" : humanStatus(f)}
              </button>
            ))}
          </div>

          <div className="requestlist-search">
            <input
              placeholder="Search by title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Tier 1: Empty states that teach */}
        {loading && <p className="empty-state">Loading…</p>}

        {!loading && list.length === 0 && (
          <div className="empty-card">
            <div className="empty-title">You haven’t created any requests yet.</div>
            <div className="empty-sub">
              Create your first reimbursement request to get started.
            </div>
            <button className="empty-cta" onClick={() => navigate("/requests/new")}>
              Create Request
            </button>
          </div>
        )}

        {!loading && list.length > 0 && filtered.length === 0 && (
          <div className="empty-card">
            <div className="empty-title">No results found.</div>
            <div className="empty-sub">
              Try a different filter or search term.
            </div>
            <button className="empty-cta secondary" onClick={() => { setFilter("ALL"); setQ(""); }}>
              Reset
            </button>
          </div>
        )}

        <div className="requestlist-grid">
          {filtered.map((r) => (
            <motion.div
  key={r.id}
  className="requestlist-card"
  whileHover={{ y: -4, boxShadow: "0 16px 32px rgba(0,0,0,0.14)" }}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
>
              <div className="requestlist-main">
                <Link to={`/requests/${r.id}`} className="requestlist-link">
                  {r.title}
                </Link>

                <span className={`status-badge ${statusClass(r.status)}`}>
                  {humanStatus(r.status)}
                </span>
              </div>

              <div className="requestlist-meta">
                <span className="meta-item">
                  <b>Created:</b> {fmtDateTime(r.created_at)}
                </span>

                {r.responded_at && (
                  <span className="meta-item">
                    <b>Responded:</b> {fmtDateTime(r.responded_at)}
                  </span>
                )}
              </div>

              {r.status === "REJECTED" && (
                <div className="requestlist-rejected-hint">
                  Rejected — open to see details
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
