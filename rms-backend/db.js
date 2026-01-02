const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,        // ✅ CORRECT
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: true
  },

  connectTimeout: 20000
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    // ❌ DO NOT EXIT — let Render retry
    return;
  }
  console.log("✅ MySQL Connected");
});

module.exports = db;
