import { Response } from "express";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
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
   } else {
     // DOCX text extraction using mammoth
     try {
       const result = await mammoth.extractRawText({ buffer: req.file.buffer });
       rawText = result.value;
     } catch (err) {
       console.error("DOCX text extraction failed:", err);
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

/**
 * PATCH /api/resumes/:id/parsed
 * Allows the student to update their parsed skills after reviewing AI extraction.
 * Accepts { skills: string[] } and merges into the existing parsedJson.
 */
export const updateParsedSkills = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const resumeId = parseInt(req.params.id as string, 10);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (isNaN(resumeId)) {
      return res.status(400).json({ error: "Invalid resume ID" });
    }

    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.some((s: any) => typeof s !== "string")) {
      return res.status(400).json({ error: "'skills' must be an array of strings" });
    }

    // Verify ownership
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found or not owned by you" });
    }

    // Merge updated skills into existing parsedJson
    const existingParsed = (resume.parsedJson as any) || {};
    const updatedParsed = {
      ...existingParsed,
      skills: skills.map((s: string) => s.trim()).filter((s: string) => s.length > 0),
    };

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: { parsedJson: updatedParsed },
    });

    return res.status(200).json({
      message: "Resume skills updated successfully",
      resume: updated,
    });
  } catch (error) {
    console.error("Update parsed skills error:", error);
    return res.status(500).json({ error: "Something went wrong updating resume skills" });
  }
};