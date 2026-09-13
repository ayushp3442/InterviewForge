/**
 * Output Comparator — InterviewForge
 *
 * Robust output comparison engine for coding challenge evaluations:
 * - Normalizes line endings (\r\n vs \n)
 * - Trims insignificant trailing whitespace per line and overall string
 * - Structured comparison for JSON/Arrays (e.g. [1, 2] == [1,2], ['a', 'b'])
 * - Case-insensitive comparison for boolean outputs (true == True)
 * - Floating point tolerance for numeric outputs (1e-5 epsilon)
 * - Preserves meaningful internal spacing and case sensitivity in strings
 */

export interface ComparisonResult {
  passed: boolean;
  normalizedActual: string;
  normalizedExpected: string;
  matchType: "exact" | "whitespace_normalized" | "json_structural" | "boolean" | "numeric_float" | "mismatch";
}

/**
 * Compare candidate actual stdout against expected output.
 */
export function compareOutputs(actual: string, expected: string): ComparisonResult {
  // 1. Raw exact match
  if (actual === expected) {
    return {
      passed: true,
      normalizedActual: actual,
      normalizedExpected: expected,
      matchType: "exact",
    };
  }

  // 2. Normalize line endings and trailing whitespace
  const normActual = normalizeString(actual);
  const normExpected = normalizeString(expected);

  if (normActual === normExpected) {
    return {
      passed: true,
      normalizedActual: normActual,
      normalizedExpected: normExpected,
      matchType: "whitespace_normalized",
    };
  }

  // 3. Boolean normalization (e.g., Python "True" vs JS/Java "true")
  if (isBooleanMatch(normActual, normExpected)) {
    return {
      passed: true,
      normalizedActual: normActual,
      normalizedExpected: normExpected,
      matchType: "boolean",
    };
  }

  // 4. Numeric float tolerance (e.g., 3.14159 vs 3.141590)
  if (isNumericFloatMatch(normActual, normExpected)) {
    return {
      passed: true,
      normalizedActual: normActual,
      normalizedExpected: normExpected,
      matchType: "numeric_float",
    };
  }

  // 5. JSON / Structured Array comparison
  if (isStructuredMatch(normActual, normExpected)) {
    return {
      passed: true,
      normalizedActual: normActual,
      normalizedExpected: normExpected,
      matchType: "json_structural",
    };
  }

  return {
    passed: false,
    normalizedActual: normActual,
    normalizedExpected: normExpected,
    matchType: "mismatch",
  };
}

/**
 * Normalize line endings, remove carriage returns, and trim trailing line spaces.
 */
export function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Compare boolean strings case-insensitively.
 */
function isBooleanMatch(a: string, b: string): boolean {
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();
  if ((lowerA === "true" || lowerA === "false") && (lowerB === "true" || lowerB === "false")) {
    return lowerA === lowerB;
  }
  return false;
}

/**
 * Compare numbers with epsilon tolerance for floating-point accuracy.
 */
function isNumericFloatMatch(a: string, b: string, epsilon = 1e-5): boolean {
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB) && a !== "" && b !== "") {
    return Math.abs(numA - numB) <= epsilon;
  }
  return false;
}

/**
 * Try parsing both strings as JSON/arrays and test deep structural equality.
 */
function isStructuredMatch(a: string, b: string): boolean {
  // Only attempt if strings resemble JSON arrays or objects
  const startsA = a.startsWith("[") || a.startsWith("{");
  const startsB = b.startsWith("[") || b.startsWith("{");

  if (!startsA && !startsB) return false;

  try {
    const parsedA = parseLenientJson(a);
    const parsedB = parseLenientJson(b);
    return deepEquals(parsedA, parsedB);
  } catch {
    return false;
  }
}

/**
 * Parse JSON or Python-style list/dict (single quotes converted to double quotes).
 */
function parseLenientJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    // Try converting Python-style single quotes to double quotes, True/False to true/false
    const jsonStr = str
      .replace(/'/g, '"')
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bNone\b/g, "null");
    return JSON.parse(jsonStr);
  }
}

/**
 * Deep equality check for primitives, arrays, and objects.
 */
function deepEquals(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) {
    // Allow comparing string boolean to boolean
    if (typeof a === "boolean" && typeof b === "string") return String(a) === b.toLowerCase();
    if (typeof b === "boolean" && typeof a === "string") return String(b) === a.toLowerCase();
    return false;
  }

  if (typeof a === "number") {
    return Math.abs(a - b) <= 1e-5;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEquals(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}
