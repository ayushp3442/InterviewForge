"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does InterviewForge AI work?",
    answer:
      "InterviewForge AI uses advanced language models to simulate realistic interview experiences. Upload your resume, and our AI analyzes your skills and experience to generate tailored interview questions. After each session, you receive detailed feedback on your technical accuracy, communication, and confidence.",
  },
  {
    question: "What types of interviews can I practice?",
    answer:
      "You can practice technical interviews (frontend, backend, full-stack, system design), behavioral interviews (HR, cultural fit), and role-specific interviews across various industries. The AI adapts questions based on your experience level and target role.",
  },
  {
    question: "How accurate is the AI feedback?",
    answer:
      "Our AI evaluation system is trained on thousands of real interview patterns and feedback from industry experts. It provides detailed scoring across multiple dimensions including technical accuracy, problem-solving approach, communication clarity, and confidence level.",
  },
  {
    question: "Can I track my improvement over time?",
    answer:
      "Absolutely! InterviewForge AI includes comprehensive analytics that track your performance across sessions. You can see score trends, identify recurring weakness areas, and monitor your improvement in specific categories like technical knowledge and communication.",
  },
  {
    question: "Is my resume data secure?",
    answer:
      "Yes, security is our top priority. All resume data is encrypted in transit and at rest. We never share your personal information with third parties, and you can delete your data at any time. We follow industry-standard security practices.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes! You can start with our free plan which includes a limited number of practice sessions per month. This lets you experience the full power of AI-driven interview preparation before committing to a premium plan for unlimited access.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28 bg-gray-50/50">
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
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Frequently asked{" "}
            <span className="text-gradient">questions</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            Everything you need to know about InterviewForge AI.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full bg-white rounded-xl p-5 border border-gray-100 text-left hover:border-gray-200 transition-colors group"
                aria-expanded={openIndex === index}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                    {faq.question}
                  </h3>
                  <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 transition-colors">
                    {openIndex === index ? (
                      <Minus className="w-3.5 h-3.5 text-gray-500 group-hover:text-brand-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-gray-500 group-hover:text-brand-600" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-50">
                        {faq.answer}
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
