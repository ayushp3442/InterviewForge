"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();

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
  const strengthColor = ["", "bg-warm-red", "bg-amber", "bg-amber-light", "bg-forest", "bg-forest"][passwordStrength];
  const strengthTextColor = ["", "text-warm-red", "text-amber", "text-amber-light", "text-forest", "text-forest"][passwordStrength];
  const confirmMismatch = confirm.length > 0 && password !== confirm;

  async function handleSignup() {
    if (!name || !email || !password || !confirm) { showError("All fields are required."); return; }
    if (name.trim().length < 2) { showError("Name must be at least 2 characters."); return; }
    if (password.length < 6) { showError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { showError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await signupUser(name.trim(), email, password);
      showSuccess("Account created! Redirecting to login...");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err: any) {
      showError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          {success ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-serif text-charcoal mb-1">Account created!</h2>
              <p className="text-sm text-stone">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-serif text-charcoal mb-1">Create your account</h1>
                <p className="text-sm text-stone">Start practising for your dream job</p>
              </div>

              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="label-board">Full name</label>
                  <input
                    type="text"
                    placeholder="Krishna Yadav"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="input-board"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label-board">Email</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="input-board"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="label-board">Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="input-board"
                  />
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor : "bg-stone-faint/20"}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-medium ${strengthTextColor}`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="label-board">Confirm password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className={`input-board ${
                      confirmMismatch
                        ? "!border-warm-red/50 focus:!border-warm-red/70 focus:!ring-warm-red/10"
                        : confirm && !confirmMismatch
                        ? "!border-forest/40 focus:!border-forest/60 focus:!ring-forest/10"
                        : ""
                    }`}
                  />
                  {confirmMismatch && (
                    <p className="text-[11px] text-warm-red mt-1.5">Passwords don&apos;t match</p>
                  )}
                  {confirm && !confirmMismatch && (
                    <p className="text-[11px] text-forest mt-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSignup}
                disabled={loading || confirmMismatch}
                className="btn-tactile w-full mt-5 py-3"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />Creating account...</>
                ) : "Create account"}
              </button>

              <p className="text-center text-xs text-stone mt-5">
                Already have an account?{" "}
                <a href="/login" className="text-gold hover:text-gold-muted font-medium transition-colors">Sign in</a>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-stone-faint mt-6">
          <a href="/" className="hover:text-stone transition-colors">← Back to InterviewForge</a>
        </p>
      </div>
    </div>
  );
}