"use client";

import React from "react";
import Features from "@/components/Features";
import ComparisonTable from "@/components/ComparisonTable";
import CTA from "@/components/CTA";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  return (
    <div className="bg-[#080711]">
      {/* Header */}
      <section className="relative pt-28 pb-16 overflow-hidden bg-[#0c0a1a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Platform Capabilities</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold font-headings text-white tracking-tight"
          >
            Engineered for Duplicate Payment Security
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#cbd5e1] text-base max-w-xl mx-auto font-normal leading-relaxed"
          >
            Explore how pattern classification models evaluate transaction signals and execute automated Razorpay reversals.
          </motion.p>
        </div>
      </section>

      {/* Main Features Grid */}
      <Features />

      {/* Comparison Grid Board */}
      <ComparisonTable />

      {/* Final Action Call */}
      <CTA />
    </div>
  );
}
