"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, ShieldCheck, Zap, BarChart2, Lock, Filter } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  color: string;
  iconBg: string;
  bullets: string[];
  description: string;
}

const capabilities: Feature[] = [
  {
    icon: <Cpu className="w-6 h-6 text-[#2dd4bf]" />,
    title: "Pattern Detection Classifier",
    color: "text-[#2dd4bf]",
    iconBg: "bg-[#2dd4bf]/10",
    description: "Evaluates multi-attribute transaction streams in real-time to flag double-deduction risks.",
    bullets: [
      "XGBoost-based classifier architecture",
      "Evaluates user hashes & amounts",
      "Sub-100ms analysis target",
      "Configurable risk threshold limits",
      "Real-time signature matching"
    ]
  },
  {
    icon: <Filter className="w-6 h-6 text-purple-400" />,
    title: "Multi-Pattern Detection",
    color: "text-purple-400",
    iconBg: "bg-purple-500/10",
    description: "Identifies duplicate triggers originating across varied checkout & network error scenarios.",
    bullets: [
      "Spinner double-click detection",
      "Gateway timeout resubmission handling",
      "Multi-tab checkout token checks",
      "Backend retry loop deduplication",
      "Velocity pattern matching"
    ]
  },
  {
    icon: <Zap className="w-6 h-6 text-[#10b981]" />,
    title: "Automated Razorpay Reversals",
    color: "text-[#10b981]",
    iconBg: "bg-[#10b981]/10",
    description: "Issues idempotent refund API requests directly to Razorpay when duplicate charges are confirmed.",
    bullets: [
      "Idempotent API key execution",
      "Automated refund dispatch",
      "No manual finance overhead required",
      "Clear status log preservation",
      "SMS & Email notification triggers"
    ]
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-[#3b82f6]" />,
    title: "Observability Console",
    color: "text-[#3b82f6]",
    iconBg: "bg-[#3b82f6]/10",
    description: "Inspect live transaction streams, flagged duplicates, and system processing metrics.",
    bullets: [
      "Real-time event stream view",
      "Interactive ledger analytics",
      "CSV transaction log exports",
      "Custom alert configuration",
      "Detailed error code tracking"
    ]
  },
  {
    icon: <Lock className="w-6 h-6 text-yellow-400" />,
    title: "HMAC Security Standards",
    color: "text-yellow-400",
    iconBg: "bg-yellow-500/10",
    description: "Validates all incoming webhooks with secret HMAC SHA256 signature tokens.",
    bullets: [
      "Razorpay webhook HMAC verification",
      "TLS 1.3 encrypted data transit",
      "Zero cardholder PCI data storage",
      "Strict API key authentication",
      "Tenant-isolated Redis caches"
    ]
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#2dd4bf]" />,
    title: "Merchant Control Rules",
    color: "text-[#2dd4bf]",
    iconBg: "bg-[#2dd4bf]/10",
    description: "Adjust lookback time windows and merchant business logic to minimize false positives.",
    bullets: [
      "Custom scan windows (5s to 24h)",
      "Ignore rules for specific checkout routes",
      "Threshold sensitivity controls",
      "Idempotency token customization",
      "Dry-run simulation mode"
    ]
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-[#080711] border-b border-white/10" id="features">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">System Architecture</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-3xl sm:text-4xl font-extrabold font-headings text-white tracking-tight"
          >
            Capabilities Built for Payment Integrity
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-[#cbd5e1] text-sm sm:text-base leading-relaxed"
          >
            Technical capabilities engineered specifically for high-volume merchants using Razorpay payment workflows.
          </motion.p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#0f0c22] rounded-2xl p-7 border border-white/10 flex flex-col justify-between hover:border-[#2dd4bf]/40 transition-all duration-300"
            >
              <div>
                <div className={`w-12 h-12 ${feat.iconBg} rounded-xl flex items-center justify-center mb-5 border border-white/5`}>
                  {feat.icon}
                </div>

                <h3 className="font-bold text-lg text-white font-headings mb-2">
                  {feat.title}
                </h3>
                
                <p className="text-[#cbd5e1] text-xs leading-relaxed mb-5">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <ul className="flex flex-col gap-2 text-xs text-[#cbd5e1]">
                  {feat.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="text-[#2dd4bf] font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
