"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Users,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium mb-4">
            Dashboard
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Your command center for{" "}
            <span className="text-gradient">interview success</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            Everything you need at a glance — performance metrics, history, and actionable insights.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-200/60 overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white rounded-md text-[11px] text-gray-400 border border-gray-200 font-mono">
                  interviewforge.ai/dashboard
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gray-50/50">
              {/* Top Nav */}
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-navy-700 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 hidden sm:inline">InterviewForge AI</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    Last session: 2h ago
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[11px] font-semibold text-white">
                    AP
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: BarChart3, label: "Total Sessions", value: "24", change: "+3", changeColor: "text-emerald-600", iconColor: "text-brand-600", iconBg: "bg-brand-50" },
                  { icon: Star, label: "Average Score", value: "87%", change: "+12%", changeColor: "text-emerald-600", iconColor: "text-amber-600", iconBg: "bg-amber-50" },
                  { icon: TrendingUp, label: "Improvement", value: "+23%", change: "vs last month", changeColor: "text-brand-600", iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
                  { icon: Users, label: "Peer Rank", value: "Top 15%", change: "of users", changeColor: "text-purple-600", iconColor: "text-purple-600", iconBg: "bg-purple-50" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                          <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                      <p className={`text-[11px] ${stat.changeColor} font-medium mt-0.5`}>{stat.change}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chart + Activity */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* Chart */}
                <div className="sm:col-span-3 bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-gray-700">Performance Trend</p>
                    <div className="flex gap-1">
                      {["1W", "1M", "3M"].map((t) => (
                        <button
                          key={t}
                          className={`px-2 py-0.5 text-[10px] rounded-md font-medium ${
                            t === "1M"
                              ? "bg-brand-50 text-brand-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-28 px-1">
                    {[45, 52, 48, 62, 58, 70, 65, 75, 72, 80, 78, 85, 82, 90, 87].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-brand-500 to-brand-300 min-h-[4px]"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="sm:col-span-2 bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Recent Activity</p>
                  <div className="space-y-3">
                    {[
                      { type: "Technical — Backend", score: 92, time: "2h ago", color: "bg-emerald-500" },
                      { type: "HR — General", score: 78, time: "Yesterday", color: "bg-brand-500" },
                      { type: "System Design", score: 85, time: "2 days ago", color: "bg-purple-500" },
                      { type: "Technical — Frontend", score: 88, time: "3 days ago", color: "bg-amber-500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{item.type}</p>
                            <p className="text-[10px] text-gray-400">{item.time}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{item.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute -inset-6 bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-navy-500/5 rounded-3xl -z-10 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
