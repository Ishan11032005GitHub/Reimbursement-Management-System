import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "./Signup.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER"
  });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await signup(form);
      toast.success("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
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
        <h2 className="auth-title">Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          disabled={loading}
        />

        <input
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          disabled={loading}
        />

        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          disabled={loading}
        >
          <option value="USER">User</option>
          <option value="MANAGER">Manager</option>
        </select>

        <motion.button
          className="signup-btn"
          disabled={loading}
          whileTap={{ scale: 0.96 }}
        >
          {loading ? "Creating..." : "Create Account"}
        </motion.button>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </motion.form>
    </div>
  );
}
