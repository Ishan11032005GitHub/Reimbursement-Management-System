import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css"; // reuse same CSS

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

      // TODO: replace with API call
      // await api.post("/auth/forgot-password", { email });

      toast.success("Password reset link sent (if account exists)");
    } catch {
      toast.error("Something went wrong");
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
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />

        <button className="login-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="signup-text">
          Remembered your password?{" "}
          <Link to="/login">Go back</Link>
        </p>
      </form>
    </div>
  );
}
