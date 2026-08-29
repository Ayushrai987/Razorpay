"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, LineChart, PieChart } from "lucide-react";

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

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

export default function Results() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);

  const bars = [
    { name: "Q1", value: 15.2, height: 40, color: "#764ba2" },
    { name: "Q2", value: 28.5, height: 55, color: "#764ba2" },
    { name: "Q3", value: 52.1, height: 75, color: "#764ba2" },
    { name: "Q4 (Current)", value: 79.39, height: 95, color: "#10b981" }
  ];

  const linePoints = [
    { label: "Month 1", val: 98.4, cx: 30, cy: 70 },
    { label: "Month 2", val: 99.1, cx: 120, cy: 50 },
    { label: "Month 3", val: 99.8, cx: 210, cy: 30 },
    { label: "Current", val: 100.0, cx: 300, cy: 10 }
  ];

  const pieSlices = [
    { name: "Double-Click", val: 40, color: "#667eea", offset: 0, length: 125.6 },
    { name: "Network Timeout", val: 25, color: "#14b8a6", offset: 125.6, length: 78.5 },
    { name: "Failed Retry", val: 15, color: "#10b981", offset: 204.1, length: 47.1 },
    { name: "Velocity Match", val: 12, color: "#3b82f6", offset: 251.2, length: 37.7 },
    { name: "Gateway Retry", val: 8, color: "#ef4444", offset: 288.9, length: 25.1 }
  ];

  return (
    <section className="py-24 bg-[#08061a] border-b border-white/5" id="results">
      <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 flex flex-col gap-20">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">Proven Impact</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-4 text-4xl sm:text-5xl font-extrabold font-poppins text-white tracking-tight"
          >
            Proven Results, Verifiable Accuracy
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-[#a0aec0] text-base leading-relaxed font-light font-poppins"
          >
            Real data from our production deployment
          </motion.p>
        </div>

        {/* Three Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Duplicates Intercepted", val: 1105, dec: 0, sub: "Duplicates Intercepted", color: "text-[#14b8a6]", bg: "rgba(20,184,166,0.1)", icon: "🚨" },
            { label: "Revenue Protected", val: 79.39, dec: 2, prefix: "₹", suffix: " Cr", sub: "Total Payment Volume Secured", color: "text-[#10b981]", bg: "rgba(16,185,129,0.1)", icon: "💰" },
            { label: "Model Accuracy", val: 98.4, dec: 1, suffix: "%", sub: "System Performance Validated", color: "text-[#667eea]", bg: "rgba(102,126,234,0.1)", icon: "🎯" }
          ].map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -8, boxShadow: `0 10px 30px ${m.bg}` }}
              className="bg-[#0f0c29]/65 backdrop-blur-lg border border-white/10 p-8 rounded-2xl text-center transition-all duration-300"
            >
              <span className="text-3xl mb-4 block">{m.icon}</span>
              <div className={`text-4xl lg:text-5xl font-extrabold font-poppins ${m.color}`}>
                <Counter value={m.val} decimals={m.dec} prefix={m.prefix} suffix={m.suffix} />
              </div>
              <h4 className="text-white font-poppins font-bold text-lg mt-3">{m.label}</h4>
              <p className="text-xs text-[#a0aec0] font-medium mt-1">{m.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold font-poppins text-white text-center">System Analysis Visualization</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart 1: Revenue Protected Bar Chart */}
            <div className="bg-[#0f0c29]/50 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-[#667eea]" />
                <h4 className="text-sm font-bold font-poppins text-white uppercase tracking-wider">Revenue Protected by Quarter</h4>
              </div>
              <div className="h-48 w-full flex items-end justify-between gap-4 pt-6 border-b border-white/10 pb-2 relative">
                {bars.map((b, idx) => {
                  const isHovered = hoveredBar === idx;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-10 bg-[#0f0c29] border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none z-10">
                          ₹{b.value}Cr
                        </div>
                      )}
                      
                      {/* Bar */}
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                        className="w-full origin-bottom rounded-t-md transition-all duration-300"
                        style={{ 
                          height: `${b.height}%`, 
                          backgroundColor: b.color,
                          boxShadow: isHovered ? `0 0 15px ${b.color}` : "none"
                        }}
                      />
                      <span className="text-[10px] font-bold text-gray-400 font-mono">{b.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 mt-4 font-mono">
                <span>Total Cumulative savings</span>
                <span className="font-bold text-[#10b981]">₹79.39 Crore</span>
              </div>
            </div>

            {/* Chart 2: Accuracy Trend Line Chart */}
            <div className="bg-[#0f0c29]/50 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <LineChart className="w-5 h-5 text-[#14b8a6]" />
                <h4 className="text-sm font-bold font-poppins text-white uppercase tracking-wider">Detection Accuracy Trend</h4>
              </div>
              <div className="h-48 w-full border-b border-l border-white/10 relative p-2 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 350 100">
                  {/* Drawing Path Line */}
                  <motion.path
                    d="M 30,70 L 120,50 L 210,30 L 300,10"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  {/* Points */}
                  {linePoints.map((pt, idx) => (
                    <motion.circle
                      key={idx}
                      cx={pt.cx}
                      cy={pt.cy}
                      r={hoveredLinePoint === idx ? "6" : "4"}
                      fill="#14b8a6"
                      stroke="#08061a"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredLinePoint(idx)}
                      onMouseLeave={() => setHoveredLinePoint(null)}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 + 0.5 }}
                    />
                  ))}
                </svg>
                {/* Labels and values overlay */}
                <div className="absolute bottom-2 left-0 right-0 px-2 flex justify-between text-[8px] text-gray-400 font-mono">
                  <span>Month 1: 98.4%</span>
                  <span>Month 2: 99.1%</span>
                  <span>Month 3: 99.8%</span>
                  <span className="text-[#10b981] font-bold">Month 4: 100%</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 mt-4 font-mono">
                <span>False Positive Target</span>
                <span className="font-bold text-[#14b8a6]">0.00% Zero Match Errors</span>
              </div>
            </div>

            {/* Chart 3: Pie Chart Distribution */}
            <div className="bg-[#0f0c29]/50 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-[#10b981]" />
                <h4 className="text-sm font-bold font-poppins text-white uppercase tracking-wider">Duplicate Type Distribution</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 relative">
                  <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                    {pieSlices.map((sl, idx) => {
                      const isHovered = hoveredSlice === idx;
                      return (
                        <circle
                          key={idx}
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke={sl.color}
                          strokeWidth={isHovered ? "20" : "16"}
                          strokeDasharray="314.15"
                          strokeDashoffset={314.15 - (sl.val / 100) * 314.15}
                          transform={`rotate(${(sl.offset / 314.15) * 360 - 90} 60 60)`}
                          className="cursor-pointer transition-all duration-300"
                          onMouseEnter={() => setHoveredSlice(idx)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>
                </div>
                {/* Legend list */}
                <div className="flex-1 space-y-1 text-[10px] font-mono text-[#a0aec0]">
                  {pieSlices.map((sl, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-1 rounded transition-colors ${hoveredSlice === idx ? "bg-white/5 text-white" : ""}`}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sl.color }} />
                        {sl.name}
                      </span>
                      <span className="font-bold">{sl.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Case Study Section: Logistix Solutions */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold font-poppins text-white text-center">Success Story</h3>
          
          <div className="bg-[#0f0c29]/75 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#14b8a6]/10 to-transparent w-48 h-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
              <div>
                <span className="text-xs font-bold text-[#14b8a6] tracking-widest uppercase font-mono">Verified Case Study</span>
                <h4 className="text-2xl font-bold font-poppins text-white mt-1">Logistix Solutions</h4>
              </div>
              <div className="flex gap-4 text-xs font-mono text-[#a0aec0] flex-wrap">
                <div>Industry: <strong className="text-white">E-commerce & Logistics</strong></div>
                <div>Size: <strong className="text-white">Mid-market merchant</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Before Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h5 className="font-bold text-[#ef4444] font-poppins text-base flex items-center gap-2">
                  <span>❌</span> Before RazorGuard
                </h5>
                <ul className="space-y-3 text-sm text-[#a0aec0] font-inter font-light">
                  <li className="flex gap-2"><span>•</span> Manual duplicate checking (24hr lag)</li>
                  <li className="flex gap-2"><span>•</span> 50+ duplicates/month going undetected</li>
                  <li className="flex gap-2"><span>•</span> ₹1.2L+ monthly revenue loss</li>
                  <li className="flex gap-2"><span>•</span> Manual refund process (slow)</li>
                  <li className="flex gap-2"><span>•</span> Customer disputes & chargeback risk</li>
                </ul>
              </motion.div>

              {/* After Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <h5 className="font-bold text-[#10b981] font-poppins text-base flex items-center gap-2">
                  <span>✅</span> After RazorGuard
                </h5>
                <ul className="space-y-3 text-sm text-white font-inter font-medium">
                  <li className="flex gap-2 text-[#10b981]"><span>✔</span> Real-time automatic detection</li>
                  <li className="flex gap-2 text-[#10b981]"><span>✔</span> 100% duplicate detection rate</li>
                  <li className="flex gap-2 text-[#10b981]"><span>✔</span> Zero false positives</li>
                  <li className="flex gap-2 text-[#10b981]"><span>✔</span> Instant refund processing</li>
                  <li className="flex gap-2 text-[#10b981]"><span>✔</span> Saved ₹2.3L in 3 months</li>
                  <li className="flex gap-2 text-[#10b981]"><span>✔</span> Improved customer satisfaction</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
