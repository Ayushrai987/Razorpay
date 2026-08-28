"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Linkedin, 
  Twitter, 
  Github,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Sales Query",
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
        subject: "Sales Query",
        message: ""
      });
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen py-16">
      {/* Header */}
      <section className="relative pb-16 overflow-hidden bg-gray-50 border-b border-gray-100 mb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Direct Line</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 tracking-tight"
          >
            Contact Our Support Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-base max-w-xl mx-auto font-light leading-relaxed"
          >
            Have inquiries regarding Razorpay custom timeframes, model configurations, or setup plans? Write to us below.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Side: Contact Information */}
        <div className="lg:col-span-5 flex flex-col gap-8 text-left">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gray-900 font-poppins">Get In Touch</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Connect with our security operations center. We review and respond to incoming inquiries within 4 hours.
            </p>
          </div>

          <div className="flex flex-col gap-6 pt-6 border-t border-gray-100">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-razorblue shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm font-poppins">Email Support</h4>
                <p className="text-xs text-gray-500 mt-1">support@razorguard.io</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-razorteal shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm font-poppins">Call Us</h4>
                <p className="text-xs text-gray-500 mt-1">+91 80 4912 8392</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm font-poppins">Office Location</h4>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Cyber Security Tech Park, Phase 2, Whitefield, Bangalore, KA, India.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-100 text-gray-400">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-razorblue transition-colors duration-300">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-razorblue transition-colors duration-300">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-razorblue transition-colors duration-300">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-250 shadow-card hover:shadow-card-hover transition-all duration-300 relative overflow-hidden">
            <h3 className="font-bold text-gray-905 text-lg font-poppins mb-6">Send A Secure Message</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left text-xs md:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Your Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Merchant Name"
                    className="bg-white border border-gray-200 hover:border-gray-300 focus:border-razorblue rounded-lg px-4 py-3 outline-none text-gray-900 text-sm transition-colors shadow-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Your Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="bg-white border border-gray-200 hover:border-gray-300 focus:border-razorblue rounded-lg px-4 py-3 outline-none text-gray-900 text-sm transition-colors shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Subject Inquiry *</label>
                <select 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  className="bg-white border border-gray-200 hover:border-gray-350 focus:border-razorblue rounded-lg px-4 py-3 outline-none text-gray-900 text-sm transition-colors cursor-pointer shadow-sm"
                >
                  <option value="Sales Query">Sales Query</option>
                  <option value="API Support">API Support</option>
                  <option value="Partnership">Partnership Inquiry</option>
                  <option value="Technical Issue">Technical Issue</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Message Details *</label>
                <textarea 
                  name="message" 
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can our technical team assist your transaction checkout portals?"
                  className="bg-white border border-gray-200 hover:border-gray-300 focus:border-razorblue rounded-lg px-4 py-3 outline-none text-gray-900 text-sm transition-colors resize-none shadow-sm"
                  required
                />
              </div>

              <AnimatePresence>
                {submitStatus === "success" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 bg-teal-50 border border-teal-100 p-4 rounded-lg text-razorteal text-xs items-center"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Message dispatched successfully! A tech manager will contact you soon.</span>
                  </motion.div>
                )}
                {submitStatus === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 bg-red-50 border border-red-100 p-4 rounded-lg text-red-500 text-xs items-center"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 btn-primary py-3.5 text-xs tracking-wider uppercase disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send Secure Message
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
