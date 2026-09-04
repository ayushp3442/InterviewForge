import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import { generalLimiter } from "./middleware/rateLimiter.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ── Security headers ──
app.use(helmet());

// ── CORS — restrict to frontend origin ──
const allowedOrigins = [
  "http://localhost:3000",
  "https://interviewforge-chi.vercel.app",
  process.env.FRONTEND_URL,
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
app.use("/api/interviews", interviewRoutes);
app.use("/api/resumes", resumeRoutes);

export default app;