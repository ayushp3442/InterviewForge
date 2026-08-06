"use client";

import { motion } from "framer-motion";
import {
  Target,
  MessageSquare,
  Shield,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

const metrics = [
  { label: "Technical Accuracy", score: 92, color: "from-brand-400 to-brand-500", icon: Target },
  { label: "Communication", score: 88, color: "from-purple-400 to-purple-500", icon: MessageSquare },
  { label: "Confidence", score: 85, color: "from-amber-400 to-amber-500", icon: Shield },
  { label: "Problem Solving", score: 90, color: "from-emerald-400 to-emerald-500", icon: Lightbulb },
];

const recommendations = [
  "Structure your answers using the STAR method for behavioral questions",
  "Elaborate more on time complexity when discussing algorithms",
  "Show more enthusiasm when discussing past project achievements",
  "Practice system design questions with focus on scalability",
];

export default function AIFeedback() {
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
            AI Feedback
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Expert-level{" "}
            <span className="text-gradient">interview feedback</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            Get detailed scoring and actionable recommendations after every practice session.
          </p>
        </motion.div>

        {/* Content */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">
              Overall Interview Score
            </p>
            <div className="relative w-40 h-40 mb-6">
              <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="2.5"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#feedbackGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  whileInView={{ strokeDasharray: "89, 100" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="feedbackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0a63f0" />
                    <stop offset="100%" stopColor="#6485fc" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">89</span>
                <span className="text-xs text-gray-400 font-medium">out of 100</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              +15 pts from last session
            </div>
          </motion.div>

          {/* Metrics + Recommendations */}
          <div className="lg:col-span-3 space-y-5">
            {/* Metric bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-5">
                Detailed Scores
              </p>
              <div className="space-y-4">
                {metrics.map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{metric.score}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${metric.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className={`bg-gradient-to-r ${metric.color} h-2 rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-gray-100"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                AI Recommendations
              </p>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-brand-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{rec}</p>
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
