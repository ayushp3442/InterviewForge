"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) router.replace("/dashboard");
  }, [router]);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500", "bg-emerald-400"][passwordStrength];
  const confirmMismatch = confirm.length > 0 && password !== confirm;

  async function handleSignup() {
    setError("");
    if (!name || !email || !password || !confirm) { setError("All fields are required."); return; }
    if (name.trim().length < 2) { setError("Name must be at least 2 characters."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await signupUser(name.trim(), email, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-violet-600/10 via-blue-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">InterviewForge</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
          {success ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Account created!</h2>
              <p className="text-sm text-white/40">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
                <p className="text-sm text-white/40">Start practising for your dream job</p>
              </div>

              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Full name</label>
                  <input
                    type="text"
                    placeholder="Krishna Yadav"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor : "bg-white/10"}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-medium ${["", "text-red-400", "text-amber-400", "text-yellow-400", "text-emerald-400", "text-emerald-400"][passwordStrength]}`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Confirm password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none transition-colors ${
                      confirmMismatch
                        ? "border-red-500/50 focus:border-red-500/70"
                        : confirm && !confirmMismatch
                        ? "border-emerald-500/40 focus:border-emerald-500/60"
                        : "border-white/[0.08] focus:border-blue-500/50"
                    }`}
                  />
                  {confirmMismatch && (
                    <p className="text-[11px] text-red-400 mt-1.5">Passwords don&apos;t match</p>
                  )}
                  {confirm && !confirmMismatch && (
                    <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-center gap-2 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSignup}
                disabled={loading || confirmMismatch}
                className="w-full mt-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
                ) : "Create account"}
              </button>

              <p className="text-center text-xs text-white/30 mt-5">
                Already have an account?{" "}
                <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</a>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-white/15 mt-6">
          <a href="/" className="hover:text-white/30 transition-colors">← Back to InterviewForge</a>
        </p>
      </div>
    </div>
  );
}