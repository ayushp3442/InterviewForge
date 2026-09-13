"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import ProblemStatement from "./ProblemStatement";
import TestRunner from "./TestRunner";
import { runCode, submitCode, type RunCodeResult, type SubmitCodeResult } from "@/lib/api";

// ── Types ───────────────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

interface CodingProblemData {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  constraints?: string;
  starterCode: Record<string, string>;
  visibleTestCases: TestCase[];
  supportedLanguages: string[];
}

interface TestResult {
  testCaseIndex: number;
  status: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  stderr: string;
  executionTimeMs: number;
  memoryKb?: number;
  errorDetails?: {
    errorType: string;
    rawMessage: string;
    friendlyExplanation: string;
    lineNumber?: number;
    columnNumber?: number;
    cleanMessage: string;
  };
}

interface CodingWorkspaceProps {
  problem: CodingProblemData;
  sessionId: number;
  questionId: number;
  sourceSkill?: string;
  onSubmitted?: (result: SubmitCodeResult) => void;
}

// ── Main Component ──────────────────────────────────────────────────────

export default function CodingWorkspace({
  problem,
  sessionId,
  questionId,
  sourceSkill,
  onSubmitted,
}: CodingWorkspaceProps) {
  const [language, setLanguage] = useState(
    problem.supportedLanguages[0] || "python"
  );
  const codeRef = useRef(problem.starterCode[language] || "");
  const [testResults, setTestResults] = useState<Map<number, TestResult>>(new Map());
  const [consoleOutput, setConsoleOutput] = useState("");
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitCodeResult | null>(null);
  const [leftWidth, setLeftWidth] = useState(38); // percentage for problem statement
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProblemCollapsed, setIsProblemCollapsed] = useState(false);

  // ── Keyboard shortcut: ESC to exit fullscreen ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // ── Handlers ──

  const handleCodeChange = useCallback((code: string) => {
    codeRef.current = code;
  }, []);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setTestResults(new Map());
    setConsoleOutput("");
    setSubmitResult(null);
  }, []);

  const handleRunTest = useCallback(
    async (testCaseIndex: number) => {
      setIsRunning(true);
      setConsoleOutput("");
      try {
        const result: RunCodeResult = await runCode(
          problem.id,
          language,
          codeRef.current,
          testCaseIndex
        );

        const testResult: TestResult = {
          testCaseIndex,
          status: result.status,
          passed: result.passed,
          actualOutput: result.actualOutput,
          expectedOutput: result.expectedOutput,
          stderr: result.stderr,
          executionTimeMs: result.executionTimeMs,
          memoryKb: result.memoryKb,
          errorDetails: result.errorDetails,
        };

        setTestResults((prev) => new Map(prev).set(testCaseIndex, testResult));
        setActiveTestIndex(testCaseIndex);

        if (result.stderr) {
          setConsoleOutput((prev) => prev + (prev ? "\n" : "") + result.stderr);
        }
      } catch (error: any) {
        setConsoleOutput(
          (prev) =>
            prev +
            (prev ? "\n" : "") +
            `[Error] ${error.message || "Failed to run code"}`
        );
      } finally {
        setIsRunning(false);
      }
    },
    [problem.id, language]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setConsoleOutput("");
    try {
      const result = await submitCode(problem.id, language, codeRef.current);
      setSubmitResult(result);
      onSubmitted?.(result);

      setConsoleOutput(
        `✅ Submitted Solution!\n` +
          `Test cases passed: ${result.passedAll}/${result.totalAll}\n` +
          (result.codeQualityScore !== null
            ? `Code Quality Score: ${result.codeQualityScore}/10\n`
            : "") +
          (result.timeComplexity ? `Estimated Time: ${result.timeComplexity}\n` : "") +
          (result.spaceComplexity ? `Estimated Space: ${result.spaceComplexity}\n` : "") +
          (result.feedback ? `\nReviewer Feedback:\n${result.feedback}` : "")
      );
    } catch (error: any) {
      setConsoleOutput(
        (prev) =>
          prev +
          (prev ? "\n" : "") +
          `[Error] ${error.message || "Failed to submit code"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [problem.id, language, onSubmitted]);

  // ── Resize handler ──

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = leftWidth;
      const container = (e.target as HTMLElement).parentElement;
      if (!container) return;
      const containerWidth = container.getBoundingClientRect().width;

      const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newWidth = startWidth + (delta / containerWidth) * 100;
        setLeftWidth(Math.max(20, Math.min(65, newWidth)));
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [leftWidth]
  );

  return (
    <div
      className={`flex flex-col bg-[#0E0E10] select-none transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 p-2 sm:p-3 bg-[#0E0E10] h-screen w-screen"
          : "h-full w-full"
      }`}
    >
      {/* ── Top mini-toolbar for Workspace Controls ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141416] border-b border-[#2A2A2C] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#E0D6C8] truncate max-w-[280px] sm:max-w-md">
            {problem.title}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              problem.difficulty === "Easy"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : problem.difficulty === "Medium"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Layout & Fullscreen buttons */}
        <div className="flex items-center gap-1.5">
          {/* Collapse/Expand problem statement toggle */}
          <button
            onClick={() => setIsProblemCollapsed(!isProblemCollapsed)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#A0A0A5] hover:text-[#E0D6C8] bg-[#1C1C1E] hover:bg-[#2A2A2C] border border-[#2A2A2C] rounded-md transition-all"
            title={isProblemCollapsed ? "Show Problem Statement" : "Maximize Code Editor Space"}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isProblemCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
            <span className="hidden sm:inline">{isProblemCollapsed ? "Show Problem" : "Focus Code"}</span>
          </button>

          {/* Quick ratio presets */}
          {!isProblemCollapsed && (
            <div className="hidden md:flex items-center bg-[#1C1C1E] border border-[#2A2A2C] rounded-md p-0.5 text-[10px]">
              <button
                onClick={() => setLeftWidth(35)}
                className={`px-1.5 py-0.5 rounded ${leftWidth === 35 ? "bg-[#C9A45C]/20 text-[#C9A45C]" : "text-[#7B7B80] hover:text-[#C9A45C]"}`}
                title="Default layout (35% problem, 65% editor)"
              >
                35:65
              </button>
              <button
                onClick={() => setLeftWidth(50)}
                className={`px-1.5 py-0.5 rounded ${leftWidth === 50 ? "bg-[#C9A45C]/20 text-[#C9A45C]" : "text-[#7B7B80] hover:text-[#C9A45C]"}`}
                title="Equal split (50% problem, 50% editor)"
              >
                50:50
              </button>
            </div>
          )}

          {/* Fullscreen toggle button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#A0A0A5] hover:text-[#E0D6C8] bg-[#1C1C1E] hover:bg-[#2A2A2C] border border-[#2A2A2C] rounded-md transition-all"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Full Screen"}
          >
            {isFullscreen ? (
              <>
                <svg className="w-3.5 h-3.5 text-[#C9A45C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0l5 0m-5 0l0 5M15 9l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5M15 15l5 5m0 0l-5 0m5 0l0-5" />
                </svg>
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#C9A45C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main split view ── */}
      <div className="flex-1 min-h-0 flex relative select-text">
        {/* Left: Problem Statement */}
        {!isProblemCollapsed && (
          <>
            <div style={{ width: `${leftWidth}%` }} className="min-h-0 p-2 pr-0 transition-[width] duration-75">
              <ProblemStatement
                title={problem.title}
                difficulty={problem.difficulty}
                description={problem.description}
                constraints={problem.constraints}
                visibleTestCases={problem.visibleTestCases}
                sourceSkill={sourceSkill}
              />
            </div>

            {/* Resize handle */}
            <div
              onMouseDown={handleMouseDown}
              className="w-2.5 cursor-col-resize flex items-center justify-center group hover:bg-[#C9A45C]/15 transition-colors z-10"
              title="Drag to resize panels"
            >
              <div className="w-0.5 h-10 bg-[#2A2A2C] group-hover:bg-[#C9A45C]/60 rounded-full transition-colors" />
            </div>
          </>
        )}

        {/* Right: Editor + Test Runner */}
        <div
          style={{ width: isProblemCollapsed ? "100%" : `${100 - leftWidth}%` }}
          className="min-h-0 flex flex-col p-2 pl-0 gap-2 flex-1"
        >
          {/* Code Editor — 62% default height */}
          <div className="flex-[62] min-h-0">
            <CodeEditor
              language={language}
              starterCode={problem.starterCode}
              sessionId={sessionId}
              questionId={questionId}
              onLanguageChange={handleLanguageChange}
              onCodeChange={handleCodeChange}
              supportedLanguages={problem.supportedLanguages}
            />
          </div>

          {/* Test Runner — 38% default height */}
          <div className="flex-[38] min-h-0">
            <TestRunner
              visibleTestCases={problem.visibleTestCases}
              testResults={testResults}
              consoleOutput={consoleOutput}
              isRunning={isRunning}
              activeTestIndex={activeTestIndex}
              onSelectTest={setActiveTestIndex}
              onRunTest={handleRunTest}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141416] border-t border-[#2A2A2C]">
        {/* Status */}
        <div className="flex items-center gap-3">
          {submitResult ? (
            <div className="flex items-center gap-2.5">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  submitResult.passedAll === submitResult.totalAll
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {submitResult.passedAll}/{submitResult.totalAll} Test Cases Passed
              </span>
              {submitResult.codeQualityScore !== null && (
                <span className="text-xs text-[#8E8E93]">
                  Quality: <strong className="text-[#E0D6C8]">{submitResult.codeQualityScore}/10</strong>
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-[#6B6B6B] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              Judge0 Sandbox Ready
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleRunTest(activeTestIndex)}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#1C1C1E] text-[#E0D6C8] border border-[#2A2A2C] rounded-lg hover:bg-[#2A2A2C] hover:border-[#3A3A3C] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border border-[#C9A45C]/40 border-t-[#C9A45C] rounded-full animate-spin" />
                Running Code...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#C9A45C]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run Code
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 text-xs bg-gradient-to-r from-[#C9A45C] to-[#D4B76A] text-[#141416] font-semibold rounded-lg hover:from-[#D4B76A] hover:to-[#E6B422] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C9A45C]/15 cursor-pointer hover:shadow-[#C9A45C]/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#141416]/40 border-t-[#141416] rounded-full animate-spin" />
                Evaluating Solution...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Submit Solution
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
