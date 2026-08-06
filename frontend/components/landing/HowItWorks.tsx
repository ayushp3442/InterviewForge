"use client";

import { motion } from "framer-motion";
import {
  Upload,
  Search,
  MessageCircle,
  ClipboardCheck,
  Rocket,
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Resume",
    description: "Upload your resume and let our AI parse your skills, experience, and career goals.",
    color: "text-brand-600",
    bg: "bg-brand-50",
    ring: "ring-brand-100",
  },
  {
    icon: Search,
    title: "AI Analysis",
    description: "Our AI analyzes your profile to create personalized interview scenarios.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    ring: "ring-purple-100",
  },
  {
    icon: MessageCircle,
    title: "Practice Interview",
    description: "Engage in realistic AI-driven interviews tailored to your target role.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
  {
    icon: ClipboardCheck,
    title: "Detailed Evaluation",
    description: "Receive comprehensive scoring across technical, communication, and confidence metrics.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
  },
  {
    icon: Rocket,
    title: "Continuous Improvement",
    description: "Track progress over time and refine your approach with AI-guided recommendations.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-100",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50/50">
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
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            From resume to{" "}
            <span className="text-gradient">interview mastery</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            Five simple steps to transform your interview preparation.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto relative">
          {/* Connecting line */}
          <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-px bg-gradient-to-b from-brand-200 via-purple-200 to-rose-200 hidden sm:block" />

          <div className="space-y-8 sm:space-y-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex gap-5 sm:gap-8 items-start"
                >
                  {/* Step circle */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${step.bg} ring-4 ${step.ring} flex items-center justify-center relative z-10`}
                    >
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color}`} />
                    </div>
                    {/* Step number */}
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 z-20">
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-2 sm:pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                      {step.description}
                    </p>
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
