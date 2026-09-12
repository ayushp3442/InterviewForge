"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Brain,
  Award,
  Zap,
  Target,
  BarChart3,
  Mic,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ── Phase Configuration ── */
const PHASES = [
  { id: 0, duration: 4200 },
  { id: 1, duration: 4000 },
  { id: 2, duration: 4500 },
  { id: 3, duration: 4000 },
  { id: 4, duration: 4500 },
  { id: 5, duration: 7000 },
];

/* ── Floating Particle System (Living Atmosphere) ── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background:
              i % 4 === 0
                ? "rgba(245, 158, 11, 0.5)"
                : i % 4 === 1
                ? "rgba(255, 255, 255, 0.2)"
                : i % 4 === 2
                ? "rgba(6, 182, 212, 0.35)"
                : "rgba(245, 158, 11, 0.25)",
          }}
          animate={{
            y: [0, -(20 + Math.random() * 80), 0],
            x: [0, (Math.random() - 0.5) * 50, 0],
            opacity: [0, 0.5 + Math.random() * 0.5, 0],
            scale: [0.3, 1 + Math.random() * 0.8, 0.3],
          }}
          transition={{
            duration: 5 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated Skill Bar ── */
function SkillBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-zinc-200 drop-shadow-md">{label}</span>
        <motion.span
          className="text-xs font-mono font-bold drop-shadow-md"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
        >
          {value}%
        </motion.span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-black/40 backdrop-blur-sm overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to right, ${color}, ${color}aa)` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/* ── Audio Visualizer Bars ── */
function AudioVisualizer() {
  const heights = [30, 55, 80, 45, 100, 75, 90, 50, 85, 60, 95, 40, 70, 35, 65, 45, 88, 55];
  return (
    <div className="flex items-end justify-center gap-[3px] h-16">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full origin-bottom"
          style={{
            background: "linear-gradient(to top, rgba(245, 158, 11, 0.9), rgba(255, 255, 255, 0.7))",
          }}
          animate={{
            height: [`${h * 0.2}%`, `${h}%`, `${h * 0.15}%`, `${h * 0.8}%`],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: Infinity,
            repeatType: "mirror",
            delay: i * 0.05,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Score Ring (SVG Animated) ── */
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          className="text-white/[0.08]"
          strokeWidth="2.5"
          stroke="currentColor"
          fill="none"
          cx="18"
          cy="18"
          r="15.9155"
        />
        <motion.circle
          className="text-amber-400"
          strokeWidth="2.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          cx="18"
          cy="18"
          r="15.9155"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 100 - score }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-black text-white font-mono drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-zinc-300 uppercase tracking-wider font-mono">Score</span>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════════ */
/*  MAIN HERO COMPONENT — BOARDROOM IMMERSIVE ANIMATION                   */
/* ════════════════════════════════════════════════════════════════════════ */

export default function VirtualBoardroomHero() {
  const [activePhase, setActivePhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Continuous seamless loop
  useEffect(() => {
    const dur = PHASES[activePhase]?.duration || 4000;
    const timer = setTimeout(() => {
      setActivePhase((prev) => (prev + 1) % PHASES.length);
    }, dur);
    return () => clearTimeout(timer);
  }, [activePhase]);

  /* Shared luxury transition */
  const luxuryEase = [0.16, 1, 0.3, 1] as const;

  // Ken Burns — different transform per phase for living background motion
  const kenBurnsVariants: Record<number, { scale: number; x: string; y: string }> = {
    0: { scale: 1.08, x: "0%", y: "0%" },
    1: { scale: 1.12, x: "-2%", y: "-1%" },
    2: { scale: 1.15, x: "1%", y: "-2%" },
    3: { scale: 1.1, x: "-1%", y: "1%" },
    4: { scale: 1.13, x: "2%", y: "-1%" },
    5: { scale: 1.06, x: "0%", y: "0%" },
  };

  const currentKB = kenBurnsVariants[activePhase] || kenBurnsVariants[0];
  const isFinale = activePhase === 5;

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#050608]"
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LAYER 0: BOARDROOM BACKDROP (Full-bleed, Ken Burns Motion)    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        {/* Sunset Boardroom */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: isFinale ? 0 : 1,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: currentKB.scale,
              x: currentKB.x,
              y: currentKB.y,
            }}
            transition={{ duration: 6, ease: "easeInOut" }}
          >
            <Image
              src="/images/boardroom_hero.jpg"
              alt="Executive Boardroom"
              fill
              priority
              className="object-cover object-center"
              quality={90}
            />
          </motion.div>
        </motion.div>

        {/* Night Cityscape (Finale) */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: isFinale ? 1 : 0,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: isFinale ? 1.06 : 1.15,
            }}
            transition={{ duration: 7, ease: "easeInOut" }}
          >
            <Image
              src="/images/boardroom_night.jpg"
              alt="Night Cityscape Boardroom"
              fill
              className="object-cover object-center"
              quality={90}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LAYER 1: CINEMATIC GRADIENTS & VIGNETTE (Depth & Readability) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {/* Top darkening for navbar/text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/80 via-[#050608]/30 to-transparent" />
        {/* Bottom deep fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/40 to-transparent" />
        {/* Side vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/70 via-transparent to-[#050608]/70" />
        {/* Radial vignette for cinematic depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,6,8,0.75)_100%)]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LAYER 2: AMBIENT ATMOSPHERE (Breathing Glows)                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {/* Warm glow - top */}
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Cool accent glow - left */}
        <motion.div
          className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 60%)" }}
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Warm accent - right */}
        <motion.div
          className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 60%)" }}
          animate={{ scale: [1, 1.25, 1], y: [0, -25, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LAYER 3: FLOATING PARTICLES                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <FloatingParticles />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LAYER 4: CONTENT — Typography, CTAs, Showcase                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 min-h-screen flex flex-col">

        {/* ── TOP SECTION: Header Text & CTAs ── */}
        <div className="text-center max-w-4xl mx-auto space-y-5">


          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: luxuryEase }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          >
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Interview
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 font-extrabold">
              Forge
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: luxuryEase }}
            className="text-lg sm:text-2xl font-light text-zinc-200/80 tracking-wide max-w-2xl mx-auto drop-shadow-md"
          >
            Master the room <span className="italic font-normal text-white">before</span> you step inside.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: luxuryEase }}
            className="text-sm sm:text-base text-zinc-300/60 max-w-2xl mx-auto leading-relaxed"
          >
            Experience live executive boardroom interviews with AI panelists,
            instant speech telemetry, and multi-dimensional performance grading.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: luxuryEase }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/signup"
              className="relative group overflow-hidden inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Free Interview</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-white/25 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            </Link>

            <a
              href="#workflow"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md text-zinc-200 hover:text-white hover:border-white/20 transition-all duration-300 text-sm font-medium hover:bg-black/40"
            >
              See How It Works
            </a>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  SHOWCASE AREA — Phases animate WITHIN the boardroom scene     */}
        {/*  No border frame, no viewport box — phases float organically  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 relative mt-8">



          {/* ── Phase Content (Floating, Organic, No Frame) ── */}
          <div className="relative min-h-[350px] sm:min-h-[400px]">
            <AnimatePresence mode="wait">

              {/* ── PHASE 0: Pure Atmospheric Boardroom & Elegant Gold Monogram ── */}
              {activePhase === 0 && (
                <motion.div
                  key="phase-0"
                  initial={{ opacity: 0, scale: 0.92, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
                  transition={{ duration: 1, ease: luxuryEase }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 1, type: "spring", stiffness: 120 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/25 via-amber-500/10 to-transparent border border-amber-500/40 backdrop-blur-2xl flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)] mb-6"
                  >
                    <motion.span
                      className="text-3xl font-black text-amber-300 tracking-tight font-mono"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      IF
                    </motion.span>
                  </motion.div>

                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.8 }}
                    className="text-3xl sm:text-5xl font-extrabold text-white tracking-wider uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
                  >
                    INTERVIEW<span className="text-amber-400">FORGE</span> AI
                  </motion.h2>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100px" }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent my-4"
                  />

                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="text-xs sm:text-sm font-light text-zinc-200/70 tracking-[0.3em] uppercase drop-shadow-md"
                  >
                    Practice Today. Perform Tomorrow.
                  </motion.p>
                </motion.div>
              )}

              {/* ── PHASE 1: AI Role Match & Calibration ── */}
              {activePhase === 1 && (
                <motion.div
                  key="phase-1"
                  initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: luxuryEase }}
                  className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
                >
                  <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-black/55 backdrop-blur-2xl border border-white/[0.1] shadow-[0_25px_80px_rgba(0,0,0,0.7)] space-y-5">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                          AI Skill Calibration
                        </h3>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                      >
                        92% Fit
                      </motion.span>
                    </div>

                    <div className="space-y-3.5">
                      <SkillBar label="Distributed Systems Architecture" value={96} color="#f59e0b" delay={0.2} />
                      <SkillBar label="High-Throughput Caching & Partitioning" value={94} color="#06b6d4" delay={0.35} />
                      <SkillBar label="Leadership & STAR Scenario Handling" value={88} color="#a855f7" delay={0.5} />
                      <SkillBar label="Communication & Clarity" value={91} color="#10b981" delay={0.65} />
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between text-[11px]"
                    >
                      <span className="text-zinc-400">Target: <strong className="text-white">Staff Engineer (L6)</strong></span>
                      <span className="text-amber-400/80 font-mono">Generating Rubrics →</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── PHASE 2: Interview Question Card ── */}
              {activePhase === 2 && (
                <motion.div
                  key="phase-2"
                  initial={{ opacity: 0, rotateY: -45, scale: 0.9, filter: "blur(12px)" }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, rotateY: 30, scale: 0.95, filter: "blur(8px)" }}
                  transition={{ duration: 0.9, ease: luxuryEase }}
                  className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
                  style={{ perspective: "1200px" }}
                >
                  <div className="w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-black/65 backdrop-blur-3xl border border-amber-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.8)] space-y-5 text-center">
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.25em] uppercase bg-amber-500/10 text-amber-300 border border-amber-500/25"
                    >
                      TECHNICAL ARCHITECTURE • 01 / 05
                    </motion.div>

                    <motion.h3
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-white drop-shadow-lg"
                    >
                      INTERVIEW QUESTION 01
                    </motion.h3>

                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                    />

                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.7 }}
                      className="text-base sm:text-lg font-light text-zinc-100/90 leading-relaxed italic"
                    >
                      &quot;Walk us through how you would architect a globally distributed key-value cache with sub-1ms p99 read latency, resilient to network partitions across 3 continents.&quot;
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-zinc-400"
                    >
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-400/60" />
                        <span>Prep: 2:30</span>
                      </div>
                      <span className="text-white/10">|</span>
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-3 h-3 text-cyan-400/60" />
                        <span>3 AI Panelists</span>
                      </div>
                      <span className="text-white/10">|</span>
                      <span className="font-mono text-amber-400/60">PANEL READY</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── PHASE 3: Live Interview & Audio Telemetry ── */}
              {activePhase === 3 && (
                <motion.div
                  key="phase-3"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: luxuryEase }}
                  className="absolute inset-0 flex flex-col justify-between p-4 sm:p-8"
                >
                  {/* Status header */}
                  <div className="flex justify-between items-center">
                    <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/[0.08] text-xs flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span className="font-semibold text-white">LIVE SIMULATION ACTIVE</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-2xl border border-amber-500/20 text-xs font-mono text-amber-300/80">
                      Q.01 // 05
                    </div>
                  </div>

                  {/* Center: Audio Visualizer */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.7 }}
                    className="self-center text-center space-y-3 p-6 sm:p-8 rounded-3xl bg-black/55 backdrop-blur-3xl border border-amber-500/20 max-w-md w-full shadow-[0_15px_50px_rgba(245,158,11,0.12)]"
                  >
                    <AudioVisualizer />
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      Candidate Audio Stream
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Real-time vocal clarity & speech cadence analysis active
                    </p>
                  </motion.div>

                  {/* Bottom: Telemetry Cards */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  >
                    <div className="p-3.5 rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/[0.07] text-xs">
                      <div className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider">Vocal Confidence</div>
                      <div className="text-amber-400 font-mono font-bold text-sm mt-0.5">94% <span className="text-zinc-500 font-normal">(Steady)</span></div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/[0.07] text-xs">
                      <div className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider">Cadence</div>
                      <div className="text-cyan-400 font-mono font-bold text-sm mt-0.5">135 WPM <span className="text-zinc-500 font-normal">(Optimal)</span></div>
                    </div>
                    <div className="hidden sm:block p-3.5 rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/[0.07] text-xs">
                      <div className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider">STAR Structure</div>
                      <div className="text-emerald-400 font-mono font-bold text-sm mt-0.5">Verified</div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ── PHASE 4: Performance Report ── */}
              {activePhase === 4 && (
                <motion.div
                  key="phase-4"
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: luxuryEase }}
                  className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
                >
                  <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-black/55 backdrop-blur-3xl border border-amber-500/25 shadow-[0_25px_80px_rgba(245,158,11,0.15)] space-y-5">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                          Executive Performance Report
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">Complete</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                      <ScoreRing score={82} size={120} />

                      <div className="space-y-2 text-center sm:text-left">
                        <motion.div
                          initial={{ x: 15, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-lg font-bold text-emerald-400"
                        >
                          Strong Performance
                        </motion.div>
                        <p className="text-xs text-zinc-300/80 max-w-xs leading-relaxed">
                          Excellent architectural decomposition and clear communication under panel pressure.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                      {[
                        { label: "Communication", score: "78%", color: "text-white" },
                        { label: "Technical Depth", score: "94%", color: "text-amber-400" },
                        { label: "Confidence", score: "85%", color: "text-cyan-400" },
                      ].map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
                        >
                          <div className="text-[11px] text-zinc-400">{m.label}</div>
                          <div className={`text-sm font-bold font-mono mt-0.5 ${m.color}`}>{m.score}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PHASE 5: Night Skyline Finale with CTA ── */}
              {activePhase === 5 && (
                <motion.div
                  key="phase-5"
                  initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.06, filter: "blur(10px)" }}
                  transition={{ duration: 1, ease: luxuryEase }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center"
                >
                  {/* Dramatic ambient glow behind CTA */}
                  <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 60%)" }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <div className="relative p-8 sm:p-12 rounded-3xl bg-black/60 backdrop-blur-3xl border border-amber-500/30 shadow-[0_0_120px_rgba(245,158,11,0.25)] max-w-md w-full space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                    >
                      <Sparkles className="w-6 h-6 text-amber-400" />
                    </motion.div>

                    <motion.h3
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.7 }}
                      className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                    >
                      Ready for Your First Session?
                    </motion.h3>

                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-xs sm:text-sm text-zinc-300/80"
                    >
                      Step into the boardroom. Practice with AI leaders calibrated to FAANG hiring bars.
                    </motion.p>

                    <motion.div
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.65, duration: 0.6 }}
                    >
                      <Link
                        href="/signup"
                        className="w-full group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-bold text-base shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_rgba(245,158,11,0.7)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                      >
                        <span>Start Your AI Interview</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
                        <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-[11px] text-zinc-500 font-mono"
                    >
                      Free 15-minute diagnostic • No credit card required
                    </motion.div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* ── Feature Highlights Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-10 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center"
        >
          {[
            { metric: "10,000+", label: "Mock Boardrooms Hosted" },
            { metric: "98.4%", label: "Placement Success Rate" },
            { metric: "< 140ms", label: "Real-Time Feedback Loop" },
            { metric: "FAANG+", label: "Calibrated Rubrics" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2, borderColor: "rgba(245, 158, 11, 0.15)" }}
              className="p-5 rounded-2xl border border-white/[0.05] bg-black/30 backdrop-blur-xl transition-colors duration-300"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 font-mono">
                {item.metric}
              </div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
