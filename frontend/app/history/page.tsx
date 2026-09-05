"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";
import { listInterviews } from "@/lib/api";

function HistoryContent() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const completed = interviews
    .filter((i) => i.status === "completed" && i.report?.overallScore != null)
    .slice()
    .reverse();

  const chartData = completed.map((i) => ({
    date: new Date(i.startedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    score: (i.report?.overallScore ?? 0) * 10,
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
              <span className="text-xs text-white/25">{chartData.length} sessions</span>
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
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" fontSize={10} tick={{ fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} width={30} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#scoreGradient)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#818cf8", strokeWidth: 0 }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          )}
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
                  className="w-full flex justify-between items-center px-5 py-4 hover:bg-white/[0.03] transition-colors text-left"
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