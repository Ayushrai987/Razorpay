"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

export default function Demo() {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [refundCount, setRefundCount] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  // Confetti particles helper
  const confettiArray = Array.from({ length: 45 });

  useEffect(() => {
    if (scanState === "scanning") {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setScanState("complete");
              setConfettiActive(true);
              // Trigger counters for completed state
              animateCounter(4921, setScannedCount);
              animateCounter(1105, setFlaggedCount);
              animateCounter(79.39, setRefundCount, 2);
            }, 500);
            return 100;
          }
          return p + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [scanState]);

  useEffect(() => {
    if (confettiActive) {
      const timer = setTimeout(() => setConfettiActive(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [confettiActive]);

  const animateCounter = (target: number, setter: React.Dispatch<React.SetStateAction<number>>, decimals = 0) => {
    let current = 0;
    const step = target / 30;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setter(target);
        clearInterval(interval);
      } else {
        setter(parseFloat(current.toFixed(decimals)));
      }
    }, 40);
  };

  const handleStartScan = () => {
    setProgress(0);
    setScannedCount(0);
    setFlaggedCount(0);
    setRefundCount(0);
    setScanState("scanning");
  };

  return (
    <section className="py-24 bg-[#08061a] relative overflow-hidden" id="demo">
      {/* Background glowing spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#14b8a6]/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Confetti Animation Effect */}
      <AnimatePresence>
        {confettiActive && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {confettiArray.map((_, i) => {
              const left = Math.random() * 100;
              const delay = Math.random() * 2;
              const color = ["#667eea", "#14b8a6", "#10b981", "#3b82f6", "#ef4444"][i % 5];
              return (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: `${left}%`, rotate: 0, opacity: 1 }}
                  animate={{ y: "100vh", rotate: 360, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, delay, ease: "easeOut" }}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left Side: Headline & Stats Info */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Interactive Preview</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-extrabold font-poppins text-white tracking-tight">
            See It In Action
          </h2>
          <p className="text-lg text-[#a0aec0] font-light leading-relaxed font-poppins">
            Watch how RazorGuard detects and refunds duplicates in real-time
          </p>
          <p className="text-sm text-[#a0aec0] leading-relaxed font-inter font-light">
            Upload your payment transaction export file below to run a mock scan. Our ML engine evaluates transaction payloads, browser hashes, and client signatures to isolate duplicate charges.
          </p>

          {/* Core Demo Info Stripe */}
          <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#a0aec0]">Engine Accuracy State</span>
              <span className="font-bold text-white font-poppins">100% Precision</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#a0aec0]">Historical Duplicates Detected</span>
              <span className="font-bold text-white font-poppins">1,105 duplicates detected in demo</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#a0aec0]">Scan Speed Metric</span>
              <span className="font-bold text-[#14b8a6] font-poppins">&lt;100ms/tx</span>
            </div>
          </div>

          <div className="pt-2">
            <Link 
              href="/demo"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-bold tracking-wider uppercase transition-all shadow-lg hover:shadow-[#14b8a6]/20"
            >
              Try Live Dashboard
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Demo Card Box (Dark Glassmorphic) */}
        <div className="lg:col-span-6 w-full">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-[#0f0c29]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:border-[#14b8a6]/40 cursor-default relative overflow-hidden"
          >
            {/* Header style */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 text-xs">
              <span className="font-mono text-gray-400">LEDGER_SCANNER_PRO.v1</span>
              <span className="flex items-center gap-1.5 text-[#14b8a6] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
                SANDBOX ACTIVE
              </span>
            </div>

            {/* Sandbox screen states */}
            {scanState === "idle" && (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group hover:text-white transition-colors duration-300">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold font-poppins text-white text-base">Select Transaction File</h4>
                  <p className="text-xs text-[#a0aec0] mt-1 max-w-xs">Upload your transaction ledger CSV or run the mock transaction scan</p>
                </div>
                <button
                  onClick={handleStartScan}
                  className="btn-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider animate-soft-pulse"
                >
                  Start Demo Scan
                </button>
              </div>
            )}

            {scanState === "scanning" && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
                <div className="relative">
                  <RefreshCw className="w-14 h-14 text-[#14b8a6] animate-spin" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">🔍</span>
                </div>
                <div className="w-full space-y-2">
                  <h4 className="font-bold font-poppins text-white text-sm">Processing Transaction Ledgers</h4>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#667eea] to-[#14b8a6] transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>STATUS: INGESTING</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {scanState === "complete" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Status Indicator */}
                <div className="flex items-center gap-3 bg-[#10b981]/10 border border-[#10b981]/20 p-4 rounded-2xl text-[#10b981] text-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <h5 className="font-bold font-poppins text-white text-sm">Scan Completed Successfully!</h5>
                    <p className="text-[11px] text-[#a0aec0] mt-0.5">Found and intercepted duplicate webhooks.</p>
                  </div>
                </div>

                {/* Scanned Results display with animated numbers */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Scanned</span>
                    <span className="text-2xl font-extrabold font-poppins text-white mt-1 block">
                      {scannedCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#ef4444]/5 border border-[#ef4444]/10 p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Flagged</span>
                    <span className="text-2xl font-extrabold font-poppins text-[#ef4444] mt-1 block">
                      {flaggedCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#10b981]/5 border border-[#10b981]/10 p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-wider block">Refunded</span>
                    <span className="text-xl font-extrabold font-poppins text-[#10b981] mt-1.5 block">
                      ₹{refundCount}Cr
                    </span>
                  </div>
                </div>

                {/* Progress bars fill animation */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 font-medium mb-1">
                      <span>XGBoost Match Accuracy</span>
                      <span className="text-white font-bold">100%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1 }}
                        className="h-full bg-[#667eea]" 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 font-medium mb-1">
                      <span>Webhook Safety Check</span>
                      <span className="text-white font-bold">98.4%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "98.4%" }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="h-full bg-[#14b8a6]" 
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleStartScan}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/10 text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    Scan Again
                  </button>
                  <Link
                    href="/demo"
                    className="flex-1 btn-primary py-3 text-xs font-bold tracking-wider uppercase text-center flex items-center justify-center gap-1.5"
                  >
                    Try Live Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>

      </div>
    </section>
  );
}
