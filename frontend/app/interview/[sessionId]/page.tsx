"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const placeholderQuestions = [
  "Tell me about yourself and your background.",
  "Explain the difference between REST and GraphQL.",
  "Describe a challenging project you worked on.",
  "How do you handle state management in React?",
  "What is your biggest weakness as a developer?",
];

export default function InterviewPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function handleNext() {
    if (currentQ < placeholderQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer("");
    } else {
      router.push("/report/placeholder-session");
    }
  }

  const progress = ((currentQ + 1) / placeholderQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Question {currentQ + 1} of {placeholderQuestions.length}</span>
          <span>{formatTime(seconds)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4">
          <p className="text-base font-medium">{placeholderQuestions[currentQ]}</p>
        </div>

        {/* Answer input */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          className="w-full border rounded-lg p-3 text-sm mb-4"
        />

        <button
          onClick={handleNext}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium"
        >
          {currentQ < placeholderQuestions.length - 1 ? "Next question" : "Submit interview"}
        </button>
      </div>
    </div>
  );
}