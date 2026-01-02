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
  SUBMITTED: "#FFB300",
  MANAGER_APPROVED: "#4CAF50",
  REJECTED: "#F44336"
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "USER") return;

    api
      .get("/requests/summary")
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
  }, [user]);

  if (!user) return null;

  const pieData =
    summary &&
    Object.entries(summary).map(([k, v]) => ({
      name: k.replace("_", " "),
      value: v,
      key: k
    }));

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">DASHBOARD</h1>

        <div className="dashboard-card">
          <p className="dashboard-user">
            Welcome, <b>{user.username}</b>
          </p>

          <span
            className={`role-badge ${
              user.role === "MANAGER" ? "manager" : "user"
            }`}
          >
            {user.role}
          </span>

          {/* ===== USER DASHBOARD ===== */}
          {user.role === "USER" && (
            <>
              {!summary && (
                <p className="dashboard-note">
                  No requests created yet.
                </p>
              )}

              {summary && (
                <div className="chart-wrapper">
                  <h3 className="chart-title">
                    Your Request Status Overview
                  </h3>

                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        label
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={COLORS[entry.key]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* ===== MANAGER DASHBOARD ===== */}
          {user.role === "MANAGER" && (
            <p className="manager-note">
              You can review and approve submitted requests from users.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
