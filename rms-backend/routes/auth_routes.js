const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

/* REGISTER */
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
      if (rows.length > 0)
        return res.status(409).json({ message: "User already exists" });

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [username, email, hash, safeRole],
        (err) => {
          if (err) return res.status(500).json({ message: "Insert failed" });
          res.status(201).json({ message: "User created" });
        }
      );
    }
  );
});

/* LOGIN */
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
  { id: user.id, role: user.role, username: user.username },
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

module.exports = router;
