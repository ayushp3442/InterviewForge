"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInterview, addQuestionsToInterview, getLatestResume } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

const categories = ["Technical", "HR", "Mixed"];
const roles = ["Backend Developer", "Frontend Developer", "Full Stack Developer", "Data Analyst"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const modes = ["Text", "Voice (Beta)"];

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

  // Check if user has a parsed resume on mount
  useEffect(() => {
    async function checkResume() {
      try {
        const res = await getLatestResume();
        if (res?.resume?.parsedJson) {
          const skills = res.resume.parsedJson.skills ?? [];
          setResumeLinked(true);
          setResumeSkillCount(Array.isArray(skills) ? skills.length : 0);
        }
      } catch {
        // No resume — silent, not an error
      }
    }
    checkResume();
  }, []);

  async function handleStart() {
    setError("");
    setLoading(true);
    try {
      // 1. Create interview session
      const createRes = await createInterview({
        type: category,
        role,
        domain: role, // Use role as domain scope
        difficulty,
        mode,
      });

      const interviewId = createRes.interview.id;

      // 2. Generate and add questions via Gemini (resume skills wired in backend)
      await addQuestionsToInterview(interviewId);

      // 3. Redirect to active interview session page
      router.push(`/interview/${interviewId}`);
    } catch (err: any) {
      console.error("Start interview error:", err);
      setError(err.message || "Failed to start interview. Please ensure database and server are running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-lg font-medium mb-1 text-center">Set up your interview</h1>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Choose your preferences to get started
        </p>

        {/* Resume linked badge */}
        {resumeLinked ? (
          <div className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 w-fit mx-auto">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Resume linked — {resumeSkillCount > 0 ? `${resumeSkillCount} skills detected` : "questions will be personalized"}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-6">
            <span>No resume uploaded.</span>
            <button
              onClick={() => router.push("/resume-upload")}
              className="text-gray-600 underline hover:text-gray-900 transition-colors"
            >
              Upload now →
            </button>
          </div>
        )}

        {/* Category */}
        <label className="text-sm text-gray-600 block mb-1">Category</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-sm py-2 rounded-lg border transition-colors ${
                category === c
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Role */}
        <label className="text-sm text-gray-600 block mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Select a role</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Difficulty */}
        <label className="text-sm text-gray-600 block mb-1">Difficulty</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`text-sm py-2 rounded-lg border transition-colors ${
                difficulty === d
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Mode */}
        <label className="text-sm text-gray-600 block mb-1">Mode</label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-sm py-2 rounded-lg border transition-colors ${
                mode === m
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-600 mb-3 text-center">{error}</p>}

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          {loading ? "Generating AI questions..." : "Start Interview"}
        </button>
      </div>
    </div>
  );
}

export default function InterviewSetupPage() {
  return (
    <AuthGuard>
      <InterviewSetupContent />
    </AuthGuard>
  );
}