"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getInterviewReport } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ToastProvider";


function ScoreBar({ label, value }: { label: string; value: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 200); return () => clearTimeout(t); }, [value]);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-stone">{label}</span>
        <span className="text-xs font-semibold text-charcoal">{value}%</span>
      </div>
      <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-gold to-gold-light"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ReportContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId ? parseInt(params.sessionId as string) : NaN;
  const { success: showSuccess } = useToast();


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQ, setExpandedQ] = useState<number | null>(0);
  const [exportingPdf, setExportingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNaN(sessionId)) { setError("Invalid session ID"); setLoading(false); return; }
    async function fetchReport() {
      try {
        const res = await getInterviewReport(sessionId);
        if (res.interview?.report) setData(res.interview);
        else setError("Report not available yet or interview is still in progress.");
      } catch (err: any) {
        setError(err.message || "Failed to load report.");
      } finally { setLoading(false); }
    }
    fetchReport();
  }, [sessionId]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess("Report link copied to clipboard!");
    } catch {
      showSuccess("Copy this URL: " + window.location.href);
    }
  };

  const handleExportPdf = async () => {
    if (!data) return;
    setExportingPdf(true);
    try {
      const { generateVectorReportPdf } = await import("@/lib/pdfExport");
      generateVectorReportPdf(data, sessionId);
      showSuccess("Executive PDF report exported successfully!");
    } catch (err: any) {
      console.error(err);
      showSuccess(err?.message || "PDF export failed — try the TXT export instead.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportTxt = async () => {
    if (!data) return;
    try {
      const { generateFormattedTextReport } = await import("@/lib/textExport");
      const txt = generateFormattedTextReport(data, sessionId);
      const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `InterviewForge_Report_${sessionId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess("Formatted TXT report exported!");
    } catch (err: any) {
      console.error(err);
      showSuccess("Failed to export TXT report.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="card-board p-8 text-center max-w-sm">
          <p className="text-sm text-warm-red mb-6">{error || "Failed to load report."}</p>
          <button onClick={() => router.push("/dashboard")} className="btn-ghost px-5 py-2">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { report, role, type, difficulty, questions } = data;
  const strengths = Array.isArray(report.strengths) ? report.strengths : [];
  const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses : [];
  const overallPct = report.overallScore * 10;
  const scoreColor = overallPct >= 70 ? "text-forest" : overallPct >= 50 ? "text-gold-muted" : "text-warm-red";

  function difficultyBadge(d: string) {
    const map: Record<string, string> = {
      Beginner:     "bg-forest/10 text-forest border-forest/20",
      Intermediate: "bg-gold/10 text-gold-muted border-gold/20",
      Advanced:     "bg-warm-red/10 text-warm-red border-warm-red/20",
    };
    return map[d] ?? "bg-cream-dark text-stone border-stone-faint/30";
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8 lg:py-10">
      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-serif text-charcoal mb-1">Interview Report</h1>
            <p className="text-xs text-stone flex items-center gap-1.5">
              {role} · {type} ·{" "}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${difficultyBadge(difficulty)}`}>
                {difficulty}
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share
            </button>
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/30 bg-gold/[0.06] hover:bg-gold/[0.12] text-xs text-gold-muted hover:text-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingPdf ? (
                <><div className="w-3 h-3 border border-gold/40 border-t-gold rounded-full animate-spin" />Exporting...</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>PDF</>
              )}
            </button>
            <button
              onClick={handleExportTxt}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              TXT
            </button>
          </div>

        </div>

        {/* Scrollable report content captured for PDF */}
        <div ref={reportRef}>

        {/* Overall score hero */}
        <div className="card-board-gold p-6 mb-4 text-center relative overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent absolute top-0 inset-x-0" />
          <p className="text-xs text-stone uppercase tracking-widest mb-2 font-medium">Overall Score</p>
          <p className={`text-6xl font-black mb-1 ${scoreColor}`}>{overallPct}<span className="text-2xl font-normal text-stone">%</span></p>
          <p className="text-xs text-stone">{overallPct >= 70 ? "Great performance! 🎉" : overallPct >= 50 ? "Good effort — keep improving" : "Keep practicing — you'll get there"}</p>
        </div>

        {/* Sub-score bars */}
        <div className="card-board p-5 mb-4 space-y-4">
          <h2 className="text-xs font-semibold text-stone uppercase tracking-wider">Score Breakdown</h2>
          <ScoreBar label="Correctness" value={report.correctnessScore * 10} />
          <ScoreBar label="Communication" value={report.communicationScore * 10} />
          <ScoreBar label="Structure" value={report.structureScore * 10} />
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-forest/20 bg-forest/[0.03] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-forest/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xs font-semibold text-forest">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {strengths.map((s: string, i: number) => (
                <li key={i} className="text-xs text-charcoal-muted flex items-start gap-1.5">
                  <span className="text-forest/50 mt-0.5 flex-shrink-0">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-warm-red/20 bg-warm-red/[0.03] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-warm-red/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-warm-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-xs font-semibold text-warm-red">To Improve</h2>
            </div>
            <ul className="space-y-2">
              {weaknesses.map((w: string, i: number) => (
                <li key={i} className="text-xs text-charcoal-muted flex items-start gap-1.5">
                  <span className="text-warm-red/50 mt-0.5 flex-shrink-0">•</span>{w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Roadmap */}
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.03] p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <h2 className="text-xs font-semibold text-gold-muted">AI Learning Roadmap</h2>
          </div>
          <p className="text-xs text-charcoal-muted leading-relaxed whitespace-pre-line">{report.roadmapText}</p>
        </div>

        {/* Q&A breakdown — accordion */}
        <div className="card-board overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-stone-faint/20">
            <h2 className="text-xs font-semibold text-stone uppercase tracking-wider">Question-by-Question</h2>
          </div>
          <div className="divide-y divide-stone-faint/15">
            {questions.map((item: any, i: number) => {
              const resp = item.response || {};
              const isOpen = expandedQ === i;
              const qScore = resp.correctnessScore != null
                ? Math.round(((resp.correctnessScore + resp.communicationScore + resp.structureScore) / 3) * 10)
                : null;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setExpandedQ(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream-dark/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-bold text-stone-faint flex-shrink-0">Q{i + 1}</span>
                      <p className="text-sm text-charcoal truncate">{item.text}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      {qScore !== null && (
                        <span className={`text-xs font-semibold ${qScore >= 70 ? "text-forest" : qScore >= 50 ? "text-gold-muted" : "text-warm-red"}`}>
                          {qScore}%
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-stone-faint transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-3">
                      <div className="bg-cream-dark/40 rounded-xl p-3 border border-stone-faint/15">
                        <p className="text-[10px] text-stone-light uppercase tracking-wider mb-1">Your Answer</p>
                        <p className="text-xs text-charcoal-muted italic leading-relaxed">&ldquo;{resp.answerText || "No answer submitted"}&rdquo;</p>
                      </div>
                      <div className="flex gap-3 text-[11px]">
                        <span className="text-stone">Correctness: <strong className="text-charcoal">{(resp.correctnessScore ?? 0) * 10}%</strong></span>
                        <span className="text-stone">Communication: <strong className="text-charcoal">{(resp.communicationScore ?? 0) * 10}%</strong></span>
                        <span className="text-stone">Structure: <strong className="text-charcoal">{(resp.structureScore ?? 0) * 10}%</strong></span>
                      </div>
                      {resp.feedback && (
                        <div className="bg-gold/[0.04] border border-gold/15 rounded-xl p-3">
                          <p className="text-[10px] text-gold-muted uppercase tracking-wider mb-1">AI Feedback</p>
                          <p className="text-xs text-charcoal-muted leading-relaxed">{resp.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        </div> {/* end reportRef div */}

        {/* CTA */}
        <button
          onClick={() => router.push("/interview-setup")}
          className="btn-tactile w-full py-3.5"
        >
          Start another interview →
        </button>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ReportContent />
      </AppLayout>
    </AuthGuard>
  );
}