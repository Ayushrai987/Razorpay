"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, PieChart } from "lucide-react";

export default function Results() {

  const testBatches = [
    { name: "Batch 1 (500 tx)", duplicateCount: 18, precision: "100%", color: "#818cf8" },
    { name: "Batch 2 (1,000 tx)", duplicateCount: 42, precision: "100%", color: "#818cf8" },
    { name: "Batch 3 (2,500 tx)", duplicateCount: 95, precision: "100%", color: "#818cf8" },
    { name: "Batch 4 (5,000 tx)", duplicateCount: 210, precision: "100%", color: "#2dd4bf" }
  ];

  const duplicateTypes = [
    { name: "Double-Click Submissions", percentage: "45%", color: "#818cf8" },
    { name: "Gateway Timeout Retries", percentage: "30%", color: "#2dd4bf" },
    { name: "Multi-Tab Concurrent Checkouts", percentage: "15%", color: "#10b981" },
    { name: "Server Loop Resubmissions", percentage: "10%", color: "#f59e0b" },
  ];

  return (
    <section className="py-20 bg-[#080711] border-b border-white/10" id="results">
      <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 flex flex-col gap-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Test Suite Benchmarks</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-3xl sm:text-4xl font-extrabold font-headings text-white tracking-tight"
          >
            Prototype Benchmark Evaluation
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-[#cbd5e1] text-sm sm:text-base leading-relaxed"
          >
            Validation results measured on synthetic transaction test suites.
          </motion.p>
        </div>

        {/* Benchmark Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Batch Precision */}
          <div className="bg-[#0f0c22] border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-2.5 mb-6">
              <BarChart3 className="w-5 h-5 text-[#2dd4bf]" />
              <h3 className="text-sm font-bold font-headings text-white uppercase tracking-wider">
                Duplicate Detection across Test Batches
              </h3>
            </div>
            <div className="space-y-4">
              {testBatches.map((b, idx) => (
                <div key={idx} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-[#cbd5e1]">
                    <span>{b.name}</span>
                    <span className="font-bold text-white">{b.duplicateCount} duplicates identified ({b.precision} precision)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(b.duplicateCount / 210) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.15 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Duplicate Type Distribution */}
          <div className="bg-[#0f0c22] border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-2.5 mb-6">
              <PieChart className="w-5 h-5 text-[#10b981]" />
              <h3 className="text-sm font-bold font-headings text-white uppercase tracking-wider">
                Duplicate Scenario Distribution
              </h3>
            </div>
            <div className="space-y-3 font-mono text-xs">
              {duplicateTypes.map((dt, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dt.color }} />
                    <span className="text-[#cbd5e1]">{dt.name}</span>
                  </div>
                  <span className="font-bold text-white">{dt.percentage}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Integration Architecture Card */}
        <div className="bg-[#0f0c22] border border-white/10 rounded-2xl p-7 text-left space-y-4">
          <h3 className="text-xl font-bold font-headings text-white">Razorpay Webhook Workflow Integration</h3>
          <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
            RazorGuard operates asynchronously on Razorpay webhook streams. Rather than blocking the initial payment checkout screen, it listens to payment authorization payloads, compares transaction fingerprints in parallel, and triggers automated reversals for verified duplicate pairs within seconds.
          </p>
        </div>

      </div>
    </section>
  );
}
