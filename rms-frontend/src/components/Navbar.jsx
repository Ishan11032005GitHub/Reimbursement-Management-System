import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import carrierLogo from "../assets/LOGO.png"; // ✅ FIXED import
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-left">
        {/* ✅ ONLY CHANGE: logo replaced */}
        <img
          src={carrierLogo}
          alt="Carrier"
          className="logo-img"
        />
      </div>

      {/* Desktop Menu */}
      <nav className="nav-links">
        <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard">
          DASHBOARD
        </Link>

        <Link
          className={isActive("/requests/new") ? "active" : ""}
          to="/requests/new"
        >
          CREATE REQ
        </Link>

        <Link className={isActive("/requests") ? "active" : ""} to="/requests">
          MY REQ
        </Link>

        <Link
          className={isActive("/requests/open") ? "active" : ""}
          to="/requests/open"
        >
          OPEN REQ
        </Link>

        {user?.role === "MANAGER" && (
          <Link
            className={isActive("/manager/requests") ? "active" : ""}
            to="/manager/requests"
          >
            MANAGER APPROVALS
          </Link>
        )}

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </nav>

      {/* Hamburger (Mobile) */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu">
          <Link to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link to="/requests/new" onClick={() => setOpen(false)}>
            Create Req
          </Link>
          <Link to="/requests" onClick={() => setOpen(false)}>
            My Req
          </Link>
          <Link to="/requests/open" onClick={() => setOpen(false)}>
            Open Req
          </Link>

          {user?.role === "MANAGER" && (
            <Link to="/manager/requests" onClick={() => setOpen(false)}>
              Manager Approvals
            </Link>
          )}

          <button onClick={logout}>Logout</button>
        </div>
      )}
    </header>
  );
}
