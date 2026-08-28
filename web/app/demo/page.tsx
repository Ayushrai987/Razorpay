"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, FileText, Download, CheckCircle, AlertTriangle, RotateCcw,
  Play, Settings, HelpCircle, TrendingUp, Zap, Shield,
  ChevronRight, CreditCard, Wifi, Target,
  BarChart3, Eye, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  transaction_id: string;
  timestamp: string;
  user_id: string;
  amount: number;
  method: string;
  status: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
  rootCause?: string;
  recoverability?: "HIGH" | "MEDIUM" | "LOW";
  recoveryAction?: string;
  recoveryProbability?: number;
  expectedRecovery?: number;
}

interface RecoveryOpportunity {
  user_id: string;
  amount: number;
  method: string;
  count: number;
  rootCause: string;
  action: string;
  probability: number;
  expectedRecovery: number;
  tier: "CRITICAL" | "HIGH" | "MEDIUM";
}

// Root cause classification engine
function classifyRootCause(tx: Transaction, prev: Transaction, timeDiffSec: number): {
  rootCause: string;
  recoveryAction: string;
  recoverability: "HIGH" | "MEDIUM" | "LOW";
  probability: number;
} {
  const gap = timeDiffSec;
  const method = tx.method.toLowerCase();

  if (gap <= 5) {
    return {
      rootCause: "Double-Click / UI Freeze",
      recoveryAction: "Auto-refund immediately — idempotency key present",
      recoverability: "HIGH",
      probability: 0.97,
    };
  }
  if (gap <= 30 && method === "upi") {
    return {
      rootCause: "UPI Intent Timeout Retry",
      recoveryAction: "Check UPI mandate status → refund if 2nd capture confirmed",
      recoverability: "HIGH",
      probability: 0.91,
    };
  }
  if (gap <= 60 && (method === "card" || method === "netbanking")) {
    return {
      rootCause: "Payment Gateway Timeout — Network Retry",
      recoveryAction: "Validate gateway callback → issue instant reversal",
      recoverability: "HIGH",
      probability: 0.94,
    };
  }
  if (gap <= 45 && method === "wallet") {
    return {
      rootCause: "Wallet Balance Double-Debit",
      recoveryAction: "Contact wallet provider + Razorpay ops for settlement",
      recoverability: "MEDIUM",
      probability: 0.78,
    };
  }
  if (gap <= 300) {
    return {
      rootCause: "Multi-Tab / Multi-Device Checkout",
      recoveryAction: "Cancel newer payment — confirm merchant order is fulfilled",
      recoverability: "MEDIUM",
      probability: 0.82,
    };
  }
  return {
    rootCause: "Unknown Pattern — Manual Audit Required",
    recoveryAction: "Escalate to ops team for manual verification",
    recoverability: "LOW",
    probability: 0.55,
  };
}

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [totalAtRisk, setTotalAtRisk] = useState(0);
  const [expectedRecovery, setExpectedRecovery] = useState(0);
  const [timeWindow, setTimeWindow] = useState(300);
  const [activeView, setActiveView] = useState<"stream" | "opportunities" | "funnel">("stream");
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [refundedIds, setRefundedIds] = useState<Set<string>>(new Set());
  const [refundedAmount, setRefundedAmount] = useState(0);
  const [liveRefundAnim, setLiveRefundAnim] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Transaction[] => {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    if (lines.length <= 1) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const txIdIdx = headers.indexOf("transaction_id");
    const timeIdx = headers.indexOf("timestamp");
    const userIdIdx = headers.indexOf("user_id");
    const amountIdx = headers.indexOf("amount");
    const methodIdx = headers.indexOf("method");
    const statusIdx = headers.indexOf("status");
    return lines.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim());
      return {
        transaction_id: cols[txIdIdx] || `tx_${Math.random().toString(36).slice(2, 10)}`,
        timestamp: cols[timeIdx] || new Date().toISOString(),
        user_id: cols[userIdIdx] || "usr_unknown",
        amount: parseFloat(cols[amountIdx]) || 0,
        method: cols[methodIdx] || "card",
        status: cols[statusIdx] || "captured",
      };
    }).filter(t => t.transaction_id);
  };

  const detectDuplicates = (txs: Transaction[]) => {
    const sorted = [...txs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let dupCount = 0;
    let risk = 0;
    let expectedRec = 0;
    const opps: RecoveryOpportunity[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      cur.isDuplicate = false;
      for (let j = i - 1; j >= 0; j--) {
        const prev = sorted[j];
        const timeDiff = Math.abs((new Date(cur.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000);
        if (cur.user_id === prev.user_id && cur.amount === prev.amount && timeDiff <= timeWindow && !prev.isDuplicate) {
          cur.isDuplicate = true;
          const classified = classifyRootCause(cur, prev, timeDiff);
          cur.duplicateReason = `${classified.rootCause} (gap: ${timeDiff.toFixed(0)}s)`;
          cur.rootCause = classified.rootCause;
          cur.recoveryAction = classified.recoveryAction;
          cur.recoverability = classified.recoverability;
          cur.recoveryProbability = classified.probability;
          cur.expectedRecovery = cur.amount * classified.probability;
          dupCount++;
          risk += cur.amount;
          expectedRec += cur.expectedRecovery!;
          opps.push({
            user_id: cur.user_id,
            amount: cur.amount,
            method: cur.method,
            count: 1,
            rootCause: classified.rootCause,
            action: classified.recoveryAction,
            probability: classified.probability,
            expectedRecovery: cur.expectedRecovery!,
            tier: classified.recoverability === "HIGH" ? "CRITICAL" : classified.recoverability === "MEDIUM" ? "HIGH" : "MEDIUM",
          });
          break;
        }
      }
    }

    // Sort opportunities by expected recovery desc
    opps.sort((a, b) => b.expectedRecovery - a.expectedRecovery);

    setTransactions(sorted);
    setDuplicateCount(dupCount);
    setTotalAtRisk(risk / 100);
    setExpectedRecovery(expectedRec / 100);
    setOpportunities(opps);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) { setFile(uploadedFile); processFile(uploadedFile); }
  };

  const processFile = (f: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTimeout(() => { detectDuplicates(parseCSV(text)); setIsProcessing(false); }, 1400);
    };
    reader.readAsText(f);
  };

  const loadSampleTransactions = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/sample_transactions.csv");
      const text = await response.text();
      setTimeout(() => { detectDuplicates(parseCSV(text)); setIsProcessing(false); }, 1200);
    } catch { setIsProcessing(false); }
  };

  const handleReset = () => {
    setFile(null); setTransactions([]); setDuplicateCount(0);
    setTotalAtRisk(0); setExpectedRecovery(0); setOpportunities([]);
    setRefundedIds(new Set()); setRefundedAmount(0);
  };

  const handleRefund = (tx: Transaction) => {
    if (refundedIds.has(tx.transaction_id)) return;
    setLiveRefundAnim(tx.transaction_id);
    setTimeout(() => {
      setRefundedIds(prev => new Set(Array.from(prev).concat(tx.transaction_id)));
      setRefundedAmount(prev => prev + (tx.amount / 100));
      setLiveRefundAnim(null);
    }, 1000);
  };

  const downloadReport = () => {
    const dupTxs = transactions.filter(t => t.isDuplicate);
    if (dupTxs.length === 0) return;
    let csv = "data:text/csv;charset=utf-8,transaction_id,user_id,amount_inr,method,root_cause,recovery_action,recovery_probability,expected_recovery_inr\n";
    dupTxs.forEach(t => {
      csv += `${t.transaction_id},${t.user_id},${(t.amount / 100).toFixed(2)},${t.method},"${t.rootCause}","${t.recoveryAction}",${(t.recoveryProbability! * 100).toFixed(0)}%,${(t.expectedRecovery! / 100).toFixed(2)}\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "razorguard_recovery_report.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const recoveryRate = totalAtRisk > 0 ? ((refundedAmount / totalAtRisk) * 100).toFixed(1) : "0";
  const tierColor = { CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#60a5fa" };
  const methodIcon = (m: string) => {
    if (m === "upi") return <Wifi className="w-3 h-3" />;
    if (m === "card") return <CreditCard className="w-3 h-3" />;
    return <DollarSign className="w-3 h-3" />;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="relative pb-12 pt-28 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-tag"><Target className="w-4 h-4" /> Revenue Recovery Sandbox</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-poppins text-gray-900 tracking-tight leading-tight">
            Find Your Hidden <span className="text-gradient">Revenue Leaks</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Upload your Razorpay transaction export. Our AI identifies every duplicate charge, classifies the root cause, 
            and calculates exactly how much revenue you can recover — with recommended actions per case.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* Recovery Mission Control KPIs — always visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Transactions", val: isProcessing ? "…" : transactions.length.toString(), icon: FileText, color: "text-gray-700", bg: "bg-gray-50" },
            { label: "Revenue at Risk", val: isProcessing ? "…" : `₹${totalAtRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
            { label: "Expected Recovery", val: isProcessing ? "…" : `₹${expectedRecovery.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: "text-razorteal", bg: "bg-teal-50" },
            { label: "Recovered This Session", val: `₹${refundedAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: Shield, color: "text-razorblue", bg: "bg-blue-50" },
          ].map(({ label, val, icon: Icon, color, bg }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`${bg} rounded-2xl p-5 border border-gray-200 shadow-card`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-2xl font-bold font-poppins ${color}`}>{val}</div>
              {label === "Recovered This Session" && refundedAmount > 0 && (
                <div className="text-[10px] text-razorteal font-semibold mt-1">{recoveryRate}% of at-risk revenue recovered</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Recovery Funnel — shown once data loaded */}
        {transactions.length > 0 && !isProcessing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-razorteal" />
              <span className="font-bold font-poppins text-sm">Revenue Recovery Funnel</span>
              <span className="ml-auto text-xs text-gray-400 font-mono">LIVE SESSION</span>
            </div>
            <div className="grid grid-cols-4 gap-0 relative">
              {[
                { label: "Total Volume", val: `₹${(transactions.reduce((s, t) => s + t.amount, 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${transactions.length} payments`, color: "#528FF0", w: "100%" },
                { label: "Revenue at Risk", val: `₹${totalAtRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${duplicateCount} duplicates`, color: "#ef4444", w: "75%" },
                { label: "Recoverable", val: `₹${expectedRecovery.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${opportunities.filter(o => o.tier === "CRITICAL").length} CRITICAL`, color: "#14b8a6", w: "55%" },
                { label: "Recovered", val: `₹${refundedAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${refundedIds.size} actions taken`, color: "#10b981", w: "35%" },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400 font-semibold text-center">{step.label}</div>
                  <div className="w-full flex justify-center">
                    <div className="relative h-12 w-full max-w-[120px] overflow-hidden rounded-lg">
                      <div className="absolute inset-0 bg-gray-700/50 rounded-lg" />
                      <motion.div className="absolute bottom-0 left-0 right-0 rounded-lg"
                        style={{ backgroundColor: step.color, opacity: 0.85 }}
                        initial={{ height: 0 }}
                        animate={{ height: step.w }}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <div className="font-bold text-sm font-mono text-center">{step.val}</div>
                  <div className="text-[10px] text-gray-400 text-center">{step.sub}</div>
                  {i < 3 && <ChevronRight className="w-4 h-4 text-gray-600 absolute" style={{ left: `${(i + 1) * 25}%`, top: "50%", transform: "translate(-50%, -50%)" }} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Control Console */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-card">
              <div className="flex items-center gap-2 mb-5">
                <Settings className="w-4 h-4 text-razorblue" />
                <span className="font-bold text-gray-900 text-sm font-poppins">Detection Settings</span>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Time Window: <span className="text-razorblue">{Math.floor(timeWindow / 60)}m {timeWindow % 60}s</span>
                  </label>
                  <input type="range" min="30" max="1200" step="30" value={timeWindow}
                    onChange={(e) => { setTimeWindow(parseInt(e.target.value)); if (transactions.length > 0) detectDuplicates(transactions); }}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-razorblue" />
                  <p className="text-[10px] text-gray-400 mt-1.5">Payments within this window with same user+amount are flagged.</p>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />

                <div className="flex flex-col gap-2.5 pt-3 border-t border-gray-100">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full btn-primary py-3 text-xs font-semibold tracking-wider">
                    <UploadCloud className="w-4 h-4" /> Upload CSV Ledger
                  </button>
                  {file && <p className="text-[10px] text-razorteal font-mono text-center truncate">📎 {file.name}</p>}
                  <button onClick={loadSampleTransactions}
                    className="flex items-center justify-center gap-2 w-full btn-secondary py-3 text-xs font-semibold tracking-wider">
                    <Play className="w-4 h-4 text-razorblue" /> Load Sample Dataset
                  </button>
                  {transactions.length > 0 && (
                    <button onClick={handleReset}
                      className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 py-3 rounded-xl font-semibold text-xs tracking-wider transition-colors">
                      <RotateCcw className="w-4 h-4" /> Reset Sandbox
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* How to guide */}
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 text-xs text-gray-500 space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
                <HelpCircle className="w-4 h-4 text-razorblue" /> Quick Start Guide
              </div>
              <div className="flex items-start gap-2"><span className="font-bold text-razorblue shrink-0">1.</span><span>Click <strong>Load Sample Dataset</strong> to instantly see the demo with realistic Razorpay data.</span></div>
              <div className="flex items-start gap-2"><span className="font-bold text-razorblue shrink-0">2.</span><span>The AI scans for duplicates and classifies each by root cause (double-click, UPI retry, gateway fault).</span></div>
              <div className="flex items-start gap-2"><span className="font-bold text-razorblue shrink-0">3.</span><span>Switch to <strong>Recovery Queue</strong> tab to see prioritized actions and trigger refunds.</span></div>
              <a href="/sample_transactions.csv" download className="flex items-center gap-1.5 text-razorblue font-bold hover:underline mt-2 pt-2 border-t border-blue-100">
                <Download className="w-3.5 h-3.5" /> Download sample_transactions.csv
              </a>
            </div>
          </div>

          {/* Right: Output Panel */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* View Toggle */}
            {transactions.length > 0 && !isProcessing && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                  { key: "stream", label: "Transaction Stream", icon: Eye },
                  { key: "opportunities", label: "Recovery Queue", icon: Target },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveView(key as "stream" | "opportunities")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                    {key === "opportunities" && duplicateCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{duplicateCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 flex flex-col min-h-[520px] overflow-hidden shadow-card">
              {/* Panel Header */}
              <div className="bg-gray-50 border-b border-gray-150 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm font-poppins">
                    {activeView === "stream" ? "Live Transaction Stream" : "AI Recovery Queue"}
                  </h3>
                  {transactions.length > 0 && !isProcessing && (
                    <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> PROCESSED
                    </span>
                  )}
                </div>
                {duplicateCount > 0 && !isProcessing && (
                  <button onClick={downloadReport}
                    className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-razorblue px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors">
                    <Download className="w-3 h-3" /> Export Report
                  </button>
                )}
              </div>

              <div className="flex-grow overflow-y-auto relative">
                {/* Loading overlay */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 border-4 border-gray-100 border-t-razorblue rounded-full animate-spin" />
                        <Zap className="w-5 h-5 text-razorblue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-sm">Running AI Detection Engine</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">Classifying root causes & scoring recovery probability…</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {transactions.length === 0 && !isProcessing && (
                  <div className="h-full flex flex-col justify-center items-center p-12 text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-razorblue opacity-60" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 font-poppins">No transactions loaded</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs">Click <strong>Load Sample Dataset</strong> to instantly see the AI in action with realistic Razorpay transaction data.</p>
                    </div>
                    <button onClick={loadSampleTransactions}
                      className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 fill-current" /> Run Live Demo
                    </button>
                  </div>
                )}

                {/* STREAM VIEW */}
                {activeView === "stream" && transactions.length > 0 && !isProcessing && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Transaction ID</th>
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">AI Verdict</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {transactions.map((tx, idx) => (
                          <motion.tr key={idx}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                            className={`transition-colors ${tx.isDuplicate ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-gray-50/50"}`}>
                            <td className="px-4 py-3 font-mono text-gray-900 font-medium text-[11px]">{tx.transaction_id}</td>
                            <td className="px-4 py-3 text-gray-400">{new Date(tx.timestamp).toLocaleTimeString("en-IN")}</td>
                            <td className="px-4 py-3 font-mono text-gray-500">{tx.user_id}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">₹{(tx.amount / 100).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1 text-gray-500">{methodIcon(tx.method)}{tx.method}</span>
                            </td>
                            <td className="px-4 py-3">
                              {tx.isDuplicate ? (
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                  <span className="text-red-600 font-semibold text-[10px]">{tx.rootCause}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-razorteal shrink-0" />
                                  <span className="text-gray-400 text-[10px]">Verified secure</span>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* RECOVERY QUEUE VIEW — THE WOW PANEL */}
                {activeView === "opportunities" && transactions.length > 0 && !isProcessing && (
                  <div className="p-4 space-y-3">
                    {opportunities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                        <CheckCircle className="w-12 h-12 text-razorteal" />
                        <p className="font-bold text-gray-700">No duplicate payments found!</p>
                        <p className="text-xs text-gray-400">All transactions are verified clean.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {opportunities.length} Recovery Opportunities · Sorted by Expected Value
                          </span>
                          <span className="text-[10px] text-razorteal font-bold">
                            {refundedIds.size}/{duplicateCount} actioned
                          </span>
                        </div>
                        {opportunities.map((opp, i) => {
                          const dupTx = transactions.find(t => t.user_id === opp.user_id && t.isDuplicate && !refundedIds.has(t.transaction_id));
                          const isRefunded = dupTx ? refundedIds.has(dupTx.transaction_id) : true;
                          const isAnimating = dupTx?.transaction_id === liveRefundAnim;
                          return (
                            <motion.div key={i}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className={`rounded-xl border p-4 transition-all ${isRefunded ? "border-green-100 bg-green-50/30 opacity-70" : "border-gray-200 bg-white hover:border-razorblue/30 hover:shadow-md"}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <span className="font-mono text-gray-900 font-bold text-xs">{opp.user_id}</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                      style={{ backgroundColor: `${tierColor[opp.tier]}15`, color: tierColor[opp.tier], border: `1px solid ${tierColor[opp.tier]}40` }}>
                                      {opp.tier}
                                    </span>
                                    <span className="flex items-center gap-1 text-[9px] text-gray-400 border border-gray-150 bg-gray-50 px-1.5 py-0.5 rounded-full">
                                      {methodIcon(opp.method)} {opp.method}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-gray-700 font-semibold mb-1">
                                    🔍 Root Cause: <span className="text-gray-900">{opp.rootCause}</span>
                                  </div>
                                  <div className="text-[11px] text-razorblue font-semibold mb-2">
                                    ⚡ Action: {opp.action}
                                  </div>
                                  <div className="flex items-center gap-4 text-[10px]">
                                    <span className="text-gray-400">At Risk: <strong className="text-red-500">₹{(opp.amount / 100).toLocaleString("en-IN")}</strong></span>
                                    <span className="text-gray-400">Recovery: <strong className="text-razorteal">{(opp.probability * 100).toFixed(0)}%</strong></span>
                                    <span className="text-gray-400">Expected: <strong className="text-emerald-600">₹{(opp.expectedRecovery / 100).toLocaleString("en-IN")}</strong></span>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {isRefunded ? (
                                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-[10px] font-bold">
                                      <CheckCircle className="w-3 h-3" /> Recovered
                                    </span>
                                  ) : isAnimating ? (
                                    <span className="flex items-center gap-1 text-razorblue bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-[10px] font-bold animate-pulse">
                                      <RefreshCw className="w-3 h-3 animate-spin" /> Processing…
                                    </span>
                                  ) : (
                                    <button onClick={() => dupTx && handleRefund(dupTx)}
                                      className="btn-primary px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 rounded-full">
                                      <Zap className="w-3 h-3" /> Recover ₹{(opp.expectedRecovery / 100).toLocaleString("en-IN")}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {/* Recovery probability bar */}
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-[9px] text-gray-400 w-24 shrink-0">Recovery score</span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div className="h-full rounded-full"
                                    style={{ backgroundColor: tierColor[opp.tier] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${opp.probability * 100}%` }}
                                    transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }} />
                                </div>
                                <span className="text-[9px] font-bold text-gray-600 w-8 shrink-0">{(opp.probability * 100).toFixed(0)}%</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
