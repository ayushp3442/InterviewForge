import { Router } from "express";
import { uploadResume as uploadResumeController, getLatestResume } from "../controllers/resume.controller.js";
import { uploadResume as uploadMiddleware } from "../middleware/upload.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/resumes/upload — multipart/form-data, field name: "resume"
router.post("/", authenticate, authorize("student"), uploadMiddleware, uploadResumeController);

// GET /api/resumes/latest — fetch the authenticated user's most recent parsed resume
router.get("/latest", authenticate, authorize("student"), getLatestResume);

export default router;