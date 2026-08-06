"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, FileText, Brain, BarChart3, Award } from "lucide-react";
import Link from "next/link";

function FloatingCard({
  children,
  className,
  delay = 0,
  offsetX = 0,
  offsetY = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  offsetX?: number;
  offsetY?: number;
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        x: mouse.x * offsetX,
        y: mouse.y * offsetY,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute inset-0 gradient-mesh" />
        {/* Dot grid */}
        <div className="absolute inset-0 bg-dot-grid" />
        {/* Animated blobs */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-brand-400/10 rounded-full gradient-blob" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-navy-500/10 rounded-full gradient-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-300/5 rounded-full gradient-blob" style={{ animationDelay: "5s" }} />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto pt-12 sm:pt-20 pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
            AI-Powered Interview Preparation
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
          >
            Ace every interview
            <br />
            <span className="text-gradient">with AI precision</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Practice with realistic AI-driven interviews, receive instant
            expert-level feedback, and track your improvement — all in one
            platform built for serious candidates.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-gray-50"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </a>
          </motion.div>
        </div>

        {/* Floating Cards */}
        <div className="relative max-w-5xl mx-auto mt-4 mb-8 hidden md:block">
          {/* Central Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-3xl"
          >
            {/* Browser Chrome */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-200/60 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md text-[11px] text-gray-400 border border-gray-200 font-mono">
                    interviewforge.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 bg-gray-50/50">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Interviews", value: "24", change: "+3 this week", color: "text-brand-600" },
                    { label: "Avg Score", value: "87%", change: "+12% improvement", color: "text-emerald-600" },
                    { label: "Top Score", value: "96%", change: "Technical round", color: "text-purple-600" },
                    { label: "Streak", value: "7 days", change: "Keep going!", color: "text-amber-600" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 border border-gray-100"
                    >
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className={`text-[11px] ${stat.color} mt-0.5 font-medium`}>{stat.change}</p>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-3">Performance Trend</p>
                  <div className="flex items-end gap-1 h-20">
                    {[40, 55, 45, 60, 70, 65, 78, 72, 85, 80, 88, 92].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-500 to-brand-300"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect behind dashboard */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-navy-500/10 rounded-3xl -z-10 blur-2xl" />
          </motion.div>

          {/* Floating Resume Card - Left */}
          <FloatingCard
            className="absolute -left-4 lg:left-4 top-8 z-20"
            delay={0.6}
            offsetX={-12}
            offsetY={8}
          >
            <div className="bg-white rounded-xl p-4 shadow-xl shadow-gray-900/5 border border-gray-100 w-[200px] animate-float">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <span className="text-xs font-semibold text-gray-900">Resume Parsed</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Skills Match</span>
                  <span className="text-emerald-600 font-medium">94%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full" style={{ width: "94%" }} />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {["React", "Node.js", "TypeScript"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FloatingCard>

          {/* Floating AI Card - Right */}
          <FloatingCard
            className="absolute -right-4 lg:right-4 top-16 z-20"
            delay={0.7}
            offsetX={12}
            offsetY={-6}
          >
            <div className="bg-white rounded-xl p-4 shadow-xl shadow-gray-900/5 border border-gray-100 w-[200px] animate-float-slow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-900">AI Feedback</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "Technical", score: 92, color: "from-brand-400 to-brand-500" },
                  { label: "Communication", score: 88, color: "from-purple-400 to-purple-500" },
                  { label: "Confidence", score: 85, color: "from-amber-400 to-amber-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-gray-600 font-medium">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div className={`bg-gradient-to-r ${item.color} h-1 rounded-full`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>

          {/* Floating Analytics Card - Bottom Left */}
          <FloatingCard
            className="absolute left-16 lg:left-28 -bottom-4 z-20"
            delay={0.8}
            offsetX={-8}
            offsetY={10}
          >
            <div className="bg-white rounded-xl p-4 shadow-xl shadow-gray-900/5 border border-gray-100 w-[180px] animate-float-slower">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-gray-900">Analytics</span>
              </div>
              <div className="flex items-end gap-0.5 h-10">
                {[30, 50, 40, 65, 55, 75, 85, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-400 to-emerald-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </FloatingCard>

          {/* Floating Score Card - Bottom Right */}
          <FloatingCard
            className="absolute right-16 lg:right-28 -bottom-8 z-20"
            delay={0.9}
            offsetX={10}
            offsetY={12}
          >
            <div className="bg-white rounded-xl p-4 shadow-xl shadow-gray-900/5 border border-gray-100 w-[180px] animate-float">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-gray-900">Performance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="3"
                      strokeDasharray="87, 100"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGrad">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">87</span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Overall Score</p>
                  <p className="text-[11px] text-emerald-600 font-medium">↑ 12 pts</p>
                </div>
              </div>
            </div>
          </FloatingCard>
        </div>

        {/* Mobile simple mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="md:hidden mt-4 px-2"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="p-4 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Score", value: "87%", color: "text-brand-600" },
                  { label: "Streak", value: "7 days", color: "text-emerald-600" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
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
