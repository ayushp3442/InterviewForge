"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";
import { listInterviews, deleteInterview } from "@/lib/api";

function HistoryContent() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [visibleLines, setVisibleLines] = useState({ overall: true, correctness: true, communication: true, structure: true });

  function toggleLine(key: keyof typeof visibleLines) {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await listInterviews();
        setInterviews(res.interviews || []);
      } catch { /* 401 handled by api.ts */ }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!window.confirm("Delete this interview? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const completed = interviews
    .filter((i) => i.status === "completed" && i.report?.overallScore != null)
    .slice()
    .reverse();

  const chartData = completed.map((i) => ({
    date: new Date(i.startedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    score: (i.report?.overallScore ?? 0) * 10,
    correctness: (i.report?.correctnessScore ?? 0) * 10,
    communication: (i.report?.communicationScore ?? 0) * 10,
    structure: (i.report?.structureScore ?? 0) * 10,
  }));

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function difficultyBadge(d: string) {
    const map: Record<string, string> = {
      Beginner:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      Advanced:     "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[d] ?? "bg-white/5 text-white/40 border-white/10";
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#12121c] border border-white/[0.10] rounded-xl px-3 py-2 shadow-xl">
          <p className="text-[11px] text-white/40 mb-0.5">{label}</p>
          <p className="text-sm font-bold text-white">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 lg:py-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">Interview History</h1>
          <p className="text-white/40 text-sm">Track your performance over time</p>
        </div>

        {/* Score trend chart */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Score Trend</h2>
            {chartData.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/25 mr-1">{chartData.length} sessions</span>
                {([
                  { key: "overall",       label: "Overall",       color: "bg-blue-500" },
                  { key: "correctness",   label: "Correct",       color: "bg-blue-400" },
                  { key: "communication", label: "Comm",          color: "bg-violet-400" },
                  { key: "structure",     label: "Structure",     color: "bg-emerald-400" },
                ] as const).map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => toggleLine(key)}
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      visibleLines[key]
                        ? "border-white/20 text-white/60 bg-white/[0.05]"
                        : "border-white/[0.06] text-white/20 bg-transparent"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${color} ${!visibleLines[key] && "opacity-30"}`} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm text-white/25">Complete your first interview to see trends</p>
            </div>
          ) : <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" fontSize={10} tick={{ fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} width={30} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  {visibleLines.overall && (
                    <Line type="monotone" dataKey="score" name="Overall" stroke="url(#scoreGradient)" strokeWidth={2.5}
                      dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#818cf8", strokeWidth: 0 }} />
                  )}
                  {visibleLines.correctness && (
                    <Line type="monotone" dataKey="correctness" name="Correctness" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2"
                      dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#93c5fd", strokeWidth: 0 }} />
                  )}
                  {visibleLines.communication && (
                    <Line type="monotone" dataKey="communication" name="Communication" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 2"
                      dot={{ r: 3, fill: "#a78bfa", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#c4b5fd", strokeWidth: 0 }} />
                  )}
                  {visibleLines.structure && (
                    <Line type="monotone" dataKey="structure" name="Structure" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 2"
                      dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#6ee7b7", strokeWidth: 0 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Interview list */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">All Interviews</h2>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center animate-pulse">
                  <div><div className="h-3 w-36 bg-white/10 rounded mb-2" /><div className="h-2 w-24 bg-white/5 rounded" /></div>
                  <div className="h-3 w-10 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-white/25 mb-3">No interviews yet.</p>
              <button onClick={() => router.push("/interview-setup")} className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Start your first interview →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {interviews.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.status === "completed" ? router.push(`/report/${item.id}`) : router.push(`/interview/${item.id}`)}
                  className="w-full flex justify-between items-center px-5 py-4 hover:bg-white/[0.03] transition-colors text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-white/80">{item.role}</p>
                    <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1.5">
                      {item.type} · {formatDate(item.startedAt)}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${difficultyBadge(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2.5">
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deletingId === item.id}
                      title="Delete interview"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40"
                    >
                      {deletingId === item.id ? (
                        <div className="w-3.5 h-3.5 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                    {item.status === "completed" && item.report ? (
                      <>
                        <span className={`text-sm font-bold ${
                          item.report.overallScore * 10 >= 70 ? "text-emerald-400"
                          : item.report.overallScore * 10 >= 50 ? "text-amber-400"
                          : "text-red-400"
                        }`}>
                          {item.report.overallScore * 10}%
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Done</span>
                      </>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">In progress →</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <HistoryContent />
      </AppLayout>
    </AuthGuard>
  );
}