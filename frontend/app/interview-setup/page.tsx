"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["Technical", "HR", "Mixed"];
const roles = ["Backend Developer", "Frontend Developer", "Full Stack Developer", "Data Analyst"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const modes = ["Text", "Voice (Beta)"];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [mode, setMode] = useState("");

  const canStart = category && role && difficulty && mode;

  function handleStart() {
    // TODO: call POST /api/interviews with { type: category, role, difficulty, mode }
    // for now, use a placeholder session id
    router.push("/interview/placeholder-session");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm border border-gray-200">
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
              className={`text-sm py-2 rounded-lg border ${
                category === c
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300"
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
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
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
              className={`text-sm py-2 rounded-lg border ${
                difficulty === d
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300"
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
              className={`text-sm py-2 rounded-lg border ${
                mode === m
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}