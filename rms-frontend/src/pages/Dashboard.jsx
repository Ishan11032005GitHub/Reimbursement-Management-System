import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./Dashboard.css";

const COLORS = {
  DRAFT: "#9E9E9E",
  SUBMITTED: "#FFB300",
  MANAGER_APPROVED: "#4CAF50",
  REJECTED: "#F44336"
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "USER") return;
    api.get("/requests/summary").then(res => setSummary(res.data));
  }, [user]);

  if (!user) return null;

  const pieData = summary
    ? Object.entries(summary).map(([k, v]) => ({
        key: k,
        name: k.replace(/_/g, " "),
        value: v
      }))
    : [];

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="dashboard-card">
          <p>Welcome, <b>{user.username}</b></p>

          {user.role === "USER" && (
            <>
              {pieData.length === 0 ? (
                <p className="dashboard-note">No requests yet</p>
              ) : (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                      >
                        {pieData.map(p => (
                          <Cell key={p.key} fill={COLORS[p.key]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
