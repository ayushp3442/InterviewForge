"use client";
import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lazy-load Monaco — SSR disabled (browser-only)
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// ── Custom dark theme matching InterviewForge zinc/amber palette ──
const INTERVIEWFORGE_DARK_THEME = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "comment", foreground: "6B6B6B", fontStyle: "italic" },
    { token: "keyword", foreground: "C9A45C" },        // gold
    { token: "string", foreground: "B8D89E" },          // soft green
    { token: "number", foreground: "D4A017" },           // amber
    { token: "type", foreground: "7DC4E4" },             // teal
    { token: "function", foreground: "E6B422" },         // amber-light
    { token: "variable", foreground: "E0D6C8" },         // warm white
    { token: "operator", foreground: "B0B0B0" },
  ],
  colors: {
    "editor.background": "#1C1C1E",
    "editor.foreground": "#E0D6C8",
    "editor.lineHighlightBackground": "#2A2A2C",
    "editor.selectionBackground": "#C9A45C33",
    "editorCursor.foreground": "#C9A45C",
    "editorLineNumber.foreground": "#4A4A4A",
    "editorLineNumber.activeForeground": "#C9A45C",
    "editor.inactiveSelectionBackground": "#C9A45C1A",
    "editorIndentGuide.background": "#2A2A2C",
    "editorIndentGuide.activeBackground": "#3A3A3A",
    "editorWidget.background": "#1C1C1E",
    "editorWidget.border": "#2A2A2C",
    "input.background": "#2A2A2C",
    "input.border": "#3A3A3A",
    "scrollbar.shadow": "#00000000",
    "scrollbarSlider.background": "#C9A45C22",
    "scrollbarSlider.hoverBackground": "#C9A45C44",
    "scrollbarSlider.activeBackground": "#C9A45C66",
  },
};

// ── Language config ──
const LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
};

const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

interface CodeEditorProps {
  language: string;
  starterCode: Record<string, string>;
  sessionId: number;
  questionId: number;
  onLanguageChange: (lang: string) => void;
  onCodeChange: (code: string) => void;
  supportedLanguages?: string[];
}

export default function CodeEditor({
  language,
  starterCode,
  sessionId,
  questionId,
  onLanguageChange,
  onCodeChange,
  supportedLanguages = ["python", "javascript", "java", "cpp"],
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [fontSize, setFontSize] = useState(14);

  // ── Scoped localStorage key ──
  const storageKey = `ifg_code_${sessionId}_${questionId}_${language}`;

  // ── Load saved code or starter code ──
  const getInitialCode = useCallback(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) return saved;
    }
    return starterCode[language] || "// Start coding here...\n";
  }, [storageKey, starterCode, language]);

  const [code, setCode] = useState(getInitialCode);

  // ── Sync on language change ──
  useEffect(() => {
    const newCode = getInitialCode();
    setCode(newCode);
    onCodeChange(newCode);
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
  }, [language, getInitialCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save to localStorage on code change ──
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || "";
      setCode(newCode);
      onCodeChange(newCode);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, newCode);
      }
    },
    [storageKey, onCodeChange]
  );

  // ── Theme setup ──
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monaco.editor.defineTheme("interviewforge-dark", INTERVIEWFORGE_DARK_THEME);
    monaco.editor.setTheme("interviewforge-dark");
  }, []);

  // ── Reset code ──
  const handleReset = useCallback(() => {
    const starter = starterCode[language] || "";
    setCode(starter);
    onCodeChange(starter);
    if (editorRef.current) {
      editorRef.current.setValue(starter);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  }, [language, starterCode, storageKey, onCodeChange]);

  return (
    <div className="flex flex-col h-full bg-[#1C1C1E] rounded-xl overflow-hidden border border-[#2A2A2C]">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#141416] border-b border-[#2A2A2C]">
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-[#2A2A2C] text-[#E0D6C8] text-xs px-2.5 py-1.5 rounded-lg border border-[#3A3A3A] focus:border-[#C9A45C] focus:outline-none transition-colors cursor-pointer"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGE_LABELS[lang] || lang}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Font size */}
          <button
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            className="p-1.5 text-[#6B6B6B] hover:text-[#C9A45C] transition-colors rounded"
            title="Decrease font size"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <span className="text-[10px] text-[#6B6B6B] font-mono w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            className="p-1.5 text-[#6B6B6B] hover:text-[#C9A45C] transition-colors rounded"
            title="Increase font size"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="w-px h-4 bg-[#2A2A2C] mx-1" />

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#6B6B6B] hover:text-[#C9A45C] transition-colors rounded"
            title="Reset to starter code"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={LANGUAGE_MAP[language] || "plaintext"}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: "on",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            suggest: { showKeywords: true, showSnippets: true },
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}
