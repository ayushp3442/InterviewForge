"use client";

import { motion } from "framer-motion";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Stripe",
  "Vercel",
];

function CompanyLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center px-8 opacity-40 hover:opacity-60 transition-opacity duration-300">
      <span className="text-lg sm:text-xl font-semibold text-gray-400 tracking-tight whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export default function TrustedBy() {
  return (
    <section className="py-16 sm:py-20 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-medium uppercase tracking-widest text-gray-400 mb-10"
        >
          Trusted by candidates from leading companies
        </motion.p>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="flex animate-marquee">
            {[...companies, ...companies].map((company, i) => (
              <CompanyLogo key={`${company}-${i}`} name={company} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
