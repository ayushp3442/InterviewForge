import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadResume } from "../middleware/upload.middleware.js";
import { uploadResumeFile, getLatestResume } from "../controllers/resume.controller.js";

const router = Router();

// POST /api/resumes/upload — upload a PDF or DOCX resume (single file, field name: "resume")
router.post(
  "/upload",
  authenticate,
  authorize("student"),
  uploadResume.single("resume"),
  uploadResumeFile
);

// GET /api/resumes/latest — fetch the latest resume for the authenticated user
router.get("/latest", authenticate, authorize("student"), getLatestResume);

export default router;
