"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getInterviewReport, submitResponse, completeInterview } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";

function InterviewContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId ? parseInt(params.sessionId as string) : NaN;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNaN(sessionId)) { setError("Invalid session ID"); setLoading(false); return; }

    async function loadQuestions() {
      try {
        const data = await getInterviewReport(sessionId);
        if (data.interview && Array.isArray(data.interview.questions)) {
          setQuestions(data.interview.questions);
          const firstUnanswered = data.interview.questions.findIndex((q: any) => !q.response);
          if (firstUnanswered !== -1) setCurrentQ(firstUnanswered);
        } else {
          setError("No questions found for this interview.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [sessionId]);

  useEffect(() => {
    if (loading || submitting) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [loading, submitting]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  async function handleNext() {
    if (!answer.trim() || answer.length < minChars) return;

    setError("");
    setSubmitting(true);
    try {
      await submitResponse(questions[currentQ].id, answer);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswer("");
        setSeconds(0);
      } else {
        await completeInterview(sessionId);
        router.push(`/report/${sessionId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const isLast = currentQ === questions.length - 1;
  const charCount = answer.length;
  const minChars = 20;
  const hasEnoughChars = charCount >= minChars;

  // Ctrl+Enter / Cmd+Enter to submit
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !submitting && hasEnoughChars) {
      e.preventDefault();
      handleNext();
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/40">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 lg:py-12">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header — progress + timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">
              Question
            </span>
            <div className="flex gap-1.5">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx < currentQ
                      ? "bg-emerald-500 w-5"
                      : idx === currentQ
                      ? "bg-blue-500 w-8"
                      : "bg-white/10 w-5"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-white/30">
              {currentQ + 1}/{questions.length}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 transition-colors duration-500 ${
            seconds >= 180
              ? "bg-red-500/10 border-red-500/30 animate-pulse"
              : "bg-white/[0.04] border-white/[0.08]"
          }`}>
            <svg className={`w-3 h-3 transition-colors ${seconds >= 180 ? "text-red-400" : "text-white/30"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs font-mono tabular-nums transition-colors ${seconds >= 180 ? "text-red-400" : "text-white/50"}`}>{formatTime(seconds)}</span>
          </div>

        </div>

        {/* Question card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm mb-4 overflow-hidden">
          {/* Gradient top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="p-6">
            {/* Question number pill */}
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Q{currentQ + 1}
            </div>

            <p className="text-base font-medium text-white/90 leading-relaxed">
              {questions[currentQ]?.text}
            </p>

            {questions[currentQ]?.sourceSkill && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded-full font-medium">
                  📌 From resume: {questions[currentQ].sourceSkill}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Answer area */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm mb-4 overflow-hidden focus-within:border-blue-500/40 transition-colors">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            placeholder="Type your answer here... Be detailed and structured."
            rows={7}
            className="w-full bg-transparent px-5 py-4 text-sm text-white/80 placeholder-white/20 focus:outline-none resize-none disabled:opacity-40"
          />
          <div className="px-5 py-2 border-t border-white/[0.04] flex justify-between items-center">
            <span className="text-[11px] text-white/20">
              {!hasEnoughChars && charCount > 0
                ? <span className="text-amber-400/60">Min {minChars} chars needed ({minChars - charCount} more)</span>
                : "Tip: Structure your answer with examples · Ctrl+Enter to submit"
              }
            </span>
            <span className={`text-[11px] tabular-nums ${charCount >= minChars ? "text-emerald-400/60" : charCount > 0 ? "text-white/30" : "text-white/15"}`}>
              {charCount}/{minChars < charCount ? charCount : minChars}
            </span>
          </div>

        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={handleNext}
          disabled={submitting || !answer.trim() || !hasEnoughChars}

          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            submitting || !answer.trim()
              ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/[0.05]"
              : isLast
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
              : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
          }`}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isLast ? "Compiling your report..." : "Evaluating answer..."}
            </>
          ) : isLast ? (
            <>
              Submit & Generate Report
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </>
          ) : (
            <>
              Next question
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <InterviewContent />
      </AppLayout>
    </AuthGuard>
  );
}