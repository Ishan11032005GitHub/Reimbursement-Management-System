require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth_routes");
const requestRoutes = require("./routes/request_routes");
const managerRoutes = require("./routes/manager_routes");

const app = express();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/manager", managerRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
