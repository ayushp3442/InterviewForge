"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSignup() {
    setError("");

    // Client-side validation
    if (!name || !email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signupUser(name.trim(), email, password);
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSignup();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-lg font-medium">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start practicing for your dream job</p>
        </div>

        <label className="text-sm text-gray-600 block mb-1">Full name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Krishna Yadav"
        />

        <label className="text-sm text-gray-600 block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="name@college.edu"
        />

        <label className="text-sm text-gray-600 block mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Min. 6 characters"
        />

        <label className="text-sm text-gray-600 block mb-1">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full border rounded-lg px-3 py-2 mb-5 text-sm focus:outline-none focus:ring-2 ${
            confirm && password !== confirm
              ? "border-red-400 focus:ring-red-400"
              : "focus:ring-gray-900"
          }`}
          placeholder="Re-enter password"
        />

        {error && <p className="text-xs text-red-600 mb-3 text-center">{error}</p>}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}