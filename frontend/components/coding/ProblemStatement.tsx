"use client";

interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

interface ProblemStatementProps {
  title: string;
  difficulty: string;
  description: string;
  constraints?: string;
  visibleTestCases: TestCase[];
  sourceSkill?: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ProblemStatement({
  title,
  difficulty,
  description,
  constraints,
  visibleTestCases,
  sourceSkill,
}: ProblemStatementProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#141416] rounded-xl border border-[#2A2A2C]">
      <div className="p-5 space-y-5">
        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                DIFFICULTY_STYLES[difficulty] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
              }`}
            >
              {difficulty}
            </span>
            {sourceSkill && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#C9A45C]/20 bg-[#C9A45C]/5 text-[#C9A45C] font-medium">
                {sourceSkill}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-[#E0D6C8]">{title}</h2>
        </div>

        {/* ── Description ── */}
        <div className="text-sm text-[#B0B0B0] leading-relaxed whitespace-pre-wrap">
          {description}
        </div>

        {/* ── Constraints ── */}
        {constraints && (
          <div>
            <h3 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
              Constraints
            </h3>
            <div className="text-xs text-[#8A8A8A] font-mono bg-[#1C1C1E] rounded-lg p-3 border border-[#2A2A2C] whitespace-pre-wrap">
              {constraints}
            </div>
          </div>
        )}

        {/* ── Examples ── */}
        <div>
          <h3 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">
            Examples
          </h3>
          <div className="space-y-3">
            {visibleTestCases.map((tc, i) => (
              <div
                key={i}
                className="bg-[#1C1C1E] rounded-lg border border-[#2A2A2C] p-3 space-y-2"
              >
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
                    Input
                  </span>
                  <pre className="text-xs text-[#E0D6C8] font-mono mt-0.5 whitespace-pre-wrap">
                    {tc.input}
                  </pre>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
                    Output
                  </span>
                  <pre className="text-xs text-[#E0D6C8] font-mono mt-0.5 whitespace-pre-wrap">
                    {tc.expectedOutput}
                  </pre>
                </div>
                {tc.explanation && (
                  <div className="pt-1 border-t border-[#2A2A2C]">
                    <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-medium">
                      Explanation
                    </span>
                    <p className="text-xs text-[#8A8A8A] mt-0.5">{tc.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
