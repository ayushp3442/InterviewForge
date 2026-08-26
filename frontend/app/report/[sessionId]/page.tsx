"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getInterviewReport } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

function ReportContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId ? parseInt(params.sessionId as string) : NaN;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNaN(sessionId)) {
      setError("Invalid session ID");
      setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const res = await getInterviewReport(sessionId);
        if (res.interview && res.interview.report) {
          setData(res.interview);
        } else {
          setError("Report is not compiled yet or this session is in-progress.");
        }
      } catch (err: any) {
        console.error("Fetch report error:", err);
        setError(err.message || "Failed to load report data.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  const handleExportTxt = () => {
    if (!data) return;
    const { report, role, type, difficulty, questions } = data;

    const strengths = Array.isArray(report.strengths) ? report.strengths : JSON.parse(report.strengths || "[]");
    const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses : JSON.parse(report.weaknesses || "[]");

    let textContent = `INTERVIEWFORGE - AI INTERVIEW REPORT
=====================================
Role: ${role}
Category: ${type}
Difficulty: ${difficulty}
Date: ${new Date(data.completedAt || data.startedAt).toLocaleDateString()}

OVERALL PERFORMANCE
-------------------
Overall Score: ${report.overallScore * 10}%
- Correctness Score: ${report.correctnessScore * 10}%
- Communication Score: ${report.communicationScore * 10}%
- Structure Score: ${report.structureScore * 10}%

KEY STRENGTHS
-------------
${strengths.map((s: string) => `• ${s}`).join("\n")}

KEY WEAKNESSES / IMPROVEMENTS
-----------------------------
${weaknesses.map((w: string) => `• ${w}`).join("\n")}

PERSONALIZED LEARNING ROADMAP
------------------------------
${report.roadmapText}

QUESTION-BY-QUESTION BREAKDOWN
--------------------------------
`;

    questions.forEach((q: any, i: number) => {
      const resp = q.response || {};
      textContent += `
Question ${i + 1}: ${q.text}
Your Answer: ${resp.answerText || "No answer submitted."}
Correctness Score: ${resp.correctnessScore ? resp.correctnessScore * 10 : 0}%
Communication Score: ${resp.communicationScore ? resp.communicationScore * 10 : 0}%
Structure Score: ${resp.structureScore ? resp.structureScore * 10 : 0}%
Feedback: ${resp.feedback || "No feedback generated."}
--------------------------------
`;
    });

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `InterviewForge_Report_${sessionId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading interview report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center max-w-sm">
          <p className="text-sm text-red-600 mb-4">{error || "Failed to load report data."}</p>
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

  const { report, role, type, difficulty, questions } = data;
  const strengths = Array.isArray(report.strengths) ? report.strengths : JSON.parse(report.strengths || "[]");
  const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses : JSON.parse(report.weaknesses || "[]");

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto print:max-w-none print:w-full">

        {/* Header section */}
        <div className="flex justify-between items-center mb-6 print:block print:mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Interview Report</h1>
            <p className="text-xs text-gray-500">
              {role} · {type} · {difficulty}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-3 py-1.5 border rounded-lg text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/history")}
              className="px-3 py-1.5 border rounded-lg text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              History
            </button>
            <button
              onClick={handleExportTxt}
              className="px-3 py-1.5 border rounded-lg text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Export TXT
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              Print / PDF
            </button>
          </div>
        </div>

        {/* Overall score */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center mb-4 print:border print:shadow-none">
          <p className="text-xs text-gray-500 mb-1">Overall Score</p>
          <p className="text-4xl font-bold text-gray-900">{report.overallScore * 10}%</p>
        </div>

        {/* Sub-scores */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center print:border print:shadow-none">
            <p className="text-xs text-gray-500 mb-1">Correctness</p>
            <p className="text-xl font-semibold text-gray-900">{report.correctnessScore * 10}%</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center print:border print:shadow-none">
            <p className="text-xs text-gray-500 mb-1">Communication</p>
            <p className="text-xl font-semibold text-gray-900">{report.communicationScore * 10}%</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center print:border print:shadow-none">
            <p className="text-xs text-gray-500 mb-1">Structure</p>
            <p className="text-xl font-semibold text-gray-900">{report.structureScore * 10}%</p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 print:border print:shadow-none">
            <h2 className="text-sm font-semibold text-green-700 mb-2">Key Strengths</h2>
            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
              {strengths.map((str: string, idx: number) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 print:border print:shadow-none">
            <h2 className="text-sm font-semibold text-red-700 mb-2">Key Weaknesses</h2>
            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
              {weaknesses.map((weak: string, idx: number) => (
                <li key={idx}>{weak}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Learning Roadmap */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-4 print:border print:shadow-none">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">AI-Powered Learning Roadmap</h2>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{report.roadmapText}</p>
        </div>

        {/* Question-wise feedback */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 print:border print:shadow-none">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Question-wise Breakdown</h2>
          <div className="space-y-4">
            {questions.map((item: any, i: number) => {
              const resp = item.response || {};
              return (
                <div key={item.id} className="pb-4 border-b border-gray-100 last:border-none last:pb-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Q{i + 1}: {item.text}
                  </p>
                  <p className="text-xs text-gray-500 mb-2 italic">
                    Your answer: "{resp.answerText || "No response provided"}"
                  </p>

                  {/* Scores */}
                  <div className="flex gap-4 text-[10px] text-gray-500 mb-2">
                    <span>Correctness: <strong>{resp.correctnessScore ? resp.correctnessScore * 10 : 0}%</strong></span>
                    <span>Communication: <strong>{resp.communicationScore ? resp.communicationScore * 10 : 0}%</strong></span>
                    <span>Structure: <strong>{resp.structureScore ? resp.structureScore * 10 : 0}%</strong></span>
                  </div>

                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg leading-relaxed">
                    <strong>Feedback:</strong> {resp.feedback || "Evaluation pending."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start new interview CTA */}
        <div className="mt-4 print:hidden">
          <button
            onClick={() => router.push("/interview-setup")}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Start another interview
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <AuthGuard>
      <ReportContent />
    </AuthGuard>
  );
}