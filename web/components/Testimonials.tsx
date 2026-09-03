"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CreditCard, Ticket, ShieldCheck } from "lucide-react";

interface WorkflowScenario {
  icon: React.ReactNode;
  title: string;
  category: string;
  description: string;
  benefit: string;
}

const scenarios: WorkflowScenario[] = [
  {
    icon: <ShoppingBag className="w-6 h-6 text-[#2dd4bf]" />,
    title: "E-Commerce Checkout & Flash Sales",
    category: "High Velocity Checkouts",
    description: "High traffic during sales causes buyers to click 'Pay' multiple times when gateways experience 2-second queue latency.",
    benefit: "Automatically catches & refunds second charges before fulfillment order queues double-ship."
  },
  {
    icon: <CreditCard className="w-6 h-6 text-purple-400" />,
    title: "SaaS & Digital Subscriptions",
    category: "Recurring Billing",
    description: "Automated retry scripts and concurrent tab checkouts trigger duplicate card authorizations for single account upgrades.",
    benefit: "Prevents customer friction and support ticket backlogs with instant double-charge reversal."
  },
  {
    icon: <Ticket className="w-6 h-6 text-[#10b981]" />,
    title: "Event Ticketing & Logistics",
    category: "Time-Sensitive Orders",
    description: "Toll gates, bus bookings, and event tickets suffer from transient mobile network drops during authorization.",
    benefit: "Idempotent refund API dispatches ensure clean merchant ledgers without manual audit delays."
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#0c0a1a] border-b border-white/10" id="workflows">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-12">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Target Use Cases</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-headings text-white tracking-tight">
            Designed for High-Volume Payment Workflows
          </h2>
          <p className="text-sm text-[#cbd5e1] font-normal max-w-lg">
            Engineered to safeguard Razorpay transaction pipelines against common duplication vectors.
          </p>
        </div>

        {/* Workflow Use Case Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {scenarios.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#0f0c22] border border-white/10 rounded-2xl p-7 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#2dd4bf] bg-[#2dd4bf]/10 px-2.5 py-1 rounded-full border border-[#2dd4bf]/20">
                    {item.category}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-white font-headings mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-[#cbd5e1] leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-start gap-2 text-xs text-[#10b981]">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{item.benefit}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
