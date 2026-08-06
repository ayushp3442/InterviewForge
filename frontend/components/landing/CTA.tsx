"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-gray-900 p-8 sm:p-12 lg:p-16"
        >
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px]" />
            <div className="absolute inset-0 bg-dot-grid opacity-10" />
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Start for free — no credit card required
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to ace your
              <br />
              next interview?
            </h2>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
              Join thousands of professionals who transformed their interview
              performance with AI-powered preparation.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white/70 hover:text-white text-sm font-medium rounded-xl transition-colors duration-300 hover:bg-white/5"
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
