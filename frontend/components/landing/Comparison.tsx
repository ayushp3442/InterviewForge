"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const rows = [
  { feature: "Personalized to your resume", trad: false, forge: true },
  { feature: "Available 24/7", trad: false, forge: true },
  { feature: "Instant detailed feedback", trad: false, forge: true },
  { feature: "AI-powered evaluation", trad: false, forge: true },
  { feature: "Progress tracking over time", trad: false, forge: true },
  { feature: "Unlimited practice sessions", trad: false, forge: true },
  { feature: "Adapts to your skill level", trad: false, forge: true },
  { feature: "Data-driven insights", trad: false, forge: true },
  { feature: "Free to start", trad: true, forge: true },
  { feature: "Human interaction practice", trad: true, forge: false },
];

export default function Comparison() {
  return (
    <section className="py-24 sm:py-32 bg-cream" aria-label="Comparison">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-gold/20 text-[11px] font-semibold text-gold-muted uppercase tracking-[0.1em] mb-5">
            Comparison
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-serif text-charcoal tracking-[-0.02em] leading-[1.15]">
            Why choose
            <br />
            <span className="text-gold">InterviewForge AI</span>?
          </h2>
          <p className="mt-5 text-stone text-base sm:text-lg leading-relaxed">
            See how AI-powered preparation outperforms traditional methods.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card-board overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-stone-faint/20">
              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone">Feature</p>
              </div>
              <div className="p-4 sm:p-5 text-center border-x border-stone-faint/20">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone">Traditional</p>
              </div>
              <div className="p-4 sm:p-5 text-center bg-gold/[0.04]">
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-gold" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-muted">InterviewForge</p>
                </div>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 ${i !== rows.length - 1 ? "border-b border-stone-faint/10" : ""} hover:bg-cream/50 transition-colors duration-300`}
              >
                <div className="p-3.5 sm:p-4 flex items-center">
                  <span className="text-[13px] text-charcoal-muted">{row.feature}</span>
                </div>
                <div className="p-3.5 sm:p-4 flex items-center justify-center border-x border-stone-faint/10">
                  {row.trad ? <Check className="w-4 h-4 text-stone-faint" /> : <X className="w-4 h-4 text-stone-faint/50" />}
                </div>
                <div className="p-3.5 sm:p-4 flex items-center justify-center bg-gold/[0.02]">
                  {row.forge ? (
                    <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                  ) : (
                    <X className="w-4 h-4 text-stone-faint" />
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
