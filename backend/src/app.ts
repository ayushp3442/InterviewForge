import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import { generalLimiter } from "./middleware/rateLimiter.middleware";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// ── Security headers ──
app.use(helmet());

// ── CORS — restrict to frontend origin ──
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ── Body parsing with size limit ──
app.use(express.json({ limit: "1mb" }));

// ── Global rate limiter (100 req / 15 min per IP) ──
app.use(generalLimiter);

// ── Routes ──
app.get("/", (_req, res) => {
  res.send("InterviewForge AI backend is running");
});

app.use("/api/auth", authRoutes);

// ── Centralized error handler (must be last) ──
app.use(errorHandler);

export default app;