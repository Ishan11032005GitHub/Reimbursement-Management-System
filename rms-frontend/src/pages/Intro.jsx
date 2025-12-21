import { useNavigate } from "react-router-dom";
import "./Intro.css";
import logo from "../assets/LOGO.png";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      <h1 className="title">
        <img
          src={logo}
          alt="Carrier RMS"
          className="title-image"
        />
      </h1>

      <p className="subtitle">
        For the World We Share
      </p>

      <div className="btn-group">
        <button onClick={() => navigate("/login")} className="btn primary">
          🔑 Sign In
        </button>

        <button onClick={() => navigate("/signup")} className="btn secondary">
          📝 Sign Up
        </button>
      </div>
    </div>
  );
}
