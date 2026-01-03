import { useEffect, useState } from "react";
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
  MANAGER_APPROVED: "#2E7D32",
  FINAL_APPROVED: "#1B5E20",
  REJECTED: "#C62828"
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});

  useEffect(() => {
    if (!user || user.role !== "USER") return;

    api
      .get("/requests/summary")
      .then(res => setSummary(res.data))
      .catch(() => setSummary({}));
  }, [user]);

  if (!user) return null;

  const pieData = Object.entries(summary).map(([k, v]) => ({
    key: k,
    name: k.replace(/_/g, " "),
    value: v
  }));

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">DASHBOARD</h1>

        <div className="dashboard-card">
          <p className="dashboard-user">
            Welcome,&nbsp;<b>{user.username}</b>
          </p>

          {pieData.length === 0 ? (
            <p className="dashboard-note">No requests created yet</p>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >
                    {pieData.map(p => (
                      <Cell key={p.key} fill={COLORS[p.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
