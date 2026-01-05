// ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", { email });

      toast.success(
        "If an account exists, a reset link has been sent to your email."
      );

      setEmail("");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2 className="auth-title">Forgot Password</h2>

        <p style={{ color: "#444", fontWeight: 600 }}>
          Enter your email to receive a password reset link.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        {/* ✅ SUBMIT BUTTON — NOT A LINK */}
        <button className="login-btn" disabled={loading}>
          {loading ? "Sending…" : "Send Reset Link"}
        </button>

        <p className="signup-text">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
