// ForgotPassword.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    // ⚠️ INSECURE BY DESIGN — NO EMAIL VERIFICATION
    navigate(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2 className="auth-title">Forgot Password</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="login-btn">
          Continue
        </button>

        <p className="signup-text">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
