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
    <div className="bg-white">
      {/* 1. PROBLEM SECTION */}
      <section className="py-24 border-b border-gray-100 relative overflow-hidden" id="problem">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column Problem Graphic Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="w-full max-w-[460px] bg-red-50/40 rounded-3xl border border-red-100 p-8 shadow-card flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-6 shadow-sm">
                <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
              </div>
              <span className="font-mono text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-100 px-3 py-1 rounded-full mb-3">
                NHAI DATA INSIGHT
              </span>
              <h3 className="font-bold font-poppins text-xl text-gray-900 mb-2">National Highway Double Deductions</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                Toll booth checkout servers experience micro-timeouts hourly, causing duplicate deductions nationwide and triggering massive chargeback fines.
              </p>
              
              <div className="w-full bg-white rounded-2xl p-4 border border-red-100 mt-6 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500">Error Code:</span>
                  <span className="font-bold text-red-500">DUP_TXN_TIMEOUT_504</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500">Annual Merchant Loss:</span>
                  <span className="font-bold text-gray-900">₹12,200 Cr nationwide</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column Problem Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col gap-6 text-left"
          >
            <span className="section-tag bg-red-50 text-red-600 border-red-100">
              <AlertTriangle className="w-3.5 h-3.5" />
              The Cost of Payment Inaction
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-poppins text-gray-900 tracking-tight leading-tight">
              Merchants Lose Over <span className="text-red-500">₹12,200 Cr</span> Annually to Duplicate Charges
            </h2>

            <p className="text-gray-600 text-base leading-relaxed font-light">
              When payment gateway connections experience temporary micro-delays, buyers freeze, hit submit repeatedly, or open parallel browser tabs. This creates multiple payment authorizations for a single cart checkout, driving up support disputes, ruining brand trust, and triggering costly chargeback fees.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-150">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-poppins">1. Timeout Resubmissions</h4>
                  <p className="text-xs text-gray-500 leading-normal mt-1">Customers click purchase buttons multiple times when spinners freeze, sending duplicated authorization requests.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-150">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-poppins">2. Parallel Browser Tab Checkouts</h4>
                  <p className="text-xs text-gray-500 leading-normal mt-1">Users opening product checkouts across concurrent browser windows trigger identical checkout API tokens simultaneously.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-150">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-poppins">3. Backend Gateway Retry Loops</h4>
                  <p className="text-xs text-gray-500 leading-normal mt-1">Automatic API retry scripts inside merchant backend services fail to recognize prior successful authorizations.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. SOLUTION SECTION */}
      <section className="py-24 bg-gray-50/60 border-b border-gray-100 relative overflow-hidden" id="solution">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column Solution Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col gap-6 text-left"
          >
            <span className="section-tag">
              <ShieldCheck className="w-3.5 h-3.5 text-razorblue" />
              Our Intelligent Defense
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-poppins text-gray-900 tracking-tight leading-tight">
              Zero-Touch AI Detection & <span className="text-gradient">Instant Auto-Refunds</span>
            </h2>

            <p className="text-gray-600 text-base leading-relaxed font-light">
              RazorGuard plugs directly into your Razorpay payment flow via webhook alerts. Our XGBoost classifier profiles transaction attributes in real-time, verifying customer hashes, amounts, time deltas, and network signatures to automatically refund duplicate charges within 100ms.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
              <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-razorteal flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-poppins">Sub-100ms Response</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">Evaluates payment metadata concurrently inside in-memory Redis caches before DB commit logs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-razorblue flex items-center justify-center shrink-0">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-poppins">Automated Razorpay APIs</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">Zero human review required. RazorGuard issues instant idempotent refund calls directly via Razorpay.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-poppins">Dispute & Chargeback Defense</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">Refunds buyers immediately before bank dispute tickets are filed, keeping gateway health scores pristine.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-poppins">Custom Rule Controls</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">Set customized duplicate scan windows from 30 seconds to 24 hours to match your checkout habits.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column Solution Graphic */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="w-full max-w-[460px] bg-white rounded-3xl border border-gray-200 p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-razorblue" />
                  <span className="font-mono text-xs font-bold text-gray-900">Razorpay API Action</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  Auto-Executed
                </span>
              </div>

              <div className="bg-gray-900 rounded-2xl p-4 font-mono text-[11px] text-gray-300 leading-relaxed overflow-x-auto">
                <span className="text-purple-400">{"// Razorpay API Auto-Refund Trigger"}</span><br />
                POST /v1/payments/<span className="text-blue-300">pay_K7a9P4qL</span>/refund<br />
                &#123;<br />
                &nbsp;&nbsp;&quot;<span className="text-teal-300">amount</span>&quot;: <span className="text-yellow-300">12500</span>,<br />
                &nbsp;&nbsp;&quot;<span className="text-teal-300">speed</span>&quot;: &quot;<span className="text-emerald-400">optimum</span>&quot;,<br />
                &nbsp;&nbsp;&quot;<span className="text-teal-300">notes</span>&quot;: &#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&quot;<span className="text-teal-300">reason</span>&quot;: &quot;<span className="text-red-400">RazorGuard AI Duplicate Flag</span>&quot;<br />
                &nbsp;&nbsp;&#125;<br />
                &#125;
              </div>

              <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900">HTTP 200 OK — Refund Processed</span>
                  <p className="text-[10px] text-gray-500">Customer notified via automated Razorpay SMS receipt.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
