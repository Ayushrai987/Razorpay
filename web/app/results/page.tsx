"use client";

import React from "react";
import Results from "@/components/Results";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import { TrendingUp, TrendingDown, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultsPage() {
  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Case Studies</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            Proven Results & Savings Analytics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-base max-w-xl mx-auto font-light leading-relaxed"
          >
            See concrete metrics and verified user studies demonstrating duplicate charge protection value.
          </motion.p>
        </div>
      </section>

      {/* Main Charts & Metrics */}
      <Results />

      {/* Merchant Case Study Details */}
      <section className="py-24 bg-white border-t border-gray-100" id="case-study">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center flex flex-col gap-4 mb-16">
            <span className="section-tag">Merchant Success</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins">LogiShip Logistics Deployment</h2>
          </div>

          <div className="bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-150 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-250/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-razorblue to-razorpurple flex items-center justify-center font-bold text-white text-sm">
                  SK
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base font-poppins">LogiShip Logistics Solutions</h4>
                  <p className="text-xs text-gray-400 font-medium">4,500 transactions / month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="flex flex-col gap-3 text-left">
                  <h5 className="font-bold text-red-500 uppercase tracking-wider text-xs flex items-center gap-1.5 font-mono">
                    <TrendingDown className="w-4 h-4" /> Before integration
                  </h5>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    Anxious shipping dispatchers clicked checkout portals multiple times due to temporary payment gateway timeout stalls.
                  </p>
                  <ul className="flex flex-col gap-2 mt-2 text-xs text-gray-400 list-disc pl-4 font-light">
                    <li>~12 duplicate transaction charges weekly</li>
                    <li>Operations managers spent 15 hours manually verifying logs</li>
                    <li>Losses from dispute penalties exceeded ₹45,000</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 text-left">
                  <h5 className="font-bold text-razorteal uppercase tracking-wider text-xs flex items-center gap-1.5 font-mono">
                    <TrendingUp className="w-4 h-4" /> With RazorGuard AI
                  </h5>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    Plugging our real-time Webhook listener intercepted identical checkout requests and automated payment recovery.
                  </p>
                  <ul className="flex flex-col gap-2 mt-2 text-xs text-gray-700 list-disc pl-4">
                    <li className="text-gray-900 font-medium">Zero manual audit sheets needed</li>
                    <li className="text-gray-900 font-medium">Duplication latency decreased to &lt;100ms</li>
                    <li className="text-gray-900 font-medium">Saved over ₹24.8 Lakhs inside 3 months</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-250/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-razorteal" />
                  <span className="text-xs text-gray-500 font-light">Total chargeback penalty avoidances: 100%</span>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 font-mono text-[10px] text-razorteal font-bold">
                  ROI EFFICIENCY SAVINGS: 412%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Review Feed */}
      <Testimonials />

      {/* Final Action Call */}
      <CTA />
    </div>
  );
}
