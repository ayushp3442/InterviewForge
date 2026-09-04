import { Response } from "express";
import { PDFParse } from "pdf-parse";
import prisma from "../config/prisma.js";
import { supabase } from "../config/supabase.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { parseResume } from "../utils/ai.service.js";

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Field name must be 'resume'" });
    }

   const originalName = req.file.originalname.toLowerCase();
   const isPdf = req.file.mimetype === "application/pdf" || originalName.endsWith(".pdf");
   const fileExt = isPdf ? "pdf" : "docx";
   const fileName = `${userId}/${Date.now()}.${fileExt}`;  

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(502).json({ error: "Failed to upload file to storage" });
    }

    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(fileName);

  let rawText = "";
  if (isPdf) {
    try {
      const parser = new PDFParse({ data: req.file.buffer });
      const pdfData = await parser.getText();
      rawText = pdfData.text;
    } catch (err) {
      console.error("PDF text extraction failed:", err);
  }
}
    const parsed = await parseResume(rawText);

    const resume = await prisma.resume.create({
      data: {
        userId,
        fileUrl: urlData.publicUrl,
        parsedJson: parsed as any,
      },
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    res.status(500).json({ error: "Something went wrong uploading the resume" });
  }
};

/**
 * GET /api/resumes/latest
 * Returns the most recently uploaded resume for the authenticated user,
 * including parsedJson (skills, projects) for frontend badge + AI wiring.
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
      select: {
        id: true,
        fileUrl: true,
        parsedJson: true,
        uploadedAt: true,
      },
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