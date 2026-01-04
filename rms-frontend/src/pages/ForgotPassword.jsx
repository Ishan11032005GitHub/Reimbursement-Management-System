import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./Login.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
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

      // IMPORTANT: use token-based flow (no email sending required)
      const res = await api.post("/auth/forgot-password", { email });
      const data = res.data;

      toast.success("If account exists, reset initiated");

      // If backend returns a resetUrl (DEV style), navigate directly
      if (data?.resetUrl) {
        const url = new URL(data.resetUrl);
        const token = url.searchParams.get("token");
        if (token) {
          navigate(`/reset-password?token=${token}`);
          return;
        }
      }

      // If no resetUrl, user can't proceed without email/token UI
      toast.info("Reset link not returned by server. Enable resetUrl in backend for now.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2 className="auth-title">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <button className="login-btn" disabled={loading}>
          {loading ? "Processing..." : "Continue"}
        </button>

        <p className="signup-text">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
