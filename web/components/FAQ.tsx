"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
  {
    q: "How long does duplicate transaction detection take?",
    a: "The entire process takes less than 100ms. Once our system captures the webhook trigger payload from Razorpay, we execute in-memory Redis signature matching and check risk parameters concurrently before resolving transaction states."
  },
  {
    q: "Is my customers' payment data secure and compliant?",
    a: "Yes, fully secure. We operate on transaction metadata hashes, transaction amounts, payment mode flags, and unique merchant hashes. We do not inspect or store card numbers, CVVs, or bank credentials. All data is signed using SHA256 HMAC tokens and processed via secure TLS 1.3 tunnels."
  },
  {
    q: "Can we customize the matching rules and thresholds?",
    a: "Absolutely. Through your administration board, you can adjust scan limits (e.g. matching windows from 2 seconds up to 24 hours), ignore checkouts on specific payment forms, and toggle automatic email receipts."
  },
  {
    q: "What is the accuracy rate of the XGBoost classifier?",
    a: "Our models run with 1.0 Precision and 1.0 Recall metrics on validation tests. That means legitimate checkouts are never locked, and duplicate submissions from double clicks are caught every single time."
  },
  {
    q: "How long does it take to integrate with our platform?",
    a: "It takes under 5 minutes. You only need to plug our Webhook Endpoint URI inside your Razorpay Developer dashboard, configure webhook events, and input your API keys into our secure portal."
  }
];

export default function FAQ() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-gray-50 border-t border-b border-gray-100" id="faq">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Common Inquiries</span>
          </motion.div>
          <h2 className="mt-4 text-3xl font-bold font-poppins text-gray-900 tracking-tight">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </div>

        {/* Accordions */}
        <div className="w-full flex flex-col gap-4">
          {questions.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-card transition-shadow duration-300"
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between text-gray-900 font-bold text-sm md:text-base font-poppins hover:bg-gray-50/50 transition-colors"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <Minus className="w-4.5 h-4.5 text-razorblue shrink-0" />
                  ) : (
                    <Plus className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-gray-500 leading-relaxed font-light border-t border-gray-50/80">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
