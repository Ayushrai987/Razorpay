"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  stat: string;
  initials: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    name: "John Merchant",
    role: "CEO",
    company: "Logistix Solutions",
    quote: "Reduced our duplicate-related losses by 95%. RazorGuard has been a game-changer for our business operations.",
    stat: "Saved ₹2.3L quarterly",
    initials: "LS",
    gradient: "from-[#667eea] to-[#764ba2]"
  },
  {
    name: "Aarav Sharma",
    role: "Director of FinOps",
    company: "RetailHub India",
    quote: "Zero false positives. Perfect for our use case. Webhook integration took us less than 5 minutes to set up.",
    stat: "Processed ₹50L+ transactions",
    initials: "RH",
    gradient: "from-[#14b8a6] to-[#10b981]"
  },
  {
    name: "Karan Johar",
    role: "Operations Lead",
    company: "PaymentPros",
    quote: "Best investment for payment security. Replaced all our manual transaction audits and cleared backlogs.",
    stat: "100% merchant satisfaction",
    initials: "PP",
    gradient: "from-[#3b82f6] to-[#667eea]"
  }
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-advance loop (5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section 
      className="py-24 bg-[#0c0924] border-t border-b border-white/5 relative overflow-hidden" 
      id="testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-12">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Client Reviews</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-poppins text-white tracking-tight">
            Trusted by Merchants Worldwide
          </h2>
          <p className="text-sm text-[#a0aec0] font-light max-w-md font-poppins">
            See what our users say about RazorGuard
          </p>
        </div>

        {/* Carousel Content */}
        <div ref={containerRef} className="relative w-full max-w-4xl min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="bg-[#0f0c29]/65 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-14 shadow-2xl flex flex-col items-center gap-6 relative w-full hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all duration-300 group"
            >
              <Quote className="absolute top-6 left-8 w-12 h-12 text-white/5 pointer-events-none" />
              
              {/* Star Rating */}
              <div className="flex gap-1.5 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: i * 0.1 }}
                    className="text-lg"
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#a0aec0] text-base md:text-xl leading-relaxed italic max-w-2xl font-light font-poppins">
                &quot;{testimonials[current].quote}&quot;
              </p>

              {/* Verified Badge Highlight Stat */}
              <div className="bg-[#14b8a6]/10 border border-[#14b8a6]/20 px-4 py-1.5 rounded-full text-[#14b8a6] text-xs font-mono font-bold">
                {testimonials[current].stat}
              </div>

              {/* User Bio */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10 w-full justify-center">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${testimonials[current].gradient} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                  {testimonials[current].initials}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-base text-white font-poppins">{testimonials[current].name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-mono">
                    {testimonials[current].role}, {testimonials[current].company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Manual navigation elements */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] flex items-center justify-center transition-all duration-300 text-white"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Dot Indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 rounded-full transition-all duration-350 ${
                  current === idx ? "w-6 bg-[#14b8a6]" : "w-2.5 bg-white/20"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] flex items-center justify-center transition-all duration-300 text-white"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
