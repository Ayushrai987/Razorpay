"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Activity, Filter, CheckCircle2, Play, X, Code2, Pause, SkipForward, Landmark, Cpu, ChevronDown } from "lucide-react";

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
  const rotateX = useTransform(y, [0, 400], [6, -6]);
  const rotateY = useTransform(x, [0, 400], [-6, 6]);

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
      subtitle: "Captures Razorpay payment event webhooks in sub-100ms.",
      description: "When a customer triggers a payment, the webhook listener ingests event payloads, user hashes, and checkout timestamps.",
      icon: Activity,
      color: "text-[#2dd4bf]",
    },
    {
      title: "Step 2: Signal Pattern Match",
      subtitle: "Evaluates duplicate risk scores across recent transaction histories.",
      description: "Compares order ID, customer hash, IP fingerprint, and amount inside a configurable lookback window (e.g. 5s to 24h).",
      icon: Cpu,
      color: "text-purple-400",
    },
    {
      title: "Step 3: Auto-Refund Trigger",
      subtitle: "Dispatches idempotent refund API calls directly to Razorpay.",
      description: "Confirmed duplicate charges trigger instant API reversals before dispute tickets or chargebacks can be filed.",
      icon: ShieldCheck,
      color: "text-[#10b981]",
    },
    {
      title: "Step 4: Audit & Ledger Sync",
      subtitle: "Records transparent event logs for merchant accounting.",
      description: "Generates clear verification records so finance teams can trace every flagged duplicate transaction and refund response.",
      icon: Landmark,
      color: "text-[#3b82f6]",
    }
  ];

  return (
    <section id="home" className="relative pt-28 pb-16 lg:pt-36 lg:pb-28 bg-[#080711] overflow-hidden border-b border-white/10">
      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#4f46e5]/15 via-[#0d9488]/15 to-transparent blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-tech-grid opacity-30" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full z-10">
        
        {/* Left Column: Core Positioning */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-fit"
          >
            <span className="section-tag">
              <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
              Merchant Payment Security Console
            </span>
          </motion.div>

          {/* Single Primary H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-headings text-white leading-[1.15] tracking-tight"
          >
            Stop Duplicate Payments Before They Become <span className="text-gradient">Refunds & Disputes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-[#cbd5e1] font-normal leading-relaxed max-w-xl"
          >
            Real-time duplicate payment detection and automated recovery for Razorpay merchant workflows. Catch double deductions caused by button double-clicks, gateway timeouts, and retry loops in <strong className="text-white font-semibold">&lt;100ms</strong>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-2"
          >
            <Link
              href="/#demo"
              className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
            >
              Test Prototype Sandbox
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={() => { setVideoModalOpen(true); setIsPlaying(true); }}
              className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base group"
            >
              <span className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
              </span>
              View Architecture Walkthrough
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs font-medium text-[#94a3b8]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span>Idempotent Razorpay Refunds</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2dd4bf]" />
              <span>5-Min Webhook Endpoint Setup</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Transaction Matching Visual Representation */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-6 relative w-full select-none"
          style={{ perspective: 1000 }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="rounded-2xl border border-white/15 shadow-2xl overflow-hidden bg-[#0f0c22] relative z-10"
          >
            {/* Header Bar */}
            <div className="bg-white/5 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-[11px] text-[#94a3b8] font-semibold">transaction_matching_console.log</span>
              </div>

              {/* Console Tabs */}
              <div className="flex bg-white/5 p-1 rounded-lg gap-0.5 text-[11px] font-mono border border-white/5">
                <button
                  onClick={() => setActiveTab("stream")}
                  className={`px-2.5 py-1 rounded transition-all ${activeTab === "stream" ? "bg-white/10 text-white font-bold" : "text-[#94a3b8] hover:text-white"}`}
                >
                  <Activity className="w-3 h-3 inline mr-1 text-[#2dd4bf]" />
                  Event Stream
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-2.5 py-1 rounded transition-all ${activeTab === "json" ? "bg-white/10 text-white font-bold" : "text-[#94a3b8] hover:text-white"}`}
                >
                  <Code2 className="w-3 h-3 inline mr-1 text-purple-400" />
                  Payload Analysis
                </button>
                <button
                  onClick={() => setActiveTab("rules")}
                  className={`px-2.5 py-1 rounded transition-all ${activeTab === "rules" ? "bg-white/10 text-white font-bold" : "text-[#94a3b8] hover:text-white"}`}
                >
                  <Filter className="w-3 h-3 inline mr-1 text-[#3b82f6]" />
                  Rules
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="p-6 space-y-4 bg-[#080711]">
              {activeTab === "stream" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#94a3b8] font-mono font-semibold uppercase">
                    <span>Recent Razorpay Webhook Events</span>
                    <span className="flex items-center gap-1.5 text-[#10b981] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                      MONITORING ACTIVE
                    </span>
                  </div>

                  {/* Transaction Comparison 1 */}
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between items-center text-white font-bold">
                      <span>txn_98214a (Original)</span>
                      <span className="text-[#10b981]">₹2,499.00 • 10:42:17 AM</span>
                    </div>
                    <div className="text-[11px] text-[#94a3b8] flex justify-between">
                      <span>Order #8291 • User Hash: usr_c3a9</span>
                      <span className="text-[#10b981] font-bold">Status: Captured</span>
                    </div>
                  </div>

                  {/* Transaction Comparison 2 — Flagged Duplicate */}
                  <div className="bg-red-500/10 rounded-xl p-3.5 border border-red-500/30 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between items-center text-white font-bold">
                      <span className="text-red-400">txn_98214b (Matched Pair)</span>
                      <span className="text-red-400">₹2,499.00 • 10:42:19 AM (+2.1s)</span>
                    </div>
                    <div className="text-[11px] text-[#cbd5e1] flex justify-between items-center">
                      <span>Order #8291 • User Hash: usr_c3a9</span>
                      <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Duplicate Flagged
                      </span>
                    </div>
                    <div className="pt-1 text-[10px] text-[#2dd4bf] border-t border-red-500/20 flex justify-between items-center">
                      <span>Action: Razorpay Idempotent Refund Dispatched</span>
                      <span className="font-bold">HTTP 200 OK</span>
                    </div>
                  </div>

                  {/* Transaction 3 */}
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between items-center text-white font-bold">
                      <span>txn_98215x (Unique)</span>
                      <span className="text-[#10b981]">₹1,150.00 • 10:43:02 AM</span>
                    </div>
                    <div className="text-[11px] text-[#94a3b8] flex justify-between">
                      <span>Order #8292 • User Hash: usr_f7b1</span>
                      <span className="text-[#10b981] font-bold">Status: Passed</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "json" && (
                <div className="bg-[#0f0c22] rounded-xl p-4 font-mono text-[11px] text-gray-300 overflow-x-auto leading-relaxed border border-white/10">
                  <span className="text-purple-400">{"// Sample RazorGuard Match Log"}</span><br />
                  &#123;<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">event_type</span>&quot;: &quot;<span className="text-yellow-400">payment.captured</span>&quot;,<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">match_confidence</span>&quot;: <span className="text-[#10b981]">0.99</span>,<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">time_delta_seconds</span>&quot;: <span className="text-blue-400">2.1</span>,<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">original_payment_id</span>&quot;: &quot;<span className="text-purple-400">pay_98214a</span>&quot;,<br />
                  &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">auto_refund_dispatched</span>&quot;: <span className="text-[#10b981]">true</span><br />
                  &#125;
                </div>
              )}

              {activeTab === "rules" && (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <div>
                      <div className="font-bold text-white">Time Window Delta</div>
                      <div className="text-[10px] text-[#94a3b8]">Flag identical user/amount pairs inside lookback limit</div>
                    </div>
                    <span className="text-[#2dd4bf] font-bold">5s – 300s</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <div>
                      <div className="font-bold text-white">Order ID Hash Matching</div>
                      <div className="text-[10px] text-[#94a3b8]">Prevent duplicate webhook processing for same merchant order</div>
                    </div>
                    <span className="text-[#10b981] font-bold">Active</span>
                  </div>
                </div>
              )}

              {/* Bottom Honest Parameters */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 text-center font-mono">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-[#2dd4bf]">&lt;100ms</div>
                  <div className="text-[9px] text-[#94a3b8]">Avg Detection Latency</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-[#10b981]">Idempotent</div>
                  <div className="text-[9px] text-[#94a3b8]">Refund Workflow</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-purple-400">Webhook</div>
                  <div className="text-[9px] text-[#94a3b8]">Razorpay Native</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="flex justify-center mt-12 opacity-60">
        <a href="#problem" className="flex items-center gap-1.5 text-xs uppercase font-mono font-semibold tracking-widest text-[#94a3b8] hover:text-white transition-colors">
          <span>Understand Duplicate Payment Mechanics</span>
          <ChevronDown className="w-4 h-4 text-[#2dd4bf] animate-bounce" />
        </a>
      </div>

      {/* Product Architecture Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
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
              className="relative bg-[#0f0c22] border border-white/10 text-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl z-10 overflow-hidden"
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-[#94a3b8] hover:text-white rounded-full hover:bg-white/5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2dd4bf]">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
                <div>
                  <h3 className="font-bold font-headings text-2xl text-white">System Architecture & Detection Flow</h3>
                  <p className="text-xs text-[#94a3b8]">Step-by-step technical breakdown of duplicate resolution</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                {/* Visualizer Panel */}
                <div className="md:col-span-7 bg-[#080711] rounded-2xl p-6 flex flex-col justify-between min-h-[300px] border border-white/10 relative">
                  <div className="flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                    <span>PHASE {videoStep + 1} OF 4</span>
                    <span className="flex items-center gap-1.5 text-[#2dd4bf]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-ping" />
                      SYSTEM SIMULATION
                    </span>
                  </div>

                  <div className="my-8 flex flex-col items-center justify-center text-center">
                    {React.createElement(walkthroughChapters[videoStep].icon, {
                      className: `w-14 h-14 ${walkthroughChapters[videoStep].color} mb-3`
                    })}
                    <h4 className="font-bold text-lg font-headings">{walkthroughChapters[videoStep].title}</h4>
                    <p className="text-xs text-[#cbd5e1] max-w-sm mt-1">{walkthroughChapters[videoStep].subtitle}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2dd4bf] transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#94a3b8] font-mono">
                      <span>{walkthroughChapters[videoStep].title}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Control Panel */}
                <div className="md:col-span-5 flex flex-col justify-between p-2">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest font-mono">Technical Explanation</span>
                    <p className="text-sm text-[#cbd5e1] leading-relaxed">
                      {walkthroughChapters[videoStep].description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="btn-primary p-3 rounded-xl flex items-center justify-center shrink-0"
                        aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                      </button>
                      <button
                        onClick={() => { setVideoStep((s) => (s + 1) % 4); setProgress(0); }}
                        className="btn-secondary p-3 rounded-xl flex items-center justify-center shrink-0 border-white/20"
                        aria-label="Next step"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <div className="text-xs text-[#94a3b8] font-medium pl-2">
                        {isPlaying ? "Step simulation active" : "Simulation paused"}
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-2">
                      {walkthroughChapters.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setVideoStep(idx); setProgress(0); }}
                          className={`flex-1 h-2 rounded-full transition-all ${videoStep === idx ? "bg-[#2dd4bf]" : "bg-white/10"}`}
                          aria-label={`Go to step ${idx + 1}`}
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
