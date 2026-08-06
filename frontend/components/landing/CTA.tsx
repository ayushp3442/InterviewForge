"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 sm:py-32" aria-label="Call to action">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-primary-950 p-10 sm:p-14 lg:p-20"
        >
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-dot-grid opacity-[0.06]" />
          </div>

          <div className="relative z-10 text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.08] text-white/60 text-[11px] font-semibold tracking-wide uppercase mb-7">
              <Sparkles className="w-3 h-3" />
              Free to start — no credit card
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-[-0.03em] leading-[1.1]">
              Ready to ace your
              <br />
              next interview?
            </h2>

            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-md mx-auto">
              Join thousands of professionals who transformed their interview performance with AI.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-gray-50 text-primary-900 text-sm font-semibold rounded-xl transition-all duration-500 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-white/50 hover:text-white/80 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/[0.04]"
              >
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
