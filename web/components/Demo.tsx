"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, RefreshCw, CheckCircle2 } from "lucide-react";

export default function Demo() {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [refundCount, setRefundCount] = useState(0);

  useEffect(() => {
    if (scanState === "scanning") {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setScanState("complete");
              animateCounter(100, setScannedCount);
              animateCounter(14, setFlaggedCount);
              animateCounter(14, setRefundCount);
            }, 300);
            return 100;
          }
          return p + 5;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [scanState]);

  const animateCounter = (target: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
    let current = 0;
    const step = target / 20;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setter(target);
        clearInterval(interval);
      } else {
        setter(Math.round(current));
      }
    }, 30);
  };

  const handleStartScan = () => {
    setProgress(0);
    setScannedCount(0);
    setFlaggedCount(0);
    setRefundCount(0);
    setScanState("scanning");
  };

  return (
    <section className="py-20 bg-[#080711] border-b border-white/10 relative overflow-hidden" id="demo">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Sandbox Explanation */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Interactive Evaluation Sandbox</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-headings text-white tracking-tight">
            Evaluate Prototype Detection Rules
          </h2>
          <p className="text-base text-[#cbd5e1] font-normal leading-relaxed">
            Run a simulated scan on a sample batch of Razorpay checkout webhooks to observe pattern matching and automated refund payload generation.
          </p>

          <div className="flex flex-col gap-3 bg-[#0f0c22] border border-white/10 rounded-xl p-5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#94a3b8]">Evaluation Mode:</span>
              <span className="font-bold text-white">Sample Webhook Ledger (100 tx)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94a3b8]">Evaluated Risk Signals:</span>
              <span className="font-bold text-white">User Hash, Amount, IP, Time Delta</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94a3b8]">Target Engine Latency:</span>
              <span className="font-bold text-[#2dd4bf]">&lt;100ms per payload</span>
            </div>
          </div>
        </div>

        {/* Right Side: Demo Interactive Screen */}
        <div className="lg:col-span-6 w-full">
          <div className="bg-[#0f0c22] border border-white/10 rounded-2xl p-7 shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10 text-xs font-mono">
              <span className="text-[#94a3b8]">PROTOTYPE_SANDBOX_V1.0</span>
              <span className="flex items-center gap-1.5 text-[#2dd4bf] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
                SANDBOX READY
              </span>
            </div>

            {scanState === "idle" && (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2dd4bf]">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold font-headings text-white text-base">Run Sample Webhook Ledger Scan</h3>
                  <p className="text-xs text-[#cbd5e1] mt-1">Simulate scanning 100 sample Razorpay checkout events</p>
                </div>
                <button
                  onClick={handleStartScan}
                  className="btn-primary px-7 py-3 text-xs font-bold uppercase tracking-wider mt-2"
                >
                  Start Prototype Scan
                </button>
              </div>
            )}

            {scanState === "scanning" && (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                <RefreshCw className="w-10 h-10 text-[#2dd4bf] animate-spin" />
                <div className="w-full space-y-2">
                  <h3 className="font-bold font-headings text-white text-sm">Evaluating Webhook Payload Signatures</h3>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4f46e5] to-[#0d9488] transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#94a3b8] font-mono">
                    <span>MATCHING SIGNALS</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {scanState === "complete" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 bg-[#10b981]/10 border border-[#10b981]/20 p-3.5 rounded-xl text-[#10b981] text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <div>
                    <h3 className="font-bold font-headings text-white text-sm">Prototype Scan Complete</h3>
                    <p className="text-[11px] text-[#cbd5e1]">Identified duplicate pairs in evaluation dataset.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="text-[10px] text-[#94a3b8] font-bold uppercase block">Evaluated</span>
                    <span className="text-xl font-extrabold font-headings text-white mt-1 block">
                      {scannedCount} tx
                    </span>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    <span className="text-[10px] text-red-400 font-bold uppercase block">Flagged</span>
                    <span className="text-xl font-extrabold font-headings text-red-400 mt-1 block">
                      {flaggedCount} dupes
                    </span>
                  </div>
                  <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-3 rounded-xl">
                    <span className="text-[10px] text-[#10b981] font-bold uppercase block">Reversals</span>
                    <span className="text-xl font-extrabold font-headings text-[#10b981] mt-1 block">
                      {refundCount} calls
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleStartScan}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl border border-white/10 text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    Reset & Rescan
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
