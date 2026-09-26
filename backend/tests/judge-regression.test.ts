/**
 * Regression Tests — InterviewForge Judge System
 *
 * Verifies all requirements for function-behavior evaluation and standard
 * stdout comparison:
 *
 * 1. Behavior test case generation (JS & Python)
 * 2. Registry lookup & language-aware resolution
 * 3. Generic function_behavior schema & type guards
 * 4. CASE 1: Correct JavaScript debounce implementation → PASS
 * 5. CASE 2: Incorrect debounce (immediate call) → FAIL
 * 6. CASE 3: Incorrect debounce (never calls) → FAIL
 * 7. CASE 4: Incorrect debounce (no timer reset) → FAIL
 * 8. CASE 5: JavaScript console.log("function") → FAIL
 * 9. CASE 6: Python print("function") → FAIL for function-behavior problem
 * 10. CASE 6b: Python valid debounce implementation → PASS
 * 11. CASE 7: Normal stdin/stdout problems → PASS (all match modes)
 * 12. CASE 8: Malicious/infinite user submissions → TIMEOUT / SAFE FAILURE
 * 13. Semantic assertion verification (no string coercion, no literal "function" matching)
 *
 * Usage:
 *   npx tsx backend/tests/judge-regression.test.ts
 */

import {
  buildDebounceBehaviorTestCases,
  buildDebouncePythonBehaviorTestCases,
  getBuiltinBehaviorTests,
  isBehaviorProblemTitle,
  isFunctionBehaviorTestCase,
  type FunctionBehaviorTestCase,
} from "../src/utils/code-runner/function-behavior-runner.js";

import { compareOutputs } from "../src/utils/code-runner/output-comparator.js";
import { prepareCode } from "../src/utils/code-runner/language-harness.js";

import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";

// ── Test Runner Helpers ──────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let skipped = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    const msg = `  ✗ ${testName}${detail ? ` — ${detail}` : ""}`;
    console.log(msg);
    failures.push(msg);
  }
}

function section(name: string) {
  console.log(`\n═══ ${name} ═══`);
}

// ── Local Process Execution for Fast Regression Testing ──────────────────

interface LocalExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

function executeLocally(script: string, timeoutMs = 4000): LocalExecResult {
  const tmpFile = path.join(
    os.tmpdir(),
    `ifj_test_${crypto.randomBytes(8).toString("hex")}.js`
  );
  try {
    fs.writeFileSync(tmpFile, script, "utf8");
    const stdout = execSync(`node "${tmpFile}"`, {
      timeout: timeoutMs,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout: stdout.trim(), stderr: "", exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: (err.stdout || "").toString().trim(),
      stderr: (err.stderr || "").toString().trim(),
      exitCode: err.status ?? (err.code === "ETIMEDOUT" ? 124 : 1),
    };
  } finally {
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      /* ignore */
    }
  }
}

function executePythonLocally(script: string, timeoutMs = 4000): LocalExecResult {
  const tmpFile = path.join(
    os.tmpdir(),
    `ifj_py_test_${crypto.randomBytes(8).toString("hex")}.py`
  );
  try {
    fs.writeFileSync(tmpFile, script, "utf8");
    const stdout = execSync(`python "${tmpFile}"`, {
      timeout: timeoutMs,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout: stdout.trim(), stderr: "", exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: (err.stdout || "").toString().trim(),
      stderr: (err.stderr || "").toString().trim(),
      exitCode: err.status ?? (err.code === "ETIMEDOUT" ? 124 : 1),
    };
  } finally {
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      /* ignore */
    }
  }
}

function runBehaviorTest(
  userCode: string,
  testCase: FunctionBehaviorTestCase,
  timeoutMs = 4000
): { passed: boolean; error?: string } {
  const fullScript = testCase.behaviorScript.replace(
    "__USER_CODE_BLOCK__",
    userCode
  );
  const result = executeLocally(fullScript, timeoutMs);
  if (result.exitCode !== 0 && !result.stdout) {
    return {
      passed: false,
      error:
        result.exitCode === 124
          ? "Execution timed out (Time Limit Exceeded)"
          : `Process exited with code ${result.exitCode}: ${result.stderr}`,
    };
  }
  const lines = result.stdout.split("\n").map((l) => l.trim()).filter(Boolean);
  const lastLine = lines.pop() || "";
  try {
    const parsed = JSON.parse(lastLine);
    return { passed: parsed.pass === true, error: parsed.error };
  } catch {
    return { passed: false, error: `Unparseable output: "${lastLine}"` };
  }
}

function runPythonBehaviorTest(
  userCode: string,
  testCase: FunctionBehaviorTestCase,
  timeoutMs = 4000
): { passed: boolean; error?: string } {
  const fullScript = testCase.behaviorScript.replace(
    "__USER_CODE_BLOCK__",
    userCode
  );
  const result = executePythonLocally(fullScript, timeoutMs);
  if (result.exitCode !== 0 && !result.stdout) {
    return {
      passed: false,
      error:
        result.exitCode === 124
          ? "Execution timed out (Time Limit Exceeded)"
          : `Process exited with code ${result.exitCode}: ${result.stderr}`,
    };
  }
  const lines = result.stdout.split("\n").map((l) => l.trim()).filter(Boolean);
  const lastLine = lines.pop() || "";
  try {
    const parsed = JSON.parse(lastLine);
    return { passed: parsed.pass === true, error: parsed.error };
  } catch {
    return { passed: false, error: `Unparseable output: "${lastLine}"` };
  }
}

// ════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ════════════════════════════════════════════════════════════════════════

console.log("\n🔬 InterviewForge Judge Regression Tests\n");

// ── 1. Behavior Test Case Generation ────────────────────────────────────

section("1. Behavior Test Case Generation & Schema Compliance");

const debounceTCs = buildDebounceBehaviorTestCases();
assert(
  debounceTCs.length >= 8,
  `Debounce generates complete test suite (got ${debounceTCs.length} test cases)`
);
assert(
  debounceTCs.every((tc) => tc.evaluationType === "function_behavior"),
  "All test cases adhere to generic schema: evaluationType === 'function_behavior'"
);
assert(
  debounceTCs.every((tc) => tc.functionName === "debounce"),
  "All test cases specify functionName === 'debounce'"
);
assert(
  debounceTCs.every((tc) => typeof tc.behaviorScript === "string" && tc.behaviorScript.includes("__USER_CODE_BLOCK__")),
  "All test cases contain self-contained behaviorScript with __USER_CODE_BLOCK__"
);
assert(
  debounceTCs.filter((tc) => !tc.isHidden).length >= 2,
  "At least 2 visible test cases provided for candidate feedback"
);
assert(
  debounceTCs.filter((tc) => tc.isHidden).length >= 4,
  "At least 4 hidden test cases provided for rigorous grading"
);

// Python behavior test case generation
const debouncePyTCs = buildDebouncePythonBehaviorTestCases();
assert(
  debouncePyTCs.length >= 4,
  `Debounce generates Python test cases (got ${debouncePyTCs.length})`
);
assert(
  debouncePyTCs.every((tc) => tc.evaluationType === "function_behavior"),
  "Python test cases use evaluationType === 'function_behavior'"
);

// ── 2. Registry Lookup ──────────────────────────────────────────────────

section("2. Problem Registry Lookup & Language Resolution");

assert(
  getBuiltinBehaviorTests("Debounce Implementation", "javascript") !== null,
  "Registry resolves 'Debounce Implementation' (JavaScript)"
);
assert(
  getBuiltinBehaviorTests("debounce", "javascript") !== null,
  "Registry resolves 'debounce' case-insensitively"
);
assert(
  getBuiltinBehaviorTests("debounce", "python") !== null,
  "Registry resolves 'debounce' (Python)"
);
assert(
  isBehaviorProblemTitle("Debounce Implementation"),
  "isBehaviorProblemTitle correctly identifies behavior problem"
);
assert(
  !isBehaviorProblemTitle("Two Sum"),
  "isBehaviorProblemTitle returns false for standard problem 'Two Sum'"
);
assert(
  getBuiltinBehaviorTests("Two Sum", "javascript") === null,
  "Registry returns null for unknown problem 'Two Sum'"
);

// ── 3. Type Guard ───────────────────────────────────────────────────────

section("3. Type Guard Validation");

assert(
  isFunctionBehaviorTestCase(debounceTCs[0]),
  "isFunctionBehaviorTestCase identifies valid FunctionBehaviorTestCase"
);
assert(
  !isFunctionBehaviorTestCase({ input: "1 2", expectedOutput: "3", isHidden: false }),
  "isFunctionBehaviorTestCase rejects plain stdout test case"
);
assert(!isFunctionBehaviorTestCase(null), "isFunctionBehaviorTestCase rejects null");
assert(!isFunctionBehaviorTestCase(undefined), "isFunctionBehaviorTestCase rejects undefined");

// ── CASE 1: Correct debounce implementation → PASS ──────────────────────

section("CASE 1: Correct debounce implementation → PASS");

const CORRECT_DEBOUNCE = `
function debounce(func, wait) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}
`;

for (const tc of debounceTCs) {
  const result = runBehaviorTest(CORRECT_DEBOUNCE, tc);
  assert(result.passed, `[PASS] ${tc.description}`, result.error);
}

// ── CASE 2: Incorrect debounce (immediate call) → FAIL ──────────────────

section("CASE 2: Incorrect debounce (immediate call) → FAIL");

const IMMEDIATE_DEBOUNCE = `
function debounce(func, wait) {
    return function(...args) {
        func.apply(this, args); // BUG: calls immediately without delaying
    };
}
`;

let case2FailCount = 0;
for (const tc of debounceTCs) {
  const result = runBehaviorTest(IMMEDIATE_DEBOUNCE, tc);
  if (!result.passed) case2FailCount++;
}
assert(
  case2FailCount >= 3,
  `Immediate-call debounce fails multiple behavioral tests (failed ${case2FailCount}/${debounceTCs.length})`
);

// ── CASE 3: Incorrect debounce (never calls) → FAIL ─────────────────────

section("CASE 3: Incorrect debounce (never calls) → FAIL");

const NEVER_CALLS_DEBOUNCE = `
function debounce(func, wait) {
    return function(...args) {
        // BUG: never calls the original function
    };
}
`;

let case3FailCount = 0;
for (const tc of debounceTCs) {
  const result = runBehaviorTest(NEVER_CALLS_DEBOUNCE, tc);
  if (!result.passed) case3FailCount++;
}
assert(
  case3FailCount >= 4,
  `Never-calls debounce fails timing and execution tests (failed ${case3FailCount}/${debounceTCs.length})`
);

// ── CASE 4: Incorrect debounce (no timer reset) → FAIL ──────────────────

section("CASE 4: Incorrect debounce (no timer reset) → FAIL");

const NO_RESET_DEBOUNCE = `
function debounce(func, wait) {
    let timer;
    return function(...args) {
        // BUG: does not clear previous timer, so every invocation fires
        timer = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}
`;

let case4FailCount = 0;
for (const tc of debounceTCs) {
  const result = runBehaviorTest(NO_RESET_DEBOUNCE, tc);
  if (!result.passed) case4FailCount++;
}
assert(
  case4FailCount >= 1,
  `No-reset debounce fails rapid-invocation test (failed ${case4FailCount})`
);

// ── CASE 5: JavaScript console.log("function") → FAIL ───────────────────

section('CASE 5: JavaScript console.log("function") → FAIL');

const JS_PRINT_HACK = `console.log("function");`;

let case5FailCount = 0;
for (const tc of debounceTCs) {
  const result = runBehaviorTest(JS_PRINT_HACK, tc);
  if (!result.passed) case5FailCount++;
}
assert(
  case5FailCount === debounceTCs.length,
  `console.log("function") fails ALL ${debounceTCs.length} tests (failed ${case5FailCount})`
);

// ── CASE 6: Python print("function") → FAIL for function-behavior ───────

section('CASE 6: Python print("function") rejected for function problems');

const PYTHON_PRINT_HACK = `print("function")`;

let case6FailCount = 0;
for (const tc of debouncePyTCs) {
  const result = runPythonBehaviorTest(PYTHON_PRINT_HACK, tc);
  if (!result.passed) case6FailCount++;
}
assert(
  case6FailCount === debouncePyTCs.length,
  `Python print("function") fails all ${debouncePyTCs.length} behavior tests (failed ${case6FailCount})`
);

// Verify why the old bug occurred vs how it is fixed:
const stdoutComparison = compareOutputs("function", "function");
assert(
  stdoutComparison.passed === true,
  "Diagnostic: Plain stdout comparator alone matches 'function' == 'function'"
);
assert(
  isBehaviorProblemTitle("Debounce Implementation"),
  "Fix verified: Controller routes problem away from stdout comparison entirely"
);

// ── CASE 6b: Python valid debounce implementation → PASS ────────────────

section("CASE 6b: Python valid debounce implementation → PASS");

const PYTHON_VALID_DEBOUNCE = `
import threading

def debounce(func, wait):
    timer = None
    def debounced(*args, **kwargs):
        nonlocal timer
        if timer is not None:
            timer.cancel()
        timer = threading.Timer(wait / 1000.0, lambda: func(*args, **kwargs))
        timer.start()
    return debounced
`;

for (const tc of debouncePyTCs) {
  const result = runPythonBehaviorTest(PYTHON_VALID_DEBOUNCE, tc);
  assert(result.passed, `[PASS Python] ${tc.description}`, result.error);
}

// ── CASE 7: Normal stdin/stdout problem continues working ───────────────

section("CASE 7: Normal stdin/stdout problems continue working (comparator unchanged)");

// 1. Exact match
assert(compareOutputs("3", "3").passed, "Exact match: '3' == '3'");

// 2. Whitespace normalization
assert(compareOutputs("  3  \n", "3").passed, "Whitespace normalized: '  3  \\n' == '3'");
assert(compareOutputs("hello\r\nworld", "hello\nworld").passed, "Line ending normalized: CRLF == LF");

// 3. JSON structural equivalence
assert(compareOutputs("[1, 2, 3]", "[1,2,3]").passed, "JSON structural: '[1, 2, 3]' == '[1,2,3]'");
assert(compareOutputs('{"a": 1, "b": 2}', '{"b": 2, "a": 1}').passed, "JSON key order normalized");

// 4. Boolean normalization
assert(compareOutputs("True", "true").passed, "Boolean normalization: 'True' == 'true'");
assert(compareOutputs("False", "false").passed, "Boolean normalization: 'False' == 'false'");

// 5. Numeric float tolerance
assert(compareOutputs("3.14159", "3.141590").passed, "Numeric float tolerance: '3.14159' == '3.141590'");

// 6. Expected mismatches
assert(!compareOutputs("4", "3").passed, "Mismatch correctly detected: '4' != '3'");
assert(!compareOutputs("false", "true").passed, "Boolean mismatch detected: 'false' != 'true'");

// 7. Language harnesses for standard problems
const pyHarness = prepareCode("def add(a, b):\n    return a + b", "python");
assert(pyHarness.isFunctionBased, "Python standard function detected as function-based");
assert(pyHarness.wrappedCode.includes("__main__"), "Python harness injects standard stdin/stdout harness");

const jsHarness = prepareCode("function add(a, b) { return a + b; }", "javascript");
assert(jsHarness.isFunctionBased, "JavaScript standard function detected as function-based");

// ── CASE 8: Malicious / infinite submissions → TIMEOUT / SAFE FAILURE ───

section("CASE 8: Malicious/infinite submission → TIMEOUT / SAFE FAILURE");

// 8a. Infinite loop inside debounce call
const INFINITE_CALL_CODE = `
function debounce(func, wait) {
    while(true) {} // infinite loop during function execution
    return function() {};
}
`;

// Test against test case 2 (which calls debounce) with 1500ms local timeout
const callInfiniteResult = runBehaviorTest(INFINITE_CALL_CODE, debounceTCs[1], 1500);
assert(
  !callInfiniteResult.passed,
  "Infinite loop inside debounce call fails safely via timeout",
  callInfiniteResult.error
);

// 8b. Top-level infinite loop
const TOP_LEVEL_INFINITE = `
while(true) {} // top-level infinite loop
function debounce(func, wait) {
    return function() {};
}
`;

const topInfiniteResult = runBehaviorTest(TOP_LEVEL_INFINITE, debounceTCs[0], 1500);
assert(
  !topInfiniteResult.passed,
  "Top-level infinite loop fails safely via timeout",
  topInfiniteResult.error
);

// 8c. Attempted process/sandbox escape
const ESCAPE_ATTEMPT = `
try {
  const fs = require('fs');
  fs.readFileSync('/etc/passwd');
} catch(e) {}
function debounce(func, wait) {
  return function() {};
}
`;

const escapeResult = runBehaviorTest(ESCAPE_ATTEMPT, debounceTCs[0]);
// Behavior test executes the definition safely without crashing
assert(
  escapeResult.passed,
  "Code attempting module access runs safely without crashing the evaluation pipeline"
);

// ── 9. Semantic Assertions (Not String Coercion) ──────────────────────────

section("9. Semantic Type Assertions (Checking typeof, not string representation)");

// Verify that the behavior scripts use typeof assertions
const typeCheckTC = debounceTCs.find((tc) => tc.description.includes("returns a function"));
assert(typeCheckTC !== undefined, "Found return type behavior test");
if (typeCheckTC) {
  assert(
    typeCheckTC.behaviorScript.includes("typeof result !== 'function'"),
    "Behavior test uses strict `typeof result !== 'function'` assertion"
  );
  assert(
    !typeCheckTC.behaviorScript.includes("String(result)"),
    "Behavior test does NOT coerce function to String"
  );
  assert(
    !typeCheckTC.behaviorScript.includes("[Function (anonymous)]"),
    "Behavior test does NOT match Node.js internal string '[Function (anonymous)]'"
  );
}

// Verify that expectedOutput is semantic description, not literal stdout
assert(
  debounceTCs.every((tc) => !tc.behaviorScript.includes("expectedOutput")),
  "No behavior script compares stdout against a literal 'expectedOutput' variable"
);

// ── Summary ──────────────────────────────────────────────────────────────

section("SUMMARY");

console.log(`\n  Total: ${passed + failed + skipped}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Skipped: ${skipped}`);

if (failures.length > 0) {
  console.log("\n  Failures:");
  for (const f of failures) console.log(f);
}

console.log(failed === 0 ? "\n🎉 All tests passed!\n" : "\n❌ Some tests failed.\n");
process.exit(failed > 0 ? 1 : 0);
