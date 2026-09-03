"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Webhook, Cpu, RefreshCw, FileText } from "lucide-react";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const steps: Step[] = [
  {
    number: "1",
    icon: <Webhook className="w-8 h-8 text-[#2dd4bf]" />,
    title: "1. Webhook Integration",
    description: "Point Razorpay webhook events to your RazorGuard listener URI in under 5 minutes.",
    gradient: "from-[#4f46e5] to-[#0d9488]"
  },
  {
    number: "2",
    icon: <Cpu className="w-8 h-8 text-purple-400" />,
    title: "2. Real-Time Pattern Match",
    description: "Evaluates time deltas, user hashes, and checkout metadata in under 100ms.",
    gradient: "from-[#0d9488] to-[#10b981]"
  },
  {
    number: "3",
    icon: <RefreshCw className="w-8 h-8 text-[#10b981]" />,
    title: "3. Automated Reversal",
    description: "Confirmed duplicates call Razorpay Refund APIs automatically with idempotent keys.",
    gradient: "from-[#10b981] to-[#3b82f6]"
  },
  {
    number: "4",
    icon: <FileText className="w-8 h-8 text-[#3b82f6]" />,
    title: "4. Audit & Ledger Logging",
    description: "All flagged events and automated refund records are saved in your finance portal.",
    gradient: "from-[#3b82f6] to-[#4f46e5]"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-[#0c0a1a] border-b border-white/10" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Integration Workflow</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-3xl sm:text-4xl font-extrabold font-headings text-white tracking-tight"
          >
            How Duplicate Payment Detection Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-[#cbd5e1] text-sm sm:text-base leading-relaxed"
          >
            A 4-step automated pipeline connecting your Razorpay gateway to merchant protection.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center relative bg-[#0f0c22] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center font-bold text-white text-sm mb-4 shadow-md`}>
                {step.number}
              </div>

              <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-4">
                {step.icon}
              </div>

              <h3 className="font-bold text-base text-white font-headings mb-2">
                {step.title}
              </h3>
              <p className="text-[#cbd5e1] text-xs leading-relaxed">
                {step.description}
              </p>

              {i < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-[#2dd4bf] z-10">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
