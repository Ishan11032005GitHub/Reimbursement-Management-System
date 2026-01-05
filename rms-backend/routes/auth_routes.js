const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");

/* ✅ EMAIL HELPERS — IMPORTED ON TOP */
const { sendResetEmail, sendVerifyEmail } = require("../utils/email");

const router = express.Router();

/* =========================
   REGISTER (EMAIL VERIFICATION ENABLED)
========================= */
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const safeRole = role === "MANAGER" ? "MANAGER" : "USER";

  db.query(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [username, email],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length) {
        return res.status(409).json({ message: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const verifyToken = crypto.randomBytes(32).toString("hex");
      const verifyTokenHash = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");

      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      db.query(
        `INSERT INTO users
         (username, email, password_hash, role, is_verified, verify_token_hash, verify_token_expiry)
         VALUES (?, ?, ?, ?, false, ?, ?)`,
        [username, email, passwordHash, safeRole, verifyTokenHash, expiry],
        async (err) => {
          if (err) {
            return res.status(500).json({ message: "Insert failed" });
          }

          const verifyUrl =
            `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

          try {
            await sendVerifyEmail(email, verifyUrl);
          } catch (e) {
            console.error("VERIFY EMAIL ERROR:", e);
            // ❗ Do NOT fail registration because of email
          }

          res.status(201).json({
            message: "Account created. Please verify your email."
          });
        }
      );
    }
  );
});

/* =========================
   EMAIL VERIFICATION
========================= */
router.get("/verify-email", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  db.query(
    `SELECT id, verify_token_expiry
     FROM users
     WHERE verify_token_hash = ?`,
    [tokenHash],
    (err, rows) => {
      if (err || !rows.length) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const user = rows[0];

      if (new Date(user.verify_token_expiry) < new Date()) {
        return res.status(400).json({ message: "Token expired" });
      }

      db.query(
        `UPDATE users
         SET is_verified = true,
             verify_token_hash = NULL,
             verify_token_expiry = NULL
         WHERE id = ?`,
        [user.id],
        () => {
          res.json({ message: "Email verified successfully" });
        }
      );
    }
  );
});

/* =========================
   LOGIN (BLOCK UNVERIFIED USERS)
========================= */
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [identifier, identifier],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!rows.length) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.is_verified) {
        return res.status(403).json({
          message: "Please verify your email before logging in"
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }
  );
});

/* =========================
   FORGOT PASSWORD (SAFE)
========================= */
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      // Prevent email enumeration
      if (err || !rows.length) {
        return res.json({
          message: "If account exists, reset link sent"
        });
      }

      const userId = rows[0].id;

      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      db.query(
        "UPDATE users SET reset_token_hash = ?, reset_token_expiry = ? WHERE id = ?",
        [tokenHash, expiry, userId],
        async () => {
          try {
            const resetUrl =
              `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            await sendResetEmail(email, resetUrl);
          } catch (err) {
            console.error("EMAIL ERROR:", err);
            // ❗ Never fail forgot-password
          }

          return res.json({
            message: "If account exists, reset link sent"
          });
        }
      );
    }
  );
});

/* =========================
   RESET PASSWORD
========================= */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  db.query(
    "SELECT id, reset_token_expiry FROM users WHERE reset_token_hash = ?",
    [tokenHash],
    async (err, rows) => {
      if (err || !rows.length) {
        return res.status(400).json({
          message: "Invalid or expired token"
        });
      }

      const user = rows[0];

      if (new Date(user.reset_token_expiry) < new Date()) {
        return res.status(400).json({
          message: "Token expired"
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);

      db.query(
        `UPDATE users
         SET password_hash = ?, reset_token_hash = NULL, reset_token_expiry = NULL
         WHERE id = ?`,
        [newHash, user.id],
        () => {
          res.json({ message: "Password reset successful" });
        }
      );
    }
  );
});

module.exports = router;
