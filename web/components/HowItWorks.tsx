"use client";

import React from "react";
import { motion } from "framer-motion";
import { UploadCloud, Search, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload / Stream",
    description: "Transactions stream via Razorpay webhooks or batch-upload CSV files directly to our detection engine.",
    color: "text-razorblue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-razorblue",
  },
  {
    number: "02",
    icon: Search,
    title: "AI Detection",
    description: "Our XGBoost model evaluates payment metadata, user fingerprints, and time windows in under 100ms.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Auto Refund",
    description: "Confirmed duplicates trigger instant, idempotent refunds via Razorpay API with zero manual intervention.",
    color: "text-razorteal",
    bg: "bg-teal-50",
    border: "border-teal-200",
    dot: "bg-razorteal",
  },
  {
    number: "04",
    icon: FileText,
    title: "Detailed Reports",
    description: "Real-time analytics, CSV exports, Slack alerts, and full audit trails for finance compliance reviews.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 section-gray" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="section-tag">Simple 4-Step Process</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-4xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            How RazorGuard <span className="text-gradient">protects your payments</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-gray-500 text-lg"
          >
            Connect in 5 minutes. Protection starts immediately.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[2.75rem] left-[calc(12.5%-0.5px)] right-[calc(12.5%-0.5px)] h-0.5 bg-gradient-to-r from-razorblue via-purple-400 via-razorteal to-emerald-500 opacity-30 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon circle */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-card group-hover:shadow-card-hover transition-all duration-300`}
                  >
                    <Icon className={`w-7 h-7 ${step.color}`} />
                  </motion.div>

                  {/* Step number */}
                  <span className="text-xs font-bold text-gray-300 tracking-widest mb-2">{step.number}</span>

                  <h3 className="font-bold text-lg text-gray-900 font-poppins mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
