"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Mail, ArrowRight, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";

export default function Footer() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscription registered successfully.");
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100 text-gray-500 font-inter pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16">
        {/* Brand Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-razorblue to-razorteal flex items-center justify-center shadow-glow-blue">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="font-poppins font-bold text-lg text-gray-900 tracking-tight">
                Razor<span className="text-razorblue">Guard</span>
              </span>
              <span className="block text-[9px] text-gray-400 font-inter tracking-widest uppercase">
                by Razorpay AI
              </span>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-gray-500 max-w-sm font-light">
            AI-powered transaction duplicate intelligence and real-time automated refund recovery. Protecting revenue, mitigating disputes, and optimizing accounting logs for high-growth merchants.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
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

        {/* Product Column */}
        <div className="flex flex-col gap-5">
          <span className="font-bold text-gray-900 tracking-wider text-[10px] uppercase">Product</span>
          <ul className="flex flex-col gap-3 text-sm font-light">
            <li>
              <Link href="/features" className="hover:text-razorblue transition-colors duration-300">
                Core Engine
              </Link>
            </li>
            <li>
              <Link href="/features#methods" className="hover:text-razorblue transition-colors duration-300">
                Detection Models
              </Link>
            </li>
            <li>
              <Link href="/features#refunds" className="hover:text-razorblue transition-colors duration-300">
                Automated Refunds
              </Link>
            </li>
            <li>
              <Link href="/demo" className="hover:text-razorblue transition-colors duration-300 flex items-center gap-1">
                Live Sandbox <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="flex flex-col gap-5">
          <span className="font-bold text-gray-900 tracking-wider text-[10px] uppercase">Resources</span>
          <ul className="flex flex-col gap-3 text-sm font-light">
            <li>
              <Link href="/how-it-works" className="hover:text-razorblue transition-colors duration-300">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/how-it-works#architecture" className="hover:text-razorblue transition-colors duration-300">
                Architecture Specs
              </Link>
            </li>
            <li>
              <Link href="/results" className="hover:text-razorblue transition-colors duration-300">
                Case Studies
              </Link>
            </li>
            <li>
              <Link href="/how-it-works#faq" className="hover:text-razorblue transition-colors duration-300">
                System FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="flex flex-col gap-5">
          <span className="font-bold text-gray-900 tracking-wider text-[10px] uppercase">Stay Secure</span>
          <p className="text-sm text-gray-500 font-light">
            Subscribe to our weekly transaction security digest.
          </p>
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white border border-gray-200 focus-within:border-razorblue rounded-xl py-1.5 pl-4 pr-1.5 shadow-sm"
          >
            <Mail className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="email"
              placeholder="Merchant Email"
              className="bg-transparent border-0 outline-none text-sm text-gray-900 placeholder-gray-400 w-full focus:ring-0"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-razorblue to-razorpurple hover:opacity-90 text-white rounded-lg p-2 transition-all duration-300 shadow-md shrink-0"
              aria-label="Subscribe"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 border-t border-gray-250/30 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-light">
        <span>© {new Date().getFullYear()} RazorGuard (Razorpay Duplicate Transaction Detection). All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link href="/contact" className="hover:text-razorblue transition-colors duration-300">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-razorblue transition-colors duration-300">Terms of Service</Link>
          <Link href="/contact" className="hover:text-razorblue transition-colors duration-300">SLA Agreement</Link>
        </div>
      </div>
    </footer>
  );
}
