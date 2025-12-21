import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    identifier: "",
    password: ""
  });

  const submit = async (e) => {
    e.preventDefault();

    if (!data.identifier || !data.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await login(data);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2 className="auth-title">Sign In</h2>

        <input
          placeholder="Username or Email"
          value={data.identifier}
          onChange={e => setData({ ...data, identifier: e.target.value })}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={e => setData({ ...data, password: e.target.value })}
          disabled={loading}
        />

        <button className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Signup Redirect */}
        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}
