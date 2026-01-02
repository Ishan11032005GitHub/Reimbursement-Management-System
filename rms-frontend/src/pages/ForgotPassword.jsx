import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirm) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/dev-reset-password", {
        email,
        newPassword: password
      });

      toast.success("Password reset successful");

      setEmail("");
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          disabled={loading}
        />

        <button className="login-btn" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="signup-text">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
