"use client";

import Link from "next/link";

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
    <footer className="border-t border-stone-faint/30 bg-charcoal" role="contentinfo">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="py-14 sm:py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center">
                <span className="text-xs font-bold text-gold tracking-tight">IF</span>
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-cream">
                Interview<span className="font-bold">Forge</span>
                <span className="text-gold ml-0.5 font-bold">AI</span>
              </span>
            </Link>
            <p className="text-[13px] text-stone-light leading-relaxed max-w-xs mb-6">
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
                  className="w-8 h-8 rounded-lg bg-cream/[0.06] border border-cream/[0.08] flex items-center justify-center text-[10px] font-bold text-stone-light hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300"
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-light mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[13px] text-stone hover:text-cream transition-colors duration-300">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider-gold" />
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-stone-light">© {new Date().getFullYear()} InterviewForge AI. All rights reserved.</p>
          <p className="text-[11px] text-stone">Built with ❤️ for ambitious candidates</p>
        </div>
      </div>
    </footer>
  );
}
