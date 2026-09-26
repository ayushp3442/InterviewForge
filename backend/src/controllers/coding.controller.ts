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
import {
  runFunctionBehaviorTest,
  getBuiltinBehaviorTests,
  isBehaviorProblemTitle,
  isFunctionBehaviorTestCase,
  type FunctionBehaviorTestCase,
  type FunctionBehaviorResult,
} from "../utils/code-runner/function-behavior-runner.js";

// ── Types ───────────────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
  /** "stdout" (default) or "function_behavior" */
  evaluationType?: "stdout" | "function_behavior";
  /** Required when evaluationType === "function_behavior" */
  functionName?: string;
  /** Required when evaluationType === "function_behavior" */
  behaviorScript?: string;
  description?: string;
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

    // ── Check if this problem uses function-behavior evaluation ──
    // Priority: 1) built-in behavior registry by problem title, 2) testCase.evaluationType === "function_behavior"
    const isBehaviorProblem =
      isBehaviorProblemTitle(problem.title) ||
      testCase.evaluationType === "function_behavior";

    if (isBehaviorProblem) {
      // ── Function-behavior evaluation path ──
      const builtinBehaviorTests = getBuiltinBehaviorTests(problem.title, language);
      let behaviorTC: FunctionBehaviorTestCase | null = null;

      if (builtinBehaviorTests && builtinBehaviorTests.length > 0) {
        // Use built-in behavior test for this index (only visible ones)
        const visibleBehavior = builtinBehaviorTests.filter((bt) => !bt.isHidden);
        behaviorTC = visibleBehavior[testCaseIndex] || builtinBehaviorTests[testCaseIndex];
      } else if (isFunctionBehaviorTestCase(testCase)) {
        behaviorTC = testCase as FunctionBehaviorTestCase;
      }

      if (!behaviorTC) {
        // Language does not have a behavior runner for this problem (e.g. Java for JS-only problem)
        return res.status(200).json({
          status: "assertion_failure",
          passed: false,
          actualOutput: `Function-behavior evaluation: '${language}' is not supported for problem '${problem.title}', or code does not define function '${testCase.functionName || "debounce"}'`,
          expectedOutput: `Defined callable function '${testCase.functionName || "debounce"}'`,
          stderr: "",
          exitCode: 1,
          executionTimeMs: 0,
          evaluationType: "function_behavior",
          testStatus: "assertion_failure",
        });
      }

      const behaviorResult = await runFunctionBehaviorTest(code, behaviorTC, language);

      const statusMap: Record<string, string> = {
        pass: "success",
        fail: "assertion_failure",
        compilation_error: "compilation_error",
        runtime_error: "runtime_error",
        timeout: "timeout",
        execution_failed: "execution_failed",
      };

      return res.status(200).json({
        status: statusMap[behaviorResult.status] || "assertion_failure",
        passed: behaviorResult.passed,
        actualOutput: behaviorResult.passed
          ? `✓ ${behaviorResult.description}`
          : behaviorResult.feedback || "Test assertion failed",
        expectedOutput: behaviorResult.description,
        stderr: "",
        exitCode: behaviorResult.passed ? 0 : 1,
        executionTimeMs: behaviorResult.executionTimeMs,
        evaluationType: "function_behavior",
        testStatus: behaviorResult.status,
      });
    }

    // ── Standard stdout evaluation path (unchanged) ──
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

    // Check if this problem has built-in behavior tests or custom function_behavior test cases
    const isBehaviorProblem =
      isBehaviorProblemTitle(problem.title) ||
      allTestCases.some((tc) => tc.evaluationType === "function_behavior");

    let passedVisible = 0;
    let passedHidden = 0;
    let totalExecutionTime = 0;
    let executionError: string | null = null;

    if (isBehaviorProblem) {
      // ── Function-behavior evaluation path ──
      const builtinBehaviorTests = getBuiltinBehaviorTests(problem.title, language);
      const customBehaviorTests = allTestCases.filter((tc) =>
        isFunctionBehaviorTestCase(tc)
      ) as unknown as FunctionBehaviorTestCase[];

      const behaviorTests =
        builtinBehaviorTests && builtinBehaviorTests.length > 0
          ? builtinBehaviorTests
          : customBehaviorTests;

      if (!behaviorTests || behaviorTests.length === 0) {
        // Unsupported language for this function-behavior problem
        return res.status(200).json({
          message: "Code submission evaluated",
          submissionId: 0,
          passedVisible: 0,
          totalVisible: 1,
          passedHidden: 0,
          totalHidden: 0,
          passedAll: 0,
          totalAll: 1,
          executionTimeMs: 0,
          executionError: `Function-behavior evaluation is not supported for language '${language}' on problem '${problem.title}'.`,
          codeQualityScore: 1,
          timeComplexity: "N/A",
          spaceComplexity: "N/A",
          feedback: `Language '${language}' is not supported for function-behavior problem '${problem.title}'. Please write your solution in JavaScript or Python.`,
        });
      }

      const behaviorVisible = behaviorTests.filter((bt) => !bt.isHidden);
      const behaviorHidden = behaviorTests.filter((bt) => bt.isHidden);

      for (const bt of behaviorVisible) {
        const result = await runFunctionBehaviorTest(code, bt, language);
        totalExecutionTime += result.executionTimeMs;
        if (result.passed) {
          passedVisible++;
        } else {
          executionError = result.feedback || "Behavior test failed";
        }
      }

      for (const bt of behaviorHidden) {
        const result = await runFunctionBehaviorTest(code, bt, language);
        totalExecutionTime += result.executionTimeMs;
        if (result.passed) {
          passedHidden++;
        } else {
          executionError = result.feedback || "Behavior test failed";
        }
      }

      // Override counts for behavior tests
      const visibleTests = behaviorVisible;
      const hiddenTests = behaviorHidden;

      const passedAll = passedVisible + passedHidden;
      const totalAll = behaviorTests.length;
      const avgExecutionTime = totalAll > 0 ? Math.round(totalExecutionTime / totalAll) : 0;

      // ── Save CodeSubmission ──
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

      // ── AI Code Review (non-blocking) ──
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
        console.warn("[CodingController] AI code evaluation failed, continuing without:", aiError);
      }

      // ── Create/Update Response record ──
      const correctnessScore = totalAll > 0 ? Math.round((passedAll / totalAll) * 10) : 0;
      const communicationScore = aiResult?.codeQualityScore ?? (passedAll === totalAll ? 9 : 7);
      const structureScore = aiResult?.codeQualityScore ?? (passedAll === totalAll ? 9 : 7);
      const feedback = aiResult?.feedback || `Passed ${passedAll}/${totalAll} behavior tests.`;

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

      return res.status(201).json({
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
    }

    // ── Standard stdout evaluation path (unchanged) ──
    const visibleTests = allTestCases.filter((tc) => !tc.isHidden);
    const hiddenTests = allTestCases.filter((tc) => tc.isHidden);

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
