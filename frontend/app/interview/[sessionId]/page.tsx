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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="card-board p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-warm-red/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-warm-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-warm-red mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-ghost px-5 py-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8 lg:py-12">
      <div className="relative max-w-2xl mx-auto">
        {/* Header — progress + timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => {
                if (window.confirm("Leave this interview? Your current answer will not be saved.")) {
                  router.push("/dashboard");
                }
              }}
              className="p-1.5 rounded-lg text-stone-light hover:text-charcoal hover:bg-cream-dark transition-all"
              title="Back to dashboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-stone uppercase tracking-wider">
              Question
            </span>

            <div className="flex gap-1.5">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx < currentQ
                      ? "bg-forest w-5"
                      : idx === currentQ
                      ? "bg-gold w-8"
                      : "bg-stone-faint/30 w-5"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-light">
              {currentQ + 1}/{questions.length}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 transition-colors duration-500 ${
            seconds >= 180
              ? "bg-warm-red/[0.06] border-warm-red/30 animate-pulse"
              : "bg-cream-dark border-stone-faint/30"
          }`}>
            <svg className={`w-3 h-3 transition-colors ${seconds >= 180 ? "text-warm-red" : "text-stone-light"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs font-mono tabular-nums transition-colors ${seconds >= 180 ? "text-warm-red" : "text-stone"}`}>{formatTime(seconds)}</span>
          </div>

        </div>

        {/* Question card */}
        <div className="card-board mb-4 overflow-hidden">
          {/* Gold top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="p-6">
            {/* Question number pill */}
            <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 text-gold-muted text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Q{currentQ + 1}
            </div>

            <p className="text-base font-medium text-charcoal leading-relaxed">
              {questions[currentQ]?.text}
            </p>

            {questions[currentQ]?.sourceSkill && (
              <div className="mt-4 flex items-center gap-2">
                <span className="badge-keycap text-xs text-charcoal-muted">
                  📌 From resume: {questions[currentQ].sourceSkill}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Answer area */}
        <div className="card-board mb-4 overflow-hidden focus-within:border-gold/30 transition-colors">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            placeholder="Type your answer here... Be detailed and structured."
            rows={7}
            className="w-full bg-transparent px-5 py-4 text-sm text-charcoal placeholder-stone-faint focus:outline-none resize-none disabled:opacity-40"
          />
          <div className="px-5 py-2 border-t border-stone-faint/15 flex justify-between items-center">
            <span className="text-[11px] text-stone-light">
              {!hasEnoughChars && charCount > 0
                ? <span className="text-gold-muted">Min {minChars} chars needed ({minChars - charCount} more)</span>
                : "Tip: Structure your answer with examples · Ctrl+Enter to submit"
              }
            </span>
            <span className={`text-[11px] tabular-nums ${charCount >= minChars ? "text-forest" : charCount > 0 ? "text-stone" : "text-stone-faint"}`}>
              {charCount}/{minChars < charCount ? charCount : minChars}
            </span>
          </div>

        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-warm-red mb-3 flex items-center gap-1.5">
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
              ? "bg-cream-dark text-stone-faint cursor-not-allowed border border-stone-faint/20"
              : isLast
              ? "bg-forest hover:bg-forest/90 text-cream shadow-md hover:-translate-y-0.5"
              : "btn-tactile"
          }`}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
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