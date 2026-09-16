import { Router } from "express";
import { getRuntimes, runCode, submitCode } from "../controllers/coding.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { codeExecutionLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

// Public: get available languages
router.get("/runtimes", getRuntimes);

// Authenticated + rate-limited: code execution
router.post("/:problemId/run", authenticate, authorize("student"), codeExecutionLimiter, runCode);
router.post("/:problemId/submit", authenticate, authorize("student"), codeExecutionLimiter, submitCode);

export default router;
