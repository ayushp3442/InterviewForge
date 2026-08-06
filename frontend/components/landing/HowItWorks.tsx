"use client";

import { motion } from "framer-motion";
import { Upload, Search, MessageCircle, ClipboardCheck, Rocket } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Resume",
    description: "Drop your resume and let AI parse your skills, projects, and experience instantly.",
    color: "text-primary-500",
    bg: "bg-primary-50",
    ring: "border-primary-100",
  },
  {
    icon: Search,
    title: "AI Analysis",
    description: "Our AI builds a complete profile and crafts personalized interview scenarios.",
    color: "text-violet-500",
    bg: "bg-violet-50",
    ring: "border-violet-100",
  },
  {
    icon: MessageCircle,
    title: "Practice Interview",
    description: "Engage in realistic, adaptive interviews tailored to your target role.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    ring: "border-emerald-100",
  },
  {
    icon: ClipboardCheck,
    title: "Detailed Evaluation",
    description: "Receive comprehensive scoring on technical depth, communication, and confidence.",
    color: "text-amber-500",
    bg: "bg-amber-50",
    ring: "border-amber-100",
  },
  {
    icon: Rocket,
    title: "Continuous Improvement",
    description: "Track progress, identify patterns, and refine your approach with AI guidance.",
    color: "text-rose-500",
    bg: "bg-rose-50",
    ring: "border-rose-100",
  },
];

export default function HowItWorks() {
  return (
    <section id="workflow" className="py-24 sm:py-32 bg-gray-50/40" aria-label="How it works">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[11px] font-semibold text-primary-600 uppercase tracking-[0.1em] mb-5">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-bold text-primary-900 tracking-[-0.03em] leading-[1.15]">
            From resume to
            <br />
            <span className="text-gradient">interview mastery</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed">
            Five steps to transform your interview preparation.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto relative">
          {/* Line */}
          <div className="absolute left-[39px] sm:left-[47px] top-4 bottom-4 w-px bg-gradient-to-b from-primary-200 via-violet-200 via-60% to-rose-200 hidden sm:block" />

          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-5 sm:gap-7 items-start group"
                >
                  <div className="flex-shrink-0 relative">
                    <div className={`w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-2xl ${step.bg} border ${step.ring} flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-105`}>
                      <Icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 z-20">
                      {i + 1}
                    </span>
                  </div>
                  <div className="pt-3 sm:pt-5">
                    <h3 className="text-[15px] font-semibold text-primary-900 mb-1 tracking-[-0.01em]">{step.title}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed max-w-sm">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
