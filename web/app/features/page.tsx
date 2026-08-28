"use client";

import React from "react";
import Features from "@/components/Features";
import ComparisonTable from "@/components/ComparisonTable";
import CTA from "@/components/CTA";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Mini Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">System Specs</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            Powerful Features to Stop Duplicate Charges
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-base max-w-xl mx-auto font-light leading-relaxed"
          >
            Explore how our machine learning models verify client footprints, prevent double payments, and trigger API refunds.
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
