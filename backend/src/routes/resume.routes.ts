import { Router } from "express";
import multer from "multer";
import { uploadResume as uploadResumeController, getLatestResume } from "../controllers/resume.controller.js";
import { uploadResume as uploadMiddleware } from "../middleware/upload.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("student"),
    (req, res, next) => {
        uploadMiddleware(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ error: "File is too large. Maximum size is 5MB." });
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({ error: "Unexpected field. Use 'resume' as the field name for the file." });
                }
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ error: err.message || "Invalid file upload" });
            }
            next();
        });
    },
    uploadResumeController
);

router.get("/latest", authenticate, authorize("student"), getLatestResume);

export default router;