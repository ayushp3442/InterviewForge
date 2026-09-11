"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Brain,
  BarChart3,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Mouse-tracked floating card                                       */
/* ------------------------------------------------------------------ */
function FloatingCard({
  children,
  className = "",
  delay = 0,
  sensitivity = 10,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  sensitivity?: number;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPos({ x: x * sensitivity, y: y * sensitivity });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [sensitivity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ x: pos.x, y: pos.y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated number counter                                           */
/* ------------------------------------------------------------------ */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const step = target / 40;
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero component                                                    */
/* ------------------------------------------------------------------ */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-cream"
      aria-label="Hero"
    >
      {/* ---- Background layers ---- */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-dot-warm" />
        {/* Warm radial gradients */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[120px]" />
        <div
          className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-gold/[0.03] rounded-full blur-[100px]"
        />
      </motion.div>

      {/* ---- Content ---- */}
      <motion.div style={{ opacity: fade }} className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gold/20 mb-8 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-gentle-pulse" />
            <span className="text-[12px] font-semibold text-charcoal-muted tracking-wide uppercase">
              AI-Powered Interview Prep
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-serif leading-[1.08] tracking-[-0.02em] text-charcoal"
          >
            Ace every interview
            <br />
            with <span className="text-gold">AI precision</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-[clamp(1rem,1.8vw,1.15rem)] text-stone max-w-xl mx-auto leading-relaxed"
          >
            Upload your resume. Practice with AI interviewers. Get instant
            expert feedback. Track your progress to perfection.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="btn-tactile text-sm px-7 py-3.5 group"
            >
              Start Practicing Free
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#workflow"
              className="btn-ghost text-sm px-6 py-3.5"
            >
              See How It Works
            </a>
          </motion.div>
        </div>

        {/* ---- Floating Cards + Dashboard ---- */}
        <div className="relative max-w-4xl mx-auto mt-16 sm:mt-20 hidden md:block">
          {/* Central Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glow behind */}
            <div className="absolute -inset-8 bg-gold/[0.03] rounded-[32px] blur-3xl" />

            {/* Browser chrome */}
            <div className="relative card-board overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-cream-dark/50 border-b border-stone-faint/20">
                <div className="flex gap-[6px]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-6 py-1 bg-white rounded-lg text-[11px] text-stone-light border border-stone-faint/30 font-mono tracking-wide">
                    interviewforge.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 bg-cream">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Interviews", value: 24, suffix: "", delta: "+3 this week", color: "text-charcoal" },
                    { label: "Avg Score", value: 87, suffix: "%", delta: "+12% improvement", color: "text-forest" },
                    { label: "Top Score", value: 96, suffix: "%", delta: "Technical round", color: "text-gold-muted" },
                    { label: "Streak", value: 7, suffix: " days", delta: "Keep going!", color: "text-gold" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-3.5 border border-stone-faint/20">
                      <p className="text-[10px] text-stone-light font-medium uppercase tracking-[0.08em]">{s.label}</p>
                      <p className="text-xl font-bold text-charcoal mt-1 tabular-nums">
                        <Counter target={s.value} suffix={s.suffix} />
                      </p>
                      <p className={`text-[10px] ${s.color} mt-0.5 font-medium`}>{s.delta}</p>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div className="bg-white rounded-xl p-4 border border-stone-faint/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-charcoal tracking-tight">Performance Trend</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-forest font-semibold bg-forest/10 px-2 py-0.5 rounded-md">
                      <TrendingUp className="w-3 h-3" />
                      +23%
                    </div>
                  </div>
                  <div className="flex items-end gap-[3px] h-[72px]">
                    {[38, 48, 42, 56, 52, 64, 60, 72, 68, 78, 74, 82, 80, 88, 86, 92].map((h, i) => (
                      <div key={i} className="flex-1">
                        <div
                          className="rounded-[3px] bg-gradient-to-t from-charcoal to-charcoal-muted transition-all duration-700"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating: Resume Card — top-left */}
          <FloatingCard className="absolute -left-8 lg:left-0 top-4 z-20" delay={0.7} sensitivity={-12}>
            <div className="card-board p-4 w-[200px]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-charcoal">Resume Parsed</p>
                  <p className="text-[9px] text-stone-light">Just now</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-stone font-medium">Skills Match</span>
                    <span className="text-forest font-semibold">94%</span>
                  </div>
                  <div className="w-full bg-stone-faint/20 rounded-full h-[5px]">
                    <div className="bg-forest h-full rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap pt-0.5">
                  {["React", "Node.js", "TypeScript"].map((t) => (
                    <span key={t} className="badge-keycap text-[9px] text-charcoal-muted">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </FloatingCard>

          {/* Floating: AI Brain — top-right */}
          <FloatingCard className="absolute -right-8 lg:right-0 top-12 z-20" delay={0.8} sensitivity={12}>
            <div className="card-board p-4 w-[200px]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-charcoal/[0.06] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-charcoal-muted" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-charcoal">AI Feedback</p>
                  <p className="text-[9px] text-stone-light">Live analysis</p>
                </div>
              </div>
              <div className="space-y-[6px]">
                {[
                  { l: "Technical", v: 92, c: "bg-charcoal" },
                  { l: "Communication", v: 88, c: "bg-gold" },
                  { l: "Confidence", v: 85, c: "bg-forest" },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="flex justify-between text-[10px] mb-[2px]">
                      <span className="text-stone font-medium">{m.l}</span>
                      <span className="text-charcoal font-semibold tabular-nums">{m.v}%</span>
                    </div>
                    <div className="w-full bg-stone-faint/20 rounded-full h-[4px]">
                      <div className={`${m.c} h-full rounded-full`} style={{ width: `${m.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>

          {/* Floating: Analytics — bottom-left */}
          <FloatingCard className="absolute left-12 lg:left-24 -bottom-6 z-20" delay={0.9} sensitivity={-8}>
            <div className="card-board p-3.5 w-[170px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-forest" />
                </div>
                <span className="text-[11px] font-semibold text-charcoal">Analytics</span>
              </div>
              <div className="flex items-end gap-[2px] h-10">
                {[28, 45, 38, 60, 52, 72, 80, 68, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-[2px] bg-gradient-to-t from-gold to-gold-light" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </FloatingCard>

          {/* Floating: Score — bottom-right */}
          <FloatingCard className="absolute right-12 lg:right-24 -bottom-10 z-20" delay={1.0} sensitivity={10}>
            <div className="card-board p-3.5 w-[170px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="text-[11px] font-semibold text-charcoal">Score</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11">
                  <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#F0EBE1" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="16" fill="none" stroke="url(#sg-gold)" strokeWidth="2.5"
                      strokeDasharray="87.96 100.53" strokeLinecap="round"
                    />
                    <defs><linearGradient id="sg-gold"><stop offset="0%" stopColor="#C9A45C" /><stop offset="100%" stopColor="#B8944A" /></linearGradient></defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-charcoal">87</span>
                </div>
                <div>
                  <p className="text-[10px] text-stone font-medium">Overall</p>
                  <p className="text-[10px] text-forest font-semibold">↑ 12 pts</p>
                </div>
              </div>
            </div>
          </FloatingCard>
        </div>

        {/* Mobile dashboard fallback */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="md:hidden mt-12 px-1"
        >
          <div className="card-board overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-cream-dark/50 border-b border-stone-faint/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                <div className="w-2 h-2 rounded-full bg-[#28C840]" />
              </div>
            </div>
            <div className="p-3 bg-cream">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Score", v: "87%", c: "text-charcoal" },
                  { l: "Streak", v: "7 days", c: "text-forest" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-stone-faint/20">
                    <p className="text-[10px] text-stone font-medium">{s.l}</p>
                    <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
