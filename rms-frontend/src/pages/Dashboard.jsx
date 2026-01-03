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
import "./Dashboard.css";

const COLORS = {
  DRAFT: "#9E9E9E",
  SUBMITTED: "#FFB300",
  MANAGER_APPROVED: "#43A047",
  FINAL_APPROVED: "#0B3D0B", // dark green (fixed)
  REJECTED: "#C62828"
};

const CustomLegend = ({ payload }) => {
  return (
    <ul className="dashboard-legend">
      {payload.map(entry => (
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
    const handler = e => setIsMobile(e.matches);

    // Support older browsers
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
      .then(res => setSummary(res.data))
      .catch(() => {
        setSummary({});
        setError("Failed to load dashboard summary. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const pieData = useMemo(() => {
    return Object.entries(summary).map(([k, v]) => ({
      key: k,
      name: k.replace(/_/g, " "),
      value: v
    }));
  }, [summary]);

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
            <p className="dashboard-note">Loading summary...</p>
          ) : error ? (
            <p className="dashboard-error">{error}</p>
          ) : pieData.length === 0 ? (
            <p className="dashboard-note">No requests created yet</p>
          ) : (
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
                    {pieData.map(p => (
                      <Cell key={p.key} fill={COLORS[p.key]} />
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
          )}
        </div>
      </div>
    </>
  );
}
