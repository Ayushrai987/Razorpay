"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Search, ShieldCheck, TrendingUp, Zap } from "lucide-react";

interface Stat {
  icon: React.ElementType;
  prefix?: string;
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  color: string;
  bg: string;
}

const stats: Stat[] = [
  { icon: Search, value: 1105, suffix: "", label: "Duplicates Detected", color: "text-razorblue", bg: "bg-blue-50" },
  { icon: ShieldCheck, prefix: "₹", value: 79.39, suffix: " Cr", decimals: 2, label: "Revenue Protected", color: "text-razorteal", bg: "bg-teal-50" },
  { icon: Zap, value: 100, suffix: "%", label: "Model Accuracy", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: TrendingUp, value: 95, suffix: "%", label: "Success Rate", color: "text-emerald-600", bg: "bg-emerald-50" },
];

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
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
    <section className="section-gray py-20 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className={`text-3xl lg:text-4xl font-bold font-poppins ${s.color}`}>
                  <Counter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="text-sm text-gray-500 font-medium mt-1">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
