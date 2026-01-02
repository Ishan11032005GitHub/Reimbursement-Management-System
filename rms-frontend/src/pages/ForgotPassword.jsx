import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState(null); // DEV only

  const submit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      toast.success("If account exists, reset link generated");

      // DEV ONLY: backend returns resetUrl
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
        console.warn("RESET LINK (DEV):", data.resetUrl);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
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
          {loading ? "Sending..." : "Generate Reset Link"}
        </button>

        {/* DEV ONLY: show reset link */}
        {resetUrl && (
          <p className="signup-text" style={{ wordBreak: "break-all" }}>
            <strong>DEV reset link:</strong>
            <br />
            <a href={resetUrl}>{resetUrl}</a>
          </p>
        )}

        <p className="signup-text">
          Remembered your password?{" "}
          <Link to="/login">Go back</Link>
        </p>
      </form>
    </div>
  );
}
