"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How does InterviewForge AI work?",
    a: "Upload your resume and our AI analyzes your skills and experience to generate tailored interview questions. After each session, you receive detailed feedback on technical accuracy, communication, and confidence.",
  },
  {
    q: "What types of interviews can I practice?",
    a: "Technical (frontend, backend, full-stack, system design), behavioral (HR, cultural fit), and role-specific interviews. The AI adapts questions based on your experience level and target role.",
  },
  {
    q: "How accurate is the AI feedback?",
    a: "Our evaluation system is trained on thousands of real interview patterns from industry experts. It scores across multiple dimensions including technical accuracy, problem-solving, and communication clarity.",
  },
  {
    q: "Can I track my improvement over time?",
    a: "Absolutely. Comprehensive analytics track performance across sessions — score trends, weakness patterns, and category-specific improvements are all available in your dashboard.",
  },
  {
    q: "Is my resume data secure?",
    a: "Security is our top priority. All data is encrypted in transit and at rest. We never share personal information with third parties, and you can delete your data at any time.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes! Start with our free plan that includes limited practice sessions per month. Experience the full power of AI-driven prep before upgrading for unlimited access.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32 bg-white" aria-label="Frequently asked questions">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-gold/20 text-[11px] font-semibold text-gold-muted uppercase tracking-[0.1em] mb-5">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-[2.75rem] font-serif text-charcoal tracking-[-0.02em] leading-[1.15]">
            Frequently asked
            <br />
            <span className="text-gold">questions</span>
          </h2>
        </motion.div>

        <div className="max-w-xl mx-auto space-y-2.5">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full card-board p-5 text-left group transition-all duration-300 hover:shadow-card-hover"
                aria-expanded={open === i}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[13px] font-semibold text-charcoal group-hover:text-charcoal-muted transition-colors font-serif">
                    {faq.q}
                  </h3>
                  <div className="w-6 h-6 rounded-lg bg-cream group-hover:bg-gold/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    {open === i ? (
                      <Minus className="w-3.5 h-3.5 text-stone group-hover:text-gold" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-stone group-hover:text-gold" />
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-[13px] text-stone leading-relaxed mt-3 pt-3 border-t border-stone-faint/20">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
