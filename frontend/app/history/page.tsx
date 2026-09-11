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
      Beginner:     "bg-forest/10 text-forest border-forest/20",
      Intermediate: "bg-gold/10 text-gold-muted border-gold/20",
      Advanced:     "bg-warm-red/10 text-warm-red border-warm-red/20",
    };
    return map[d] ?? "bg-cream-dark text-stone border-stone-faint/30";
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-charcoal rounded-xl px-3 py-2 shadow-xl">
          <p className="text-[11px] text-cream/60 mb-0.5">{label}</p>
          <p className="text-sm font-bold text-cream">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8 lg:py-10">
      <div className="relative max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-serif text-charcoal mb-1">Interview History</h1>
          <p className="text-stone text-sm">Track your performance over time</p>
        </div>

        {/* Score trend chart */}
        <div className="card-board p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-stone uppercase tracking-wider">Score Trend</h2>
            {chartData.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-light mr-1">{chartData.length} sessions</span>
                {([
                  { key: "overall",       label: "Overall",       color: "bg-charcoal" },
                  { key: "correctness",   label: "Correct",       color: "bg-gold" },
                  { key: "communication", label: "Comm",          color: "bg-charcoal-muted" },
                  { key: "structure",     label: "Structure",     color: "bg-forest" },
                ] as const).map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => toggleLine(key)}
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      visibleLines[key]
                        ? "border-stone-faint/40 text-charcoal-muted bg-cream-dark/50"
                        : "border-stone-faint/20 text-stone-light bg-transparent"
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
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-stone-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm text-stone-light">Complete your first interview to see trends</p>
            </div>
          ) : <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="date" fontSize={10} tick={{ fill: "#8A8A8A" }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} domain={[0, 100]} tick={{ fill: "#8A8A8A" }} axisLine={false} tickLine={false} width={30} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(0,0,0,0.06)", strokeWidth: 1 }} />
                  {visibleLines.overall && (
                    <Line type="monotone" dataKey="score" name="Overall" stroke="#171717" strokeWidth={2.5}
                      dot={{ r: 4, fill: "#171717", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#2A2A2A", strokeWidth: 0 }} />
                  )}
                  {visibleLines.correctness && (
                    <Line type="monotone" dataKey="correctness" name="Correctness" stroke="#C9A45C" strokeWidth={1.5} strokeDasharray="4 2"
                      dot={{ r: 3, fill: "#C9A45C", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#D4B76A", strokeWidth: 0 }} />
                  )}
                  {visibleLines.communication && (
                    <Line type="monotone" dataKey="communication" name="Communication" stroke="#6B6B6B" strokeWidth={1.5} strokeDasharray="4 2"
                      dot={{ r: 3, fill: "#6B6B6B", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#8A8A8A", strokeWidth: 0 }} />
                  )}
                  {visibleLines.structure && (
                    <Line type="monotone" dataKey="structure" name="Structure" stroke="#2D6A4F" strokeWidth={1.5} strokeDasharray="4 2"
                      dot={{ r: 3, fill: "#2D6A4F", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#3D8A6A", strokeWidth: 0 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Interview list */}
        <div className="card-board overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-faint/20">
            <h2 className="text-xs font-semibold text-stone uppercase tracking-wider">All Interviews</h2>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center animate-pulse">
                  <div><div className="h-3 w-36 bg-cream-dark rounded mb-2" /><div className="h-2 w-24 bg-cream-dark/60 rounded" /></div>
                  <div className="h-3 w-10 bg-cream-dark rounded" />
                </div>
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-stone-light mb-3">No interviews yet.</p>
              <button onClick={() => router.push("/interview-setup")} className="text-xs text-gold hover:text-gold-muted font-medium transition-colors">
                Start your first interview →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-faint/15">
              {interviews.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.status === "completed" ? router.push(`/report/${item.id}`) : router.push(`/interview/${item.id}`)}
                  className="w-full flex justify-between items-center px-5 py-4 hover:bg-cream-dark/30 transition-colors text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-charcoal">{item.role}</p>
                    <p className="text-xs text-stone-light mt-0.5 flex items-center gap-1.5">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-stone-light hover:text-warm-red hover:bg-warm-red/[0.06] disabled:opacity-40"
                    >
                      {deletingId === item.id ? (
                        <div className="w-3.5 h-3.5 border border-warm-red/40 border-t-warm-red rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                    {item.status === "completed" && item.report ? (
                      <>
                        <span className={`text-sm font-bold ${
                          item.report.overallScore * 10 >= 70 ? "text-forest"
                          : item.report.overallScore * 10 >= 50 ? "text-gold-muted"
                          : "text-warm-red"
                        }`}>
                          {item.report.overallScore * 10}%
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">Done</span>
                      </>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold-muted border border-gold/20">In progress →</span>
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