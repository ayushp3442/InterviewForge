"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getInterviewReport, submitResponse, completeInterview } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

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
    if (isNaN(sessionId)) {
      setError("Invalid session ID");
      setLoading(false);
      return;
    }

    async function loadQuestions() {
      try {
        const data = await getInterviewReport(sessionId);
        if (data.interview && Array.isArray(data.interview.questions)) {
          setQuestions(data.interview.questions);
          // Resume from first unanswered question
          const firstUnanswered = data.interview.questions.findIndex((q: any) => !q.response);
          if (firstUnanswered !== -1) {
            setCurrentQ(firstUnanswered);
          }
        } else {
          setError("No questions found for this interview.");
        }
      } catch (err: any) {
        console.error("Load questions error:", err);
        setError(err.message || "Failed to load questions. Make sure the database is restored.");
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
    if (!answer.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const currentQuestionId = questions[currentQ].id;
      // 1. Submit response and evaluate via AI
      await submitResponse(currentQuestionId, answer);

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswer("");
      } else {
        // Last question answered - finalize interview and generate report
        await completeInterview(sessionId);
        router.push(`/report/${sessionId}`);
      }
    } catch (err: any) {
      console.error("Submit response error:", err);
      setError(err.message || "Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center max-w-sm">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            Question {currentQ + 1} of {questions.length}
          </span>
          <span>{formatTime(seconds)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4">
          <p className="text-base font-medium leading-relaxed">{questions[currentQ]?.text}</p>
          {questions[currentQ]?.sourceSkill && (
            <span className="mt-2 inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {questions[currentQ].sourceSkill}
            </span>
          )}
        </div>

        {/* Answer input */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitting}
          placeholder="Type your answer here..."
          rows={6}
          className="w-full border rounded-lg p-3 text-sm mb-4 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          onClick={handleNext}
          disabled={submitting || !answer.trim()}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          {submitting
            ? currentQ < questions.length - 1
              ? "Submitting and evaluating..."
              : "Compiling final report..."
            : currentQ < questions.length - 1
            ? "Next question →"
            : "Submit interview"}
        </button>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <AuthGuard>
      <InterviewContent />
    </AuthGuard>
  );
}