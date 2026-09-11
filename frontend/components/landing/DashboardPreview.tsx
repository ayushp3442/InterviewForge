"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, Users, Zap, TrendingUp, Star } from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="py-24 sm:py-32 bg-cream" aria-label="Dashboard preview">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-gold/20 text-[11px] font-semibold text-gold-muted uppercase tracking-[0.1em] mb-5">
            Dashboard
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-serif text-charcoal tracking-[-0.02em] leading-[1.15]">
            Your command center for
            <br />
            <span className="text-gold">interview success</span>
          </h2>
          <p className="mt-5 text-stone text-base sm:text-lg leading-relaxed">
            Everything at a glance — metrics, history, and actionable insights.
          </p>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute -inset-8 bg-gold/[0.03] rounded-[32px] blur-3xl -z-10" />

          <div className="card-board overflow-hidden">
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-cream-dark/50 border-b border-stone-faint/20">
              <div className="flex gap-[6px]">
                <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-6 py-1 bg-white rounded-lg text-[11px] text-stone-light border border-stone-faint/30 font-mono tracking-wide">
                  interviewforge.ai/dashboard
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-cream">
              {/* Top bar */}
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-4 border border-stone-faint/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gold">IF</span>
                  </div>
                  <span className="text-sm font-semibold text-charcoal hidden sm:inline tracking-tight">InterviewForge AI</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-light">
                    <Clock className="w-3 h-3" />
                    Last session: 2h ago
                  </div>
                  <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-[10px] font-bold text-gold ring-2 ring-gold/20">AP</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: BarChart3, label: "Sessions", value: "24", delta: "+3", deltaColor: "text-forest" },
                  { icon: Star, label: "Avg Score", value: "87%", delta: "+12%", deltaColor: "text-forest" },
                  { icon: TrendingUp, label: "Improvement", value: "+23%", delta: "vs last month", deltaColor: "text-gold-muted" },
                  { icon: Users, label: "Peer Rank", value: "Top 15%", delta: "of users", deltaColor: "text-charcoal-muted" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white rounded-xl p-3.5 border border-stone-faint/20">
                      <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center mb-2">
                        <Icon className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <p className="text-[10px] text-stone-light font-medium uppercase tracking-[0.08em]">{stat.label}</p>
                      <p className="text-lg font-bold text-charcoal mt-0.5 tabular-nums">{stat.value}</p>
                      <p className={`text-[10px] ${stat.deltaColor} font-semibold mt-0.5`}>{stat.delta}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chart + Activity */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="sm:col-span-3 bg-white rounded-xl p-4 border border-stone-faint/20">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-charcoal tracking-tight">Performance Trend</p>
                    <div className="flex gap-1">
                      {["1W", "1M", "3M"].map((t) => (
                        <span key={t} className={`px-2 py-0.5 text-[10px] rounded-md font-medium cursor-default ${t === "1M" ? "bg-gold/10 text-gold-muted" : "text-stone-light"}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-[3px] h-28">
                    {[42, 50, 46, 58, 54, 66, 62, 72, 68, 76, 74, 82, 78, 86, 84].map((h, i) => (
                      <div key={i} className="flex-1 rounded-[3px] bg-gradient-to-t from-charcoal to-charcoal-muted" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 bg-white rounded-xl p-4 border border-stone-faint/20">
                  <p className="text-xs font-semibold text-charcoal mb-3 tracking-tight">Recent Activity</p>
                  <div className="space-y-3">
                    {[
                      { type: "Technical — Backend", score: 92, time: "2h ago", dot: "bg-forest" },
                      { type: "HR — General", score: 78, time: "Yesterday", dot: "bg-gold" },
                      { type: "System Design", score: 85, time: "2 days ago", dot: "bg-charcoal-muted" },
                      { type: "Technical — Frontend", score: 88, time: "3 days ago", dot: "bg-gold-muted" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                          <div>
                            <p className="text-[11px] font-medium text-charcoal">{item.type}</p>
                            <p className="text-[10px] text-stone-light">{item.time}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-charcoal tabular-nums">{item.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
