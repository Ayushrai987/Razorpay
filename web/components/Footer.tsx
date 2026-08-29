"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, ArrowRight, Github, Linkedin, Twitter, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Please enter a valid email";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setEmail("");
  };

  return (
    <footer className="bg-[#05030f] border-t border-white/5 text-[#a0aec0] font-inter" id="contact">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/5">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#14b8a6] flex items-center justify-center shadow-[0_0_20px_rgba(102,126,234,0.4)]">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-poppins font-bold text-xl text-white tracking-tight">
                  Razor<span className="text-[#14b8a6]">Guard</span>
                </span>
                <span className="block text-[9px] text-[#a0aec0] font-inter tracking-widest uppercase mt-0.5">
                  by Razorpay AI
                </span>
              </div>
            </Link>
            
            <p className="text-sm leading-relaxed text-[#a0aec0] max-w-sm font-light">
              AI-powered duplicate transaction detection with real-time automated refund recovery. Protecting revenue for high-growth merchants.
            </p>
            
            {/* Social Links with individual glows */}
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0077b5]/20 hover:border-[#0077b5]/40 hover:shadow-[0_0_12px_rgba(0,119,181,0.4)] transition-all duration-300 text-[#a0aec0] hover:text-[#0077b5]"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1d9bf0]/20 hover:border-[#1d9bf0]/40 hover:shadow-[0_0_12px_rgba(29,155,240,0.4)] transition-all duration-300 text-[#a0aec0] hover:text-[#1d9bf0]"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com/Ayushrai987/Razorpay" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-all duration-300 text-[#a0aec0] hover:text-white"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="flex flex-col gap-5">
            <span className="font-bold text-white tracking-wider text-[10px] uppercase font-mono">Product</span>
            <ul className="flex flex-col gap-3 text-sm font-light">
              {[
                { label: "Core Engine", href: "/features" },
                { label: "Detection Models", href: "/features#methods" },
                { label: "Automated Refunds", href: "/features#refunds" },
                { label: "Live Sandbox", href: "/demo" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#14b8a6] transition-colors duration-300 hover:translate-x-0.5 inline-block transform">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col gap-5">
            <span className="font-bold text-white tracking-wider text-[10px] uppercase font-mono">Resources</span>
            <ul className="flex flex-col gap-3 text-sm font-light">
              {[
                { label: "How It Works", href: "/how-it-works" },
                { label: "Architecture Docs", href: "/how-it-works#architecture" },
                { label: "Case Studies", href: "/results" },
                { label: "System FAQ", href: "/how-it-works#faq" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#14b8a6] transition-colors duration-300 hover:translate-x-0.5 inline-block transform">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col gap-5">
            <span className="font-bold text-white tracking-wider text-[10px] uppercase font-mono">Stay Secure</span>
            <p className="text-sm text-[#a0aec0] font-light">
              Weekly transaction security digest for merchants.
            </p>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-[#10b981] text-sm font-medium bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-3 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                You&apos;re subscribed!
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className={`relative flex items-center bg-white/5 border rounded-xl py-2 pl-4 pr-1.5 transition-colors ${emailError ? "border-[#ef4444]/40" : "border-white/10 focus-within:border-[#14b8a6]/40"}`}>
                  <Mail className="w-4 h-4 text-[#a0aec0] mr-2 shrink-0" />
                  <input
                    type="email"
                    placeholder="Merchant Email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    className="bg-transparent border-0 outline-none text-sm text-white placeholder-[#a0aec0]/60 w-full focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#667eea] to-[#14b8a6] hover:opacity-90 text-white rounded-lg p-2 transition-all duration-300 shadow-md shrink-0"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {emailError && <p className="text-[#ef4444] text-xs">{emailError}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#a0aec0]/60 font-light">
          <span>© {new Date().getFullYear()} RazorGuard · Razorpay Duplicate Detection System. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-[#14b8a6] transition-colors duration-300">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-[#14b8a6] transition-colors duration-300">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#14b8a6] transition-colors duration-300">SLA Agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

