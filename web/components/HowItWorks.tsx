"use client";

import React from "react";
import { motion } from "framer-motion";

interface Step {
  number: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  glowColor: string;
  iconBg: string;
  gradient: string;
}

const steps: Step[] = [
  {
    number: "1",
    icon: "📤",
    title: "Upload Transactions",
    description: "Upload your payment CSV or connect API",
    color: "text-[#667eea]",
    glowColor: "rgba(102, 126, 234, 0.4)",
    iconBg: "bg-[#667eea]/10",
    gradient: "from-[#667eea] to-[#764ba2]"
  },
  {
    number: "2",
    icon: "🔍",
    title: "AI Detects Duplicates",
    description: "Real-time ML model analysis",
    color: "text-[#14b8a6]",
    glowColor: "rgba(20, 184, 166, 0.4)",
    iconBg: "bg-[#14b8a6]/10",
    gradient: "from-[#14b8a6] to-[#10b981]"
  },
  {
    number: "3",
    icon: "✅",
    title: "Automatic Refund",
    description: "Instant processing via Razorpay API",
    color: "text-[#10b981]",
    glowColor: "rgba(16, 185, 129, 0.4)",
    iconBg: "bg-[#10b981]/10",
    gradient: "from-[#10b981] to-[#3b82f6]"
  },
  {
    number: "4",
    icon: "📋",
    title: "Get Reports",
    description: "Detailed audit & analytics",
    color: "text-[#3b82f6]",
    glowColor: "rgba(59, 130, 246, 0.4)",
    iconBg: "bg-[#3b82f6]/10",
    gradient: "from-[#3b82f6] to-[#667eea]"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0c0924]" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-24">
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
            className="mt-4 text-4xl font-bold font-poppins text-white tracking-tight"
          >
            How RazorGuard <span className="text-gradient">Protects Your Payments</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-[#a0aec0] text-base leading-relaxed font-light font-poppins"
          >
            Connect in 5 minutes. Real-time protection starts immediately.
          </motion.p>
        </div>

        {/* Steps and Connections */}
        <div className="relative">
          
          {/* Animated Connecting Lines (desktop only) */}
          <div className="hidden lg:block absolute top-[68px] left-[15%] right-[15%] h-1 bg-white/5 z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-[#667eea] via-[#14b8a6] via-[#10b981] to-[#3b82f6]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => {
              return (
                <div key={i} className="flex flex-col items-center text-center relative group">
                  
                  {/* Step Number Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", duration: 0.6, delay: i * 0.15 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center font-bold text-white text-sm mb-4 border border-white/20 shadow-md`}
                  >
                    {step.number}
                  </motion.div>

                  {/* Icon Container with Scale+Rotate on hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 + 0.1 }}
                    whileHover={{ scale: 1.15, rotate: i % 2 === 0 ? 5 : -5 }}
                    className={`w-[100px] h-[100px] ${step.iconBg} rounded-[24px] border border-white/10 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-[0_0_20px_rgba(20,184,166,0.35)] transition-all duration-300 relative cursor-default`}
                  >
                    <span className="text-5xl">{step.icon}</span>
                  </motion.div>

                  {/* Title & Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 + 0.2 }}
                    className="max-w-[280px]"
                  >
                    <h3 className="font-bold text-xl text-white font-poppins mb-2 group-hover:text-[#14b8a6] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[#a0aec0] text-sm leading-relaxed font-inter font-light">
                      {step.description}
                    </p>
                  </motion.div>

                  {/* Flow Arrow Indicator inside layout (Desktop only, hidden after step 4) */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-[60px] -right-[15px] translate-x-1/2 z-20 text-[#14b8a6] font-bold text-xl select-none animate-pulse">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
