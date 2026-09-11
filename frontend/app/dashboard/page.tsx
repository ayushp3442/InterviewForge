"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";
import { listInterviews } from "@/lib/api";
import { getUser } from "@/lib/auth";

function DashboardContent() {
  const router = useRouter();
  const user = getUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";

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

  const completed = interviews.filter((i) => i.status === "completed");
  const totalInterviews = interviews.length;
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((s, i) => s + (i.report?.overallScore ?? 0), 0) / completed.length * 10)
      : null;
  const latestScore =
    completed.length > 0 ? (completed[0].report?.overallScore ?? 0) * 10 : null;
  const recentActivity = interviews.slice(0, 6);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  const statCards = [
    {
      label: "Total Sessions",
      value: loading ? null : totalInterviews,
      suffix: "",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "Average Score",
      value: loading ? null : avgScore,
      suffix: avgScore !== null ? "%" : "—",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Latest Score",
      value: loading ? null : latestScore,
      suffix: latestScore !== null ? "%" : "—",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-cream p-6 lg:p-8">
      <div className="relative max-w-4xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-charcoal mb-1">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-stone text-sm">
            {loading ? "Fetching your stats..." : totalInterviews === 0
              ? "Ready to start your first interview?"
              : `You have completed ${completed.length} interview${completed.length !== 1 ? "s" : ""}.`}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/interview-setup")}
          className="btn-tactile w-full mb-6 py-3.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Start new interview
        </button>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="card-board p-4"
            >
              <div className="text-gold mb-3">{card.icon}</div>
              <p className="text-[11px] text-stone mb-0.5 font-medium uppercase tracking-wide">{card.label}</p>
              {loading ? (
                <div className="h-7 w-12 bg-cream-dark rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-charcoal">
                  {card.value !== null ? card.value : "—"}
                  {card.value !== null && card.suffix && (
                    <span className="text-base font-normal text-stone">{card.suffix}</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="card-board overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-faint/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-charcoal">Recent Activity</h2>
            {totalInterviews > 0 && (
              <button
                onClick={() => router.push("/history")}
                className="text-xs text-stone hover:text-gold transition-colors"
              >
                View all →
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center animate-pulse">
                  <div>
                    <div className="h-3 w-32 bg-cream-dark rounded mb-1.5" />
                    <div className="h-2 w-20 bg-cream-dark/60 rounded" />
                  </div>
                  <div className="h-3 w-10 bg-cream-dark rounded" />
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gold/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-stone">No interviews yet.</p>
              <p className="text-xs text-stone-light mt-1">Start your first one above!</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-faint/15">
              {recentActivity.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    item.status === "completed"
                      ? router.push(`/report/${item.id}`)
                      : router.push(`/interview/${item.id}`)
                  }
                  className="w-full flex justify-between items-center px-5 py-3.5 hover:bg-cream-dark/30 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-charcoal">{item.role}</p>
                    <p className="text-xs text-stone-light mt-0.5">
                      {item.type} · {item.difficulty} · {formatDate(item.startedAt)}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {item.status === "completed" && item.report ? (
                      <>
                        <span className="text-sm font-bold text-charcoal">
                          {item.report.overallScore * 10}%
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 font-medium">
                          Done
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold-muted border border-gold/20 font-medium">
                        In progress
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick action row */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => router.push("/history")}
            className="btn-ghost justify-start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View full history
          </button>
          <button
            onClick={() => router.push("/resume-upload")}
            className="btn-ghost justify-start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Upload resume
          </button>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <DashboardContent />
      </AppLayout>
    </AuthGuard>
  );
}