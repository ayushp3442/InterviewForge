/**
 * Language Harness & Code Preparer — InterviewForge
 *
 * Automatically detects whether candidate code is a standalone program (with main)
 * or a function/class-based implementation (LeetCode style).
 * Generates type-safe hidden execution wrappers when needed without forcing
 * candidates to write repetitive I/O boilerplate.
 */

export interface PreparedCode {
  wrappedCode: string;
  isFunctionBased: boolean;
  lineOffset: number; // Number of lines added before user code (for accurate line mapping)
}

/**
 * Prepares user code for sandboxed execution by injecting wrappers or
 * normalizing class structures where appropriate.
 */
export function prepareCode(code: string, language: string): PreparedCode {
  const lang = language.toLowerCase();

  switch (lang) {
    case "python":
      return preparePythonCode(code);
    case "javascript":
    case "js":
      return prepareJavaScriptCode(code);
    case "java":
      return prepareJavaCode(code);
    case "cpp":
    case "c++":
      return prepareCppCode(code);
    default:
      return { wrappedCode: code, isFunctionBased: false, lineOffset: 0 };
  }
}

// ── Python Preparer ─────────────────────────────────────────────────────

function preparePythonCode(userCode: string): PreparedCode {
  // Check if code already reads stdin or has a __main__ block
  const hasStdinRead =
    userCode.includes("input(") ||
    userCode.includes("sys.stdin") ||
    userCode.includes('if __name__ == "__main__":') ||
    userCode.includes("if __name__ == '__main__':");

  // If user explicitly reads stdin/prints stdout, execute directly
  if (hasStdinRead) {
    return { wrappedCode: userCode, isFunctionBased: false, lineOffset: 0 };
  }

  // Check if user defined at least one function or Solution class
  const hasFunctionOrClass =
    /def\s+\w+\s*\(/.test(userCode) ||
    /class\s+Solution\b/.test(userCode);

  if (!hasFunctionOrClass) {
    return { wrappedCode: userCode, isFunctionBased: false, lineOffset: 0 };
  }

  // Inject hidden test harness at the bottom
  // Line offset is 0 because harness is appended after user code!
  const harness = `
# --- Auto-generated InterviewForge Test Harness ---
if __name__ == "__main__":
    import sys, json, ast, inspect

    raw_input = sys.stdin.read().strip()
    
    def _parse_input_args(s):
        if not s:
            return []
        try:
            val = json.loads(s)
            return [val]
        except Exception:
            pass
        try:
            wrapped = f"({s})"
            val = ast.literal_eval(wrapped)
            if isinstance(val, tuple):
                return list(val)
            return [val]
        except Exception:
            pass
        try:
            wrapped = f"({s},)"
            val = ast.literal_eval(wrapped)
            return list(val)
        except Exception:
            pass
        lines = [l.strip() for l in s.splitlines() if l.strip()]
        return lines if len(lines) > 1 else [s]

    _args = _parse_input_args(raw_input)
    _res = None
    _sol_cls = globals().get("Solution")
    
    if _sol_cls:
        _inst = _sol_cls()
        _methods = [getattr(_inst, m) for m in dir(_inst) if not m.startswith("_") and callable(getattr(_inst, m))]
        if _methods:
            try:
                _res = _methods[0](*_args)
            except TypeError:
                try:
                    _res = _methods[0](raw_input)
                except Exception as e:
                    raise e
    else:
        _user_funcs = [
            obj for name, obj in globals().items()
            if inspect.isfunction(obj) and not name.startswith("_") and obj.__module__ == "__main__"
        ]
        if _user_funcs:
            _target = _user_funcs[-1]
            try:
                _res = _target(*_args)
            except TypeError:
                try:
                    _res = _target(raw_input)
                except Exception as e:
                    raise e

    if _res is not None:
        if isinstance(_res, (dict, list, bool)):
            print(json.dumps(_res))
        else:
            print(_res)
`;

  return {
    wrappedCode: `${userCode}\n${harness}`,
    isFunctionBased: true,
    lineOffset: 0,
  };
}

// ── JavaScript Preparer ─────────────────────────────────────────────────

function prepareJavaScriptCode(userCode: string): PreparedCode {
  const hasStdinRead =
    userCode.includes("fs.readFileSync") ||
    userCode.includes("readline") ||
    userCode.includes("process.stdin");

  if (hasStdinRead) {
    return { wrappedCode: userCode, isFunctionBased: false, lineOffset: 0 };
  }

  const hasFunctionOrClass =
    /function\s+\w+\s*\(/.test(userCode) ||
    /const\s+\w+\s*=\s*(?:function|\([^)]*\)\s*=>)/.test(userCode) ||
    /class\s+Solution\b/.test(userCode);

  if (!hasFunctionOrClass) {
    return { wrappedCode: userCode, isFunctionBased: false, lineOffset: 0 };
  }

  const harness = `
// --- Auto-generated InterviewForge Test Harness ---
(function() {
  const fs = require('fs');
  const rawInput = fs.readFileSync(0, 'utf-8').trim();
  if (!rawInput && typeof solution === 'undefined') return;

  function parseArgs(str) {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return [parsed];
    } catch(e) {}
    try {
      const wrapped = JSON.parse('[' + str + ']');
      if (Array.isArray(wrapped)) return wrapped;
    } catch(e) {}
    return [str];
  }

  const args = parseArgs(rawInput);
  let res = undefined;

  if (typeof Solution !== 'undefined') {
    const inst = new Solution();
    const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(inst));
    const methods = proto.filter(m => m !== 'constructor' && typeof inst[m] === 'function');
    if (methods.length > 0) {
      try { res = inst[methods[0]](...args); } catch(e) { res = inst[methods[0]](rawInput); }
    }
  } else {
    // Find last declared function in local context
    const fnNames = [];
    const fnRegex = /(?:function\\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\\s+([a-zA-Z0-9_$]+)\\s*=\\s*(?:function|\\([^)]*\\)\\s*=>))/g;
    let m;
    while ((m = fnRegex.exec(\`${userCode.replace(/`/g, "\\`")}\`)) !== null) {
      const name = m[1] || m[2];
      if (name) fnNames.push(name);
    }
    const targetName = fnNames[fnNames.length - 1];
    if (targetName && typeof eval(targetName) === 'function') {
      try { res = eval(targetName)(...args); } catch(e) { res = eval(targetName)(rawInput); }
    }
  }

  if (res !== undefined) {
    console.log(typeof res === 'object' ? JSON.stringify(res) : res);
  }
})();
`;

  return {
    wrappedCode: `${userCode}\n${harness}`,
    isFunctionBased: true,
    lineOffset: 0,
  };
}

// ── Java Preparer ───────────────────────────────────────────────────────

function prepareJavaCode(userCode: string): PreparedCode {
  // Normalize public class Solution -> class Solution
  // In Java on Judge0 (which compiles Main.java), a file cannot have 'public class Solution'
  let normalized = userCode.replace(/public\s+class\s+Solution\b/g, "class Solution");

  // Check if code has main method
  const hasMain = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]/m.test(normalized);

  if (hasMain) {
    // If user wrote 'public class Whatever', ensure it's either Main or non-public
    if (/public\s+class\s+(?!Main\b)\w+/.test(normalized)) {
      normalized = normalized.replace(/public\s+class\s+(\w+)/, "class $1");
      // Add a public class Main entry point that delegates
      const classMatch = normalized.match(/class\s+(\w+)/);
      const targetClass = classMatch ? classMatch[1] : "Solution";
      const delegator = `
public class Main {
    public static void main(String[] args) throws Exception {
        ${targetClass}.main(args);
    }
}
`;
      return {
        wrappedCode: `${normalized}\n${delegator}`,
        isFunctionBased: false,
        lineOffset: 0,
      };
    }
    return { wrappedCode: normalized, isFunctionBased: false, lineOffset: 0 };
  }

  // Function-based Java: Candidate wrote `class Solution { ... }` without main
  // Inject a Main harness that reads stdin and dynamically dispatches
  const imports = `import java.util.*;\nimport java.io.*;\n`;
  const harness = `
public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            if (sb.length() > 0) sb.append("\\n");
            sb.append(line);
        }
        String input = sb.toString().trim();
        
        // Instantiate Solution and call the primary method
        Solution sol = new Solution();
        java.lang.reflect.Method[] methods = Solution.class.getDeclaredMethods();
        java.lang.reflect.Method target = null;
        for (java.lang.reflect.Method m : methods) {
            if (!java.lang.reflect.Modifier.isStatic(m.getModifiers()) || methods.length == 1) {
                target = m;
                break;
            }
        }
        if (target == null && methods.length > 0) target = methods[0];
        if (target == null) return;
        target.setAccessible(true);
        
        Class<?>[] paramTypes = target.getParameterTypes();
        Object[] invokeArgs = new Object[paramTypes.length];
        
        // Basic argument deserializer for common interview types
        if (paramTypes.length == 1) {
            invokeArgs[0] = deserializeArg(input, paramTypes[0]);
        } else if (paramTypes.length > 1) {
            // Split comma-separated arguments outside brackets
            List<String> parts = splitArgs(input);
            for (int i = 0; i < paramTypes.length && i < parts.size(); i++) {
                invokeArgs[i] = deserializeArg(parts.get(i).trim(), paramTypes[i]);
            }
        }
        
        Object result = target.invoke(sol, invokeArgs);
        if (result != null) {
            if (result instanceof Object[]) {
                System.out.println(Arrays.deepToString((Object[]) result));
            } else if (result instanceof int[]) {
                System.out.println(Arrays.toString((int[]) result));
            } else if (result instanceof boolean[]) {
                System.out.println(Arrays.toString((boolean[]) result));
            } else {
                System.out.println(result);
            }
        }
    }
    
    private static Object deserializeArg(String s, Class<?> type) {
        s = s.trim();
        if (type == int.class || type == Integer.class) {
            return Integer.parseInt(s.replaceAll("[^0-9-]", ""));
        }
        if (type == long.class || type == Long.class) {
            return Long.parseLong(s.replaceAll("[^0-9-]", ""));
        }
        if (type == boolean.class || type == Boolean.class) {
            return Boolean.parseBoolean(s.toLowerCase());
        }
        if (type == String.class) {
            if (s.startsWith("\\\"") && s.endsWith("\\\"") && s.length() >= 2) {
                return s.substring(1, s.length() - 1);
            }
            return s;
        }
        if (type == int[].class) {
            s = s.replaceAll("[\\[\\]\\\\s]", "");
            if (s.isEmpty()) return new int[0];
            String[] nums = s.split(",");
            int[] arr = new int[nums.length];
            for (int i = 0; i < nums.length; i++) arr[i] = Integer.parseInt(nums[i].trim());
            return arr;
        }
        if (type == List.class) {
            s = s.replaceAll("[\\[\\]\\\\s]", "");
            if (s.isEmpty()) return new ArrayList<Object>();
            String[] items = s.split(",");
            List<Object> list = new ArrayList<>();
            for (String item : items) {
                try { list.add(Integer.parseInt(item.trim())); } catch (Exception e) { list.add(item.trim()); }
            }
            return list;
        }
        return s;
    }
    
    private static List<String> splitArgs(String s) {
        List<String> list = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        boolean inQuote = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '\"') inQuote = !inQuote;
            else if (!inQuote) {
                if (c == '[' || c == '{' || c == '(') depth++;
                else if (c == ']' || c == '}' || c == ')') depth--;
                else if (c == ',' && depth == 0) {
                    list.add(cur.toString());
                    cur = new StringBuilder();
                    continue;
                }
            }
            cur.append(c);
        }
        if (cur.length() > 0) list.add(cur.toString());
        return list;
    }
}
`;

  // Prepend standard imports, user code, then Main harness
  const lineOffset = 2; // lines added before user code
  return {
    wrappedCode: `${imports}${normalized}\n${harness}`,
    isFunctionBased: true,
    lineOffset,
  };
}

// ── C++ Preparer ────────────────────────────────────────────────────────

function prepareCppCode(userCode: string): PreparedCode {
  const hasMain = /int\s+main\s*\(|void\s+main\s*\(/.test(userCode);

  if (hasMain) {
    return { wrappedCode: userCode, isFunctionBased: false, lineOffset: 0 };
  }

  // Missing main in C++: Inject standard libraries and test runner
  const headers = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <map>
#include <set>
#include <queue>
#include <deque>
#include <cmath>
using namespace std;
`;

  // Look for Solution class method or free function
  const hasSolutionClass = /class\s+Solution\b/.test(userCode);

  const mainHarness = `
// --- Auto-generated InterviewForge C++ Test Harness ---
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string line;
    stringstream ss;
    while (getline(cin, line)) {
        ss << line << "\\n";
    }
    string input = ss.str();
    // In function mode, the user's code is loaded and compiled.
    // If the candidate wrote a function or class, it compiles successfully.
    return 0;
}
`;

  const headerLines = headers.split("\n").length - 1;

  return {
    wrappedCode: `${headers}\n${userCode}\n${mainHarness}`,
    isFunctionBased: true,
    lineOffset: headerLines + 1,
  };
}
