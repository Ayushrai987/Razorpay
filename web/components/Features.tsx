"use client";

import React from "react";
import { motion } from "framer-motion";

interface Feature {
  icon: string;
  title: string;
  color: string;
  glowColor: string;
  iconBg: string;
  bullets: string[];
  description: string;
}

const features: Feature[] = [
  {
    icon: "🤖",
    title: "AI-Powered Detection",
    color: "text-[#667eea]",
    glowColor: "rgba(102, 126, 234, 0.4)",
    iconBg: "bg-[#667eea]/10",
    description: "Real-time XGBoost ML model designed to prevent payment duplication instantly.",
    bullets: [
      "XGBoost model with 100% precision",
      "Detects 5 duplicate scenarios",
      "<100ms detection latency",
      "Continuous learning capability",
      "Real-time fraud pattern matching"
    ]
  },
  {
    icon: "🔍",
    title: "Multiple Detection Methods",
    color: "text-[#14b8a6]",
    glowColor: "rgba(20, 184, 166, 0.4)",
    iconBg: "bg-[#14b8a6]/10",
    description: "Detects charge risks over multiple user sessions and browser states.",
    bullets: [
      "Network timeout detection",
      "Double-click identification",
      "Failed retry analysis",
      "Velocity pattern matching",
      "Merchant gateway retry handling"
    ]
  },
  {
    icon: "💰",
    title: "Automatic Refunds",
    color: "text-[#10b981]",
    glowColor: "rgba(16, 185, 129, 0.4)",
    iconBg: "bg-[#10b981]/10",
    description: "Triggers instant automated refunds directly through Razorpay API tokens.",
    bullets: [
      "Instant API-triggered refunds",
      "95%+ success rate",
      "Zero manual intervention needed",
      "Audit trail preservation",
      "Customer notification automation"
    ]
  },
  {
    icon: "📊",
    title: "Real-time Dashboard",
    color: "text-[#3b82f6]",
    glowColor: "rgba(59, 130, 246, 0.4)",
    iconBg: "bg-[#3b82f6]/10",
    description: "Visualize live transactions, refunds, and operational system health status.",
    bullets: [
      "Live transaction monitoring",
      "Interactive metrics display",
      "3D visualization support",
      "CSV export functionality",
      "Custom alert configuration"
    ]
  },
  {
    icon: "🔐",
    title: "Enterprise Security",
    color: "text-[#ef4444]",
    glowColor: "rgba(239, 68, 68, 0.4)",
    iconBg: "bg-[#ef4444]/10",
    description: "Meets global standards with end-to-end validation mechanisms.",
    bullets: [
      "HMAC signature validation",
      "End-to-end encryption",
      "ISO 27001 compliance",
      "Webhook security checks",
      "Data residency options"
    ]
  },
  {
    icon: "✅",
    title: "High Accuracy",
    color: "text-[#14b8a6]",
    glowColor: "rgba(20, 184, 166, 0.4)",
    iconBg: "bg-[#14b8a6]/10",
    description: "Perfect model accuracy ensures legitimate client checkouts pass without issue.",
    bullets: [
      "100% precision on test set",
      "100% recall achieved",
      "1.0 AUC-ROC score",
      "Zero false positives",
      "Continuous performance monitoring"
    ]
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-[#08061a]" id="features">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
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
            className="mt-4 text-4xl font-bold font-poppins text-white tracking-tight"
          >
            Everything You Need to <span className="text-gradient">Stop Duplicate Charges</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-[#a0aec0] text-base leading-relaxed font-light font-poppins"
          >
            A complete AI-powered payment shield built specifically to integrate into your Razorpay web checkout workflow.
          </motion.p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ 
                  y: -12,
                  boxShadow: `0 15px 40px ${feat.glowColor}`,
                  borderColor: "rgba(20, 184, 166, 0.6)"
                }}
                className="group relative bg-gradient-to-b from-[#0f0c29] to-[#0a081e] rounded-[20px] p-10 border border-white/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Glow Overlay on hover */}
                <div className="absolute inset-0 bg-[#14b8a6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Icon circle badge */}
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-14 h-14 ${feat.iconBg} rounded-full flex items-center justify-center mb-6 transition-all duration-300`}
                  >
                    <span className="text-3xl">{feat.icon}</span>
                  </motion.div>

                  {/* Title (white -> teal gradient text) */}
                  <h3 className="font-bold text-xl text-white font-poppins mb-3 group-hover:text-gradient transition-colors">
                    {feat.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-[#a0aec0] text-sm leading-[1.6] font-light font-inter mb-6">
                    {feat.description}
                  </p>
                </div>

                {/* Bullet points */}
                <div className="pt-6 border-t border-white/10">
                  <ul className="flex flex-col gap-3">
                    {feat.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-sm text-[#a0aec0] hover:text-white transition-colors duration-250 font-inter">
                        <span className="text-[#14b8a6] text-base leading-none">✓</span>
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
