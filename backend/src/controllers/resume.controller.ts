import { Response } from "express";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
import prisma from "../config/prisma.js";
import { supabase } from "../config/supabase.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { parseResume } from "../utils/resume.placeholder.js";

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Field name must be 'resume'" });
    }

    const fileExt = req.file.mimetype === "application/pdf" ? "pdf" : "docx";
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
    if (req.file.mimetype === "application/pdf") {
      try {
        const pdfData = await pdfParse(req.file.buffer);
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