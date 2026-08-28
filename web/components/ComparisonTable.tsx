"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ComparisonTable() {
  return (
    <section className="py-24 bg-white" id="comparison">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Competitor Comparison</span>
          </motion.div>
          <h2 className="mt-4 text-3xl font-bold font-poppins text-gray-900 tracking-tight">
            How We <span className="text-gradient">Compare</span>
          </h2>
        </div>

        {/* Table Container */}
        <div className="w-full bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-5 font-semibold">Technical Feature</th>
                  <th className="p-5 font-semibold">Manual Verification</th>
                  <th className="p-5 font-semibold">Idempotency Checks Only</th>
                  <th className="p-5 font-semibold text-razorblue bg-blue-50/50">RazorGuard AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr>
                  <td className="p-5 font-medium text-gray-900">Detection Speed</td>
                  <td className="p-5 text-gray-400 text-xs">24 - 48 Hours delay</td>
                  <td className="p-5 text-gray-400 text-xs">Immediate (Initial request)</td>
                  <td className="p-5 text-razorblue font-semibold text-xs bg-blue-50/30">Sub-100 milliseconds</td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-gray-900">Coverage Window</td>
                  <td className="p-5 text-gray-400 text-xs">Historical audit files</td>
                  <td className="p-5 text-gray-400 text-xs">API transaction parameters</td>
                  <td className="p-5 text-razorblue font-semibold text-xs bg-blue-50/30">Custom config (2s - 24h)</td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-gray-900">Accuracy & Precision</td>
                  <td className="p-5 text-gray-400 text-xs flex items-center gap-1.5"><X className="w-4 h-4 text-red-500 shrink-0" /> Low (human slips)</td>
                  <td className="p-5 text-gray-400 text-xs flex items-center gap-1.5"><X className="w-4 h-4 text-red-500 shrink-0" /> Medium (misses tab spikes)</td>
                  <td className="p-5 text-razorteal font-semibold text-xs bg-blue-50/30 flex items-center gap-1.5"><Check className="w-4 h-4 text-razorteal shrink-0" /> 100% precision score</td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-gray-900">Auto-Refund Pipeline</td>
                  <td className="p-5 text-gray-400 text-xs flex items-center gap-1.5"><X className="w-4 h-4 text-red-500 shrink-0" /> Manual admin process</td>
                  <td className="p-5 text-gray-400 text-xs flex items-center gap-1.5"><X className="w-4 h-4 text-red-500 shrink-0" /> Not supported</td>
                  <td className="p-5 text-razorblue font-semibold text-xs bg-blue-50/30 flex items-center gap-1.5"><Check className="w-4 h-4 text-razorblue shrink-0" /> Webhook API automation</td>
                </tr>
                <tr>
                  <td className="p-5 font-medium text-gray-900">Multiple Tabs check</td>
                  <td className="p-5 text-gray-400 text-xs flex items-center gap-1.5"><X className="w-4 h-4 text-red-500 shrink-0" /> No</td>
                  <td className="p-5 text-gray-400 text-xs flex items-center gap-1.5"><X className="w-4 h-4 text-red-500 shrink-0" /> No</td>
                  <td className="p-5 text-razorblue font-semibold text-xs bg-blue-50/30 flex items-center gap-1.5"><Check className="w-4 h-4 text-razorblue shrink-0" /> Browser fingerprint profile</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
