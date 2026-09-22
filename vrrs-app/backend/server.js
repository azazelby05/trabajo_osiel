import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import auth from "./middleware/auth.js";
import { requireAdmin, requireManager } from "./middleware/requireRole.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5560;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5180";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    name: "vrrs.sid",
    secret: process.env.SESSION_SECRET || "vrrs_dev_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ message: "SwitchWheels VRRS API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", auth, customerRoutes);
app.use("/api/vehicles", auth, vehicleRoutes);
app.use("/api/reservations", auth, reservationRoutes);
app.use("/api/users", auth, requireAdmin, userRoutes);
app.use("/api/reports", auth, requireManager, reportRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: err.message || "Server error" });
});

connectDatabase().then(() => {
  app.listen(PORT, () => console.log(`VRRS server running on port ${PORT}`));
});
