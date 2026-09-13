/**
 * Error Classifier & Humanizer — InterviewForge
 *
 * Parses raw compiler output, runtime stack traces, and system signals
 * into candidate-friendly diagnostic messages with line numbers and explanations,
 * while keeping the raw stderr output available.
 */

export interface ParsedError {
  errorType: string;
  message: string;
  cleanMessage?: string;
  lineNumber?: number;
  columnNumber?: number;
  explanation: string;
  friendlyExplanation?: string;
  rawStderr: string;
  rawMessage?: string;
}

export type ErrorClassification = ParsedError;

/**
 * Classify and humanize compiler / runtime errors based on language and stderr.
 */
export function classifyError(
  rawStderr: string,
  language: string,
  lineOffset = 0
): ParsedError {
  const cleanStderr = (rawStderr || "").trim();
  if (!cleanStderr) {
    return {
      errorType: "Unknown Error",
      message: "An unknown error occurred during execution.",
      cleanMessage: "An unknown error occurred during execution.",
      explanation: "No error details were provided by the runtime.",
      friendlyExplanation: "No error details were provided by the runtime.",
      rawStderr: cleanStderr,
      rawMessage: cleanStderr,
    };
  }

  // Universal system checks (Time Limit, Memory Limit, Output Limit)
  const lowerStderr = cleanStderr.toLowerCase();
  if (
    lowerStderr.includes("time limit exceeded") ||
    lowerStderr.includes("execution timed out") ||
    lowerStderr.includes("sigxcpu")
  ) {
    return {
      errorType: "Time Limit Exceeded",
      message: "Execution exceeded the maximum time limit (5 seconds CPU / 10 seconds Wall Clock).",
      cleanMessage: "Execution exceeded the allowed time limit.",
      explanation: "Your solution took too long to complete. Check for infinite loops (e.g. while loops without progression) or optimize time complexity (e.g., replace O(N^2) nested loops with O(N) or O(N log N) hash maps/sorting).",
      friendlyExplanation: "Your solution took too long to complete. Check for infinite loops or optimize time complexity (e.g., avoid nested loops over large inputs).",
      rawStderr: cleanStderr,
      rawMessage: cleanStderr,
    };
  }

  if (
    lowerStderr.includes("memory limit exceeded") ||
    lowerStderr.includes("out of memory") ||
    lowerStderr.includes("outofmemoryerror") ||
    lowerStderr.includes("sigxfsz")
  ) {
    return {
      errorType: "Memory Limit Exceeded",
      message: "Execution exceeded the maximum memory limit (256 MB).",
      cleanMessage: "Execution exceeded the allowed memory limit (256 MB).",
      explanation: "Your solution allocated more memory than permitted. Check for massive arrays, memory leaks, or unbounded recursive call stacks.",
      friendlyExplanation: "Your program exceeded the 256MB memory limit. Avoid creating excessively large arrays or deep recursion without base cases.",
      rawStderr: cleanStderr,
      rawMessage: cleanStderr,
    };
  }

  const lang = language.toLowerCase();
  let parsed: ParsedError;

  if (lang === "python") {
    parsed = classifyPythonError(cleanStderr, lineOffset);
  } else if (lang === "java") {
    parsed = classifyJavaError(cleanStderr, lineOffset);
  } else if (lang === "cpp" || lang === "c++") {
    parsed = classifyCppError(cleanStderr, lineOffset);
  } else if (lang === "javascript" || lang === "js" || lang === "typescript" || lang === "ts") {
    parsed = classifyJsError(cleanStderr, lineOffset);
  } else {
    parsed = {
      errorType: "Runtime Error",
      message: cleanStderr.split("\n")[0].slice(0, 150),
      explanation: "The program encountered an unhandled error during execution.",
      rawStderr: cleanStderr,
    };
  }

  return {
    ...parsed,
    cleanMessage: parsed.cleanMessage || parsed.message,
    friendlyExplanation: parsed.friendlyExplanation || parsed.explanation,
    rawMessage: parsed.rawMessage || parsed.rawStderr,
  };
}

// ── Python Classifier ───────────────────────────────────────────────────

function classifyPythonError(stderr: string, lineOffset: number): ParsedError {
  // Extract line number: File "...", line 12
  const lineMatch = stderr.match(/line (\d+)/i);
  const rawLine = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  const lineNumber = rawLine ? Math.max(1, rawLine - lineOffset) : undefined;

  if (stderr.includes("ZeroDivisionError")) {
    return {
      errorType: "Division By Zero",
      message: extractLastNonEmptyLine(stderr),
      lineNumber,
      explanation: "A division or modulo operation by zero was attempted. Verify loop variables and divisor bounds.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("IndexError")) {
    return {
      errorType: "Index Out of Range",
      message: extractLastNonEmptyLine(stderr),
      lineNumber,
      explanation: "Attempted to access an index that is out of bounds for the list or string. Check boundary conditions.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("KeyError")) {
    return {
      errorType: "Key Error",
      message: extractLastNonEmptyLine(stderr),
      lineNumber,
      explanation: "The requested key does not exist in the dictionary. Use dict.get(key) or verify key existence first.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("RecursionError")) {
    return {
      errorType: "Maximum Recursion Depth Exceeded",
      message: "RecursionError: maximum recursion depth exceeded",
      lineNumber,
      explanation: "The function called itself too many times without reaching a base case. Check recursive termination conditions.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("IndentationError") || stderr.includes("TabError")) {
    return {
      errorType: "Indentation Error",
      message: extractLastNonEmptyLine(stderr),
      lineNumber,
      explanation: "Inconsistent indentation detected. Make sure you use 4 spaces consistently and do not mix tabs and spaces.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("NameError")) {
    return {
      errorType: "Undefined Variable or Function",
      message: extractLastNonEmptyLine(stderr),
      lineNumber,
      explanation: "A variable or function was referenced before it was defined or initialized.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("TypeError")) {
    return {
      errorType: "Type Error",
      message: extractLastNonEmptyLine(stderr),
      lineNumber,
      explanation: "An operation was performed on incompatible data types (e.g. adding string to integer).",
      rawStderr: stderr,
    };
  }

  return {
    errorType: "Python Error",
    message: extractLastNonEmptyLine(stderr),
    lineNumber,
    explanation: "An exception occurred during Python execution. Check the traceback for details.",
    rawStderr: stderr,
  };
}

// ── Java Classifier ─────────────────────────────────────────────────────

function classifyJavaError(stderr: string, lineOffset: number): ParsedError {
  // Extract line number: Main.java:14: error: ...
  const lineMatch = stderr.match(/Main\.java:(\d+):/i) || stderr.match(/Solution\.java:(\d+):/i);
  const rawLine = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  const lineNumber = rawLine ? Math.max(1, rawLine - lineOffset) : undefined;

  if (stderr.includes("class Solution is public, should be declared in a file named Solution.java")) {
    return {
      errorType: "Class Name Mismatch",
      message: "class Solution is public, should be declared in a file named Solution.java",
      lineNumber,
      explanation: "In Java, public classes must match their file name. Use 'class Solution' (package-private) instead of 'public class Solution'.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("cannot find symbol")) {
    const symbolMatch = stderr.match(/symbol:\s*(?:variable|class|method)\s+([^\n]+)/i);
    const sym = symbolMatch ? symbolMatch[1] : "";
    return {
      errorType: "Undefined Symbol",
      message: sym ? `Cannot find symbol: ${sym}` : "Cannot find symbol (variable, method, or class)",
      lineNumber,
      explanation: `The symbol ${sym ? `'${sym}' ` : ""}is not recognized. Check for typos, variable scope, or missing imports (e.g. import java.util.*;).`,
      rawStderr: stderr,
    };
  }

  if (stderr.includes("NullPointerException")) {
    return {
      errorType: "Null Pointer Exception",
      message: "java.lang.NullPointerException",
      lineNumber,
      explanation: "Attempted to call a method or access an attribute on a null reference. Verify object initialization.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("ArrayIndexOutOfBoundsException") || stderr.includes("IndexOutOfBoundsException")) {
    return {
      errorType: "Index Out of Bounds",
      message: extractLastNonEmptyLine(stderr),
      lineNumber,
      explanation: "Array or collection index is outside the valid range [0, length - 1].",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("StackOverflowError")) {
    return {
      errorType: "Stack Overflow",
      message: "java.lang.StackOverflowError",
      lineNumber,
      explanation: "Excessive recursion depth reached the memory stack limit. Check your recursion base condition.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("incompatible types")) {
    return {
      errorType: "Type Mismatch",
      message: extractFirstErrorLine(stderr),
      lineNumber,
      explanation: "Type mismatch: provided data type cannot be converted or assigned to the expected type.",
      rawStderr: stderr,
    };
  }

  return {
    errorType: stderr.includes("error:") ? "Compilation Error" : "Runtime Error",
    message: extractFirstErrorLine(stderr),
    lineNumber,
    explanation: stderr.includes("error:")
      ? "Java compilation failed. Check syntax and declarations."
      : "A Java runtime exception was thrown during execution.",
    rawStderr: stderr,
  };
}

// ── C++ Classifier ──────────────────────────────────────────────────────

function classifyCppError(stderr: string, lineOffset: number): ParsedError {
  // Extract line: code.cpp:12:5: error: ...
  const lineMatch = stderr.match(/:(\d+):\d+:\s*(?:error|fatal error):/i) || stderr.match(/:(\d+):\s*(?:error|fatal error):/i);
  const rawLine = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  const lineNumber = rawLine ? Math.max(1, rawLine - lineOffset) : undefined;

  if (stderr.includes("undefined reference to `main'") || stderr.includes("undefined reference to 'main'")) {
    return {
      errorType: "Missing main() Function",
      message: "undefined reference to `main'",
      lineNumber,
      explanation: "C++ executable requires a main() function or function harness. The platform automatically wraps functions.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("SIGSEGV") || stderr.includes("Segmentation fault") || stderr.includes("core dumped")) {
    return {
      errorType: "Segmentation Fault (SIGSEGV)",
      message: "Process terminated with signal SIGSEGV (Segmentation Fault)",
      lineNumber,
      explanation: "Invalid memory access. Check for out-of-bounds array/vector indexing, null pointer dereferencing, or uninitialized pointers.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("SIGFPE") || stderr.includes("Floating point exception")) {
    return {
      errorType: "Arithmetic Error (SIGFPE)",
      message: "Process terminated with signal SIGFPE (Floating Point Exception)",
      lineNumber,
      explanation: "An invalid arithmetic operation occurred, typically division or modulo by zero.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("expected ';'") || stderr.includes("expected ';' before")) {
    return {
      errorType: "Syntax Error (Missing Semicolon)",
      message: extractFirstErrorLine(stderr),
      lineNumber,
      explanation: "A semicolon ';' is missing at or near this line.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("was not declared in this scope")) {
    const varMatch = stderr.match(/'([^']+)' was not declared in this scope/);
    const varName = varMatch ? varMatch[1] : "";
    return {
      errorType: "Undeclared Identifier",
      message: varName ? `'${varName}' was not declared in this scope` : "Identifier not declared in this scope",
      lineNumber,
      explanation: `The identifier ${varName ? `'${varName}' ` : ""}is not recognized. Check declaration spelling, variable scope, or missing #include headers.`,
      rawStderr: stderr,
    };
  }

  return {
    errorType: stderr.includes("error:") ? "Compilation Error" : "Runtime Error",
    message: extractFirstErrorLine(stderr),
    lineNumber,
    explanation: stderr.includes("error:")
      ? "C++ compilation failed. Inspect syntax and types."
      : "Program crashed or terminated with a runtime error.",
    rawStderr: stderr,
  };
}

// ── JavaScript Classifier ───────────────────────────────────────────────

function classifyJsError(stderr: string, lineOffset: number): ParsedError {
  const lineMatch = stderr.match(/:(\d+):\d+/);
  const rawLine = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  const lineNumber = rawLine ? Math.max(1, rawLine - lineOffset) : undefined;

  if (stderr.includes("ReferenceError")) {
    return {
      errorType: "Reference Error",
      message: extractFirstErrorLine(stderr),
      lineNumber,
      explanation: "A variable is referenced that has not been declared in the current scope.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("TypeError")) {
    return {
      errorType: "Type Error",
      message: extractFirstErrorLine(stderr),
      lineNumber,
      explanation: "Attempted to access properties of undefined/null or invoked a non-function value.",
      rawStderr: stderr,
    };
  }

  if (stderr.includes("RangeError: Maximum call stack size exceeded")) {
    return {
      errorType: "Stack Overflow (Recursion Error)",
      message: "RangeError: Maximum call stack size exceeded",
      lineNumber,
      explanation: "The function entered infinite recursion and exceeded the maximum JavaScript call stack size.",
      rawStderr: stderr,
    };
  }

  return {
    errorType: "JavaScript Error",
    message: extractFirstErrorLine(stderr),
    lineNumber,
    explanation: "An unhandled JavaScript error occurred during execution.",
    rawStderr: stderr,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────

function extractFirstErrorLine(stderr: string): string {
  const lines = stderr.split("\n");
  const errorLine = lines.find((l) => l.includes("error:") || l.includes("Error:") || l.includes("Exception"));
  return (errorLine || lines[0] || "Error occurred").trim().slice(0, 160);
}

function extractLastNonEmptyLine(stderr: string): string {
  const lines = stderr.split("\n").map((l) => l.trim()).filter(Boolean);
  return (lines[lines.length - 1] || "Error occurred").slice(0, 160);
}
