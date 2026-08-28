"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ShieldAlert, ArrowRight } from "lucide-react";

interface LiveTx {
  id: string;
  amount: string;
  status: "Secure" | "Refunded" | "Flagged";
  time: string;
}

const initialTxs: LiveTx[] = [
  { id: "pay_N8a2B7cD", amount: "₹154.00", status: "Secure", time: "Just now" },
  { id: "pay_K7a9P4qL", amount: "₹125.00", status: "Refunded", time: "2m ago" },
  { id: "pay_M9d1C2eA", amount: "₹45.00", status: "Secure", time: "4m ago" },
  { id: "pay_J6b8O3pM", amount: "₹125.00", status: "Flagged", time: "4m ago" },
];

export default function Demo() {
  const [txs, setTxs] = useState<LiveTx[]>(initialTxs);

  // 3D Mouse Tilt values
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const rotateX = useTransform(y, [0, 400], [10, -10]);
  const rotateY = useTransform(x, [0, 400], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const normalizedX = (mouseX / width) * 400;
    const normalizedY = (mouseY / height) * 400;
    
    x.set(normalizedX);
    y.set(normalizedY);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  useEffect(() => {
    const ids = ["pay_R3x1Q8wE", "pay_A9c2L5mF", "pay_B7d4K3nG", "pay_C6e8M2oH"];
    let idx = 0;
    const interval = setInterval(() => {
      const isDup = Math.random() > 0.6;
      setTxs(prev => [
        {
          id: ids[idx % ids.length],
          amount: isDup ? "₹125.00" : `₹${(Math.random() * 200 + 50).toFixed(2)}`,
          status: isDup ? "Refunded" : "Secure",
          time: "Just now",
        },
        ...prev.slice(0, 3),
      ]);
      idx++;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const badgeStyle = (status: string) => {
    if (status === "Secure") return "bg-emerald-100 text-emerald-700";
    if (status === "Refunded") return "bg-blue-100 text-razorblue";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <section className="py-24 bg-white" id="demo">
      <div className="max-w-[1536px] mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        {/* Left: Text */}
        <div className="lg:col-span-6 flex flex-col gap-7 text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Live Sandbox</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-poppins text-gray-900 tracking-tight leading-tight"
          >
            See It In Action — <span className="text-gradient">Live Sandbox</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-xl text-gray-600 leading-relaxed font-inter font-light"
          >
            Watch RazorGuard detect duplicate charges in real time. The dashboard preview shows an actual live checkout stream — every flagged transaction gets automatically refunded within milliseconds, keeping your books pristine.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-100"
          >
            {[
              ["1,105", "Duplicates detected in demo sandbox"],
              ["₹79.39 Cr", "Revenue protected historically"],
              ["100ms", "Average detection latency threshold"],
            ].map(([val, label], i) => (
              <div key={i} className="flex items-center justify-between text-sm font-medium">
                <span className="text-gray-500">{label}</span>
                <span className="font-bold text-gray-900 font-poppins text-base">{val}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/demo" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base">
              Try Interactive Sandbox
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Right: Live dashboard with 3D Tilt */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 relative w-full cursor-pointer select-none"
          style={{ perspective: 1200 }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="rounded-3xl border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden bg-white transition-all duration-100"
          >
            {/* Browser chrome */}
            <div className="bg-gray-100 border-b border-gray-200 px-5 py-3.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-xs text-gray-400 border border-gray-200 flex items-center justify-between">
                <span>razorguard.io/demo</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Dashboard */}
            <div className="p-8 space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-2">
                {[
                  { label: "Today", val: "1,105", sub: "Duplicates" },
                  { label: "Refunded", val: "100%", sub: "Auto" },
                  { label: "Saved", val: "₹79.39Cr", sub: "Revenue" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <div className="font-bold text-lg font-poppins text-gray-900">{s.val}</div>
                    <div className="text-[11px] text-gray-400 font-medium mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Feed */}
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-1">Transaction Feed</div>
              <div className="space-y-3 max-h-56 overflow-hidden">
                {txs.map((tx, i) => (
                  <motion.div
                    key={tx.id + i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 border ${
                      tx.status !== "Secure" ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className={`w-5 h-5 ${tx.status !== "Secure" ? "text-razorblue" : "text-emerald-500"}`} />
                      <div>
                        <div className="font-mono text-sm font-bold text-gray-700">{tx.id}</div>
                        <div className="text-[11px] text-gray-450 mt-0.5">{tx.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-800">{tx.amount}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
