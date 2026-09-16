/**
 * Code Execution Service — InterviewForge
 *
 * Executes code using Judge0 Community Edition API (primary) with fallback
 * support for custom Piston instances.
 * All code runs in sandboxed containers — never directly on the host server.
 *
 * Features:
 *   - Judge0 Community Edition (free, high-performance, multi-language sandbox)
 *   - Optional Piston API fallback if PISTON_API_URL is configured
 *   - Safety limits (code size, stdin size, output size, timeout)
 *   - Normalized result contract (success, compilation_error, runtime_error, timeout, etc.)
 *   - Request timeout protection via AbortController
 */

import { prepareCode } from "./code-runner/language-harness.js";
import { classifyError, type ErrorClassification } from "./code-runner/error-classifier.js";

// ── Safety Limits ───────────────────────────────────────────────────────

export const EXECUTION_LIMITS = {
  MAX_CODE_SIZE: 64 * 1024,       // 64 KB max code
  MAX_STDIN_SIZE: 16 * 1024,      // 16 KB max stdin per test case
  MAX_OUTPUT_SIZE: 32 * 1024,     // 32 KB max stdout capture
  EXECUTION_TIMEOUT_MS: 10_000,   // 10 second timeout
  REQUEST_TIMEOUT_MS: 15_000,     // 15 second total fetch timeout
} as const;

// ── Language Mapping ────────────────────────────────────────────────────

interface LanguageConfig {
  name: string;
  displayName: string;
  judge0Id: number;
  pistonLanguage: string;
  pistonVersion: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  python: {
    name: "python",
    displayName: "Python 3",
    judge0Id: 71, // Python (3.8.1)
    pistonLanguage: "python",
    pistonVersion: "3.10.0",
  },
  javascript: {
    name: "javascript",
    displayName: "JavaScript (Node.js)",
    judge0Id: 93, // Node.js (18.15.0)
    pistonLanguage: "javascript",
    pistonVersion: "18.15.0",
  },
  java: {
    name: "java",
    displayName: "Java (OpenJDK)",
    judge0Id: 62, // Java OpenJDK (13.0.1)
    pistonLanguage: "java",
    pistonVersion: "15.0.2",
  },
  cpp: {
    name: "cpp",
    displayName: "C++ (GCC)",
    judge0Id: 54, // C++ GCC (9.2.0)
    pistonLanguage: "c++",
    pistonVersion: "10.2.0",
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIGS) as readonly string[];

export function isSupportedLanguage(lang: string): lang is keyof typeof LANGUAGE_CONFIGS {
  return lang in LANGUAGE_CONFIGS;
}

// ── Types ───────────────────────────────────────────────────────────────

export type ExecutionStatus =
  | "success"
  | "compilation_error"
  | "runtime_error"
  | "timeout"
  | "output_limit_exceeded"
  | "execution_failed";

export interface ExecuteCodeInput {
  language: string;   // "python", "javascript", "java", "cpp"
  code: string;
  stdin?: string;
  expectedFunction?: string;
  skipHarness?: boolean;
}

export interface ExecuteCodeResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryKb?: number;
  errorDetails?: ErrorClassification;
}

// ── Judge0 Types ────────────────────────────────────────────────────────

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
}

// ── Endpoints ───────────────────────────────────────────────────────────

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
const PISTON_API_URL = process.env.PISTON_API_URL;

// ── Core Execution Function ─────────────────────────────────────────────

/**
 * Execute code via Judge0 Community Edition (primary) or Piston (if configured).
 *
 * Validates inputs, executes in sandbox, and normalizes the response into a
 * stable ExecuteCodeResult contract.
 */
export async function executeCode(input: ExecuteCodeInput): Promise<ExecuteCodeResult> {
  // ── Input validation ──
  if (!isSupportedLanguage(input.language)) {
    return {
      status: "execution_failed",
      stdout: "",
      stderr: `Unsupported language: "${input.language}". Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  if (input.code.length > EXECUTION_LIMITS.MAX_CODE_SIZE) {
    return {
      status: "execution_failed",
      stdout: "",
      stderr: `Code exceeds maximum size of ${EXECUTION_LIMITS.MAX_CODE_SIZE / 1024}KB`,
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  if (input.stdin && input.stdin.length > EXECUTION_LIMITS.MAX_STDIN_SIZE) {
    return {
      status: "execution_failed",
      stdout: "",
      stderr: `Input exceeds maximum size of ${EXECUTION_LIMITS.MAX_STDIN_SIZE / 1024}KB`,
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  const langConfig = LANGUAGE_CONFIGS[input.language];
  const startTime = Date.now();

  // Prepare harness if not skipped (auto-inject main/dispatcher if function-based)
  const rawPrepared = input.skipHarness
    ? { wrappedCode: input.code, lineOffset: 0, isFunctionBased: false }
    : prepareCode(input.code, input.language);

  const prepared = {
    code: rawPrepared.wrappedCode,
    lineOffset: rawPrepared.lineOffset,
    hasHarness: rawPrepared.isFunctionBased,
  };

  // If custom PISTON_API_URL is specified, try Piston first
  if (PISTON_API_URL && !PISTON_API_URL.includes("emkc.org")) {
    try {
      return await executeWithPiston(PISTON_API_URL, langConfig, input, prepared, startTime);
    } catch (err) {
      console.warn("[CodeExecution] Custom Piston failed, falling back to Judge0:", err);
    }
  }

  // Primary execution: Judge0 Community Edition
  try {
    return await executeWithJudge0(langConfig, input, prepared, startTime);
  } catch (error: any) {
    console.error("[CodeExecution] Judge0 error:", error);
    return {
      status: "execution_failed",
      stdout: "",
      stderr: `Execution service error: ${error.message || "Failed to contact execution runner"}`,
      exitCode: 1,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

// ── Judge0 Execution Implementation ──────────────────────────────────────

async function executeWithJudge0(
  langConfig: LanguageConfig,
  input: ExecuteCodeInput,
  prepared: { code: string; lineOffset: number; hasHarness: boolean },
  startTime: number
): Promise<ExecuteCodeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EXECUTION_LIMITS.REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${JUDGE0_API_URL}/submissions?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: prepared.code,
        language_id: langConfig.judge0Id,
        stdin: input.stdin || "",
        cpu_time_limit: Math.floor(EXECUTION_LIMITS.EXECUTION_TIMEOUT_MS / 1000),
        wall_time_limit: 10,
        memory_limit: 262144, // 256 MB
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error(`[CodeExecution] Judge0 API error (${res.status}):`, errorText.slice(0, 200));
      return {
        status: "execution_failed",
        stdout: "",
        stderr: `Execution engine returned status ${res.status}: ${errorText.slice(0, 100)}`,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const data = (await res.json()) as Judge0Response;
    const executionTimeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : Date.now() - startTime;
    return normalizeJudge0Response(data, executionTimeMs, input.language, prepared.lineOffset);
  } catch (err: any) {
    if (err.name === "AbortError") {
      const errorDetails = classifyError(
        "Time Limit Exceeded: Execution took longer than allowed limit",
        input.language,
        prepared.lineOffset
      );
      return {
        status: "timeout",
        stdout: "",
        stderr: "Execution timed out. Try optimizing your solution or checking for infinite loops.",
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        errorDetails,
      };
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeJudge0Response(
  data: Judge0Response,
  executionTimeMs: number,
  language: string,
  lineOffset: number
): ExecuteCodeResult {
  const statusId = data.status?.id;
  const memoryKb = data.memory ?? undefined;

  // 1: In Queue, 2: Processing
  // 3: Accepted
  // 4: Wrong Answer (ran successfully to completion)
  // 5: Time Limit Exceeded
  // 6: Compilation Error
  // 7: Runtime Error (SIGSEGV)
  // 8: Runtime Error (SIGXFSZ)
  // 9: Runtime Error (SIGFPE)
  // 10: Runtime Error (SIGABRT)
  // 11: Runtime Error (NZEC)
  // 12: Runtime Error (Other)
  // 13: Internal Error
  // 14: Exec Format Error

  // Compilation Error
  if (statusId === 6) {
    const rawError = data.compile_output || data.stderr || "Compilation failed";
    const errorDetails = classifyError(rawError, language, lineOffset);
    return {
      status: "compilation_error",
      stdout: "",
      stderr: truncateOutput(rawError),
      exitCode: 1,
      executionTimeMs,
      memoryKb,
      errorDetails,
    };
  }

  // Time Limit Exceeded
  if (statusId === 5) {
    const errorDetails = classifyError("Time Limit Exceeded (CPU time limit reached)", language, lineOffset);
    return {
      status: "timeout",
      stdout: truncateOutput(data.stdout || ""),
      stderr: "Execution timed out. Please check for infinite loops or high time complexity.",
      exitCode: 1,
      executionTimeMs,
      memoryKb,
      errorDetails,
    };
  }

  // Runtime Errors (7 to 12)
  if (statusId >= 7 && statusId <= 12) {
    const rawError = data.stderr || data.message || `Runtime error (${data.status.description})`;
    const isMle =
      data.status.description?.toLowerCase().includes("memory") ||
      rawError.toLowerCase().includes("memory limit") ||
      (memoryKb && memoryKb > 262144);
    const errorDetails = classifyError(
      isMle ? `Memory Limit Exceeded: ${rawError}` : rawError,
      language,
      lineOffset
    );
    return {
      status: "runtime_error",
      stdout: truncateOutput(data.stdout || ""),
      stderr: truncateOutput(rawError),
      exitCode: 1,
      executionTimeMs,
      memoryKb,
      errorDetails,
    };
  }

  // Output limit check
  const stdout = data.stdout || "";
  if (stdout.length > EXECUTION_LIMITS.MAX_OUTPUT_SIZE) {
    return {
      status: "output_limit_exceeded",
      stdout: truncateOutput(stdout),
      stderr: "Output limit exceeded. Check for infinite print statements.",
      exitCode: 0,
      executionTimeMs,
      memoryKb,
    };
  }

  // Execution failed / internal error
  if (statusId >= 13) {
    const rawError = data.message || data.stderr || `Engine error: ${data.status.description}`;
    const errorDetails = classifyError(rawError, language, lineOffset);
    return {
      status: "execution_failed",
      stdout: truncateOutput(stdout),
      stderr: truncateOutput(rawError),
      exitCode: 1,
      executionTimeMs,
      memoryKb,
      errorDetails,
    };
  }

  // Success (Status 3: Accepted or Status 4: Wrong Answer)
  return {
    status: "success",
    stdout: truncateOutput(stdout),
    stderr: truncateOutput(data.stderr || ""),
    exitCode: 0,
    executionTimeMs,
    memoryKb,
  };
}

// ── Piston Execution Fallback ────────────────────────────────────────────

async function executeWithPiston(
  apiUrl: string,
  langConfig: LanguageConfig,
  input: ExecuteCodeInput,
  prepared: { code: string; lineOffset: number; hasHarness: boolean },
  startTime: number
): Promise<ExecuteCodeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EXECUTION_LIMITS.REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${apiUrl}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: langConfig.pistonLanguage,
        version: langConfig.pistonVersion,
        files: [{ content: prepared.code }],
        stdin: input.stdin || "",
        run_timeout: EXECUTION_LIMITS.EXECUTION_TIMEOUT_MS,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Piston returned status ${res.status}`);
    }

    const data: any = await res.json();
    const run = data.run || {};
    const compile = data.compile;

    if (compile && compile.code !== 0 && compile.code !== null) {
      const rawError = compile.stderr || compile.output || "Compilation failed";
      const errorDetails = classifyError(rawError, input.language, prepared.lineOffset);
      return {
        status: "compilation_error",
        stdout: "",
        stderr: truncateOutput(rawError),
        exitCode: compile.code,
        executionTimeMs: Date.now() - startTime,
        errorDetails,
      };
    }

    if (run.code !== 0 && run.code !== null) {
      const rawError = run.stderr || "Runtime error";
      const errorDetails = classifyError(rawError, input.language, prepared.lineOffset);
      return {
        status: "runtime_error",
        stdout: truncateOutput(run.stdout || ""),
        stderr: truncateOutput(rawError),
        exitCode: run.code,
        executionTimeMs: Date.now() - startTime,
        errorDetails,
      };
    }

    return {
      status: "success",
      stdout: truncateOutput(run.stdout || ""),
      stderr: truncateOutput(run.stderr || ""),
      exitCode: 0,
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function truncateOutput(output: string): string {
  if (output.length <= EXECUTION_LIMITS.MAX_OUTPUT_SIZE) return output;
  return output.slice(0, EXECUTION_LIMITS.MAX_OUTPUT_SIZE) + "\n... [output truncated]";
}

export function getAvailableRuntimes() {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    name: lang,
    displayName: LANGUAGE_CONFIGS[lang].displayName,
    pistonLanguage: LANGUAGE_CONFIGS[lang].pistonLanguage,
    pistonVersion: LANGUAGE_CONFIGS[lang].pistonVersion,
  }));
}
