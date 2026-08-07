"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
            ? "bg-white/70 backdrop-blur-2xl border-b border-gray-200/40 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
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
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="rounded-lg transition-transform duration-500 group-hover:scale-110"
                priority
              />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-primary-900">
                Interview<span className="font-bold">Forge</span>
                <span className="text-gradient ml-0.5">AI</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-primary-900 transition-colors duration-300 rounded-lg group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-4 right-4 h-[1.5px] bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-[7px] text-[13px] font-medium text-gray-600 hover:text-primary-900 rounded-lg transition-all duration-300 hover:bg-gray-100/60"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="group relative px-4 py-[7px] text-[13px] font-semibold text-white rounded-lg bg-primary-900 hover:bg-primary-900/90 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(15,23,42,0.15)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_rgba(15,23,42,0.2)] hover:-translate-y-[1px]"
              >
                Get Started
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -mr-2 text-gray-500 hover:text-primary-900 transition-colors"
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
            <div className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 bottom-0 w-[300px] bg-white/95 backdrop-blur-2xl shadow-2xl p-8 pt-24"
            >
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-gray-600 hover:text-primary-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="border-t border-gray-100 mt-6 pt-6 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-gray-600 hover:text-primary-900 rounded-xl transition-all text-center hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-[15px] font-semibold text-white bg-primary-900 rounded-xl transition-all text-center shadow-lg"
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
