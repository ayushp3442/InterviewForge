"use client";

import { motion } from "framer-motion";

const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Stripe", "Vercel"];

export default function TrustedBy() {
  return (
    <section className="py-16 sm:py-20" aria-label="Trusted by">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="divider-gold mb-10" />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-light mb-10"
        >
          Trusted by candidates hired at
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span key={name} className="text-[18px] font-semibold text-stone-faint tracking-tight whitespace-nowrap select-none hover:text-stone transition-colors duration-500">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
