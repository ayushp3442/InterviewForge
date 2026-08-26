import { Router } from "express";
import { uploadResume as uploadResumeController } from "../controllers/resume.controller.js";
import { uploadResume as uploadMiddleware } from "../middleware/upload.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("student"), uploadMiddleware, uploadResumeController);

export default router;