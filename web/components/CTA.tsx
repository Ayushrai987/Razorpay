"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-20 bg-[#080711] relative overflow-hidden" id="cta">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10 flex flex-col items-center gap-6">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold font-headings text-white tracking-tight leading-tight"
        >
          Evaluate RazorGuard for Your <span className="text-gradient">Razorpay Workflows</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[#cbd5e1] text-base max-w-lg font-normal leading-relaxed"
        >
          Explore our sandbox prototype or integrate webhooks to test real-time duplicate payment detection and automatic refund dispatch.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2"
        >
          <Link
            href="/#demo"
            className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-wider uppercase shadow-lg"
          >
            Run Interactive Sandbox Demo
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>

          <Link
            href="/#how-it-works"
            className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-bold tracking-wider uppercase"
          >
            <Code2 className="w-4.5 h-4.5 text-[#2dd4bf]" />
            View Webhook Architecture
          </Link>
        </motion.div>

        <span className="text-[11px] text-[#94a3b8] font-mono tracking-wider uppercase mt-1">
          Sub-100ms Detection Engine • Non-Disruptive Webhook Integration
        </span>
      </div>
    </section>
  );
}
