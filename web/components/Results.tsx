"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Clock } from "lucide-react";

export default function Results() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const quarters = [
    { name: "Q1", value: 12.4, color: "bg-blue-300" },
    { name: "Q2", value: 18.2, color: "bg-blue-400" },
    { name: "Q3", value: 23.9, color: "bg-razorblue" },
    { name: "Q4", value: 24.89, color: "bg-razorteal" }
  ];

  return (
    <section className="py-24 bg-white" id="results">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="section-tag">Proven Impact</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-4xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            Results that speak for <span className="text-gradient">themselves</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-gray-500 text-lg"
          >
            How we protect millions in revenue for high-volume digital platforms.
          </motion.p>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Chart Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 bg-gray-50 border border-gray-100 rounded-3xl p-8 shadow-card flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase font-mono">Revenue Protected Timeline</span>
              <span className="text-xs text-razorteal font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +100% QoQ
              </span>
            </div>

            {/* SVG Bars Container */}
            <div className="h-56 w-full flex items-end justify-between gap-4 pt-6 border-b border-gray-200 pb-2 relative">
              {quarters.map((q, idx) => {
                const heightPercentage = (q.value / 25) * 100;
                const isHovered = hoveredBar === idx;
                return (
                  <div
                    key={q.name}
                    className="flex-1 flex flex-col items-center gap-3 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? -5 : 5 }}
                      className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none"
                    >
                      ₹{q.value}Cr
                    </motion.div>

                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${heightPercentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${q.color} ${
                        isHovered ? "brightness-95 scale-x-[1.03]" : ""
                      }`}
                    />
                    <span className="text-[10px] font-bold text-gray-400">{q.name}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-gray-400">Total cumulative savings</span>
              <span className="font-bold text-gray-900 font-poppins">₹79.39 Crore</span>
            </div>
          </motion.div>

          {/* Text/Metrics Panel */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-3 gap-6"
            >
              <div>
                <span className="block text-3xl font-extrabold text-gray-900 font-poppins">1,105</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1.5 block">Duplicates Caught</span>
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-razorteal font-poppins">₹79.39 Cr</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1.5 block">Revenue Protected</span>
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-gray-900 font-poppins">98.4%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1.5 block">Model Precision</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col gap-5 pt-8 border-t border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 font-poppins">Continuous ML Performance Verification</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our models analyze key transaction signals (amounts, user IDs, device hashes, and gateway states) to isolate duplicate submissions. We retrain the model daily to keep false-positive rates at exactly 0.00%.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-razorteal" />
                  <span className="text-gray-600 font-medium">100% Automatic Refund Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-razorblue" />
                  <span className="text-gray-600 font-medium">Sub-100ms Action Latency</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
