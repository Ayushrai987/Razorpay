"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Play, X, Code2, Activity, Filter, CheckCircle2, Pause, SkipForward, Landmark, DollarSign, Cpu } from "lucide-react";

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
  const rotateX = useTransform(y, [0, 400], [10, -10]);
  const rotateY = useTransform(x, [0, 400], [-10, 10]);

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
          return p + 1.5;
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
      color: "text-razorblue",
      bg: "bg-blue-50/50",
    },
    {
      title: "Step 2: AI Risk Validation",
      subtitle: "XGBoost models predict duplicate risk classification scores.",
      description: "Evaluates time deltas, user hashes, and gateway states to distinguish true duplicate pairs from legitimate checkouts.",
      icon: Cpu,
      color: "text-purple-600",
      bg: "bg-purple-50/50",
    },
    {
      title: "Step 3: Auto-Refund Trigger",
      subtitle: "Idempotent payment refund API dispatched instantly to Razorpay.",
      description: "Confirmed duplicates call Razorpay APIs to reverse double-deductions instantly, before chargebacks are initialized.",
      icon: DollarSign,
      color: "text-razorteal",
      bg: "bg-teal-50/50",
    },
    {
      title: "Step 4: Metric Safe-Guarding",
      subtitle: "Live merchant ledger metrics and audit feeds refreshed.",
      description: "Revenue protected logs automatically update, and customer email alerts are sent confirming transaction reversals.",
      icon: Landmark,
      color: "text-emerald-600",
      bg: "bg-emerald-50/50",
    }
  ];

  return (
    <section className="relative pt-36 pb-24 lg:pt-48 lg:pb-36 bg-white overflow-hidden border-b border-gray-100">
      {/* Animated background shape elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100/60 to-teal-50/40 blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-50/50 to-blue-100/50 blur-3xl opacity-60 animate-blob" style={{ animationDelay: "3s" }} />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(15 23 42 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />
      </div>

      {/* Main container with full 1536px display coverage */}
      <div className="relative max-w-[1536px] mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center w-full z-10">
        {/* Left column - Jumbo Content */}
        <div className="lg:col-span-6 flex flex-col gap-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-fit"
          >
            <span className="section-tag px-5 py-2 text-sm rounded-full">
              <ShieldCheck className="w-5 h-5 text-razorblue" />
              Razorpay Certified Webhook Guard
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-poppins text-gray-900 leading-[1.08] tracking-tight"
          >
            Protect Your Revenue from <span className="text-gradient">Duplicate Payments</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-inter font-light max-w-2xl"
          >
            Our real-time XGBoost AI engine evaluates Razorpay checkout streams in <strong className="text-gray-900 font-semibold">&lt;100ms</strong> to catch double-deductions, network retries, and multi-tab orders — issuing automated instant refunds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-5 pt-3"
          >
            <Link
              href="/contact?subject=FreeTrial"
              className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-10 py-5 text-lg rounded-2xl shadow-xl hover:scale-102 transition-transform"
            >
              Start Free Trial
              <ArrowRight className="w-6 h-6" />
            </Link>
            
            <button
              onClick={() => { setVideoModalOpen(true); setIsPlaying(true); }}
              className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 px-9 py-5 text-lg rounded-2xl group hover:scale-102 transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-razorblue flex items-center justify-center group-hover:bg-razorblue group-hover:text-white transition-colors">
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              </div>
              Watch Product Demo
            </button>
          </motion.div>

          {/* Trust points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-8 pt-6 border-t border-gray-100 text-sm font-semibold text-gray-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-razorteal" />
              <span>No Credit Card Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-razorblue" />
              <span>5-Min Webhook Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>1.0 Precision & Recall</span>
            </div>
          </motion.div>
        </div>

        {/* Right column — 3D Interactive preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-6 relative w-full cursor-pointer select-none"
          style={{ perspective: 1200 }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="rounded-3xl border border-gray-200 shadow-2xl overflow-hidden bg-white transition-all duration-100"
          >
            {/* macOS Chrome Header */}
            <div className="bg-gray-100/90 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 font-mono text-xs text-gray-500 font-medium">razorguard_console.v2</span>
              </div>
              
              {/* Tabs */}
              <div className="flex bg-gray-200/70 p-1.5 rounded-xl gap-1 text-[11px] font-semibold">
                <button
                  onClick={() => setActiveTab("stream")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === "stream" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <Activity className="w-3.5 h-3.5 inline mr-1 text-razorblue" />
                  Live Stream
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === "json" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <Code2 className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                  API Payload
                </button>
                <button
                  onClick={() => setActiveTab("rules")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === "rules" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <Filter className="w-3.5 h-3.5 inline mr-1 text-razorteal" />
                  Risk Rules
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="p-8 bg-white space-y-5">
              {activeTab === "stream" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    <span>Incoming Checkout Stream</span>
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      SUB-100MS ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-150 text-sm">
                      <div>
                        <div className="font-mono font-bold text-gray-900">pay_N8a2B7cD</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">User: usr_9381 • UPI Intent</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">₹154.00</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Secure</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50/80 rounded-xl p-4 border border-blue-200 text-sm">
                      <div>
                        <div className="font-mono font-bold text-gray-900">pay_K7a9P4qL <span className="text-xs text-red-500 font-semibold">(Double-Click)</span></div>
                        <div className="text-[11px] text-gray-500 mt-0.5">User: usr_4201 • Retried in 1.4s</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">₹125.00</div>
                        <span className="text-[10px] bg-blue-100 text-razorblue font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Auto-Refunded</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-150 text-sm">
                      <div>
                        <div className="font-mono font-bold text-gray-900">pay_M9d1C2eA</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">User: usr_1102 • Netbanking</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">₹450.00</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "json" && (
                <div className="bg-gray-900 rounded-2xl p-5 font-mono text-xs text-gray-200 overflow-x-auto leading-relaxed">
                  <span className="text-purple-400">{"// Webhook Payload Signature Assessment"}</span><br />
                  &#123;<br />
                  &nbsp;&nbsp;&quot;<span className="text-teal-300">event</span>&quot;: &quot;<span className="text-yellow-300">payment.captured</span>&quot;,<br />
                  &nbsp;&nbsp;&quot;<span className="text-teal-300">duplicate_risk_score</span>&quot;: <span className="text-red-400">0.998</span>,<br />
                  &nbsp;&nbsp;&quot;<span className="text-teal-300">matched_previous_id</span>&quot;: &quot;<span className="text-blue-300">pay_J6b8O3pM</span>&quot;,<br />
                  &nbsp;&nbsp;&quot;<span className="text-teal-300">auto_refund_status</span>&quot;: &quot;<span className="text-emerald-400">EXECUTED_200_OK</span>&quot;<br />
                  &#125;
                </div>
              )}

              {activeTab === "rules" && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
                    <div>
                      <div className="font-bold text-gray-900">Time Delta Threshold</div>
                      <div className="text-xs text-gray-400 mt-0.5">Flag checkouts under 300s window</div>
                    </div>
                    <span className="font-mono font-bold text-razorblue">300 sec</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
                    <div>
                      <div className="font-bold text-gray-900">Browser Fingerprint Match</div>
                      <div className="text-xs text-gray-400 mt-0.5">Inspect canvas & IP headers</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              )}

              {/* Bottom Quick Metric strip */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center p-3 rounded-xl bg-blue-50/50">
                  <div className="font-bold text-lg font-poppins text-razorblue">1,105</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Duplicates Caught</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-teal-50/50">
                  <div className="font-bold text-lg font-poppins text-razorteal">₹79.39 Cr</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Revenue Protected</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-50/50">
                  <div className="font-bold text-lg font-poppins text-purple-600">100%</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Model Precision</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Watch Demo Video Modal — High-Impact Interactive Walkthrough */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
              onClick={() => setVideoModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white text-gray-900 rounded-3xl p-8 max-w-4xl w-full shadow-2xl z-10 overflow-hidden border border-gray-100"
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-razorblue">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
                <div>
                  <h3 className="font-bold font-poppins text-2xl text-gray-900">Interactive Product Walkthrough</h3>
                  <p className="text-xs text-gray-400">Step-by-step simulation of the AI Revenue Recovery loop</p>
                </div>
              </div>

              {/* Main Simulated Video Canvas */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                
                {/* Visualizer Panel */}
                <div className="md:col-span-7 bg-gray-900 rounded-2xl p-6 flex flex-col justify-between min-h-[300px] border border-gray-800 text-white relative">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>STEP {videoStep + 1} OF 4</span>
                    <span className="flex items-center gap-1.5 text-razorblue">
                      <span className="w-1.5 h-1.5 rounded-full bg-razorblue animate-ping" />
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
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-razorblue transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>{walkthroughChapters[videoStep].title}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>

                {/* Subtitles / Narrative Control Panel */}
                <div className="md:col-span-5 flex flex-col justify-between p-2">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Narrator Insights</span>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {walkthroughChapters[videoStep].description}
                    </p>
                  </div>

                  {/* Audio/Playback Controls */}
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="btn-primary p-3 rounded-xl flex items-center justify-center shrink-0"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                      </button>
                      <button 
                        onClick={() => { setVideoStep((s) => (s + 1) % 4); setProgress(0); }}
                        className="btn-secondary p-3 rounded-xl flex items-center justify-center shrink-0"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <div className="text-xs text-gray-500 font-medium pl-2">
                        {isPlaying ? "Autoplay active" : "Video paused"}
                      </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex gap-1.5 pt-2">
                      {walkthroughChapters.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setVideoStep(idx); setProgress(0); }}
                          className={`flex-1 h-2 rounded-full transition-all ${videoStep === idx ? "bg-razorblue" : "bg-gray-250"}`}
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
