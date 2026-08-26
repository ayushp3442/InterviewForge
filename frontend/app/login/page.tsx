"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin();
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
          onKeyDown={handleKeyDown}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />

        <label className="text-sm text-gray-600 block mb-1">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />

        <div className="text-right mb-5">
          <a href="#" className="text-xs text-blue-600">Forgot password?</a>
        </div>

        {error && <p className="text-xs text-red-600 mb-3 text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}