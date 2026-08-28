"use client";

import React from "react";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import { Webhook, Database, BrainCircuit, Unlock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Integration Steps</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            How RazorGuard AI Protects Transactions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-base max-w-xl mx-auto font-light leading-relaxed"
          >
            A high-speed machine learning pipeline that catches parallel checkouts inside the webhook traffic.
          </motion.p>
        </div>
      </section>

      {/* Steps Flow Timeline */}
      <HowItWorks />

      {/* Technical Architecture flow visual */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-poppins mb-12">System Architecture Flow</h2>
          
          <div className="bg-gray-50 border border-gray-150 p-8 md:p-12 rounded-3xl shadow-card flex justify-center overflow-x-auto">
            <div className="min-w-[650px] flex items-center justify-between gap-4 py-6 relative w-full">
              
              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-razorblue">
                  <Webhook className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-905 text-xs font-poppins mt-2">1. Razorpay Webhook</h4>
                <p className="text-[10px] text-gray-400 leading-normal text-center">Checkout payment triggers payload dispatch.</p>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />

              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-905 text-xs font-poppins mt-2">2. Redis Lock Check</h4>
                <p className="text-[10px] text-gray-400 leading-normal text-center">Dynamic key validation captures tab checkouts.</p>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />

              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-razorteal">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-905 text-xs font-poppins mt-2">3. XGBoost Evaluator</h4>
                <p className="text-[10px] text-gray-400 leading-normal text-center">Risk scoring classifies transaction attributes.</p>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />

              <div className="flex flex-col items-center gap-2 w-36 z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Unlock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-905 text-xs font-poppins mt-2">4. Razorpay Refund API</h4>
                <p className="text-[10px] text-gray-400 leading-normal text-center">Auto-refund reverses double charges.</p>
              </div>

              <div className="absolute top-[48px] left-16 right-16 h-0.5 bg-gray-200 z-0 pointer-events-none" />
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
