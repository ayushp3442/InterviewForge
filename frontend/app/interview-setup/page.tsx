"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInterview, addQuestionsToInterview } from "@/lib/api";
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

  const canStart = category && role && difficulty && mode && !loading;

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

      // 2. Generate and add questions via Gemini
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
        <p className="text-sm text-gray-500 mb-6 text-center">
          Choose your preferences to get started
        </p>

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