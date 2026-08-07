import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import interviewRoutes from "./routes/interview.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("InterviewForge AI backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);

export default app;