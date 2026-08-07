import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateQuestions } from "../utils/ai.placeholder";

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

export const addQuestionsToInterview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const interviewId = parseInt(req.params.id as string);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (interview.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to modify this interview" });
    }

    const aiResult = await generateQuestions({
      interviewType: interview.type,
      role: interview.role,
      domain: interview.domain,
      difficulty: interview.difficulty,
      questionCount: 5,
    });

    if (!aiResult || !Array.isArray(aiResult.questions)) {
      return res.status(502).json({ error: "AI service returned an unexpected response" });
    }

    const createdQuestions = await Promise.all(
      aiResult.questions.map((q, index) =>
        prisma.question.create({
          data: {
            interviewId,
            text: q.text,
            orderIndex: index,
            sourceSkill: q.sourceSkill,
          },
        })
      )
    );

    res.status(201).json({
      message: "Questions generated and saved",
      questions: createdQuestions,
    });
  } catch (error) {
    console.error("Add questions error:", error);
    res.status(500).json({ error: "Something went wrong generating questions" });
  }
};