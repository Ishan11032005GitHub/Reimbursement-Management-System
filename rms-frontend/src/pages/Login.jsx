import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
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
      <motion.form
        className="auth-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
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

        <div style={{ textAlign: "right", marginBottom: "16px" }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: "14px", color: "#1e88e5", textDecoration: "none" }}
          >
            Forgot password?
          </Link>
        </div>

        <motion.button
          className="login-btn"
          disabled={loading}
          whileTap={{ scale: 0.96 }}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </motion.form>
    </div>
  );
}
