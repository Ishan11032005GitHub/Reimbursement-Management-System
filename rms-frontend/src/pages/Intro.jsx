import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Intro.css";
import logo from "../assets/LOGO.png";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      {/* Logo */}
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.img
          src={logo}
          alt="Carrier RMS"
          className="title-image"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="subtitle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        For the World We Share
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="btn-group"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.button
          onClick={() => navigate("/login")}
          className="btn primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔑 Sign In
        </motion.button>

        <motion.button
          onClick={() => navigate("/signup")}
          className="btn secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📝 Sign Up
        </motion.button>
      </motion.div>
    </div>
  );
}
