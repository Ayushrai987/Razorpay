"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Stat {
  icon: string;
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

const stats: Stat[] = [
  { 
    icon: "🚨", 
    value: 1105, 
    suffix: "", 
    label: "Duplicates Intercepted", 
    subtext: "↑ Detected in real-time webhooks",
    color: "text-[#14b8a6]", 
    glowColor: "rgba(20, 184, 166, 0.4)",
    iconBg: "bg-[#14b8a6]/10" 
  },
  { 
    icon: "💰", 
    prefix: "₹", 
    value: 79.39, 
    suffix: " Cr", 
    decimals: 2, 
    label: "Revenue Protected", 
    subtext: "↑ Total payment volume secured",
    color: "text-[#10b981]", 
    glowColor: "rgba(16, 185, 129, 0.4)",
    iconBg: "bg-[#10b981]/10" 
  },
  { 
    icon: "🎯", 
    value: 100, 
    suffix: "%", 
    label: "Model Accuracy", 
    subtext: "Perfect precision on test dataset",
    color: "text-[#667eea]", 
    glowColor: "rgba(102, 126, 234, 0.4)",
    iconBg: "bg-[#667eea]/10" 
  },
  { 
    icon: "✅", 
    value: 95, 
    suffix: "%", 
    label: "Success Rate", 
    subtext: "Refunds processed successfully",
    color: "text-[#3b82f6]", 
    glowColor: "rgba(59, 130, 246, 0.4)",
    iconBg: "bg-[#3b82f6]/10" 
  },
];

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2500; // 2.5s duration
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

  const formatted = count.toLocaleString("en-IN", {
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
    <section className="relative py-20 bg-[#0c0924] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Layout: 4 columns, responsive to 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: `0 10px 30px ${s.glowColor}`,
                  borderColor: "rgba(102, 126, 234, 0.5)"
                }}
                className="bg-[#0f0c29]/60 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center transition-all duration-300 relative group cursor-default"
              >
                {/* Circular semi-transparent background for icon */}
                <div className={`w-14 h-14 ${s.iconBg} rounded-full flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                
                {/* Large animated counter number */}
                <div className={`text-4xl lg:text-5xl font-extrabold font-poppins tracking-tight ${s.color}`}>
                  <Counter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
                </div>
                
                {/* Label */}
                <h4 className="text-white font-poppins font-bold text-lg mt-3">{s.label}</h4>
                
                {/* Subtext */}
                <p className="text-xs text-[#a0aec0] font-medium mt-1.5">{s.subtext}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
