"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#workflow" },
    { label: "Pricing", href: "#" },
    { label: "FAQ", href: "#faq" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Interview Tips", href: "#" },
    { label: "Career Guide", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Press", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-100/60 bg-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="py-14 sm:py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="InterviewForge AI" width={32} height={32} className="rounded-lg" />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-primary-900">
                Interview<span className="font-bold">Forge</span>
                <span className="text-gradient ml-0.5">AI</span>
              </span>
            </Link>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-xs mb-6">
              AI-powered interview preparation. Practice, improve, and ace every interview.
            </p>
            <div className="flex gap-2.5">
              {[
                { label: "Twitter", text: "X" },
                { label: "LinkedIn", text: "LI" },
                { label: "GitHub", text: "GH" },
              ].map((s) => (
                <a
                  key={s.text}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all duration-300"
                  aria-label={s.label}
                >
                  {s.text}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[13px] text-gray-500 hover:text-primary-900 transition-colors duration-300">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 border-t border-gray-100/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} InterviewForge AI. All rights reserved.</p>
          <p className="text-[11px] text-gray-300">Built with ❤️ for ambitious candidates</p>
        </div>
      </div>
    </footer>
  );
}
