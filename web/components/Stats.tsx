"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, ShieldAlert, Cpu, CheckCircle } from "lucide-react";

interface StatItem {
  icon: React.ReactNode;
  prefix?: string;
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  subtext: string;
  color: string;
  glowColor: string;
  iconBg: string;
}

const prototypeStats: StatItem[] = [
  {
    icon: <ShieldAlert className="w-6 h-6 text-[#2dd4bf]" />,
    value: 5000,
    suffix: "+",
    label: "Demo Transactions Analyzed",
    subtext: "Simulated checkout payload validation",
    color: "text-[#2dd4bf]",
    glowColor: "rgba(45, 212, 191, 0.25)",
    iconBg: "bg-[#2dd4bf]/10"
  },
  {
    icon: <Cpu className="w-6 h-6 text-[#10b981]" />,
    value: 12,
    suffix: " Signals",
    label: "Detection Parameters",
    subtext: "Hashes, amounts, & time deltas evaluated",
    color: "text-[#10b981]",
    glowColor: "rgba(16, 185, 129, 0.25)",
    iconBg: "bg-[#10b981]/10"
  },
  {
    icon: <Zap className="w-6 h-6 text-purple-400" />,
    value: 100,
    prefix: "<",
    suffix: " ms",
    label: "Execution Latency",
    subtext: "Webhook response & API dispatch target",
    color: "text-purple-400",
    glowColor: "rgba(167, 139, 250, 0.25)",
    iconBg: "bg-purple-500/10"
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-[#3b82f6]" />,
    value: 100,
    suffix: "%",
    label: "Benchmark Suite Match",
    subtext: "Zero missed duplicates on test datasets",
    color: "text-[#3b82f6]",
    glowColor: "rgba(59, 130, 246, 0.25)",
    iconBg: "bg-[#3b82f6]/10"
  },
];

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const fps = 60;
    const steps = (duration / 1000) * fps;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [inView, value]);

  const formatted = count.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative py-16 bg-[#0c0a1a] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#94a3b8]">
            Platform Benchmark Performance & Technical Targets
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {prototypeStats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#0f0c22]/80 border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 relative group cursor-default hover:border-white/20"
            >
              <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-105`}>
                {s.icon}
              </div>

              <div className={`text-3xl lg:text-4xl font-extrabold font-headings tracking-tight ${s.color}`}>
                <Counter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
              </div>

              <h3 className="text-white font-headings font-bold text-base mt-2.5">{s.label}</h3>

              <p className="text-xs text-[#94a3b8] font-normal mt-1">{s.subtext}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
