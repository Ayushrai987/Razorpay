"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const reviews = [
  {
    name: "Sanjay Kulkarni",
    role: "Head of Finops",
    company: "LogiShip Logistics",
    initials: "SK",
    gradient: "from-blue-500 to-teal-400",
    quote: "Before deploying RazorGuard, our operations team spent 15 hours weekly cross-checking bank transaction reports to reverse customer double-charges. RazorGuard automated the detection process, reducing support dispute tickets by 90%."
  },
  {
    name: "Ananya Roy",
    role: "Engineering Director",
    company: "FastTransit Cargo",
    initials: "AR",
    gradient: "from-purple-500 to-indigo-500",
    quote: "Network micro-timeouts in toll plaza checkout systems caused critical transaction replication. Integrating RazorGuard's XGBoost models enabled detection filters to catch chargebacks in under 100ms. Perfect reliability."
  },
  {
    name: "Meera Bose",
    role: "Operations Lead",
    company: "CartBuy E-Commerce",
    initials: "MB",
    gradient: "from-teal-400 to-emerald-500",
    quote: "The API integration was seamless. RazorGuard connected with our Razorpay webhook logs instantly. Our payment gateway integrity scores are back at 99.9%, and our customer trust has never been stronger."
  }
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="py-24 bg-gray-50 border-t border-b border-gray-100" id="testimonials">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <span className="section-tag">Client Feedback</span>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-gray-900 tracking-tight">
            Trusted by Operations Teams
          </h2>
        </div>

        {/* Carousel Card Container */}
        <div className="relative w-full min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-card flex flex-col items-center gap-6 relative w-full"
            >
              <Quote className="absolute top-6 left-8 w-12 h-12 text-gray-100 pointer-events-none" />
              
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 text-base md:text-lg leading-relaxed italic max-w-2xl font-light">
                &quot;{reviews[current].quote}&quot;
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 w-full justify-center">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${reviews[current].gradient} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                  {reviews[current].initials}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm text-gray-900 font-poppins">{reviews[current].name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    {reviews[current].role}, {reviews[current].company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons and Indicators */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex gap-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  current === idx ? "w-6 bg-razorblue" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
}
