"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    // TODO: connect to real API later
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-lg font-medium">InterviewForge AI</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <label className="text-sm text-gray-600 block mb-1">Email</label>
        <input
          type="email"
          placeholder="name@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
        />

        <label className="text-sm text-gray-600 block mb-1">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-2 text-sm"
        />

        <div className="text-right mb-5">
          <a href="#" className="text-xs text-blue-600">Forgot password?</a>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600">Sign up</a>
        </p>
      </div>
    </div>
  );
}