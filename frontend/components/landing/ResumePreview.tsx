"use client";

import { motion } from "framer-motion";
import { Code2, FolderKanban, GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";

const categories = [
  {
    icon: Code2,
    title: "Skills",
    color: "text-primary-500",
    bg: "bg-primary-50",
    border: "border-primary-100",
    skills: [
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
    color: "text-violet-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    items: [
      { name: "E-commerce Platform", detail: "React, Node.js, MongoDB" },
      { name: "AI Chat Application", detail: "Next.js, OpenAI, WebSocket" },
      { name: "Analytics Dashboard", detail: "D3.js, Python, PostgreSQL" },
    ],
  },
  {
    icon: GraduationCap,
    title: "Education",
    color: "text-emerald-500",
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
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    items: [
      { name: "Software Engineer", detail: "Google — 2 years" },
      { name: "Frontend Developer", detail: "Startup Inc. — 1.5 years" },
      { name: "Intern", detail: "Microsoft — 6 months" },
    ],
  },
];

export default function ResumePreview() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50/40" aria-label="Resume analysis preview">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[11px] font-semibold text-primary-600 uppercase tracking-[0.1em] mb-5">
            Resume Intelligence
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-bold text-primary-900 tracking-[-0.03em] leading-[1.15]">
            AI-powered
            <br />
            <span className="text-gradient">resume analysis</span>
          </h2>
          <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed">
            Every detail extracted and organized for perfectly tailored interview prep.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`glass-card-hover p-6 border ${cat.border}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary-900">{cat.title}</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Extracted by AI</p>
                  </div>
                </div>

                {cat.title === "Skills" ? (
                  <div className="space-y-2.5">
                    {cat.skills!.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-gray-600 font-medium">{skill.name}</span>
                          <span className="text-gray-400 tabular-nums">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-[5px]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-gradient-to-r from-primary-400 to-primary-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.tags!.map((tag) => (
                        <span key={tag} className="px-2 py-[3px] bg-gray-50 text-gray-500 text-[10px] font-medium rounded-md border border-gray-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {cat.items!.map((item) => (
                      <div key={item.name} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 ${cat.color} mt-0.5 flex-shrink-0`} />
                        <div>
                          <p className="text-[11px] font-medium text-gray-700">{item.name}</p>
                          <p className="text-[10px] text-gray-400">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
