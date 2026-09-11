"use client";

import { motion } from "framer-motion";
import { Code2, FolderKanban, GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";

const categories = [
  {
    icon: Code2,
    title: "Skills",
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
    items: [
      { name: "E-commerce Platform", detail: "React, Node.js, MongoDB" },
      { name: "AI Chat Application", detail: "Next.js, OpenAI, WebSocket" },
      { name: "Analytics Dashboard", detail: "D3.js, Python, PostgreSQL" },
    ],
  },
  {
    icon: GraduationCap,
    title: "Education",
    items: [
      { name: "B.Tech Computer Science", detail: "IIT Delhi — 9.2 CGPA" },
      { name: "ML Specialization", detail: "Stanford Online — Certificate" },
    ],
  },
  {
    icon: Briefcase,
    title: "Experience",
    items: [
      { name: "Software Engineer", detail: "Google — 2 years" },
      { name: "Frontend Developer", detail: "Startup Inc. — 1.5 years" },
      { name: "Intern", detail: "Microsoft — 6 months" },
    ],
  },
];

export default function ResumePreview() {
  return (
    <section className="py-24 sm:py-32 bg-white" aria-label="Resume analysis preview">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-gold/20 text-[11px] font-semibold text-gold-muted uppercase tracking-[0.1em] mb-5">
            Resume Intelligence
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-serif text-charcoal tracking-[-0.02em] leading-[1.15]">
            AI-powered
            <br />
            <span className="text-gold">resume analysis</span>
          </h2>
          <p className="mt-5 text-stone text-base sm:text-lg leading-relaxed">
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
                className="card-board-hover p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-charcoal">{cat.title}</h3>
                    <p className="text-[10px] text-stone-light font-medium">Extracted by AI</p>
                  </div>
                </div>

                {cat.title === "Skills" ? (
                  <div className="space-y-2.5">
                    {cat.skills!.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-charcoal-muted font-medium">{skill.name}</span>
                          <span className="text-stone tabular-nums">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-cream-dark rounded-full h-[5px]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-gradient-to-r from-gold to-gold-light h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.tags!.map((tag) => (
                        <span key={tag} className="badge-keycap text-[10px] text-charcoal-muted">{tag}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {cat.items!.map((item) => (
                      <div key={item.name} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[11px] font-medium text-charcoal">{item.name}</p>
                          <p className="text-[10px] text-stone-light">{item.detail}</p>
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
