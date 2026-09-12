import { Response } from "express";
import prisma from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { generateQuestions, evaluateResponse, generateReport } from "../utils/ai.service.js";


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

    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    let resumeSkills: string[] = [];
    let resumeProjects: Array<{ title: string; techStack?: string[]; description?: string }> = [];

    if (latestResume && latestResume.parsedJson) {
      const parsed = latestResume.parsedJson as any;
      resumeSkills = Array.isArray(parsed.skills) ? parsed.skills : [];
      resumeProjects = Array.isArray(parsed.projects) ? parsed.projects : [];
    }

    const questionCount = parseInt(req.body?.questionCount) || 5;
    const safeCount = Math.min(Math.max(questionCount, 3), 10); // clamp 3–10

    const aiResult = await generateQuestions({
      interviewType: interview.type,
      role: interview.role,
      domain: interview.domain,
      difficulty: interview.difficulty,
      questionCount: safeCount,
      resumeSkills,
      resumeProjects,
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

export const submitResponse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const questionId = parseInt(req.params.id as string);
    const { answerText } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!answerText) {
      return res.status(400).json({ error: "answerText is required" });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { interview: true },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.interview.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to answer this question" });
    }

    const response = await prisma.response.create({
      data: {
        questionId,
        answerText,
      },
    });

    res.status(201).json({
      message: "Response saved. It will be evaluated when the interview is completed.",
      response,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "This question has already been answered" });
    }
    console.error("Submit response error:", error);
    res.status(500).json({ error: error?.message || "Something went wrong submitting the response" });
  }
};

export const completeInterview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const interviewId = parseInt(req.params.id as string);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: {
          include: { response: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (interview.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to complete this interview" });
    }

    if (interview.status === "completed") {
      return res.status(400).json({ error: "Interview is already completed" });
    }

    type QuestionWithResponse = (typeof interview.questions)[number];

    const answeredQuestions = interview.questions.filter(
      (q: QuestionWithResponse) => q.response
    );

    if (answeredQuestions.length === 0) {
      return res.status(400).json({
        error: "Cannot complete an interview with no answered questions",
      });
    }

    // Evaluate every answered question now, in one batch, before generating the report
    const evaluatedResponses = await Promise.all(
      answeredQuestions.map(async (q: QuestionWithResponse) => {
        const aiResult = await evaluateResponse({
          questionText: q.text,
          answerText: q.response!.answerText,
          interviewType: interview.type,
        });

        if (
          !aiResult ||
          typeof aiResult.correctnessScore !== "number" ||
          typeof aiResult.communicationScore !== "number" ||
          typeof aiResult.structureScore !== "number"
        ) {
          throw new Error(`AI service returned an unexpected response for question ${q.id}`);
        }

        const updatedResponse = await prisma.response.update({
          where: { id: q.response!.id },
          data: {
            correctnessScore: aiResult.correctnessScore,
            communicationScore: aiResult.communicationScore,
            structureScore: aiResult.structureScore,
            feedback: aiResult.feedback,
          },
        });

        return {
          questionText: q.text,
          answerText: q.response!.answerText,
          correctnessScore: updatedResponse.correctnessScore,
          communicationScore: updatedResponse.communicationScore,
          structureScore: updatedResponse.structureScore,
        };
      })
    );

    const aiResult = await generateReport({
      interviewType: interview.type,
      role: interview.role,
      domain: interview.domain,
      difficulty: interview.difficulty,
      qaPairs: evaluatedResponses,
    });

    if (
      !aiResult ||
      typeof aiResult.overallScore !== "number" ||
      !Array.isArray(aiResult.strengths) ||
      !Array.isArray(aiResult.weaknesses)
    ) {
      return res.status(502).json({ error: "AI service returned an unexpected response" });
    }

    const [report, updatedInterview] = await prisma.$transaction([
      prisma.report.create({
        data: {
          interviewId,
          overallScore: aiResult.overallScore,
          correctnessScore: aiResult.correctnessScore,
          communicationScore: aiResult.communicationScore,
          structureScore: aiResult.structureScore,
          strengths: aiResult.strengths,
          weaknesses: aiResult.weaknesses,
          roadmapText: aiResult.roadmapText,
        },
      }),
      prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      }),
    ]);

    res.status(201).json({
      message: "Interview completed and report generated",
      report,
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    res.status(500).json({ error: "Something went wrong completing the interview" });
  }
};

export const getInterviewReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const interviewId = parseInt(req.params.id as string);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (isNaN(interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID" });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: {
          include: {
            response: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        report: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (interview.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to access this interview report" });
    }

    res.status(200).json({
      interview,
    });
  } catch (error) {
    console.error("Get interview report error:", error);
    res.status(500).json({ error: "Something went wrong fetching the report" });
  }
};

export const listInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const interviews = await prisma.interview.findMany({
      where: { userId },
      include: {
        report: {
          select: {
            overallScore: true,
            correctnessScore: true,
            communicationScore: true,
            structureScore: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    res.status(200).json({ interviews });
  } catch (error) {
    console.error("List interviews error:", error);
    res.status(500).json({ error: "Something went wrong fetching interviews" });
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const interviewId = parseInt(req.params.id as string);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (isNaN(interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID" });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { questions: { include: { response: true } } },
    });

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (interview.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this interview" });
    }

    // Delete in FK order: responses → questions → report → interview
    const questionIds = interview.questions.map((q) => q.id);

    await prisma.$transaction([
      prisma.response.deleteMany({ where: { questionId: { in: questionIds } } }),
      prisma.question.deleteMany({ where: { interviewId } }),
      prisma.report.deleteMany({ where: { interviewId } }),
      prisma.interview.delete({ where: { id: interviewId } }),
    ]);

    res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Delete interview error:", error);
    res.status(500).json({ error: "Something went wrong deleting the interview" });
  }
};