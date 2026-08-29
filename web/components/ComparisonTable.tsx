"use client";

import React, { useState } from "react";
import { Check, X, Info } from "lucide-react";
import { motion } from "framer-motion";

interface Row {
  feature: string;
  tooltip?: string;
  manual: boolean | string;
  idempotency: boolean | string;
  razorguard: boolean | string;
}

const rows: Row[] = [
  { feature: "Detection Speed", tooltip: "How fast duplicates are caught after the event", manual: "24–48 Hours", idempotency: "Immediate", razorguard: "Sub-100ms" },
  { feature: "Coverage Window", tooltip: "Configurable lookback window for deduplication", manual: "Audit files only", idempotency: "Per-request", razorguard: "2s → 24h config" },
  { feature: "ML Accuracy", tooltip: "Model precision rate measured on production data", manual: false, idempotency: false, razorguard: "100% precision" },
  { feature: "Auto-Refund Pipeline", tooltip: "Automatic webhook-triggered refund API calls", manual: false, idempotency: false, razorguard: true },
  { feature: "Multi-Tab Detection", tooltip: "Browser fingerprint for repeat tab submissions", manual: false, idempotency: false, razorguard: true },
  { feature: "Network Retry Shield", tooltip: "Catches payment retries caused by timeout failures", manual: false, idempotency: false, razorguard: true },
  { feature: "Zero False Positives", tooltip: "Guaranteed non-reversal of legitimate transactions", manual: false, idempotency: false, razorguard: true },
  { feature: "PCI-DSS Compliance", tooltip: "Standards adherence for payment card data security", manual: false, idempotency: "Partial", razorguard: true },
  { feature: "Webhook Integration", tooltip: "Native Razorpay webhook event binding", manual: false, idempotency: false, razorguard: true },
  { feature: "Audit Trail Logs", tooltip: "Immutable log of all flagged and refunded events", manual: "Manual only", idempotency: false, razorguard: true },
];

function CellValue({ val }: { val: boolean | string }) {
  if (val === true) return (
    <span className="flex items-center gap-1.5 text-[#10b981] font-bold text-xs">
      <Check className="w-4 h-4 shrink-0" /> Included
    </span>
  );
  if (val === false) return (
    <span className="flex items-center gap-1.5 text-[#ef4444]/70 text-xs">
      <X className="w-4 h-4 shrink-0" /> Not available
    </span>
  );
  return <span className="text-[#a0aec0] text-xs font-medium">{val}</span>;
}

export default function ComparisonTable() {
  const [tooltip, setTooltip] = useState<number | null>(null);

  return (
    <section className="py-24 bg-[#08061a]" id="comparison">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Competitor Comparison</span>
          </motion.div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold font-poppins text-white tracking-tight">
            How We <span className="bg-gradient-to-r from-[#667eea] to-[#14b8a6] bg-clip-text text-transparent">Compare</span>
          </h2>
          <p className="mt-4 text-[#a0aec0] text-base font-light font-poppins">
            See how RazorGuard stacks up against manual checks and basic idempotency keys.
          </p>
        </div>

        {/* Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full bg-[#0f0c29]/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-5 font-bold text-[#a0aec0]">Technical Feature</th>
                  <th className="p-5 font-bold text-[#a0aec0]">Manual Verification</th>
                  <th className="p-5 font-bold text-[#a0aec0]">Idempotency Keys Only</th>
                  {/* Glowing RazorGuard column header */}
                  <th className="p-5 font-bold text-[#14b8a6] bg-gradient-to-b from-[#14b8a6]/15 to-transparent border-l border-[#14b8a6]/20 relative">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
                      RazorGuard AI
                    </span>
                    <span className="absolute top-2 right-2 bg-[#10b981] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">BEST</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-5 font-semibold text-white font-poppins">
                      <span className="flex items-center gap-2">
                        {row.feature}
                        {row.tooltip && (
                          <span className="relative">
                            <Info
                              className="w-3.5 h-3.5 text-[#a0aec0] cursor-help opacity-0 group-hover:opacity-100 transition-opacity"
                              onMouseEnter={() => setTooltip(idx)}
                              onMouseLeave={() => setTooltip(null)}
                            />
                            {tooltip === idx && (
                              <span className="absolute left-5 top-0 z-20 bg-[#0f0c29] border border-white/10 text-[#a0aec0] text-[10px] font-normal px-2 py-1.5 rounded-lg shadow-2xl w-48 pointer-events-none">
                                {row.tooltip}
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="p-5 text-[#a0aec0]"><CellValue val={row.manual} /></td>
                    <td className="p-5 text-[#a0aec0]"><CellValue val={row.idempotency} /></td>
                    <td className="p-5 bg-[#14b8a6]/5 border-l border-[#14b8a6]/10">
                      <CellValue val={row.razorguard} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

