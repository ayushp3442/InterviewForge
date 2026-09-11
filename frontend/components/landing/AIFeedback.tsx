"use client";

import { motion } from "framer-motion";
import { Target, MessageSquare, Shield, Lightbulb, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Technical Accuracy", score: 92, icon: Target },
  { label: "Communication", score: 88, icon: MessageSquare },
  { label: "Confidence", score: 85, icon: Shield },
  { label: "Problem Solving", score: 90, icon: Lightbulb },
];

const tips = [
  "Structure answers using the STAR method for behavioral questions",
  "Elaborate on time complexity when discussing algorithms",
  "Show more enthusiasm discussing past project achievements",
  "Practice system design questions focusing on scalability",
];

export default function AIFeedback() {
  return (
    <section className="py-24 sm:py-32 bg-cream" aria-label="AI feedback preview">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-gold/20 text-[11px] font-semibold text-gold-muted uppercase tracking-[0.1em] mb-5">
            AI Feedback
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-serif text-charcoal tracking-[-0.02em] leading-[1.15]">
            Expert-level
            <br />
            <span className="text-gold">interview feedback</span>
          </h2>
          <p className="mt-5 text-stone text-base sm:text-lg leading-relaxed">
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
            className="lg:col-span-2 card-board p-6 flex flex-col items-center justify-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-6">Overall Score</p>
            <div className="relative w-36 h-36 mb-5">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#F0EBE1" strokeWidth="2" />
                <motion.circle
                  cx="18" cy="18" r="16" fill="none" stroke="url(#fbGold)" strokeWidth="2" strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100.53" }}
                  whileInView={{ strokeDasharray: "89.47 100.53" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="fbGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C9A45C" />
                    <stop offset="100%" stopColor="#B8944A" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-charcoal tabular-nums">89</span>
                <span className="text-[10px] text-stone font-medium">out of 100</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-forest font-semibold">
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
              className="card-board p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-5">Detailed Scores</p>
              <div className="space-y-4">
                {metrics.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-stone" />
                          <span className="text-[13px] font-medium text-charcoal-muted">{m.label}</span>
                        </div>
                        <span className="text-[13px] font-bold text-charcoal tabular-nums">{m.score}%</span>
                      </div>
                      <div className="w-full bg-cream-dark rounded-full h-[6px]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className="bg-gradient-to-r from-gold to-gold-light h-full rounded-full"
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
              className="card-board p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone mb-4">AI Recommendations</p>
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-gold-muted">{i + 1}</span>
                    </div>
                    <p className="text-[13px] text-charcoal-muted leading-relaxed">{tip}</p>
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
