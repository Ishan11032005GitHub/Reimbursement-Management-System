// ResetPassword.jsx
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./Login.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing token");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        newPassword: password
      });

      toast.success("Password reset successful. You can log in now.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2 className="auth-title">Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
        />

        <button className="login-btn" disabled={loading}>
          {loading ? "Resetting…" : "Reset Password"}
        </button>

        <p className="signup-text">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
