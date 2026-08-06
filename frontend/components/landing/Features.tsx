"use client";

import { motion } from "framer-motion";
import {
  FileSearch,
  MessageSquare,
  BrainCircuit,
  TrendingUp,
  FileBarChart,
  PieChart,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Resume Parsing",
    description: "AI extracts your skills, projects, and experience to build a personalized interview experience.",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    icon: MessageSquare,
    title: "AI Interviews",
    description: "Practice with adaptive AI interviewers that match your target role, seniority, and industry.",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    icon: BrainCircuit,
    title: "AI Evaluation",
    description: "Expert-level scoring across technical accuracy, communication, confidence, and problem-solving.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor improvement over time with detailed analytics, streaks, and personalized milestones.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    icon: FileBarChart,
    title: "Detailed Reports",
    description: "Comprehensive post-session reports with actionable recommendations and targeted improvement areas.",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    icon: PieChart,
    title: "Deep Analytics",
    description: "Insights into strengths, weaknesses, and trends across different categories and question types.",
    gradient: "from-cyan-500/10 to-sky-500/10",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32" aria-label="Features">
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
            Features
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-bold text-primary-900 tracking-[-0.03em] leading-[1.15]">
            Everything you need to
            <br />
            <span className="text-gradient">prepare smarter</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed">
            A complete AI-powered toolkit that transforms how you prepare for interviews.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative glass-card-hover p-6 sm:p-7 cursor-default"
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-primary-900 mb-2 tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
