"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldAlert, ArrowRight, Lock, Mail, CheckCircle2, User, KeyRound } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Demo", href: "/demo" },
  { name: "Results", href: "/results" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3.5"
            : "bg-white/80 backdrop-blur-sm py-5 border-b border-gray-100/60"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-razorblue to-razorteal flex items-center justify-center shadow-glow-blue transition-transform group-hover:scale-105">
              <ShieldAlert className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-poppins font-extrabold text-xl text-gray-900 tracking-tight">
                Razor<span className="text-razorblue">Guard</span>
              </span>
              <span className="block text-[10px] text-gray-400 font-inter tracking-widest uppercase font-semibold">
                by Razorpay AI
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-razorblue font-semibold bg-blue-50/80"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-razorblue rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA & Login */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setSignInOpen(true)}
              className="text-sm font-semibold text-gray-700 hover:text-razorblue transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-gray-400" />
              Sign in
            </button>
            <Link
              href="/contact?subject=GetStarted"
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200"
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
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-razorblue" />
                  <span className="font-poppins font-bold text-gray-900 text-lg">RazorGuard</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 flex flex-col gap-1.5 px-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      pathname === link.href
                        ? "bg-blue-50 text-razorblue font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="px-6 pb-8 flex flex-col gap-3 border-t border-gray-100 pt-4">
                <button 
                  onClick={() => { setMobileOpen(false); setSignInOpen(true); }} 
                  className="btn-secondary text-center py-3 text-sm flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Sign in
                </button>
                <Link href="/contact?subject=GetStarted" onClick={() => setMobileOpen(false)} className="btn-primary text-center py-3 text-sm">
                  Get Started Free
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
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setSignInOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 z-10 overflow-hidden"
            >
              <button
                onClick={() => setSignInOpen(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-razorblue mb-2 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-poppins text-gray-900">Sign in to RazorGuard</h3>
                <p className="text-xs text-gray-500">Access your merchant duplicate detection dashboard</p>
              </div>

              {loginSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-emerald-600 gap-3">
                  <CheckCircle2 className="w-12 h-12 animate-bounce" />
                  <span className="font-bold text-base text-gray-900 font-poppins">Authenticated Successfully!</span>
                  <p className="text-xs text-gray-500">Redirecting to live merchant portal...</p>
                </div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Merchant Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="merchant@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm input-focus"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your merchant email."); }} className="text-xs text-razorblue hover:underline">Forgot?</a>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm input-focus"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary py-3.5 text-sm mt-2 w-full flex justify-center items-center gap-2">
                    Sign In to Console
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative my-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                    <span className="relative bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Or continue with</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setLoginSuccess(true); setTimeout(() => { setLoginSuccess(false); setSignInOpen(false); }, 1500); }}
                    className="w-full py-3 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 h-4 rounded bg-razorblue text-white flex items-center justify-center font-bold text-[9px]">R</div>
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
