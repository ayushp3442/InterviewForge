"use client";

import { motion } from "framer-motion";
import {
  Code2,
  FolderKanban,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Star,
} from "lucide-react";

const categories = [
  {
    icon: Code2,
    title: "Skills",
    color: "text-brand-600",
    bg: "bg-brand-50",
    border: "border-brand-100",
    items: [
      { name: "React.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Node.js", level: 85 },
      { name: "Python", level: 78 },
      { name: "System Design", level: 82 },
    ],
    tags: ["JavaScript", "AWS", "Docker", "GraphQL", "REST APIs"],
  },
  {
    icon: FolderKanban,
    title: "Projects",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    items: [
      { name: "E-commerce Platform", detail: "React, Node.js, MongoDB" },
      { name: "AI Chat Application", detail: "Next.js, OpenAI, WebSocket" },
      { name: "Analytics Dashboard", detail: "D3.js, Python, PostgreSQL" },
    ],
  },
  {
    icon: GraduationCap,
    title: "Education",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    items: [
      { name: "B.Tech Computer Science", detail: "IIT Delhi — 9.2 CGPA" },
      { name: "ML Specialization", detail: "Stanford Online — Certificate" },
    ],
  },
  {
    icon: Briefcase,
    title: "Experience",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    items: [
      { name: "Software Engineer", detail: "Google — 2 years" },
      { name: "Frontend Developer", detail: "Startup Inc. — 1.5 years" },
      { name: "Intern", detail: "Microsoft — 6 months" },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ResumePreview() {
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
            Resume Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            AI-powered{" "}
            <span className="text-gradient">resume analysis</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            Our AI extracts and organizes every detail from your resume to create perfectly tailored interview experiences.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                variants={cardVariants}
                className={`bg-white rounded-2xl p-6 border ${category.border} hover-lift`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${category.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-[11px] text-gray-400">Extracted by AI</p>
                  </div>
                </div>

                {/* Skills with progress */}
                {category.title === "Skills" && (
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">{item.name}</span>
                          <span className="text-gray-400">{(item as { name: string; level: number }).level}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(item as { name: string; level: number }).level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-gradient-to-r from-brand-400 to-brand-500 h-1.5 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {category.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-full border border-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* List items */}
                {category.title !== "Skills" && (
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div key={item.name} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 ${category.color} mt-0.5 flex-shrink-0`} />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{item.name}</p>
                          <p className="text-[11px] text-gray-400">{(item as { name: string; detail: string }).detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
