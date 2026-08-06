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
    description:
      "Upload your resume and our AI instantly extracts skills, experience, and projects to tailor your interview preparation.",
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    icon: MessageSquare,
    title: "AI Interviews",
    description:
      "Practice with intelligent AI interviewers that adapt questions to your experience level, role, and industry.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: BrainCircuit,
    title: "AI Evaluation",
    description:
      "Receive expert-level evaluations on technical accuracy, communication clarity, and problem-solving approach.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Monitor your improvement over time with detailed performance analytics and personalized milestones.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: FileBarChart,
    title: "Detailed Reports",
    description:
      "Get comprehensive post-interview reports with actionable recommendations and specific improvement areas.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: PieChart,
    title: "Analytics",
    description:
      "Gain deep insights into your strengths and weaknesses across different interview categories and question types.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
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
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient">prepare smarter</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            A complete AI-powered toolkit designed to transform how you prepare for interviews.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 hover-lift glow-border cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
