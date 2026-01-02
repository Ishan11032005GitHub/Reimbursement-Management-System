require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth_routes");
const requestRoutes = require("./routes/request_routes");
const managerRoutes = require("./routes/manager_routes");

const app = express();

/* ===== ENV SAFETY CHECK ===== */
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

/* ===== MIDDLEWARE ===== */
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/manager", managerRoutes);

/* ===== SERVER ===== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
