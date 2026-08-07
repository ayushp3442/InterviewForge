import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const createInterview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { type, role, domain, difficulty, mode } = req.body;

    if (!type || !role || !domain || !difficulty || !mode) {
      return res.status(400).json({
        error: "type, role, domain, difficulty, and mode are all required",
      });
    }

    const interview = await prisma.interview.create({
      data: {
        userId,
        type,
        role,
        domain,
        difficulty,
        mode,
        status: "in_progress",
      },
    });

    res.status(201).json({
      message: "Interview session created",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);
    res.status(500).json({ error: "Something went wrong creating the interview" });
  }
};