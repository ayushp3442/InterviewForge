"use client";
import { useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
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

interface TestRunnerProps {
  visibleTestCases: TestCase[];
  testResults: Map<number, TestResult>;
  consoleOutput: string;
  isRunning: boolean;
  activeTestIndex: number;
  onSelectTest: (index: number) => void;
  onRunTest: (index: number) => void;
}

// ── Tab Component ───────────────────────────────────────────────────────

type TabKey = "tests" | "output" | "console";

export default function TestRunner({
  visibleTestCases,
  testResults,
  consoleOutput,
  isRunning,
  activeTestIndex,
  onSelectTest,
  onRunTest,
}: TestRunnerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("tests");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "tests", label: "Test Cases" },
    { key: "output", label: "Output" },
    { key: "console", label: "Console" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#141416] rounded-xl border border-[#2A2A2C] overflow-hidden">
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#141416] border-b border-[#2A2A2C]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
              activeTab === tab.key
                ? "bg-[#C9A45C]/10 text-[#C9A45C] font-medium"
                : "text-[#6B6B6B] hover:text-[#B0B0B0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "tests" && (
          <TestCasesPanel
            visibleTestCases={visibleTestCases}
            testResults={testResults}
            isRunning={isRunning}
            activeTestIndex={activeTestIndex}
            onSelectTest={onSelectTest}
            onRunTest={onRunTest}
          />
        )}

        {activeTab === "output" && (
          <OutputPanel
            testResult={testResults.get(activeTestIndex)}
            activeTestIndex={activeTestIndex}
          />
        )}

        {activeTab === "console" && <ConsolePanel output={consoleOutput} />}
      </div>
    </div>
  );
}

// ── Test Cases Panel ────────────────────────────────────────────────────

function TestCasesPanel({
  visibleTestCases,
  testResults,
  isRunning,
  activeTestIndex,
  onSelectTest,
  onRunTest,
}: {
  visibleTestCases: TestCase[];
  testResults: Map<number, TestResult>;
  isRunning: boolean;
  activeTestIndex: number;
  onSelectTest: (index: number) => void;
  onRunTest: (index: number) => void;
}) {
  return (
    <div className="p-3 space-y-2">
      {/* Test case tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {visibleTestCases.map((_, i) => {
          const result = testResults.get(i);
          const isActive = i === activeTestIndex;

          return (
            <button
              key={i}
              onClick={() => onSelectTest(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all ${
                isActive
                  ? "border-[#C9A45C]/40 bg-[#C9A45C]/10 text-[#C9A45C]"
                  : "border-[#2A2A2C] bg-[#1C1C1E] text-[#6B6B6B] hover:text-[#B0B0B0]"
              }`}
            >
              {result && (
                <span className={result.passed ? "text-emerald-400" : "text-red-400"}>
                  {result.passed ? "✓" : "✗"}
                </span>
              )}
              Case {i + 1}
            </button>
          );
        })}
      </div>

      {/* Active test case detail */}
      {visibleTestCases[activeTestIndex] && (
        <div className="bg-[#1C1C1E] rounded-lg border border-[#2A2A2C] p-3 space-y-3">
          <div>
            <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
              Input
            </span>
            <pre className="text-xs text-[#E0D6C8] font-mono mt-1 bg-[#141416] rounded p-2 whitespace-pre-wrap">
              {visibleTestCases[activeTestIndex].input}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
              Expected Output
            </span>
            <pre className="text-xs text-[#E0D6C8] font-mono mt-1 bg-[#141416] rounded p-2 whitespace-pre-wrap">
              {visibleTestCases[activeTestIndex].expectedOutput}
            </pre>
          </div>

          <button
            onClick={() => onRunTest(activeTestIndex)}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#C9A45C]/10 text-[#C9A45C] border border-[#C9A45C]/20 rounded-lg hover:bg-[#C9A45C]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border border-[#C9A45C]/40 border-t-[#C9A45C] rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run This Test
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Output Panel ────────────────────────────────────────────────────────

function OutputPanel({
  testResult,
  activeTestIndex,
}: {
  testResult?: TestResult;
  activeTestIndex: number;
}) {
  const [showRawError, setShowRawError] = useState(false);

  if (!testResult) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-[#4A4A4A]">
          Run a test case to see output here
        </p>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    success: testResult.passed
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20",
    compilation_error: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    runtime_error: "bg-red-500/10 text-red-400 border-red-500/20",
    timeout: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    memory_limit_exceeded: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    output_limit_exceeded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    execution_failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const statusLabels: Record<string, string> = {
    success: testResult.passed ? "Accepted" : "Wrong Answer",
    compilation_error: "Compilation Error",
    runtime_error: "Runtime Error",
    timeout: "Time Limit Exceeded",
    memory_limit_exceeded: "Memory Limit Exceeded",
    output_limit_exceeded: "Output Limit Exceeded",
    execution_failed: "Execution Failed",
  };

  const errorDetails = testResult.errorDetails;

  return (
    <div className="p-3 space-y-3">
      {/* Status badge & telemetry */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
              statusStyles[testResult.status] || statusStyles.execution_failed
            }`}
          >
            {statusLabels[testResult.status] || testResult.status}
          </span>
          <span className="text-[10px] text-[#6B6B6B]">Case {activeTestIndex + 1}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#6B6B6B] font-mono">
          {testResult.memoryKb !== undefined && (
            <span>{(testResult.memoryKb / 1024).toFixed(1)} MB</span>
          )}
          {testResult.memoryKb !== undefined && <span>•</span>}
          <span>{testResult.executionTimeMs}ms</span>
        </div>
      </div>

      {/* Output comparison for success */}
      {testResult.status === "success" && (
        <div className="space-y-2">
          <div>
            <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
              Your Output
            </span>
            <pre
              className={`text-xs font-mono mt-1 rounded p-2 whitespace-pre-wrap border ${
                testResult.passed
                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300"
                  : "bg-red-500/5 border-red-500/10 text-red-300"
              }`}
            >
              {testResult.actualOutput || "(empty output)"}
            </pre>
          </div>
          {!testResult.passed && (
            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
                Expected Output
              </span>
              <pre className="text-xs font-mono mt-1 rounded p-2 whitespace-pre-wrap border bg-[#1C1C1E] border-[#2A2A2C] text-[#E0D6C8]">
                {testResult.expectedOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Human-readable Error Diagnostics Card */}
      {testResult.status !== "success" && (
        <div className="space-y-2.5">
          {errorDetails ? (
            <div className="bg-[#1C1C1E] rounded-lg border border-red-500/20 p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {errorDetails.errorType}
                  </span>
                  {errorDetails.lineNumber && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#2A2A2C] text-[#E0D6C8] font-mono">
                      Line {errorDetails.lineNumber}
                      {errorDetails.columnNumber ? `:${errorDetails.columnNumber}` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Clean diagnostic message */}
              <div className="text-xs font-mono text-red-300 bg-red-950/20 rounded p-2 border border-red-900/30 whitespace-pre-wrap">
                {errorDetails.cleanMessage || errorDetails.rawMessage}
              </div>

              {/* Friendly Explanation */}
              <div className="flex items-start gap-2 text-xs text-[#C9A45C]/90 bg-[#C9A45C]/5 border border-[#C9A45C]/15 rounded-md p-2.5">
                <svg className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-relaxed">{errorDetails.friendlyExplanation}</span>
              </div>

              {/* Raw log toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowRawError(!showRawError)}
                  className="text-[10px] text-[#8E8E93] hover:text-[#E0D6C8] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${showRawError ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showRawError ? "Hide raw compiler output" : "Show raw compiler output"}
                </button>

                {showRawError && (
                  <pre className="text-[11px] font-mono mt-1.5 rounded p-2 whitespace-pre-wrap border bg-[#141416] border-[#2A2A2C] text-[#8E8E93] max-h-48 overflow-y-auto">
                    {testResult.stderr || errorDetails.rawMessage}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
                Error Output
              </span>
              <pre className="text-xs font-mono mt-1 rounded p-2 whitespace-pre-wrap border bg-red-500/5 border-red-500/10 text-red-300 max-h-48 overflow-y-auto">
                {testResult.stderr || "Execution failed without output."}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Console Panel ───────────────────────────────────────────────────────

function ConsolePanel({ output }: { output: string }) {
  return (
    <div className="p-3">
      {output ? (
        <pre className="text-xs text-[#B0B0B0] font-mono whitespace-pre-wrap">
          {output}
        </pre>
      ) : (
        <p className="text-xs text-[#4A4A4A]">Console output will appear here</p>
      )}
    </div>
  );
}
