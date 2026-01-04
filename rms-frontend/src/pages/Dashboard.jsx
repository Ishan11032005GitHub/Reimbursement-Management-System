import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const COLORS = {
  DRAFT: "#9E9E9E",
  SUBMITTED: "#FFB300",
  MANAGER_APPROVED: "#43A047",
  FINAL_APPROVED: "#1565C0",
  REJECTED: "#C62828"
};

const CustomLegend = ({ payload }) => {
  if (!payload) return null;
  return (
    <ul className="dashboard-legend">
      {payload.map((entry) => (
        <li key={entry.value} className="dashboard-legend-item">
          <span
            className="dashboard-legend-swatch"
            style={{ backgroundColor: entry.color }}
          />
          <span className="dashboard-legend-text">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 600px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 600px)");
    const handler = (e) => setIsMobile(e.matches);

    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  useEffect(() => {
    if (!user || user.role !== "USER") return;

    setLoading(true);
    setError("");

    api
      .get("/requests/summary")
      .then((res) => setSummary(res.data || {}))
      .catch(() => {
        setSummary({});
        setError("Failed to load dashboard summary. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const pieData = useMemo(() => {
    return Object.entries(summary || {}).map(([k, v]) => ({
      key: k,
      name: String(k).replace(/_/g, " "),
      value: Number(v || 0)
    }));
  }, [summary]);

  const total = useMemo(() => {
    return pieData.reduce((acc, x) => acc + (x.value || 0), 0);
  }, [pieData]);

  const chartHeight = isMobile ? 240 : 320;

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">DASHBOARD</h1>

        <div className="dashboard-card">
          <p className="dashboard-user">
            Welcome,&nbsp;<b>{user.username}</b>
          </p>

          {loading ? (
            <p className="dashboard-note">Loading summary…</p>
          ) : error ? (
            <p className="dashboard-error">{error}</p>
          ) : total === 0 ? (
            <div className="empty-card">
              <div className="empty-title">No requests yet.</div>
              <div className="empty-sub">
                Create your first reimbursement request to see analytics here.
              </div>
              <Link className="empty-cta-link" to="/requests/new">
                Create Request
              </Link>
            </div>
          ) : (
            <>
              <div className="dashboard-kpis">
                <div className="kpi">
                  <div className="kpi-label">Total Requests</div>
                  <div className="kpi-value">{total}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Rejected</div>
                  <div className="kpi-value">
                    {Number(summary.REJECTED || 0)}
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Pending Review</div>
                  <div className="kpi-value">
                    {Number(summary.SUBMITTED || 0)}
                  </div>
                </div>
              </div>

              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={isMobile ? 90 : 110}
                      label={!isMobile}
                    >
                      {pieData.map((p) => (
                        <Cell key={p.key} fill={COLORS[p.key] || "#8884d8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout={isMobile ? "horizontal" : "vertical"}
                      align={isMobile ? "center" : "right"}
                      verticalAlign={isMobile ? "bottom" : "middle"}
                      content={<CustomLegend />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
