import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import carrierLogo from "../assets/LOGO.png";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Tier 4: close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="nav-left">
        <img src={carrierLogo} alt="Carrier" className="logo-img" />
      </div>

      <nav className="nav-links">
        <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard">
          DASHBOARD
        </Link>

        <Link className={isActive("/requests/new") ? "active" : ""} to="/requests/new">
          CREATE REQ
        </Link>

        <Link className={isActive("/requests") ? "active" : ""} to="/requests">
          MY REQ
        </Link>

        <Link className={isActive("/requests/open") ? "active" : ""} to="/requests/open">
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

      <div className="hamburger" onClick={() => setOpen((v) => !v)} role="button">
        ☰
      </div>

      {open && (
        <div className="mobile-menu">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/requests/new">Create Req</Link>
          <Link to="/requests">My Req</Link>
          <Link to="/requests/open">Open Req</Link>

          {user?.role === "MANAGER" && <Link to="/manager/requests">Manager Approvals</Link>}

          <button onClick={logout}>Logout</button>
        </div>
      )}
    </header>
  );
}
