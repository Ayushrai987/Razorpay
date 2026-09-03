"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck, ArrowRight, Lock, Mail, CheckCircle2, User, KeyRound } from "lucide-react";

const navLinks = [
  { name: "Overview", href: "/#home" },
  { name: "Problem Vectors", href: "/#problem" },
  { name: "Detection Engine", href: "/#solution" },
  { name: "Capabilities", href: "/features" },
  { name: "Benchmarks", href: "/results" },
  { name: "Sandbox Demo", href: "/demo" },
  { name: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccess(true);
    setTimeout(() => {
      setLoginSuccess(false);
      setSignInOpen(false);
      setLoginEmail("");
      setLoginPass("");
    }, 1800);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center ${
          scrolled
            ? "bg-[#080711]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.6)] border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="RazorGuard Homepage">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#0d9488] flex items-center justify-center shadow-[0_0_15px_rgba(13,148,136,0.4)]">
              <ShieldCheck className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-headings font-extrabold text-xl text-white tracking-tight group-hover:text-[#2dd4bf] transition-colors">
                Razor<span className="text-[#2dd4bf]">Guard</span>
              </span>
              <span className="block text-[9px] text-[#94a3b8] font-mono tracking-wider uppercase font-semibold">
                Razorpay Payment Security
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#cbd5e1] hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA & Login */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setSignInOpen(true)}
              className="text-sm font-semibold text-[#cbd5e1] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-[#94a3b8]" />
              Merchant Portal
            </button>
            <Link
              href="/#demo"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              Try Prototype Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-xl text-[#cbd5e1] hover:text-white hover:bg-white/5 transition-colors border border-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#080711]/80 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#0f0c22] border-r border-white/10 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2dd4bf]" />
                  <span className="font-headings font-bold text-white text-lg">RazorGuard</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-[#94a3b8] hover:text-white rounded-lg hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 flex flex-col gap-1 px-4 py-6" aria-label="Mobile Navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-base font-medium text-[#cbd5e1] hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="px-6 pb-8 flex flex-col gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={() => { setMobileOpen(false); setSignInOpen(true); }}
                  className="btn-secondary text-center py-3 text-sm flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Merchant Portal
                </button>
                <Link href="/#demo" onClick={() => setMobileOpen(false)} className="btn-primary text-center py-3 text-sm">
                  Try Prototype Demo
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interactive Merchant Portal Modal */}
      <AnimatePresence>
        {signInOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#080711]/85 backdrop-blur-md"
              onClick={() => setSignInOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-[#0f0c22] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl z-10 overflow-hidden"
            >
              <button
                onClick={() => setSignInOpen(false)}
                className="absolute top-5 right-5 p-2 text-[#94a3b8] hover:text-white rounded-full hover:bg-white/5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2dd4bf] mb-1 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 id="modal-title" className="text-2xl font-bold font-headings text-white">Merchant Security Console</h3>
                <p className="text-xs text-[#94a3b8]">Access sandbox evaluation tools and duplicate alert settings</p>
              </div>

              {loginSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-[#10b981] gap-3" aria-live="polite">
                  <CheckCircle2 className="w-12 h-12" />
                  <span className="font-bold text-base text-white font-headings">Authenticated (Prototype Portal)</span>
                  <p className="text-xs text-[#94a3b8]">Loading sample sandbox ledger...</p>
                </div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-email" className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider">
                      Merchant Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="merchant@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-sm input-focus"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="login-password" className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider">
                        Password
                      </label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset is available in the merchant portal documentation."); }} className="text-xs text-[#2dd4bf] hover:underline">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-sm input-focus"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary py-3.5 text-sm mt-2 w-full flex justify-center items-center gap-2">
                    Access Merchant Console
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative my-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                    <span className="relative bg-[#0f0c22] px-3 text-[10px] text-[#94a3b8] uppercase tracking-widest font-semibold">Or continue with</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setLoginSuccess(true); setTimeout(() => { setLoginSuccess(false); setSignInOpen(false); }, 1500); }}
                    className="w-full py-3 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                  >
                    <span className="w-4 h-4 rounded bg-[#4f46e5] text-white flex items-center justify-center font-bold text-[9px]">R</span>
                    Razorpay OAuth Sandbox Login
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
