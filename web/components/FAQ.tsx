"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What is duplicate payment detection?",
    a: "Duplicate payment detection is an automated security mechanism that monitors checkout authorization streams for repeated transaction attempts originating from the same customer, cart session, or order ID within a specified timeframe."
  },
  {
    q: "How do duplicate payments occur in Razorpay workflows?",
    a: "Duplicate charges typically happen when buyers double-tap checkout submit buttons during network latency, open parallel payment windows across multiple browser tabs, or when merchant backend services trigger uncoordinated API retries."
  },
  {
    q: "How does RazorGuard identify duplicate transactions?",
    a: "RazorGuard ingests Razorpay payment webhooks in real-time. It evaluates transaction metadata including customer email hashes, payment amounts, payment method flags, and checkout timestamps in under 100ms using an XGBoost pattern classification model."
  },
  {
    q: "What happens after a duplicate payment is detected?",
    a: "When a duplicate charge is confirmed, RazorGuard automatically issues an idempotent refund API request directly to Razorpay. This reverses the secondary double deduction immediately before bank dispute tickets or chargebacks are initiated."
  },
  {
    q: "Does RazorGuard store sensitive cardholder data?",
    a: "No. RazorGuard operates exclusively on payment event metadata and SHA256 hashes. It never inspects, captures, or stores card numbers, CVVs, netbanking passwords, or sensitive PCI-DSS restricted data."
  },
  {
    q: "How long does it take to integrate with Razorpay?",
    a: "Integration takes under 5 minutes. You register our Webhook Endpoint URI inside your Razorpay Developer Dashboard, select relevant payment event triggers (such as payment.captured), and input your API credentials into your RazorGuard merchant console."
  }
];

export default function FAQ() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <section className="py-20 bg-[#0c0a1a] border-b border-white/10" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Frequently Asked Questions</span>
          </motion.div>
          <h2 className="mt-4 text-3xl font-extrabold font-headings text-white tracking-tight">
            Understanding Duplicate Payment Protection
          </h2>
          <p className="mt-2 text-[#cbd5e1] text-sm">
            Answers to common technical and operational inquiries for payment teams.
          </p>
        </div>

        {/* Accordions */}
        <div className="w-full flex flex-col gap-3.5">
          {faqs.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#0f0c22] rounded-xl border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => handleToggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full p-5 text-left flex items-center justify-between text-white font-bold text-sm md:text-base font-headings hover:bg-white/5 transition-colors"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-[#2dd4bf] shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#94a3b8] shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-[#cbd5e1] leading-relaxed border-t border-white/5">
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
