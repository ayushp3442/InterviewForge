"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
          className="relative overflow-hidden rounded-3xl bg-charcoal p-10 sm:p-14 lg:p-20"
        >
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/[0.06] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/[0.04] rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-dot-warm opacity-[0.15]" />
          </div>

          <div className="relative z-10 text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold-light text-[11px] font-semibold tracking-wide uppercase mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-gentle-pulse" />
              Free to start — no credit card
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-cream tracking-[-0.02em] leading-[1.1]">
              Ready to ace your
              <br />
              next interview?
            </h2>

            <p className="mt-5 text-base sm:text-lg text-stone-light leading-relaxed max-w-md mx-auto">
              Join thousands of professionals who transformed their interview performance with AI.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="btn-gold text-sm px-7 py-3.5 group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-cream/50 hover:text-cream/80 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-cream/[0.04]"
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
