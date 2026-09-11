"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#workflow" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 10);
  });

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-cream/90 backdrop-blur-2xl border-b border-gold/10 shadow-[0_1px_0_rgba(201,164,92,0.06)]"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-5 sm:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group relative"
              aria-label="InterviewForge AI Home"
            >
              <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <span className="text-xs font-bold text-gold tracking-tight">IF</span>
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-charcoal">
                Interview<span className="font-bold">Forge</span>
                <span className="text-gold ml-0.5 font-bold">AI</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-[13px] font-medium text-stone hover:text-charcoal transition-colors duration-300 rounded-lg group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-4 right-4 h-[1.5px] bg-gold rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-[7px] text-[13px] font-medium text-stone hover:text-charcoal rounded-lg transition-all duration-300 hover:bg-charcoal/[0.04]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn-tactile text-[13px] py-[7px] px-4"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -mr-2 text-stone hover:text-charcoal transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-charcoal/10 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 bottom-0 w-[300px] bg-cream shadow-2xl p-8 pt-24"
            >
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-stone hover:text-charcoal hover:bg-charcoal/[0.03] rounded-xl transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="border-t border-stone-faint/30 mt-6 pt-6 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-stone hover:text-charcoal rounded-xl transition-all text-center hover:bg-charcoal/[0.03]"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn-tactile text-[15px] py-3 text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
