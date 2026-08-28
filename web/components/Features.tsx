"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Search, DollarSign, BarChart2, Shield, CheckCircle, Check } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Detection Engine",
    description: "Our machine learning pipeline uses XGBoost classification models trained on millions of merchant payment transactions. It evaluates cross-channel signatures to isolate duplicates with absolute precision.",
    bullets: ["Zero false-positive guarantees", "Dynamic attribute scoring", "IP & canvas browser profiling"],
    color: "text-razorblue",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Search,
    title: "Multiple Detection Methods",
    description: "Catches duplicate charges regardless of how they happen—whether from micro-network gateway timeouts, customer double-clicking submit buttons, or parallel tabs opened concurrently.",
    bullets: ["Double-click button intercepts", "Gateway retry loop detection", "Concurrent tab session matching"],
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: DollarSign,
    title: "Automatic Zero-Touch Refunds",
    description: "Once a duplicate charge is verified, RazorGuard dispatches idempotent API payloads directly to Razorpay's refund endpoints, eliminating manual finance checks.",
    bullets: ["Instant webhook execution", "Idempotent payload safety", "Automated email receipts"],
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: BarChart2,
    title: "Real-time Dashboard Analytics",
    description: "Monitor live transaction feeds on an enterprise portal. Track duplicate detection rates, auto-refund volumes, latency metrics, and export detailed CSV reports for audits.",
    bullets: ["Live transaction streams", "CSV audit log exports", "Custom risk window sliders"],
    color: "text-razorteal",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    icon: Shield,
    title: "Enterprise Compliance & Security",
    description: "Protects payment records using advanced encryption. Uses SHA256 HMAC payload verification to validate every webhook signal and meet SOC2 security requirements.",
    bullets: ["HMAC signature validation", "TLS 1.3 encrypted data", "Full access audit trails"],
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: CheckCircle,
    title: "100% High Precision Accuracy",
    description: "Achieves 1.0 Precision, 1.0 Recall, and 1.0 AUC-ROC on production benchmarks. Legitimate customer orders are never blocked, keeping sales processing smoothly.",
    bullets: ["Perfect precision rates", "Null false-positive reports", "Continuous retraining loops"],
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="section-tag">Core Capabilities</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-4xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            Everything You Need to <span className="text-gradient">Stop Duplicate Charges</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-gray-500 text-base leading-relaxed font-light"
          >
            A complete AI-powered payment shield built specifically to integrate into your Razorpay web checkout workflow.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group bg-white rounded-3xl p-8 border ${feat.border} shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-12 h-12 ${feat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${feat.color}`} />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 font-poppins mb-3">{feat.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-light mb-6">{feat.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <ul className="flex flex-col gap-2">
                    {feat.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-razorteal shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
