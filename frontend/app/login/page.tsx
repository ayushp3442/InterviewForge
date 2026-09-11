"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    if (isLoggedIn()) router.replace("/dashboard");
  }, [router]);

  async function handleLogin() {
    if (!email || !password) { showError("Please enter both email and password."); return; }
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      showSuccess("Welcome back! Signing you in...");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: any) {
      showError(err.message || "Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      {/* Subtle warm glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center">
            <span className="text-xs font-bold text-gold tracking-tight">IF</span>
          </div>
          <span className="text-lg font-semibold text-charcoal tracking-tight">
            Interview<span className="font-bold">Forge</span>
          </span>
        </div>

        {/* Card */}
        <div className="card-board-gold p-8">
          <div className="mb-6">
            <h1 className="text-xl font-serif text-charcoal mb-1">Welcome back</h1>
            <p className="text-sm text-stone">Sign in to continue your journey</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-board">Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="input-board"
              />
            </div>
            <div>
              <label className="label-board">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="input-board"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-tactile w-full mt-5 py-3"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />Signing in...</>
            ) : "Sign in"}
          </button>

          <p className="text-center text-xs text-stone mt-5">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-gold hover:text-gold-muted font-medium transition-colors">Create one</a>
          </p>
        </div>

        <p className="text-center text-xs text-stone-faint mt-6">
          <a href="/" className="hover:text-stone transition-colors">← Back to InterviewForge</a>
        </p>
      </div>
    </div>
  );
}