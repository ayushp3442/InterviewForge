/**
 * Coding Controller — InterviewForge
 *
 * Handles code execution, submission, and runtime info for coding interview questions.
 *
 * Endpoints:
 *   GET  /api/coding/runtimes          — Available languages
 *   POST /api/coding/:problemId/run    — Run code against a single visible test case
 *   POST /api/coding/:problemId/submit — Submit final solution (all test cases + AI review)
 *
 * Security:
 *   - All execution happens server-side (Piston API)
 *   - Hidden test cases are NEVER sent to frontend
 *   - userId always comes from auth token, never from request body
 *   - Rate limited via codeExecutionLimiter
 */

import { Response } from "express";
import prisma from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  executeCode,
  getAvailableRuntimes,
  isSupportedLanguage,
  EXECUTION_LIMITS,
} from "../utils/code-execution.service.js";
import { compareOutputs } from "../utils/code-runner/output-comparator.js";

// ── Types ───────────────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

// ── 1. Get Runtimes ─────────────────────────────────────────────────────

export const getRuntimes = async (_req: AuthRequest, res: Response) => {
  try {
    const runtimes = getAvailableRuntimes();
    res.status(200).json({ runtimes });
  } catch (error) {
    console.error("Get runtimes error:", error);
    res.status(500).json({ error: "Failed to fetch available runtimes" });
  }
};

// ── 2. Run Code (single visible test case) ──────────────────────────────

export const runCode = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const problemId = parseInt(req.params.problemId as string);
    const { language, code, testCaseIndex } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // ── Validate inputs ──
    if (isNaN(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID" });
    }

    if (!language || typeof language !== "string") {
      return res.status(400).json({ error: "Language is required" });
    }

    if (!isSupportedLanguage(language)) {
      return res.status(400).json({ error: `Unsupported language: "${language}"` });
    }

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required" });
    }

    if (code.length > EXECUTION_LIMITS.MAX_CODE_SIZE) {
      return res.status(400).json({
        error: `Code exceeds maximum size of ${EXECUTION_LIMITS.MAX_CODE_SIZE / 1024}KB`,
      });
    }

    if (typeof testCaseIndex !== "number" || testCaseIndex < 0) {
      return res.status(400).json({ error: "Valid testCaseIndex is required (0-based)" });
    }

    // ── Load problem & verify ownership ──
    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
      include: {
        question: {
          include: { interview: true },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Coding problem not found" });
    }

    if (problem.question.interview.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to access this problem" });
    }

    // ── Get the specific VISIBLE test case ──
    const allTestCases = problem.testCases as unknown as TestCase[];
    const visibleTestCases = allTestCases.filter((tc) => !tc.isHidden);

    if (testCaseIndex >= visibleTestCases.length) {
      return res.status(400).json({
        error: `Invalid test case index. Available: 0 to ${visibleTestCases.length - 1}`,
      });
    }

    const testCase = visibleTestCases[testCaseIndex];

    // ── Execute code via Sandboxed Runner ──
    const result = await executeCode({
       language,
       code,
       stdin: testCase.input,
     });

    // ── Compare output with multi-mode comparator ──
    const comparison = compareOutputs(result.stdout, testCase.expectedOutput);
    const passed = result.status === "success" && comparison.passed;

    res.status(200).json({
      status: result.status,
      passed,
      actualOutput: result.stdout,
      expectedOutput: testCase.expectedOutput,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTimeMs: result.executionTimeMs,
      memoryKb: result.memoryKb,
      errorDetails: result.errorDetails,
    });
  } catch (error) {
    console.error("Run code error:", error);
    res.status(500).json({ error: "Something went wrong running your code" });
  }
};

// ── 3. Submit Code (all test cases + AI review) ─────────────────────────

export const submitCode = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const problemId = parseInt(req.params.problemId as string);
    const { language, code } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // ── Validate inputs ──
    if (isNaN(problemId)) {
      return res.status(400).json({ error: "Invalid problem ID" });
    }

    if (!language || typeof language !== "string" || !isSupportedLanguage(language)) {
      return res.status(400).json({ error: `Unsupported language: "${language}"` });
    }

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required" });
    }

    if (code.length > EXECUTION_LIMITS.MAX_CODE_SIZE) {
      return res.status(400).json({
        error: `Code exceeds maximum size of ${EXECUTION_LIMITS.MAX_CODE_SIZE / 1024}KB`,
      });
    }

    // ── Load problem & verify ownership ──
    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
      include: {
        question: {
          include: { interview: true },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Coding problem not found" });
    }

    if (problem.question.interview.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to submit to this problem" });
    }

    // ── Execute code against ALL test cases (visible + hidden) ──
    const allTestCases = problem.testCases as unknown as TestCase[];
    const visibleTests = allTestCases.filter((tc) => !tc.isHidden);
    const hiddenTests = allTestCases.filter((tc) => tc.isHidden);

    let passedVisible = 0;
    let passedHidden = 0;
    let totalExecutionTime = 0;
    let executionError: string | null = null;

    // Run visible tests
    for (const tc of visibleTests) {
      const result = await executeCode({ language, code, stdin: tc.input });
      totalExecutionTime += result.executionTimeMs;

      if (result.status !== "success") {
        executionError = result.errorDetails?.friendlyExplanation || result.stderr || result.status;
        continue;
      }

      const comparison = compareOutputs(result.stdout, tc.expectedOutput);
      if (comparison.passed) {
        passedVisible++;
      }
    }

    // Run hidden tests
    for (const tc of hiddenTests) {
      const result = await executeCode({ language, code, stdin: tc.input });
      totalExecutionTime += result.executionTimeMs;

      if (result.status !== "success") {
        executionError = result.errorDetails?.friendlyExplanation || result.stderr || result.status;
        continue;
      }

      const comparison = compareOutputs(result.stdout, tc.expectedOutput);
      if (comparison.passed) {
        passedHidden++;
      }
    }

    const passedAll = passedVisible + passedHidden;
    const totalAll = allTestCases.length;
    const avgExecutionTime = totalAll > 0 ? Math.round(totalExecutionTime / totalAll) : 0;

    // ── Save CodeSubmission (test results saved first, AI comes after) ──
    const submission = await prisma.codeSubmission.create({
      data: {
        codingProblemId: problemId,
        questionId: problem.questionId,
        userId,
        language,
        code,
        passedTestCases: passedAll,
        totalTestCases: totalAll,
        executionTimeMs: avgExecutionTime,
      },
    });

    // ── AI Code Review (non-blocking — failure doesn't block submission) ──
    let aiResult: {
      codeQualityScore: number;
      timeComplexity: string;
      spaceComplexity: string;
      feedback: string;
    } | null = null;

    try {
      const { evaluateCodeSubmission } = await import("../utils/ai.service.js");
      aiResult = await evaluateCodeSubmission({
        problemDescription: problem.description,
        constraints: problem.constraints || "",
        language,
        code,
        passedTestCases: passedAll,
        totalTestCases: totalAll,
        executionError: executionError || undefined,
      });

      // Update submission with AI results
      await prisma.codeSubmission.update({
        where: { id: submission.id },
        data: {
          codeQualityScore: aiResult.codeQualityScore,
          timeComplexity: aiResult.timeComplexity,
          spaceComplexity: aiResult.spaceComplexity,
          feedback: aiResult.feedback,
        },
      });
    } catch (aiError) {
      // AI evaluation failed — submission still saved with test results
      console.warn("[CodingController] AI code evaluation failed, continuing without:", aiError);
    }

    // ── Create/Update Response record for Question so it appears in reports ──
    const correctnessScore = totalAll > 0 ? Math.round((passedAll / totalAll) * 10) : 0;
    const communicationScore = aiResult?.codeQualityScore ?? (passedAll === totalAll ? 9 : 7);
    const structureScore = aiResult?.codeQualityScore ?? (passedAll === totalAll ? 9 : 7);
    const feedback = aiResult?.feedback || `Passed ${passedAll}/${totalAll} test cases.`;

    try {
      await prisma.response.upsert({
        where: { questionId: problem.questionId },
        create: {
          questionId: problem.questionId,
          answerText: `// [${language.toUpperCase()} Solution]\n${code}`,
          correctnessScore,
          communicationScore,
          structureScore,
          feedback,
        },
        update: {
          answerText: `// [${language.toUpperCase()} Solution]\n${code}`,
          correctnessScore,
          communicationScore,
          structureScore,
          feedback,
        },
      });
    } catch (respError) {
      console.error("[CodingController] Failed to upsert question response:", respError);
    }

    // ── Return safe response (no hidden test inputs/outputs) ──
    res.status(201).json({
      message: "Code submitted successfully",
      submissionId: submission.id,
      passedVisible,
      totalVisible: visibleTests.length,
      passedHidden,
      totalHidden: hiddenTests.length,
      passedAll,
      totalAll,
      executionTimeMs: avgExecutionTime,
      executionError,
      codeQualityScore: aiResult?.codeQualityScore ?? null,
      timeComplexity: aiResult?.timeComplexity ?? null,
      spaceComplexity: aiResult?.spaceComplexity ?? null,
      feedback: aiResult?.feedback ?? null,
    });
  } catch (error) {
    console.error("Submit code error:", error);
    res.status(500).json({ error: "Something went wrong submitting your code" });
  }
};
