import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

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

          {user.role === "MANAGER" && (
            <p className="manager-note">
              You have manager-level access and can approve requests.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
