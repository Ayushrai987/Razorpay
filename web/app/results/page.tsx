"use client";

import React from "react";
import Results from "@/components/Results";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import { motion } from "framer-motion";

export default function ResultsPage() {
  return (
    <div className="bg-[#080711]">
      {/* Header Section */}
      <section className="relative pt-28 pb-16 overflow-hidden bg-[#0c0a1a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Performance Benchmarks</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold font-headings text-white tracking-tight"
          >
            Benchmark Performance & Test Analytics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#cbd5e1] text-base max-w-xl mx-auto font-normal leading-relaxed"
          >
            Measured evaluation results on synthetic checkout transaction streams.
          </motion.p>
        </div>
      </section>

      {/* Main Charts & Metrics */}
      <Results />

      {/* Target Workflows */}
      <Testimonials />

      {/* Final Action Call */}
      <CTA />
    </div>
  );
}
