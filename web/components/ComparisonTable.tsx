"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface Row {
  feature: string;
  manual: boolean | string;
  idempotency: boolean | string;
  razorguard: boolean | string;
}

const rows: Row[] = [
  { feature: "Detection Latency Target", manual: "24–48 Hours (Audit)", idempotency: "Immediate", razorguard: "Sub-100ms" },
  { feature: "Scan Lookback Window", manual: "Static Export Files", idempotency: "Per-request Key", razorguard: "5s → 24h Configurable" },
  { feature: "Multi-Attribute Signal Matching", manual: false, idempotency: false, razorguard: true },
  { feature: "Automated Razorpay Refund API", manual: false, idempotency: false, razorguard: true },
  { feature: "Multi-Tab Checkout Detection", manual: false, idempotency: false, razorguard: true },
  { feature: "Gateway Timeout Retry Handling", manual: false, idempotency: false, razorguard: true },
  { feature: "Zero Merchant Code Refactoring", manual: false, idempotency: false, razorguard: true },
  { feature: "HMAC Signature Verification", manual: false, idempotency: "Partial", razorguard: true },
  { feature: "Native Webhook Event Ingestion", manual: false, idempotency: false, razorguard: true },
  { feature: "Structured Audit Log Trails", manual: "Manual Spreadsheets", idempotency: false, razorguard: true },
];

function CellValue({ val }: { val: boolean | string }) {
  if (val === true) return (
    <span className="flex items-center gap-1.5 text-[#10b981] font-bold text-xs font-mono">
      <Check className="w-4 h-4 shrink-0 text-[#10b981]" /> Supported
    </span>
  );
  if (val === false) return (
    <span className="flex items-center gap-1.5 text-[#ef4444] text-xs font-mono">
      <X className="w-4 h-4 shrink-0 text-[#ef4444]" /> Not Supported
    </span>
  );
  return <span className="text-[#cbd5e1] text-xs font-mono font-medium">{val}</span>;
}

export default function ComparisonTable() {
  return (
    <section className="py-20 bg-[#080711] border-b border-white/10" id="comparison">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center gap-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Architecture Comparison</span>
          </motion.div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold font-headings text-white tracking-tight">
            How RazorGuard Compares to Standard Approaches
          </h2>
          <p className="mt-3 text-[#cbd5e1] text-sm sm:text-base font-normal">
            Comparing manual audit processes, basic idempotency keys, and automated webhook deduplication.
          </p>
        </div>

        {/* Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full bg-[#0f0c22] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Technical Feature Comparison Table">
              <caption className="sr-only">Comparison of RazorGuard duplicate detection vs manual verification and basic idempotency keys</caption>
              <thead className="border-b border-white/10 text-xs font-mono uppercase tracking-wider bg-white/5">
                <tr>
                  <th scope="col" className="p-4 font-bold text-white">Technical Capability</th>
                  <th scope="col" className="p-4 font-bold text-[#94a3b8]">Manual Reconciliation</th>
                  <th scope="col" className="p-4 font-bold text-[#94a3b8]">Idempotency Keys Alone</th>
                  <th scope="col" className="p-4 font-bold text-[#2dd4bf] bg-[#2dd4bf]/10 border-l border-[#2dd4bf]/20">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                      RazorGuard Webhook Shield
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <th scope="row" className="p-4 font-semibold text-white font-headings text-xs sm:text-sm">
                      {row.feature}
                    </th>
                    <td className="p-4 text-[#cbd5e1]"><CellValue val={row.manual} /></td>
                    <td className="p-4 text-[#cbd5e1]"><CellValue val={row.idempotency} /></td>
                    <td className="p-4 bg-[#2dd4bf]/5 border-l border-[#2dd4bf]/10">
                      <CellValue val={row.razorguard} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
