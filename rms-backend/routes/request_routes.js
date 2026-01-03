const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const db = require("../db");
const auth = require("../middleware/auth");
const STATUS = require("../constants/status");

const router = express.Router();

/* ===================== MULTER (KEEP EXTENSION) ===================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

/* ===================== URL HELPER (RENDER/PROXY SAFE) ===================== */
function toPublicFileUrl(req, filePath) {
  if (!filePath) return null;

  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  const protoHeader = req.headers["x-forwarded-proto"];
  const proto = (protoHeader ? String(protoHeader) : req.protocol).split(",")[0].trim();
  const host = req.get("x-forwarded-host") || req.get("host");

  if (normalized.startsWith("uploads/")) {
    const name = normalized.substring("uploads/".length);
    return `${proto}://${host}/uploads/${name}`;
  }

  return `${proto}://${host}/${normalized}`;
}

/* ===================== CREATE ===================== */
router.post("/", auth, upload.single("file"), (req, res) => {
  const { title, amount, date, category } = req.body;

  if (!title || !amount || !date || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const filePath = req.file ? `uploads/${req.file.filename}` : null;

  db.query(
    `INSERT INTO requests 
     (title, amount, date, category, file_path, created_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, amount, date, category, filePath, req.user.id, STATUS.DRAFT],
    (err, result) => {
      if (err) {
        console.error("CREATE REQUEST ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.status(201).json({
        message: "Created",
        id: result.insertId
      });
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
    [title, amount, date, category, req.params.id, req.user.id, STATUS.DRAFT],
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
    [STATUS.SUBMITTED, req.params.id, req.user.id, STATUS.DRAFT],
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

/* ===================== SUMMARY ===================== */
router.get("/summary", auth, (req, res) => {
  if (req.user.role !== "USER") {
    return res.json({});
  }

  db.query(
    `SELECT status, COUNT(*) as count
     FROM requests
     WHERE created_by = ?
     GROUP BY status`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error("SUMMARY ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      const out = {};
      rows.forEach(r => {
        out[r.status] = Number(r.count || 0);
      });

      res.json(out);
    }
  );
});

/* ===================== LIST (MY REQUESTS ONLY) ===================== */
router.get("/", auth, (req, res) => {
  db.query(
    `
    SELECT 
      r.*,
      r.reviewed_at AS responded_at,
      u.username AS created_by_username,
      ru.username AS responded_by_username
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
router.get("/:id", auth, (req, res) => {
  const id = req.params.id;

  let sql = `
    SELECT 
      r.*,
      r.reviewed_at AS responded_at,
      u.username AS created_by_username,
      ru.username AS responded_by_username
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
    [STATUS.FINAL_APPROVED, req.params.id, req.user.id, STATUS.MANAGER_APPROVED],
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
