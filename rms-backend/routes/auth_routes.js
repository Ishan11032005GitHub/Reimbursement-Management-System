const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const safeRole = role === "MANAGER" ? "MANAGER" : "USER";

  db.query(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [username, email],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length)
        return res.status(409).json({ message: "User already exists" });

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [username, email, hash, safeRole],
        (err) => {
          if (err)
            return res.status(500).json({ message: "Insert failed" });

          res.status(201).json({ message: "User created" });
        }
      );
    }
  );
});

/* =========================
   LOGIN
========================= */
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password)
    return res.status(400).json({ message: "Missing credentials" });

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [identifier, identifier],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!rows.length)
        return res.status(401).json({ message: "Invalid credentials" });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match)
        return res.status(401).json({ message: "Invalid credentials" });

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

const { sendResetEmail } = require("../utils/emails");

/* =========================
   FORGOT PASSWORD (UNCHANGED)
========================= */
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email required" });

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      // Always return same response (prevent email enumeration)
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
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            await sendResetEmail(email, resetUrl);

            res.json({
              message: "If account exists, reset link sent"
            });
          } catch (mailErr) {
            console.error("EMAIL ERROR:", mailErr);

            res.status(500).json({
              message: "Failed to send email"
            });
          }
        }
      );
    }
  );
});

/* =========================
   RESET PASSWORD (UNCHANGED)
========================= */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({message: "Invalid request"});

  // inside /reset-password
  if(newPassword.length<8){
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
      if (err || !rows.length)
        return res.status(400).json({
          message: "Invalid or expired token"
        });

      const user = rows[0];

      if (new Date(user.reset_token_expiry) < new Date())
        return res.status(400).json({
          message: "Token expired"
        });

      const newHash = await bcrypt.hash(newPassword, 10);

      db.query(
        `UPDATE users
         SET password_hash = ?, reset_token_hash = NULL, reset_token_expiry = NULL
         WHERE id = ?`,
        [newHash, user.id],
        () => {
          res.json({
            message: "Password reset successful"
          });
        }
      );
    }
  );
});

/* =========================
   🔴 DEV RESET PASSWORD (NO TOKEN, NO EMAIL)
   ONLY ADDITION — EMERGENCY USE
========================= */
// =========================
// DEV RESET PASSWORD
// =========================
router.post("/dev-reset-password", async (req, res) => {
  if(process.env.NODE_ENV !== "production"){
    return res.status(403).json({
      message: "DEV endpoint disabled in production"
    });
  }

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hash, email],
      () => {
        res.json({
          message: "If account exists, password has been reset"
        });
      }
    );
  } catch (err) {
    console.error("DEV RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
