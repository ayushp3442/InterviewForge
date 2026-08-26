"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AuthGuard from "@/components/AuthGuard";
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
      } catch {
        // 401 handled by api.ts
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Only completed interviews with a report have scores to chart
  const completedWithScore = interviews
    .filter((i) => i.status === "completed" && i.report?.overallScore !== null)
    .slice()
    .reverse(); // oldest first for the chart

  const chartData = completedWithScore.map((i) => ({
    date: new Date(i.startedAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    score: (i.report?.overallScore ?? 0) * 10,
  }));

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">Interview History</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Dashboard
          </button>
        </div>

        {/* Score trend chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <p className="text-sm font-medium text-gray-600 mb-3">Score trend</p>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-gray-400">Loading chart...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-gray-400">Complete your first interview to see trends.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: "#9ca3af" }} />
                <YAxis fontSize={11} domain={[0, 100]} tick={{ fill: "#9ca3af" }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Score"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#111827"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#111827" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Interview list */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-3">All interviews</p>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
          ) : interviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No interviews yet.{" "}
              <button
                onClick={() => router.push("/interview-setup")}
                className="text-blue-600 hover:underline"
              >
                Start one now
              </button>
            </p>
          ) : (
            <div className="space-y-0">
              {interviews.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    item.status === "completed"
                      ? router.push(`/report/${item.id}`)
                      : router.push(`/interview/${item.id}`)
                  }
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-none cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.role}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.type} · {item.difficulty} · {formatDate(item.startedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    {item.status === "completed" && item.report ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.report.overallScore * 10}%
                        </p>
                        <p className="text-xs text-green-600">Completed</p>
                      </>
                    ) : (
                      <p className="text-xs text-orange-500 font-medium">In progress →</p>
                    )}
                  </div>
                </div>
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
      <HistoryContent />
    </AuthGuard>
  );
}