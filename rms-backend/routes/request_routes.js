const express = require("express");
const multer = require("multer");
const db = require("../db");
const auth = require("../middleware/auth");
const STATUS = require("../constants/status");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ===================== CREATE ===================== */
router.post("/", auth, upload.single("file"), (req, res) => {
  const { title, amount, date, category } = req.body;

  db.query(
    `INSERT INTO requests 
     (title, amount, date, category, file_path, created_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      amount,
      date,
      category,
      req.file?.path || null,
      req.user.id,
      STATUS.DRAFT
    ],
    (err) => {
      if (err) {
        console.error("CREATE REQUEST ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.status(201).json({ message: "Created" });
    }
  );
});

/* ===================== UPDATE DRAFT ===================== */
router.put("/:id", auth, (req, res) => {
  const { title, amount, date, category } = req.body;

  db.query(
    `UPDATE requests 
     SET title=?, amount=?, date=?, category=?
     WHERE id=? AND created_by=? AND status=?`,
    [
      title,
      amount,
      date,
      category,
      req.params.id,
      req.user.id,
      STATUS.DRAFT
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE REQUEST ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(400).json({ message: "Cannot edit request" });
      }

      res.json({ message: "Updated" });
    }
  );
});

/* ===================== SUBMIT ===================== */
router.post("/:id/submit", auth, (req, res) => {
  db.query(
    `UPDATE requests 
     SET status=? 
     WHERE id=? AND created_by=? AND status=?`,
    [
      STATUS.SUBMITTED,
      req.params.id,
      req.user.id,
      STATUS.DRAFT
    ],
    (err, result) => {
      if (err) {
        console.error("SUBMIT ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(400).json({ message: "Cannot submit" });
      }

      res.json({ message: "Submitted" });
    }
  );
});

/* ===================== LIST ===================== */
router.get("/", auth, (req, res) => {
  let query = `
    SELECT r.*, u.username
    FROM requests r
    JOIN users u ON r.created_by = u.id
  `;
  const params = [];

  if (req.user.role === "USER") {
    query += " WHERE r.created_by=?";
    params.push(req.user.id);
  }

  query += " ORDER BY r.created_at DESC";

  db.query(query, params, (err, rows) => {
    if (err) {
      console.error("FETCH REQUESTS ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json(rows);
  });
});

/* ===================== DETAILS ===================== */
router.get("/:id", auth, (req, res) => {
  db.query(
    `SELECT r.*, u.username
     FROM requests r
     JOIN users u ON r.created_by = u.id
     WHERE r.id=?`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.error("FETCH REQUEST ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json(rows[0]);
    }
  );
});

/* ===================== FINAL APPROVE ===================== */
router.post("/:id/final-approve", auth, (req, res) => {
  db.query(
    `UPDATE requests
     SET status = ?
     WHERE id = ?
       AND created_by = ?
       AND status = ?`,
    [
      STATUS.FINAL_APPROVED,
      req.params.id,
      req.user.id,
      STATUS.MANAGER_APPROVED
    ],
    (err, result) => {
      if (err) {
        console.error("FINAL APPROVE ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(400).json({ message: "Invalid transition" });
      }

      res.json({ message: "Final approved" });
    }
  );
});

module.exports = router;
