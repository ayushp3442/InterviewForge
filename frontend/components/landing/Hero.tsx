"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Play,
  FileText,
  Brain,
  BarChart3,
  Award,
  Sparkles,
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
  floatClass = "animate-float",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  sensitivity?: number;
  floatClass?: string;
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
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ x: pos.x, y: pos.y }}
      className={`${className} ${floatClass}`}
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
/*  Particle field                                                    */
/* ------------------------------------------------------------------ */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    const count = 40;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.05,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${p.o})`;
        ctx.fill();
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
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
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* ---- Background layers ---- */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 bg-dot-grid" />
        <Particles />
        {/* Gradient orbs */}
        <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px] bg-primary-500/[0.07] rounded-full gradient-orb" />
        <div
          className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] bg-purple-500/[0.05] rounded-full gradient-orb"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-[40%] left-[45%] w-[700px] h-[700px] bg-indigo-400/[0.04] rounded-full gradient-orb"
          style={{ animationDelay: "6s" }}
        />
      </motion.div>

      {/* ---- Content ---- */}
      <motion.div style={{ opacity: fade }} className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-[12px] font-semibold text-primary-700 tracking-wide uppercase">
              AI-Powered Interview Prep
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.035em] text-primary-900"
          >
            Ace every interview
            <br />
            <span className="text-gradient-hero">with AI precision</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-[clamp(1rem,1.8vw,1.2rem)] text-gray-500 max-w-xl mx-auto leading-relaxed font-normal"
          >
            Upload your resume. Practice with AI interviewers. Get instant
            expert feedback. Track your progress to perfection.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary-900 text-white text-sm font-semibold rounded-xl transition-all duration-500 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_rgba(15,23,42,0.18)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_16px_40px_rgba(15,23,42,0.25)] hover:-translate-y-0.5"
            >
              Start Practicing Free
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            <a
              href="#workflow"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-gray-500 hover:text-primary-900 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-gray-100/50"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors duration-300">
                <Play className="w-3.5 h-3.5 ml-0.5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              See How It Works
            </a>
          </motion.div>
        </div>

        {/* ---- Floating Cards + Dashboard ---- */}
        <div className="relative max-w-4xl mx-auto mt-16 sm:mt-20 hidden md:block">
          {/* Central Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glow behind */}
            <div className="absolute -inset-8 bg-gradient-to-r from-primary-500/[0.06] via-purple-500/[0.04] to-indigo-500/[0.06] rounded-[32px] blur-3xl" />

            {/* Browser chrome */}
            <div className="relative glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 border-b border-gray-200/40">
                <div className="flex gap-[6px]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-6 py-1 bg-white/80 rounded-lg text-[11px] text-gray-400 border border-gray-200/60 font-mono tracking-wide">
                    interviewforge.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 bg-[#fafafa]">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Interviews", value: 24, suffix: "", delta: "+3 this week", color: "text-primary-600" },
                    { label: "Avg Score", value: 87, suffix: "%", delta: "+12% improvement", color: "text-emerald-600" },
                    { label: "Top Score", value: 96, suffix: "%", delta: "Technical round", color: "text-violet-600" },
                    { label: "Streak", value: 7, suffix: " days", delta: "Keep going!", color: "text-amber-600" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-100/80">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.08em]">{s.label}</p>
                      <p className="text-xl font-bold text-primary-900 mt-1 tabular-nums">
                        <Counter target={s.value} suffix={s.suffix} />
                      </p>
                      <p className={`text-[10px] ${s.color} mt-0.5 font-medium`}>{s.delta}</p>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div className="bg-white rounded-xl p-4 border border-gray-100/80">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-700 tracking-tight">Performance Trend</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      <TrendingUp className="w-3 h-3" />
                      +23%
                    </div>
                  </div>
                  <div className="flex items-end gap-[3px] h-[72px]">
                    {[38, 48, 42, 56, 52, 64, 60, 72, 68, 78, 74, 82, 80, 88, 86, 92].map((h, i) => (
                      <div key={i} className="flex-1">
                        <div
                          className="rounded-[3px] bg-gradient-to-t from-primary-500 to-primary-300 transition-all duration-700"
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
            <div className="glass-card p-4 w-[200px] shadow-xl shadow-primary-900/[0.03]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-primary-900">Resume Parsed</p>
                  <p className="text-[9px] text-gray-400">Just now</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-400 font-medium">Skills Match</span>
                    <span className="text-emerald-600 font-semibold">94%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-[5px]">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap pt-0.5">
                  {["React", "Node.js", "TypeScript"].map((t) => (
                    <span key={t} className="px-2 py-[3px] bg-primary-50 text-primary-600 text-[9px] font-semibold rounded-md">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </FloatingCard>

          {/* Floating: AI Brain — top-right */}
          <FloatingCard className="absolute -right-8 lg:right-0 top-12 z-20" delay={0.8} sensitivity={12} floatClass="animate-float-slow">
            <div className="glass-card p-4 w-[200px] shadow-xl shadow-primary-900/[0.03]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-primary-900">AI Feedback</p>
                  <p className="text-[9px] text-gray-400">Live analysis</p>
                </div>
              </div>
              <div className="space-y-[6px]">
                {[
                  { l: "Technical", v: 92, c: "from-primary-400 to-primary-500" },
                  { l: "Communication", v: 88, c: "from-violet-400 to-violet-500" },
                  { l: "Confidence", v: 85, c: "from-amber-400 to-amber-500" },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="flex justify-between text-[10px] mb-[2px]">
                      <span className="text-gray-400 font-medium">{m.l}</span>
                      <span className="text-primary-900 font-semibold tabular-nums">{m.v}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-[4px]">
                      <div className={`bg-gradient-to-r ${m.c} h-full rounded-full`} style={{ width: `${m.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>

          {/* Floating: Analytics — bottom-left */}
          <FloatingCard className="absolute left-12 lg:left-24 -bottom-6 z-20" delay={0.9} sensitivity={-8} floatClass="animate-float-slower">
            <div className="glass-card p-3.5 w-[170px] shadow-xl shadow-primary-900/[0.03]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-[11px] font-semibold text-primary-900">Analytics</span>
              </div>
              <div className="flex items-end gap-[2px] h-10">
                {[28, 45, 38, 60, 52, 72, 80, 68, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-[2px] bg-gradient-to-t from-emerald-400 to-emerald-300" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </FloatingCard>

          {/* Floating: Score — bottom-right */}
          <FloatingCard className="absolute right-12 lg:right-24 -bottom-10 z-20" delay={1.0} sensitivity={10}>
            <div className="glass-card p-3.5 w-[170px] shadow-xl shadow-primary-900/[0.03]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-[11px] font-semibold text-primary-900">Score</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11">
                  <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="16" fill="none" stroke="url(#sg)" strokeWidth="2.5"
                      strokeDasharray="87.96 100.53" strokeLinecap="round"
                    />
                    <defs><linearGradient id="sg"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></linearGradient></defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-primary-900">87</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Overall</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">↑ 12 pts</p>
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
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-b border-gray-200/40">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                <div className="w-2 h-2 rounded-full bg-[#28C840]" />
              </div>
            </div>
            <div className="p-3 bg-[#fafafa]">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Score", v: "87%", c: "text-primary-600" },
                  { l: "Streak", v: "7 days", c: "text-emerald-600" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100/80">
                    <p className="text-[10px] text-gray-400 font-medium">{s.l}</p>
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
