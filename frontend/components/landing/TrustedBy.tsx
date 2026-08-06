"use client";

import { motion } from "framer-motion";

const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Stripe", "Vercel"];

export default function TrustedBy() {
  return (
    <section className="py-16 sm:py-20 border-t border-gray-100/60" aria-label="Trusted by">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-10"
        >
          Trusted by candidates hired at
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="flex animate-marquee">
            {[...companies, ...companies].map((name, i) => (
              <div key={`${name}-${i}`} className="flex items-center justify-center px-10 shrink-0">
                <span className="text-[18px] font-semibold text-gray-300 tracking-tight whitespace-nowrap select-none hover:text-gray-400 transition-colors duration-500">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
