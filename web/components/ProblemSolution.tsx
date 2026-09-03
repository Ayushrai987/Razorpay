"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Layers,
  RefreshCw,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Code2
} from "lucide-react";

export default function ProblemSolution() {
  return (
    <div className="bg-[#080711] text-[#f8fafc]">
      {/* 1. PROBLEM SECTION */}
      <section className="py-20 border-b border-white/10 relative overflow-hidden" id="problem">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Technical Breakdown Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="w-full max-w-[460px] bg-[#0f0c22] rounded-2xl border border-red-500/30 p-7 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5 text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <span className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full mb-3 border border-red-500/20">
                COMMON GATEWAY FAILURE PATTERN
              </span>
              <p className="font-bold font-headings text-xl text-white mb-2">Double Deduction Latency Window</p>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                When network handshakes experience transient micro-delays between browser, gateway, and bank, customers retry payments while initial authorizations are still in flight.
              </p>

              <div className="w-full bg-[#080711] rounded-xl p-4 border border-white/10 mt-5 text-left space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#94a3b8]">Event Sequence:</span>
                  <span className="font-bold text-red-400">PAYMENT_CAPTURE_TIMEOUT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94a3b8]">Impacted Workflows:</span>
                  <span className="font-bold text-white">E-Commerce & High-Volume APMs</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column Problem Explanation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col gap-5 text-left"
          >
            <span className="section-tag bg-red-500/10 text-red-400 border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              Root Causes of Duplicate Charges
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headings text-white tracking-tight leading-tight">
              Why Duplicate Payments Occur in High-Volume Checkouts
            </h2>

            <p className="text-[#cbd5e1] text-sm sm:text-base leading-relaxed">
              Payment duplication is rarely a single bug — it stems from asynchronous webhooks, client network retries, and browser execution loops during checkout interruptions.
            </p>

            <div className="flex flex-col gap-3.5 mt-1">
              <div className="flex gap-4 p-4 rounded-xl bg-[#0f0c22] border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-headings">1. Spinner Freeze & Double-Clicks</h3>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed mt-0.5">Buyers double-tap &quot;Pay Now&quot; or reload frozen authorization pages, sending secondary authorization tokens.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-[#0f0c22] border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-headings">2. Multi-Tab & Retried Checkouts</h3>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed mt-0.5">Customers open checkout links across multiple browser tabs, causing simultaneous payment attempts for a single cart.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-[#0f0c22] border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-headings">3. Server Retry Loops & Webhook Duplication</h3>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed mt-0.5">Merchant backend services or gateway webhooks retry failed network calls without verifying prior success states.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. SOLUTION SECTION */}
      <section className="py-20 bg-[#0c0a1a] border-b border-white/10 relative overflow-hidden" id="solution">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Solution Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col gap-5 text-left"
          >
            <span className="section-tag">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2dd4bf]" />
              Automated Detection Architecture
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headings text-white tracking-tight leading-tight">
              Real-Time Webhook Monitoring & <span className="text-gradient">Automated Reversals</span>
            </h2>

            <p className="text-[#cbd5e1] text-sm sm:text-base leading-relaxed">
              RazorGuard intercepts incoming Razorpay webhook payloads. Our machine-learning classification engine checks user hashes, transaction amounts, time deltas, and payment modes in under 100ms.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <div className="flex items-start gap-3 p-4 bg-[#0f0c22] rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-[#2dd4bf]/10 text-[#2dd4bf] flex items-center justify-center shrink-0 border border-[#2dd4bf]/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-headings">Sub-100ms Analysis</h3>
                  <p className="text-xs text-[#cbd5e1] mt-0.5 leading-relaxed">Runs in-memory Redis signature matching before database transactions settle.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#0f0c22] rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-headings">Idempotent Refund Trigger</h3>
                  <p className="text-xs text-[#cbd5e1] mt-0.5 leading-relaxed">Calls Razorpay Refund APIs automatically with idempotent keys to reverse duplicate charges safely.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#0f0c22] rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-headings">Dispute Risk Reduction</h3>
                  <p className="text-xs text-[#cbd5e1] mt-0.5 leading-relaxed">Protects gateway health metrics by resolving double charges before bank dispute tickets are logged.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#0f0c22] rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0 border border-[#10b981]/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-headings">Configurable Lookback</h3>
                  <p className="text-xs text-[#cbd5e1] mt-0.5 leading-relaxed">Set custom scan windows (e.g. 5 seconds to 24 hours) tailored to your merchant order cadence.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column Code Payload Graphic */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="w-full max-w-[460px] bg-[#0f0c22] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#2dd4bf]" />
                  <span className="font-mono text-xs font-bold text-white">Razorpay API Refund Dispatch</span>
                </div>
                <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold px-2 py-0.5 rounded uppercase font-mono">
                  AUTO-DISPATCH
                </span>
              </div>

              <div className="bg-[#080711] rounded-xl p-4 font-mono text-[11px] text-gray-300 leading-relaxed overflow-x-auto border border-white/5">
                <span className="text-purple-400">{"// Automatic Refund Call Payload"}</span><br />
                POST /v1/payments/<span className="text-blue-300">pay_K7a9P4qL</span>/refund<br />
                &#123;<br />
                &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">amount</span>&quot;: <span className="text-yellow-300">249900</span>,<br />
                &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">speed</span>&quot;: &quot;<span className="text-[#10b981]">optimum</span>&quot;,<br />
                &nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">notes</span>&quot;: &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&quot;<span className="text-[#2dd4bf]">reason</span>&quot;: &quot;<span className="text-red-400">RazorGuard Duplicate Flag</span>&quot;<br />
                &nbsp;&nbsp;&#125;<br />
                &#125;
              </div>

              <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-3 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white font-mono">HTTP 200 OK — Reversal Confirmed</span>
                  <p className="text-[10px] text-[#cbd5e1]">Customer receives notification of prompt double-charge reversal.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
