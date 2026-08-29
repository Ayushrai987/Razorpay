"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Play, X, Code2, Activity, Filter, CheckCircle2, Pause, SkipForward, Landmark, DollarSign, Cpu, ChevronDown } from "lucide-react";

export default function Hero() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"stream" | "json" | "rules">("stream");
  
  // Interactive Walkthrough state
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoStep, setVideoStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // 3D Mouse Tilt values
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const rotateX = useTransform(y, [0, 400], [8, -8]);
  const rotateY = useTransform(x, [0, 400], [-8, 8]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const normalizedX = (mouseX / width) * 400;
    const normalizedY = (mouseY / height) * 400;
    
    x.set(normalizedX);
    y.set(normalizedY);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  // Walkthrough player loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setVideoStep((s) => (s + 1) % 4);
            return 0;
          }
          return p + 2;
        });
      }, 60);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const walkthroughChapters = [
    {
      title: "Step 1: Webhook Ingestion",
      subtitle: "RazorGuard monitors Razorpay events stream directly in under 10ms.",
      description: "When a checkout triggers a payload dispatch, our webhook listener parses transaction fingerprints.",
      icon: Activity,
      color: "text-[#14b8a6]",
      bg: "bg-[#14b8a6]/10",
    },
    {
      title: "Step 2: AI Risk Validation",
      subtitle: "XGBoost models predict duplicate risk classification scores.",
      description: "Evaluates time deltas, user hashes, and gateway states to distinguish true duplicate pairs from legitimate checkouts.",
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Step 3: Auto-Refund Trigger",
      subtitle: "Idempotent payment refund API dispatched instantly to Razorpay.",
      description: "Confirmed duplicates call Razorpay APIs to reverse double-deductions instantly, before chargebacks are initialized.",
      icon: DollarSign,
      color: "text-[#10b981]",
      bg: "bg-[#10b981]/10",
    },
    {
      title: "Step 4: Metric Safe-Guarding",
      subtitle: "Live merchant ledger metrics and audit feeds refreshed.",
      description: "Revenue protected logs automatically update, and customer email alerts are sent confirming transaction reversals.",
      icon: Landmark,
      color: "text-[#3b82f6]",
      bg: "bg-[#3b82f6]/10",
    }
  ];

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 bg-[#0f0c29] overflow-hidden border-b border-white/10 hero-stagger">
    
    {/* 2. a) Animated gradient background and moving shapes */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Color shifting gradient */}
      <div className="absolute inset-0 opacity-40 bg-hero-animated" />

      {/* Moving shapes */}
      <div className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full border-2 border-white/5 animate-float-slow" />
      <div className="absolute top-[60%] right-[15%] w-48 h-48 rounded-lg border-2 border-white/5 animate-float-fast" />
      <div className="absolute bottom-[10%] left-[25%] w-24 h-24 rounded-full bg-gradient-to-tr from-[#667eea]/10 to-[#14b8a6]/5 blur-xl animate-float-slow" />

      {/* Particles floating effect (Desktop only for performance) */}
      <div className="hidden lg:block absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#14b8a6]/40 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute top-2/3 left-1/5 w-1.5 h-1.5 rounded-full bg-[#667eea]/40 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-white/20 animate-ping" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 rounded-full bg-[#10b981]/50 animate-pulse" style={{ animationDuration: "2.5s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />
    </div>

    <div className="relative max-w-[1536px] mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center w-full z-10">
    
      {/* Left Column: Headline, subheadline, CTA buttons */}
      <div className="lg:col-span-6 flex flex-col gap-8 text-left">
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-fit">
          <span className="section-tag px-5 py-2 text-xs rounded-full">
            <ShieldCheck className="w-4 h-4 text-[#14b8a6]" />
            Razorpay Certified Webhook Guard
          </span>
        </motion.div>

        {/* Headline - Slide up + Fade in */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headings text-white leading-[1.1] tracking-tight">
          Protect Your Revenue from <span className="text-gradient">Duplicate Payments</span>
        </motion.h1>

        {/* Subheadline - Fade in after headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#a0aec0] font-light max-w-xl font-body">
          AI-powered detection & automatic refunds for Razorpay
        </motion.p>

        {/* Description - Fade in */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-base text-[#a0aec0] leading-relaxed font-body max-w-xl">
          Stop losing money to duplicate charges, payment retries, and multi-click checkouts. Our real-time machine learning engine evaluates transaction streams in <strong className="text-white font-semibold">&lt;100ms</strong> to automate client resolution.
        </motion.p>

        {/* CTA Buttons - 0.3s transitions, hover states */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-5 pt-3">
          <Link
            href="/#contact"
            className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-10 py-5 text-lg rounded-2xl animate-soft-pulse hover:shadow-[0_0_25px_rgba(102,126,234,0.7)]">
            Start Free Trial
            <ArrowRight className="w-6 h-6" />
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-fit"
          >
            <span className="section-tag px-5 py-2 text-xs rounded-full">
              <ShieldCheck className="w-4 h-4 text-[#14b8a6]" />
              Razorpay Certified Webhook Guard
            </span>
          </motion.div>

          {/* Headline - Slide up + Fade in */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-poppins text-white leading-[1.1] tracking-tight"
          >
            Protect Your Revenue from <span className="text-gradient">Duplicate Payments</span>
          </motion.h1>

          {/* Subheadline - Fade in after headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#a0aec0] font-light max-w-xl font-poppins"
          >
            AI-powered detection & automatic refunds for Razorpay
          </motion.p>

          {/* Description - Fade in */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-base text-[#a0aec0] leading-relaxed font-inter font-light max-w-xl"
          >
            Stop losing money to duplicate charges, payment retries, and multi-click checkouts. Our real-time machine learning engine evaluates transaction streams in <strong className="text-white font-semibold">&lt;100ms</strong> to automate client resolution.
          </motion.p>

          {/* CTA Buttons - 0.3s transitions, hover states */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-5 pt-3"
          >
            <Link
              href="/#contact"
              className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-10 py-5 text-lg rounded-2xl animate-soft-pulse hover:shadow-[0_0_25px_rgba(102,126,234,0.7)]"
            >
              Start Free Trial
              <ArrowRight className="w-6 h-6" />
            </Link>
            
            <button
              onClick={() => { setVideoModalOpen(true); setIsPlaying(true); }}
              className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 px-9 py-5 text-lg rounded-2xl group transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              </div>
              Watch Demo
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10 text-xs font-semibold text-[#a0aec0]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#10b981]" />
              <span>No Credit Card Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-[#14b8a6]" />
              <span>5-Min Webhook Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[#3b82f6]" />
              <span>100% Model Accuracy</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: 3D Console UI Box */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="lg:col-span-6 relative w-full cursor-pointer select-none"
          style={{ perspective: 1200 }}
        >
          {/* Subtle floating glow backdrop */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#667eea] to-[#14b8a6] rounded-3xl opacity-20 blur-xl animate-soft-pulse z-0 pointer-events-none" />

          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#0f0c29]/90 backdrop-blur-md transition-all duration-100 relative z-10"
          >
            {/* macOS Chrome Header */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 font-mono text-[10px] text-gray-400 font-semibold tracking-wider">razorguard_engine.io</span>
              </div>
              
              {/* Control Tabs */}
              <div className="flex bg-white/5 p-1 rounded-xl gap-0.5 text-[10px] font-bold border border-white/5">
                <button
                  onClick={() => setActiveTab("stream")}
                  className={`px-3 py-1 rounded-lg transition-all ${activeTab === "stream" ? "bg-white/10 text-white shadow-sm" : "text-[#a0aec0] hover:text-white"}`}
                >
                  <Activity className="w-3 h-3 inline mr-1 text-[#14b8a6]" />
                  Live Stream
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1 rounded-lg transition-all ${activeTab === "json" ? "bg-white/10 text-white shadow-sm" : "text-[#a0aec0] hover:text-white"}`}
                >
                  <Code2 className="w-3 h-3 inline mr-1 text-purple-400" />
                  API Payload
                </button>
                <button
                  onClick={() => setActiveTab("rules")}
                  className={`px-3 py-1 rounded-lg transition-all ${activeTab === "rules" ? "bg-white/10 text-white shadow-sm" : "text-[#a0aec0] hover:text-white"}`}
                >
                  <Filter className="w-3 h-3 inline mr-1 text-[#3b82f6]" />
                  Risk Rules
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="p-8 space-y-5 bg-[#0a081e]/40">
              {activeTab === "stream" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] text-[#a0aec0] font-bold uppercase tracking-wider">
                    <span>Incoming Checkout Stream</span>
                    <span className="flex items-center gap-1.5 text-[#10b981] font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                      SUB-100MS ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5 text-sm">
                      <div>
                        <div className="font-mono font-bold text-white">pay_N8a2B7cD</div>
                        <div className="text-[11px] text-[#a0aec0] mt-0.5">User: usr_9381 • UPI Intent</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">₹154.00</div>
                        <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Secure</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#667eea]/10 rounded-xl p-4 border border-[#667eea]/30 text-sm">
                      <div>
                        <div className="font-mono font-bold text-white">pay_K7a9P4qL <span className="text-xs text-[#ef4444] font-semibold">(Double-Click)</span></div>
                        <div className="text-[11px] text-[#a0aec0] mt-0.5">User: usr_4201 • Retried in 1.4s</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">₹125.00</div>
                        <span className="text-[9px] bg-[#3b82f6]/20 text-[#3b82f6] font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Auto-Refunded</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5 text-sm">
                      <div>
                        <div className="font-mono font-bold text-white">pay_M9d1C2eA</div>
                        <div className="text-[11px] text-[#a0aec0] mt-0.5">User: usr_1102 • Netbanking</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">₹450.00</div>
                        <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "json" && (
                <div className="bg-[#0a081e] rounded-2xl p-5 font-mono text-[11px] text-gray-300 overflow-x-auto leading-relaxed border border-white/5">
                  <span className="text-purple-400">{"// RazorGuard Signature Analysis"}</span><br />
                  &#123;<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#14b8a6]">event</span>&quot;: &quot;<span className="text-yellow-400">payment.captured</span>&quot;,<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#14b8a6]">duplicate_risk_score</span>&quot;: <span className="text-[#ef4444]">0.998</span>,<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#14b8a6]">matched_previous_id</span>&quot;: &quot;<span className="text-purple-400">pay_J6b8O3pM</span>&quot;,<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#14b8a6]">auto_refund_status</span>&quot;: &quot;<span className="text-[#10b981]">DISPATCHED_200_OK</span>&quot;<br />
                  &#125;
                </div>
              )}

              {activeTab === "rules" && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                      <div className="font-bold text-white">Time Delta Window</div>
                      <div className="text-xs text-[#a0aec0] mt-0.5">Flag identical items inside 5-min limit</div>
                    </div>
                    <span className="font-mono font-bold text-[#14b8a6]">300 sec</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                      <div className="font-bold text-white">Semantic Content Match</div>
                      <div className="text-xs text-[#a0aec0] mt-0.5">Canvas & IP header comparison</div>
                    </div>
                    <span className="font-mono font-bold text-[#10b981]">Active</span>
                  </div>
                </div>
              )}

              {/* Bottom stats strip */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-base font-poppins text-[#14b8a6]">1,105</div>
                  <div className="text-[9px] text-[#a0aec0] mt-0.5">Duplicates</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-base font-poppins text-[#10b981]">₹79.39 Cr</div>
                  <div className="text-[9px] text-[#a0aec0] mt-0.5">Revenue Protected</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-base font-poppins text-purple-400">100%</div>
                  <div className="text-[9px] text-[#a0aec0] mt-0.5">ML Accuracy</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Down arrow indicator with pulse */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-60">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#a0aec0]">Explore Platform</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#14b8a6]" />
        </motion.div>
      </div>

      {/* Watch Demo Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setVideoModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-[#0f0c29] border border-white/10 text-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl z-10 overflow-hidden"
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#14b8a6]">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
                <div>
                  <h3 className="font-bold font-poppins text-2xl text-white">Interactive Product Walkthrough</h3>
                  <p className="text-xs text-[#a0aec0]">Simulation of the AI duplicate resolution feedback loop</p>
                </div>
              </div>

              {/* Main Simulated Video Canvas */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                
                {/* Visualizer Panel */}
                <div className="md:col-span-7 bg-[#0a081e] rounded-2xl p-6 flex flex-col justify-between min-h-[300px] border border-white/10 text-white relative">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>STEP {videoStep + 1} OF 4</span>
                    <span className="flex items-center gap-1.5 text-[#14b8a6]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-ping" />
                      SIMULATING
                    </span>
                  </div>

                  {/* Stage-specific visual illustration */}
                  <div className="my-8 flex flex-col items-center justify-center text-center">
                    {React.createElement(walkthroughChapters[videoStep].icon, {
                      className: `w-16 h-16 ${walkthroughChapters[videoStep].color} mb-4 animate-pulse`
                    })}
                    <h4 className="font-bold text-lg font-poppins">{walkthroughChapters[videoStep].title}</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">{walkthroughChapters[videoStep].subtitle}</p>
                  </div>

                  {/* Progress Slider */}
                  <div className="space-y-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#14b8a6] transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>{walkthroughChapters[videoStep].title}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Control Panel */}
                <div className="md:col-span-5 flex flex-col justify-between p-2">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest font-mono">Narrator Insights</span>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {walkthroughChapters[videoStep].description}
                    </p>
                  </div>

                  {/* Audio/Playback Controls */}
                  <div className="space-y-3 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="btn-primary p-3 rounded-xl flex items-center justify-center shrink-0"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                      </button>
                      <button 
                        onClick={() => { setVideoStep((s) => (s + 1) % 4); setProgress(0); }}
                        className="btn-secondary p-3 rounded-xl flex items-center justify-center shrink-0 border-white/20"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <div className="text-xs text-gray-450 font-medium pl-2">
                        {isPlaying ? "Autoplay active" : "Video paused"}
                      </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex gap-1.5 pt-2">
                      {walkthroughChapters.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setVideoStep(idx); setProgress(0); }}
                          className={`flex-1 h-2 rounded-full transition-all ${videoStep === idx ? "bg-[#14b8a6]" : "bg-white/10"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
