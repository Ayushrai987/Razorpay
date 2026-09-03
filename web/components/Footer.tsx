"use client";

import React, { useState } from "react";
import Link from "next/link";
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
    <footer className="bg-[#05040b] border-t border-white/10 text-[#cbd5e1] font-sans" id="contact">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="RazorGuard Homepage">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#0d9488] flex items-center justify-center shadow-[0_0_15px_rgba(13,148,136,0.4)]">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-headings font-bold text-xl text-white tracking-tight">
                  Razor<span className="text-[#2dd4bf]">Guard</span>
                </span>
                <span className="block text-[9px] text-[#94a3b8] font-mono tracking-wider uppercase mt-0.5">
                  Razorpay Duplicate Security
                </span>
              </div>
            </Link>
            
            <p className="text-xs leading-relaxed text-[#cbd5e1] max-w-sm">
              Real-time duplicate payment detection and automated refund recovery platform designed for merchant checkout workflows.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0077b5]/20 hover:border-[#0077b5]/40 transition-all text-[#94a3b8] hover:text-[#0077b5]"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1d9bf0]/20 hover:border-[#1d9bf0]/40 transition-all text-[#94a3b8] hover:text-[#1d9bf0]"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com/Ayushrai987/Razorpay" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all text-[#94a3b8] hover:text-white"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white tracking-wider text-[10px] uppercase font-mono">Platform</span>
            <ul className="flex flex-col gap-2 text-xs font-normal">
              <li><Link href="/" className="hover:text-[#2dd4bf] transition-colors">Overview</Link></li>
              <li><Link href="/#problem" className="hover:text-[#2dd4bf] transition-colors">Duplication Vectors</Link></li>
              <li><Link href="/#solution" className="hover:text-[#2dd4bf] transition-colors">Detection Engine</Link></li>
              <li><Link href="/features" className="hover:text-[#2dd4bf] transition-colors">Capabilities</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white tracking-wider text-[10px] uppercase font-mono">Resources</span>
            <ul className="flex flex-col gap-3 text-xs font-normal">
              <li><Link href="/how-it-works" className="hover:text-[#2dd4bf] transition-colors">Integration Steps</Link></li>
              <li><Link href="/demo" className="hover:text-[#2dd4bf] transition-colors">Interactive Sandbox</Link></li>
              <li><Link href="/results" className="hover:text-[#2dd4bf] transition-colors">Benchmark Results</Link></li>
              <li><Link href="/contact" className="hover:text-[#2dd4bf] transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white tracking-wider text-[10px] uppercase font-mono">Technical Updates</span>
            <p className="text-xs text-[#cbd5e1]">
              Payment security digest for engineering teams.
            </p>
            
            {submitted ? (
              <div className="flex items-center gap-2 text-[#10b981] text-xs bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Subscribed to digest!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <label htmlFor="newsletter-email" className="sr-only">Merchant Email</label>
                <div className={`relative flex items-center bg-white/5 border rounded-xl py-1.5 pl-3 pr-1 transition-colors ${emailError ? "border-red-500/50" : "border-white/10 focus-within:border-[#2dd4bf]"}`}>
                  <Mail className="w-4 h-4 text-[#94a3b8] mr-2 shrink-0" />
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="merchant@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    className="bg-transparent border-0 outline-none text-xs text-white placeholder-[#94a3b8] w-full focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#4f46e5] to-[#0d9488] hover:opacity-90 text-white rounded-lg p-1.5 transition-all shrink-0"
                    aria-label="Subscribe to technical updates"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {emailError && <p className="text-red-400 text-[10px]">{emailError}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#94a3b8]">
          <span>© {new Date().getFullYear()} RazorGuard · Real-Time Duplicate Payment Detection System.</span>
          <div className="flex items-center gap-5">
            <Link href="/how-it-works" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/demo" className="hover:text-white transition-colors">Sandbox</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
