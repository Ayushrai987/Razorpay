"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck, ArrowRight, Lock, Mail, CheckCircle2, User, KeyRound } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Demo", href: "/#demo" },
  { name: "Results", href: "/#results" },
  { name: "Contact", href: "/#contact" },
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
            ? "bg-[#0a081ec0] backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ y: [0, -5, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#14b8a6] flex items-center justify-center shadow-[0_0_15px_rgba(102,126,234,0.4)]"
            >
              <ShieldCheck className="w-5.5 h-5.5 text-white" />
            </motion.div>
            <div className="leading-tight">
              <span className="font-poppins font-extrabold text-xl text-white tracking-tight group-hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.6)] transition-all">
                Razor<span className="text-[#14b8a6]">Guard</span>
              </span>
              <span className="block text-[9px] text-[#a0aec0] font-inter tracking-widest uppercase font-bold">
                by Razorpay AI
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium text-[#a0aec0] hover:text-white transition-all duration-300 hover:bg-white/5"
                >
                  <span className="relative z-10">{link.name}</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-[#14b8a6] scale-x-0 origin-left transition-transform duration-300"
                    style={{ transformOrigin: "left" }}
                    whileHover={{ scaleX: 1 }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA & Login */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setSignInOpen(true)}
              className="text-sm font-semibold text-[#a0aec0] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-gray-400" />
              Sign in
            </button>
            <Link
              href="/#contact"
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-xl text-[#a0aec0] hover:text-white hover:bg-white/5 transition-colors border border-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
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
              className="fixed inset-0 bg-[#0a081e]/80 backdrop-blur-md z-45 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#0f0c29] border-r border-white/10 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#14b8a6]" />
                  <span className="font-poppins font-bold text-white text-lg">RazorGuard</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 flex flex-col gap-1.5 px-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-base font-medium text-[#a0aec0] hover:text-white hover:bg-white/5 transition-all"
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
                  Sign in
                </button>
                <Link href="/#contact" onClick={() => setMobileOpen(false)} className="btn-primary text-center py-3 text-sm">
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interactive Sign In Modal */}
      <AnimatePresence>
        {signInOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a081e]/80 backdrop-blur-md"
              onClick={() => setSignInOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-[#0f0c29] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl z-10 overflow-hidden"
            >
              <button
                onClick={() => setSignInOpen(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#14b8a6] mb-2 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-poppins text-white">Sign in to RazorGuard</h3>
                <p className="text-xs text-[#a0aec0]">Access your merchant duplicate duplicate detection dashboard</p>
              </div>

              {loginSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-[#10b981] gap-3">
                  <CheckCircle2 className="w-12 h-12 animate-bounce" />
                  <span className="font-bold text-base text-white font-poppins">Authenticated Successfully!</span>
                  <p className="text-xs text-[#a0aec0]">Redirecting to live merchant portal...</p>
                </div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#a0aec0] uppercase tracking-wider">Merchant Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="merchant@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-sm input-focus"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#a0aec0] uppercase tracking-wider">Password</label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your merchant email."); }} className="text-xs text-[#14b8a6] hover:underline">Forgot?</a>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-sm input-focus"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary py-3.5 text-sm mt-2 w-full flex justify-center items-center gap-2">
                    Sign In to Console
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative my-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                    <span className="relative bg-[#0f0c29] px-3 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Or continue with</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setLoginSuccess(true); setTimeout(() => { setLoginSuccess(false); setSignInOpen(false); }, 1500); }}
                    className="w-full py-3 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-4 h-4 rounded bg-[#667eea] text-white flex items-center justify-center font-bold text-[9px]">R</div>
                    Razorpay Single Sign-On (SSO)
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
