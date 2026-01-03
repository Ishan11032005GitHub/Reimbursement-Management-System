const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const STATUS = require("../constants/status");

const router = express.Router();

/* VIEW SUBMITTED REQUESTS */
router.get("/requests", auth, role("MANAGER"), (req, res) => {
  db.query(
    `SELECT r.*, u.username
     FROM requests r
     JOIN users u ON r.created_by = u.id
     WHERE r.status = ?
     ORDER BY r.created_at DESC`,
    [STATUS.SUBMITTED],
    (err, rows) => {
      if (err) {
        console.error("FETCH MANAGER REQUESTS ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(rows);
    }
  );
});

/* APPROVE */
router.post("/requests/:id/approve", auth, role("MANAGER"), (req, res) => {
  db.query(
    `UPDATE requests 
     SET status = ?, reviewed_by = ?, reviewed_at = NOW(), manager_comment = NULL
     WHERE id = ? AND status = ?`,
    [STATUS.MANAGER_APPROVED, req.user.id, req.params.id, STATUS.SUBMITTED],
    (err, result) => {
      if (err) {
        console.error("APPROVE ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(400).json({ message: "Invalid transition" });
      }

      // return server time (optional convenience)
      res.json({ message: "Manager approved", responded_at: new Date().toISOString() });
    }
  );
});

/* REJECT (comment mandatory) */
router.post("/requests/:id/reject", auth, role("MANAGER"), (req, res) => {
  const { comment } = req.body;

  if (!comment || comment.trim().length < 3) {
    return res.status(400).json({ message: "Rejection comment is required" });
  }

  db.query(
    `UPDATE requests 
     SET status = ?, reviewed_by = ?, reviewed_at = NOW(), manager_comment = ?
     WHERE id = ? AND status = ?`,
    [STATUS.REJECTED, req.user.id, comment.trim(), req.params.id, STATUS.SUBMITTED],
    (err, result) => {
      if (err) {
        console.error("REJECT ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(400).json({ message: "Invalid transition" });
      }

      res.json({ message: "Rejected", responded_at: new Date().toISOString() });
    }
  );
});

module.exports = router;
