"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInterview, addQuestionsToInterview, getLatestResume } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";

const categories = ["Technical", "HR", "Mixed"];
const roles = ["Backend Developer", "Frontend Developer", "Full Stack Developer", "Data Analyst"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const modes = ["Text"];
const modesComingSoon = ["Voice"];

function InterviewSetupContent() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeLinked, setResumeLinked] = useState(false);
  const [resumeSkillCount, setResumeSkillCount] = useState(0);

  const canStart = category && role && difficulty && mode && !loading;

  useEffect(() => {
    async function checkResume() {
      try {
        const res = await getLatestResume();
        if (res?.resume?.parsedJson) {
          const skills = res.resume.parsedJson.skills ?? [];
          setResumeLinked(true);
          setResumeSkillCount(Array.isArray(skills) ? skills.length : 0);
        }
      } catch { /* no resume — silent */ }
    }
    checkResume();
  }, []);

  async function handleStart() {
    setError(""); setLoading(true);
    try {
      const createRes = await createInterview({ type: category, role, domain: role, difficulty, mode });
      const interviewId = createRes.interview.id;
      await addQuestionsToInterview(interviewId);
      router.push(`/interview/${interviewId}`);
    } catch (err: any) {
      setError(err.message || "Failed to start interview. Please ensure the server is running.");
    } finally { setLoading(false); }
  }

  function PillGroup({
    options,
    selected,
    onSelect,
    disabledOptions = [],
  }: {
    options: string[];
    selected: string;
    onSelect: (v: string) => void;
    disabledOptions?: string[];
  }) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              selected === opt
                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08]"
            }`}
          >
            {opt}
          </button>
        ))}
        {disabledOptions.map((opt) => (
          <div key={opt} className="relative group">
            <button
              disabled
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.02] border border-white/[0.05] text-white/20 cursor-not-allowed flex items-center gap-1.5"
            >
              {opt}
              <span className="text-[9px] bg-white/10 text-white/30 px-1 py-0.5 rounded font-semibold tracking-wide">SOON</span>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1a1a2e] border border-white/10 rounded-lg text-[11px] text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              🎙️ Voice mode coming soon
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 lg:py-10 flex items-start justify-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">Set up your interview</h1>
          <p className="text-white/40 text-sm">Choose your preferences to get tailored AI questions</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-6 space-y-6">
          {/* Resume status */}
          {resumeLinked ? (
            <div className="flex items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl px-3.5 py-2.5">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-emerald-400 font-medium">
                Resume linked — {resumeSkillCount > 0 ? `${resumeSkillCount} skills detected` : "questions will be personalized"}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5">
              <p className="text-xs text-white/30">No resume uploaded</p>
              <button onClick={() => router.push("/resume-upload")} className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Upload now →
              </button>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2.5">Interview Type</label>
            <PillGroup options={categories} selected={category} onSelect={setCategory} />
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2.5">Target Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a2e]">Select a role...</option>
                {roles.map((r) => <option key={r} value={r} className="bg-[#1a1a2e]">{r}</option>)}
              </select>
              <svg className="w-4 h-4 text-white/25 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2.5">Difficulty</label>
            <PillGroup options={difficulties} selected={difficulty} onSelect={setDifficulty} />
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2.5">Mode</label>
            <PillGroup options={modes} selected={mode} onSelect={setMode} disabledOptions={modesComingSoon} />
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating AI questions...</>
            ) : "Start Interview →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewSetupPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <InterviewSetupContent />
      </AppLayout>
    </AuthGuard>
  );
}