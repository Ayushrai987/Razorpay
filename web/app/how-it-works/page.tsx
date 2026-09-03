"use client";

import React from "react";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import { Webhook, Database, Cpu, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  return (
    <div className="bg-[#080711]">
      {/* Header Banner */}
      <section className="relative pt-28 pb-16 overflow-hidden bg-[#0c0a1a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Integration Architecture</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold font-headings text-white tracking-tight"
          >
            How Duplicate Payment Detection Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#cbd5e1] text-base max-w-xl mx-auto font-normal leading-relaxed"
          >
            An end-to-end webhook validation pipeline evaluating transaction streams in under 100ms.
          </motion.p>
        </div>
      </section>

      {/* Steps Flow Timeline */}
      <HowItWorks />

      {/* Technical Architecture flow visual */}
      <section className="py-20 bg-[#080711] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white font-headings mb-10">End-to-End Event Processing Flow</h2>
          
          <div className="bg-[#0f0c22] border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl flex justify-center overflow-x-auto">
            <div className="min-w-[650px] flex items-center justify-between gap-4 py-4 relative w-full font-mono">
              
              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2dd4bf]">
                  <Webhook className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-xs font-headings mt-1">1. Webhook Payload</h3>
                <p className="text-[10px] text-[#cbd5e1] text-center">Razorpay checkout emits event.</p>
              </div>

              <ArrowRight className="w-4 h-4 text-[#94a3b8] shrink-0" />

              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-xs font-headings mt-1">2. Redis Cache Lookup</h3>
                <p className="text-[10px] text-[#cbd5e1] text-center">Evaluates active session keys.</p>
              </div>

              <ArrowRight className="w-4 h-4 text-[#94a3b8] shrink-0" />

              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2dd4bf]">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-xs font-headings mt-1">3. XGBoost Evaluator</h3>
                <p className="text-[10px] text-[#cbd5e1] text-center">Scores transaction signals.</p>
              </div>

              <ArrowRight className="w-4 h-4 text-[#94a3b8] shrink-0" />

              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#10b981]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-xs font-headings mt-1">4. Refund API Call</h3>
                <p className="text-[10px] text-[#cbd5e1] text-center">Idempotent reversal dispatched.</p>
              </div>

              <div className="absolute top-[48px] left-16 right-16 h-0.5 bg-white/10 z-0 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Grid */}
      <FAQ />

      {/* Final Action Area */}
      <CTA />
    </div>
  );
}
