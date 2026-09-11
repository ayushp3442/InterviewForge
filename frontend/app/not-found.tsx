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
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="relative text-center max-w-md">
        {/* 404 big number */}
        <div className="relative mb-6">
          <p className="text-[120px] font-black leading-none select-none text-charcoal/[0.06]">
            404
          </p>
          {/* Icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gold/[0.08] border border-gold/15 flex items-center justify-center">
              <svg className="w-10 h-10 text-gold/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-serif text-charcoal mb-2">Page not found</h1>
        <p className="text-stone text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Redirecting to dashboard in <span className="text-gold font-semibold tabular-nums">{count}s</span>...
        </p>

        {/* Progress bar */}
        <div className="h-0.5 bg-stone-faint/20 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(count / 10) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="btn-ghost px-5 py-2.5"
          >
            ← Go back
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-tactile px-5 py-2.5"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mt-10 opacity-30">
          <div className="w-5 h-5 rounded-md bg-charcoal flex items-center justify-center">
            <span className="text-[8px] font-bold text-gold">IF</span>
          </div>
          <span className="text-xs text-charcoal font-semibold tracking-tight">InterviewForge</span>
        </div>
      </div>
    </div>
  );
}
