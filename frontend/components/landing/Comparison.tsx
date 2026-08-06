"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const comparisons = [
  { feature: "Personalized to your resume", traditional: false, forge: true },
  { feature: "Available 24/7", traditional: false, forge: true },
  { feature: "Instant detailed feedback", traditional: false, forge: true },
  { feature: "AI-powered evaluation", traditional: false, forge: true },
  { feature: "Progress tracking over time", traditional: false, forge: true },
  { feature: "Unlimited practice sessions", traditional: false, forge: true },
  { feature: "Adapts to your skill level", traditional: false, forge: true },
  { feature: "Data-driven insights", traditional: false, forge: true },
  { feature: "Free to start", traditional: true, forge: true },
  { feature: "Human interaction practice", traditional: true, forge: false },
];

export default function Comparison() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50/50">
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
            Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Why choose{" "}
            <span className="text-gradient">InterviewForge AI</span>?
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            See how AI-powered preparation outperforms traditional methods.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-900/5 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
              <div className="p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Feature</p>
              </div>
              <div className="p-4 sm:p-5 text-center border-x border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Traditional</p>
              </div>
              <div className="p-4 sm:p-5 text-center bg-brand-50/50">
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">InterviewForge</p>
                </div>
              </div>
            </div>

            {/* Rows */}
            {comparisons.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 gap-0 ${
                  i !== comparisons.length - 1 ? "border-b border-gray-50" : ""
                } hover:bg-gray-50/50 transition-colors`}
              >
                <div className="p-3.5 sm:p-4 flex items-center">
                  <span className="text-sm text-gray-700">{row.feature}</span>
                </div>
                <div className="p-3.5 sm:p-4 flex items-center justify-center border-x border-gray-50">
                  {row.traditional ? (
                    <Check className="w-5 h-5 text-gray-300" />
                  ) : (
                    <X className="w-5 h-5 text-gray-200" />
                  )}
                </div>
                <div className="p-3.5 sm:p-4 flex items-center justify-center bg-brand-50/30">
                  {row.forge ? (
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-brand-600" />
                    </div>
                  ) : (
                    <X className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
