"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    avatar: "PS",
    avatarGradient: "from-brand-400 to-brand-600",
    rating: 5,
    quote:
      "InterviewForge AI completely transformed how I prepared for my Google interview. The AI feedback was incredibly accurate — it identified weaknesses I didn't even know I had. Landed my dream job!",
  },
  {
    name: "James Chen",
    role: "Senior Developer at Microsoft",
    avatar: "JC",
    avatarGradient: "from-purple-400 to-purple-600",
    rating: 5,
    quote:
      "The resume analysis feature is brilliant. It parsed my resume perfectly and generated interview questions specific to my experience. The progress tracking kept me motivated throughout.",
  },
  {
    name: "Aisha Patel",
    role: "Frontend Engineer at Stripe",
    avatar: "AP",
    avatarGradient: "from-emerald-400 to-emerald-600",
    rating: 5,
    quote:
      "I practiced with InterviewForge AI for two weeks before my Stripe interview. The detailed scoring on communication and technical skills helped me pinpoint exactly what to improve. Highly recommend!",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
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
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Loved by{" "}
            <span className="text-gradient">ambitious candidates</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed">
            Join thousands of professionals who aced their interviews with InterviewForge AI.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover-lift relative"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-brand-100 mb-4" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.avatarGradient} flex items-center justify-center text-xs font-semibold text-white`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
