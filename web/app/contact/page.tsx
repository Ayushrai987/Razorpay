"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Evaluation Support",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error");
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setSubmitStatus("error");
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "Evaluation Support",
        message: ""
      });
    }, 1500);
  };

  return (
    <div className="bg-[#080711] min-h-screen pt-28 pb-20">
      {/* Header */}
      <section className="relative pb-12 text-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Developer & Merchant Inquiry</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold font-headings text-white tracking-tight"
          >
            Contact Payment Security Support
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#cbd5e1] text-base max-w-xl mx-auto font-normal leading-relaxed"
          >
            Have technical questions about Razorpay webhook integration, scan lookback limits, or prototype deployment? Submit an inquiry below.
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-[#0f0c22] p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          <h2 className="font-bold text-white text-xl font-headings mb-6">Send Technical Inquiry</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left text-xs md:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-name" className="text-[#cbd5e1] font-bold uppercase tracking-wider text-[10px]">
                  Name <span className="text-[#2dd4bf]">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Merchant Name"
                  className="input-focus px-4 py-3 rounded-xl border border-white/10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="text-[#cbd5e1] font-bold uppercase tracking-wider text-[10px]">
                  Work Email <span className="text-[#2dd4bf]">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="input-focus px-4 py-3 rounded-xl border border-white/10 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-subject" className="text-[#cbd5e1] font-bold uppercase tracking-wider text-[10px]">
                Inquiry Topic <span className="text-[#2dd4bf]">*</span>
              </label>
              <select
                id="contact-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-focus px-4 py-3 rounded-xl border border-white/10 text-sm cursor-pointer"
              >
                <option value="Evaluation Support">Prototype Evaluation & Webhook Integration</option>
                <option value="Custom Rules">Custom Scan Window & Lookback Rules</option>
                <option value="Security Architecture">Security & HMAC Verification Specs</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-[#cbd5e1] font-bold uppercase tracking-wider text-[10px]">
                Message <span className="text-[#2dd4bf]">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your payment transaction volume or integration question..."
                className="input-focus px-4 py-3 rounded-xl border border-white/10 text-sm resize-none"
              />
            </div>

            <AnimatePresence>
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-3 bg-[#10b981]/10 border border-[#10b981]/20 p-4 rounded-xl text-[#10b981] text-xs items-center"
                  role="status"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Inquiry received! We will follow up shortly.</span>
                </motion.div>
              )}
              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs items-center"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-3.5 text-xs font-bold tracking-wider uppercase disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Submit Inquiry
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
