"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [count, setCount] = useState(10);

  // Auto-redirect countdown
  useEffect(() => {
    if (count <= 0) { router.push("/dashboard"); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-blue-600/8 via-violet-600/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        {/* 404 big number */}
        <div className="relative mb-6">
          <p className="text-[120px] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 0.25,
            }}
          >
            404
          </p>
          {/* Icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Redirecting to dashboard in <span className="text-blue-400 font-semibold tabular-nums">{count}s</span>...
        </p>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(count / 10) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm font-medium text-white/60 hover:text-white/90 transition-all"
          >
            ← Go back
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mt-10 opacity-30">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xs text-white font-semibold tracking-tight">InterviewForge</span>
        </div>
      </div>
    </div>
  );
}
