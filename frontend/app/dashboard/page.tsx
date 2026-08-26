"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { listInterviews, logoutUser } from "@/lib/api";
import { getUser, getRefreshToken, logout } from "@/lib/auth";

function DashboardContent() {
  const router = useRouter();
  const user = getUser();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await listInterviews();
        setInterviews(res.interviews || []);
      } catch {
        // 401 is handled by api.ts — redirects to /login automatically
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute real stats
  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const totalInterviews = interviews.length;

  const averageScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.report?.overallScore ?? 0), 0) /
            completedInterviews.length *
            10
        )
      : null;

  const latestScore =
    completedInterviews.length > 0
      ? (completedInterviews[0].report?.overallScore ?? 0) * 10
      : null;

  // Recent activity — up to 5 most recent
  const recentActivity = interviews.slice(0, 5);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  async function handleLogout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch {
      // Even if the server call fails, still clear client-side tokens
    } finally {
      logout();
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Top nav */}
        <div className="flex justify-between items-center bg-white rounded-xl px-4 py-3 mb-4 shadow-sm border border-gray-200">
          <p className="font-medium text-sm">InterviewForge AI</p>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600 hidden sm:block">
                Hi, {user.name.split(" ")[0]}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
              {initials}
            </div>
          </div>
        </div>

        {/* Start interview button */}
        <button
          onClick={() => router.push("/interview-setup")}
          className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium mb-4 hover:bg-gray-800 transition-colors"
        >
          Start new interview
        </button>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total interviews</p>
            <p className="text-xl font-semibold">
              {loading ? "—" : totalInterviews}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Average score</p>
            <p className="text-xl font-semibold">
              {loading ? "—" : averageScore !== null ? `${averageScore}%` : "—"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Latest score</p>
            <p className="text-xl font-semibold">
              {loading ? "—" : latestScore !== null ? `${latestScore}%` : "—"}
            </p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-3">Recent activity</p>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No interviews yet. Start your first one above!
            </p>
          ) : (
            recentActivity.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  item.status === "completed"
                    ? router.push(`/report/${item.id}`)
                    : router.push(`/interview/${item.id}`)
                }
                className="flex justify-between items-center text-sm py-2.5 border-b border-gray-100 last:border-none cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <span className="font-medium text-gray-800">{item.type}</span>
                  <span className="text-gray-500"> — {item.role}</span>
                </div>
                <div className="text-right text-xs text-gray-500 flex items-center gap-2">
                  <span>{formatDate(item.startedAt)}</span>
                  {item.status === "completed" && item.report ? (
                    <span className="font-semibold text-gray-800">
                      {item.report.overallScore * 10}%
                    </span>
                  ) : (
                    <span className="text-orange-500 font-medium">In progress</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick nav */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => router.push("/history")}
            className="flex-1 bg-white border border-gray-200 rounded-lg py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            View history
          </button>
          <button
            onClick={() => router.push("/resume-upload")}
            className="flex-1 bg-white border border-gray-200 rounded-lg py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Upload resume
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}