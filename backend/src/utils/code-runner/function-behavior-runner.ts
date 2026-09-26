/**
 * Function-Behavior Runner — InterviewForge
 *
 * Evaluates JavaScript and Python submissions that return or implement a
 * function/class, where correctness CANNOT be determined by comparing stdout
 * to an expected string.
 *
 * Instead, each test case carries a `behaviorScript` — a self-contained script
 * that:
 *   1. Includes the user's submitted code verbatim.
 *   2. Exercises the returned function with controlled inputs / timers.
 *   3. Prints a JSON result object to stdout: { "pass": true/false, "error": "..." }
 *
 * Security:
 *   - User code is sent through the EXISTING Judge0/Piston sandbox via
 *     `executeCode()` with `skipHarness: true`. No vm module, no eval on host,
 *     no child_process in production. The container-level isolation is fully preserved.
 *
 * Supported evaluationType values (stored in testCase.evaluationType):
 *   "function_behavior" — behaviorScript tells exactly how to test.
 *   "stdout"            — Default: normal stdin→stdout comparison (not handled here).
 */

import { executeCode, type ExecuteCodeResult } from "../code-execution.service.js";

// ── Types ────────────────────────────────────────────────────────────────

/**
 * Extended test case that includes function-behavior evaluation data.
 * This is a superset of the existing TestCase shape — the new fields are
 * optional so existing stdout test cases remain unchanged.
 */
export interface FunctionBehaviorTestCase {
  evaluationType: "function_behavior";
  /** The function name the user must define (e.g. "debounce", "memoize") */
  functionName: string;
  /** Short description shown in the UI (e.g. "returns a function") */
  description: string;
  /**
   * A complete script that wraps the user's code and validates its behavior.
   * The placeholder `__USER_CODE_BLOCK__` will be replaced with the user's
   * submitted code verbatim.
   *
   * The script MUST print exactly one JSON line to stdout:
   *   { "pass": true }           — on success
   *   { "pass": false, "error": "reason" } — on failure
   *
   * The script runs inside Judge0/Piston so it has the same isolation guarantees
   * as any other submission.
   */
  behaviorScript: string;
  isHidden: boolean;
  explanation?: string;
}

export interface FunctionBehaviorResult {
  passed: boolean;
  description: string;
  feedback?: string;
  executionTimeMs: number;
  status: "pass" | "fail" | "compilation_error" | "runtime_error" | "timeout" | "execution_failed";
}

// ── Core Evaluator ────────────────────────────────────────────────────────

/**
 * Run a single function-behavior test case against user code.
 *
 * This stitches the user's code into the behaviorScript, then sends the
 * combined script through the existing executeCode() pipeline (Judge0/Piston).
 * No code runs on the host server.
 */
export async function runFunctionBehaviorTest(
  userCode: string,
  testCase: FunctionBehaviorTestCase,
  language: string
): Promise<FunctionBehaviorResult> {
  // Stitch user code into the behavior script
  const fullScript = testCase.behaviorScript.replace(
    "__USER_CODE_BLOCK__",
    userCode
  );

  // Execute through the existing sandboxed runner with skipHarness = true
  // (the behavior script IS the complete program — no extra harness needed)
  const result: ExecuteCodeResult = await executeCode({
    language,
    code: fullScript,
    skipHarness: true,
  });

  // ── Handle non-success execution statuses ──
  if (result.status === "compilation_error") {
    return {
      passed: false,
      description: testCase.description,
      feedback: `Compilation error: ${result.stderr || "Unknown compilation error"}`,
      executionTimeMs: result.executionTimeMs,
      status: "compilation_error",
    };
  }

  if (result.status === "timeout") {
    return {
      passed: false,
      description: testCase.description,
      feedback: "Execution timed out — possible infinite loop or missing timer cleanup.",
      executionTimeMs: result.executionTimeMs,
      status: "timeout",
    };
  }

  if (result.status === "runtime_error") {
    return {
      passed: false,
      description: testCase.description,
      feedback: `Runtime error: ${result.stderr || "Unknown runtime error"}`,
      executionTimeMs: result.executionTimeMs,
      status: "runtime_error",
    };
  }

  if (result.status === "execution_failed") {
    return {
      passed: false,
      description: testCase.description,
      feedback: `Execution failed: ${result.stderr || "Unknown execution failure"}`,
      executionTimeMs: result.executionTimeMs,
      status: "execution_failed",
    };
  }

  // ── Parse structured JSON output from the behavior script ──
  const stdout = result.stdout.trim();

  try {
    // The behavior script prints a JSON line as the final result
    const lines = stdout.split("\n").map((l) => l.trim()).filter(Boolean);
    const lastLine = lines.pop() || "";
    const parsed = JSON.parse(lastLine);

    if (parsed.pass === true) {
      return {
        passed: true,
        description: testCase.description,
        executionTimeMs: result.executionTimeMs,
        status: "pass",
      };
    } else {
      return {
        passed: false,
        description: testCase.description,
        feedback: parsed.error || "Test assertion failed.",
        executionTimeMs: result.executionTimeMs,
        status: "fail",
      };
    }
  } catch {
    // If stdout is not valid JSON, the code failed to output valid test results
    return {
      passed: false,
      description: testCase.description,
      feedback: `Behavior test produced invalid output or syntax error. Output: "${stdout.slice(0, 200)}"`,
      executionTimeMs: result.executionTimeMs,
      status: "fail",
    };
  }
}

// ── Run All Behavior Tests ────────────────────────────────────────────────

/**
 * Run all function-behavior test cases for a problem and return aggregated results.
 */
export async function runAllBehaviorTests(
  userCode: string,
  testCases: FunctionBehaviorTestCase[],
  language: string
): Promise<{
  results: FunctionBehaviorResult[];
  passedCount: number;
  totalCount: number;
  totalExecutionTimeMs: number;
}> {
  const results: FunctionBehaviorResult[] = [];
  let passedCount = 0;
  let totalExecutionTimeMs = 0;

  for (const tc of testCases) {
    const result = await runFunctionBehaviorTest(userCode, tc, language);
    results.push(result);
    totalExecutionTimeMs += result.executionTimeMs;
    if (result.passed) passedCount++;
  }

  return {
    results,
    passedCount,
    totalCount: testCases.length,
    totalExecutionTimeMs,
  };
}

// ── Built-in JavaScript Behavior Script Templates ─────────────────────────

/**
 * Build the complete set of function-behavior test cases for the Debounce problem in JavaScript.
 * These tests verify ALL 10 required behaviors:
 *   a. `debounce` identifier exists
 *   b. `typeof debounce === "function"`
 *   c. `debounce(fn, wait)` returns a function
 *   d. The returned function is callable
 *   e. Calling it multiple times before `wait` cancels the previous invocation
 *   f. Only the LAST invocation executes
 *   g. Correct arguments from the LAST call are passed to the original function
 *   h. The original function does NOT execute before the required delay
 *   i. The original function executes AFTER the required delay
 *   j. Independent debounced functions maintain independent timers
 */
export function buildDebounceBehaviorTestCases(): FunctionBehaviorTestCase[] {
  const makeJSScript = (body: string) => `
'use strict';
// ── User submission (injected) ──
__USER_CODE_BLOCK__
// ── End user submission ──

(async function __behaviorTest() {
  function __pass() {
    process.stdout.write(JSON.stringify({ pass: true }) + '\\n');
    process.exit(0);
  }
  function __fail(msg) {
    process.stdout.write(JSON.stringify({ pass: false, error: msg }) + '\\n');
    process.exit(0);
  }

  try {
${body}
  } catch (err) {
    __fail('Unexpected exception: ' + (err && err.message ? err.message : String(err)));
  }
})();
`;

  return [
    // ── Test 1 (visible, Req a & b): debounce identifier exists and is a function ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "debounce is defined and is a function",
      isHidden: false,
      explanation: "The submitted code must define a 'debounce' identifier that is a function.",
      behaviorScript: makeJSScript(`
    if (typeof debounce === 'undefined') return __fail('debounce is not defined');
    if (typeof debounce !== 'function') return __fail('Expected debounce to be a function, got: ' + typeof debounce);
    __pass();
      `),
    },

    // ── Test 2 (visible, Req c): debounce(fn, wait) returns a function ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "debounce(fn, wait) returns a function",
      isHidden: false,
      explanation: "typeof debounce(() => {}, 50) must be 'function'.",
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') return __fail('debounce is not defined as a function');
    const result = debounce(() => {}, 50);
    // Semantic assertion: check the TYPE, not the string representation
    if (typeof result !== 'function') return __fail('Expected typeof result === "function", got: ' + typeof result);
    __pass();
      `),
    },

    // ── Test 3 (visible, Req d): returned function is callable ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "The debounced wrapper is callable without throwing",
      isHidden: false,
      explanation: "Calling the debounced wrapper with arguments must not throw.",
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') return __fail('debounce is not defined as a function');
    const fn = debounce(() => {}, 50);
    try {
      fn();
      fn(1, 2, 3);
    } catch (e) {
      return __fail('Calling debounced function threw: ' + (e && e.message ? e.message : String(e)));
    }
    __pass();
      `),
    },

    // ── Test 4 (hidden, Req h): original function does NOT execute before delay ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Original function does NOT execute before the delay",
      isHidden: true,
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') return __fail('debounce is not defined as a function');
    let called = 0;
    const fn = debounce(() => { called++; }, 80);
    fn();
    // Check immediately — should NOT have fired yet
    if (called !== 0) return __fail('Function fired synchronously instead of waiting for delay. called=' + called);
    // Check before delay expires — still should not have fired
    setTimeout(() => {
      if (called !== 0) return __fail('Function fired before delay expired. called=' + called);
    }, 40);
    // Check after delay — should have fired exactly once
    setTimeout(() => {
      if (called !== 1) return __fail('Expected function to fire once after delay, called=' + called);
      __pass();
    }, 150);
      `),
    },

    // ── Test 5 (hidden, Req i): original function executes AFTER delay ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Original function executes after the wait period",
      isHidden: true,
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') return __fail('debounce is not defined as a function');
    let executed = false;
    let result = null;
    const fn = debounce((x) => { executed = true; result = x; }, 60);
    fn('hello');
    if (executed) return __fail('Function executed prematurely before wait delay. Must delay execution.');
    setTimeout(() => {
      if (!executed) return __fail('Function failed to execute after wait period');
      if (result !== 'hello') return __fail('Expected result to be "hello" after delay, got: ' + JSON.stringify(result));
      __pass();
    }, 120);
      `),
    },

    // ── Test 6 (hidden, Req e & f): repeated calls cancel previous; only LAST call fires ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Repeated calls reset the timer; only the last call fires",
      isHidden: true,
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') return __fail('debounce is not defined as a function');
    let callCount = 0;
    const fn = debounce(() => { callCount++; }, 100);
    fn(); // t=0
    setTimeout(() => fn(), 40);  // t=40, resets timer
    setTimeout(() => fn(), 80);  // t=80, resets timer again
    // At t=120, wait from t=80 has not expired yet
    setTimeout(() => {
      if (callCount !== 0) return __fail('Previous invocation was not cancelled by subsequent call. callCount=' + callCount);
    }, 120);
    // Wait expires at t=180 (80+100)
    setTimeout(() => {
      if (callCount !== 1) return __fail('Expected only the last invocation to execute (count=1), got: ' + callCount);
      __pass();
    }, 250);
      `),
    },

    // ── Test 7 (hidden, Req g): arguments from the LAST call are forwarded ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Arguments from the last call are forwarded correctly",
      isHidden: true,
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') return __fail('debounce is not defined as a function');
    let callCount = 0;
    let received = null;
    const fn = debounce((...args) => { callCount++; received = args; }, 60);
    fn(1, 'first');
    fn(42, 'last', true);
    if (callCount !== 0) return __fail('Function executed prematurely before wait delay');
    setTimeout(() => {
      if (callCount !== 1) return __fail('Expected only 1 execution (the last one), but got ' + callCount);
      if (!Array.isArray(received) || received[0] !== 42 || received[1] !== 'last' || received[2] !== true) {
        return __fail('Expected last-call args [42, "last", true], got: ' + JSON.stringify(received));
      }
      __pass();
    }, 120);
      `),
    },

    // ── Test 8 (hidden, Req j): independent debounced functions maintain independent timers ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Independent debounced functions maintain independent timers",
      isHidden: true,
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') return __fail('debounce is not defined as a function');
    let countA = 0, countB = 0;
    const fnA = debounce(() => { countA++; }, 60);
    const fnB = debounce(() => { countB++; }, 60);
    fnA();
    setTimeout(() => fnB(), 30);
    // At t=80: fnA should have fired (60ms elapsed), fnB should NOT have fired yet (only 50ms elapsed)
    setTimeout(() => {
      if (countA !== 1) return __fail('fnA should have fired at 60ms, got: ' + countA);
      if (countB !== 0) return __fail('fnB timer interfered with by fnA, fnB executed too early, countB=' + countB);
    }, 80);
    // At t=140: both should have fired exactly once
    setTimeout(() => {
      if (countA !== 1) return __fail('fnA final count should be 1, got: ' + countA);
      if (countB !== 1) return __fail('fnB final count should be 1, got: ' + countB);
      __pass();
    }, 140);
      `),
    },

    // ── Test 9 (hidden): rejects console.log("function") print hack ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Rejects print-hack submissions that don't define debounce",
      isHidden: true,
      behaviorScript: makeJSScript(`
    if (typeof debounce !== 'function') {
      return __fail('debounce is not defined as a function. Printing output is not a valid solution.');
    }
    const r = debounce(() => {}, 10);
    if (typeof r !== 'function') {
      return __fail('debounce must return a function, got typeof: ' + typeof r);
    }
    __pass();
      `),
    },
  ];
}

// ── Built-in Python Behavior Script Templates ─────────────────────────────

/**
 * Build the complete set of function-behavior test cases for the Debounce problem in Python.
 * Ensures Python submissions are tested semantically and `print("function")` fails.
 */
export function buildDebouncePythonBehaviorTestCases(): FunctionBehaviorTestCase[] {
  const makePythonScript = (body: string) => `
import sys
import json
import time
import threading

# ── User submission (injected) ──
__USER_CODE_BLOCK__
# ── End user submission ──

def __pass():
    sys.stdout.write(json.dumps({"pass": True}) + "\\n")
    sys.exit(0)

def __fail(msg):
    sys.stdout.write(json.dumps({"pass": False, "error": str(msg)}) + "\\n")
    sys.exit(0)

try:
${body}
except Exception as err:
    __fail(f"Unexpected exception: {err}")
`;

  return [
    // ── Test 1 (visible): debounce is defined and callable ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "debounce is defined and is callable in Python",
      isHidden: false,
      explanation: "The submitted code must define a callable function named 'debounce'.",
      behaviorScript: makePythonScript(`
    if 'debounce' not in globals() or not callable(globals().get('debounce')):
        __fail("debounce is not defined as a callable function. Printing output is not a valid solution.")
    __pass()
      `),
    },

    // ── Test 2 (visible): debounce(fn, wait) returns a callable ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "debounce(fn, wait) returns a callable function",
      isHidden: false,
      explanation: "Calling debounce(fn, wait) must return a callable wrapper.",
      behaviorScript: makePythonScript(`
    if 'debounce' not in globals() or not callable(globals().get('debounce')):
        __fail("debounce is not defined as a callable function")
    res = debounce(lambda: None, 50)
    if not callable(res):
        __fail(f"Expected debounce to return a callable function, got {type(res).__name__}")
    __pass()
      `),
    },

    // ── Test 3 (hidden): delay and reset behavior ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Debounced function delays execution and resets on repeated calls",
      isHidden: true,
      behaviorScript: makePythonScript(`
    if 'debounce' not in globals() or not callable(globals().get('debounce')):
        __fail("debounce is not defined as a callable function")
    called = []
    def target(*args):
        called.append(args)
    fn = debounce(target, 80)
    fn(1, "first")
    if len(called) != 0:
        __fail("Function executed immediately before delay expired")
    time.sleep(0.04)
    fn(42, "last")  # reset timer
    time.sleep(0.05)
    if len(called) != 0:
        __fail("Previous call was not cancelled; function executed prematurely")
    time.sleep(0.10)
    if len(called) != 1:
        __fail(f"Expected exactly 1 execution (the last one), got {len(called)}")
    if called[0] != (42, "last"):
        __fail(f"Expected last-call args (42, 'last'), got {called[0]}")
    __pass()
      `),
    },

    // ── Test 4 (hidden): rejects print hack ──
    {
      evaluationType: "function_behavior",
      functionName: "debounce",
      description: "Rejects print-hack submissions that don't define debounce",
      isHidden: true,
      behaviorScript: makePythonScript(`
    if 'debounce' not in globals() or not callable(globals().get('debounce')):
        __fail("debounce is not defined as a function. Printing output is not a valid solution.")
    __pass()
      `),
    },
  ];
}

// ── Problem-to-BehaviorTestCases Registry ────────────────────────────────
//
// Map normalized problem titles → behavior test case builder per language.
// Add new function-based problems here (throttle, memoize, curry, etc.)

const BEHAVIOR_REGISTRY: Record<
  string,
  Record<string, () => FunctionBehaviorTestCase[]>
> = {
  "debounce implementation": {
    javascript: buildDebounceBehaviorTestCases,
    python: buildDebouncePythonBehaviorTestCases,
  },
  debounce: {
    javascript: buildDebounceBehaviorTestCases,
    python: buildDebouncePythonBehaviorTestCases,
  },
};

/**
 * Returns built-in behavior test cases for a given problem title and language,
 * or null if the problem is not in the registry.
 */
export function getBuiltinBehaviorTests(
  problemTitle: string,
  language: string = "javascript"
): FunctionBehaviorTestCase[] | null {
  const key = problemTitle.toLowerCase().trim();
  const langKey = language.toLowerCase().trim();
  const problemEntry = BEHAVIOR_REGISTRY[key];
  if (!problemEntry) return null;
  const builder = problemEntry[langKey];
  return builder ? builder() : null;
}

/**
 * Checks if a problem title is known to require function-behavior evaluation
 * in ANY supported language.
 */
export function isBehaviorProblemTitle(problemTitle: string): boolean {
  const key = problemTitle.toLowerCase().trim();
  return Boolean(BEHAVIOR_REGISTRY[key]);
}

/**
 * Check if a test case object is a valid FunctionBehaviorTestCase.
 */
export function isFunctionBehaviorTestCase(
  tc: any
): tc is FunctionBehaviorTestCase {
  return (
    tc !== null &&
    typeof tc === "object" &&
    tc.evaluationType === "function_behavior" &&
    typeof tc.behaviorScript === "string"
  );
}
