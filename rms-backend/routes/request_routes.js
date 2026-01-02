const express = require("express");
const multer = require("multer");
const db = require("../db");
const auth = require("../middleware/auth");
const STATUS = require("../constants/status");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

function toPublicFileUrl(req, filePath) {
  if (!filePath) return null;
  // filePath usually: "uploads/abc123"
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  // serve via: /uploads/<filename>
  if (normalized.startsWith("uploads/")) {
    const name = normalized.substring("uploads/".length);
    return `${req.protocol}://${req.get("host")}/uploads/${name}`;
  }
  // fallback (if already a public path)
  return `${req.protocol}://${req.get("host")}/${normalized}`;
}

/* ===================== CREATE ===================== */
router.post("/", auth, upload.single("file"), (req, res) => {
  const { title, amount, date, category } = req.body;

  if (!title || !amount || !date || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

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

  if (!title || !amount || !date || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

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

/* ===================== LIST (MY REQUESTS ONLY) ===================== */
/**
 * IMPORTANT FIX:
 * This endpoint MUST return only the logged-in user's requests.
 * Managers should use /api/manager/requests for approvals.
 * This fixes: "user ke req manager ki my req me dikh rhi"
 */
router.get("/", auth, (req, res) => {
  db.query(
    `
    SELECT 
      r.*,
      u.username AS created_by_username,
      ru.username AS reviewed_by_username
    FROM requests r
    JOIN users u ON r.created_by = u.id
    LEFT JOIN users ru ON r.reviewed_by = ru.id
    WHERE r.created_by = ?
    ORDER BY r.created_at DESC
    `,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error("FETCH REQUESTS ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      const mapped = rows.map((r) => ({
        ...r,
        file_url: toPublicFileUrl(req, r.file_path)
      }));

      res.json(mapped);
    }
  );
});

/* ===================== DETAILS ===================== */
/**
 * IMPORTANT FIX:
 * USER can only view their own request
 * MANAGER can view any request (for review)
 */
router.get("/:id", auth, (req, res) => {
  const id = req.params.id;

  let sql = `
    SELECT 
      r.*,
      u.username AS created_by_username,
      ru.username AS reviewed_by_username
    FROM requests r
    JOIN users u ON r.created_by = u.id
    LEFT JOIN users ru ON r.reviewed_by = ru.id
    WHERE r.id = ?
  `;
  const params = [id];

  if (req.user.role === "USER") {
    sql += " AND r.created_by = ?";
    params.push(req.user.id);
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("FETCH REQUEST ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    const r = rows[0];
    res.json({
      ...r,
      file_url: toPublicFileUrl(req, r.file_path)
    });
  });
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
