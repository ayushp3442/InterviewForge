"use client";

import { motion } from "framer-motion";
import { Target, MessageSquare, Shield, Lightbulb, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Technical Accuracy", score: 92, color: "from-primary-400 to-primary-500", icon: Target },
  { label: "Communication", score: 88, color: "from-violet-400 to-violet-500", icon: MessageSquare },
  { label: "Confidence", score: 85, color: "from-amber-400 to-amber-500", icon: Shield },
  { label: "Problem Solving", score: 90, color: "from-emerald-400 to-emerald-500", icon: Lightbulb },
];

const tips = [
  "Structure answers using the STAR method for behavioral questions",
  "Elaborate on time complexity when discussing algorithms",
  "Show more enthusiasm discussing past project achievements",
  "Practice system design questions focusing on scalability",
];

export default function AIFeedback() {
  return (
    <section className="py-24 sm:py-32" aria-label="AI feedback preview">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[11px] font-semibold text-primary-600 uppercase tracking-[0.1em] mb-5">
            AI Feedback
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-bold text-primary-900 tracking-[-0.03em] leading-[1.15]">
            Expert-level
            <br />
            <span className="text-gradient">interview feedback</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed">
            Detailed scoring and actionable recommendations after every session.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 glass-card p-6 flex flex-col items-center justify-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-6">Overall Score</p>
            <div className="relative w-36 h-36 mb-5">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                <motion.circle
                  cx="18" cy="18" r="16" fill="none" stroke="url(#fbGrad)" strokeWidth="2" strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100.53" }}
                  whileInView={{ strokeDasharray: "89.47 100.53" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="fbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-primary-900 tabular-nums">89</span>
                <span className="text-[10px] text-gray-400 font-medium">out of 100</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
              <TrendingUp className="w-4 h-4" />
              +15 pts from last session
            </div>
          </motion.div>

          {/* Metrics + Tips */}
          <div className="lg:col-span-3 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-5">Detailed Scores</p>
              <div className="space-y-4">
                {metrics.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-[13px] font-medium text-gray-700">{m.label}</span>
                        </div>
                        <span className="text-[13px] font-bold text-primary-900 tabular-nums">{m.score}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-[6px]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className={`bg-gradient-to-r ${m.color} h-full rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4">AI Recommendations</p>
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-primary-600">{i + 1}</span>
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
