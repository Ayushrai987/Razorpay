"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="cta">
      {/* Background glowing gradients */}
      <div className="absolute inset-0 bg-gradient-animated opacity-[0.04] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10 flex flex-col items-center gap-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 tracking-tight leading-tight"
        >
          Ready to Protect Your <span className="text-gradient">Merchant Revenue?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-gray-500 text-lg max-w-lg font-light leading-relaxed"
        >
          Join hundreds of digital merchants securing transactions, mitigating disputes, and automating accounting workflows with RazorGuard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <Link
            href="/contact"
            className="w-full sm:w-auto relative group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-razorblue to-razorpurple text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:shadow-glow-blue shadow-md"
          >
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-xl bg-razorblue/30 animate-pulse-ring" />
            <span className="relative z-10 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-4.5 h-4.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
          
          <Link
            href="/contact?subject=Demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-gray-100"
          >
            <Calendar className="w-4.5 h-4.5" />
            Schedule Demo
          </Link>
        </motion.div>
        
        <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-2">
          Zero coding needed to try • Installs in 5 minutes
        </span>
      </div>
    </section>
  );
}
