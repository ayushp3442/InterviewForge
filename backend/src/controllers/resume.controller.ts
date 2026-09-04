import { Response } from "express";
import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware.js";
import path from "path";


/**
 * POST /api/resumes/upload
 * Accepts a PDF or DOCX file via multipart/form-data (field: "resume").
 * Saves the file path to the DB. Parsing is handled in a subsequent step.
 */
export const uploadResumeFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // multer attaches the file to req.file
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Send a PDF or DOCX file in the 'resume' field." });
    }

    const relativeFilePath = path.join("uploads", req.file.filename);

    // Save to DB — parsedJson will be populated after parsing (Commit 3)
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileUrl: relativeFilePath,
        parsedJson: Prisma.JsonNull,
      },
    });

    return res.status(201).json({
      message: "Resume uploaded successfully",
      resume: {
        id: resume.id,
        fileUrl: resume.fileUrl,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({ error: "Something went wrong uploading the resume" });
  }
};

/**
 * GET /api/resumes/latest
 * Returns the most recent resume for the authenticated user.
 */
export const getLatestResume = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    if (!resume) {
      return res.status(404).json({ error: "No resume found for this user" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    console.error("Get latest resume error:", error);
    return res.status(500).json({ error: "Something went wrong fetching the resume" });
  }
};
