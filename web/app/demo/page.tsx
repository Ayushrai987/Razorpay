"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, FileText, Download, CheckCircle, AlertTriangle, RotateCcw,
  Play, Settings, HelpCircle, TrendingUp, Zap, Shield,
  ChevronRight, CreditCard, Wifi,
  BarChart3, Eye, RefreshCw, DollarSign
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
    <div className="bg-[#080711] min-h-screen text-[#f8fafc]">
      {/* Header */}
      <section className="relative pb-12 pt-28 overflow-hidden bg-[#0c0a1a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col gap-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-tag">Interactive Prototype Evaluation</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold font-headings text-white tracking-tight leading-tight">
            RazorGuard Prototype <span className="text-gradient">Sandbox Console</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[#cbd5e1] text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Upload a sample transaction CSV or load our benchmark dataset to test pattern matching, duplicate root cause classification, and automated refund API call generation.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Transactions", val: isProcessing ? "…" : transactions.length.toString(), icon: FileText, color: "text-[#cbd5e1]", bg: "bg-[#0f0c22]" },
            { label: "Revenue at Risk", val: isProcessing ? "…" : `₹${totalAtRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: AlertTriangle, color: "text-red-400", bg: "bg-[#0f0c22]" },
            { label: "Expected Reversals", val: isProcessing ? "…" : `₹${expectedRecovery.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: "text-[#2dd4bf]", bg: "bg-[#0f0c22]" },
            { label: "Actioned Reversals", val: `₹${refundedAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: Shield, color: "text-[#10b981]", bg: "bg-[#0f0c22]" },
          ].map(({ label, val, icon: Icon, color, bg }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`${bg} rounded-2xl p-5 border border-white/10 shadow-2xl`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-2xl font-bold font-headings ${color}`}>{val}</div>
              {label === "Actioned Reversals" && refundedAmount > 0 && (
                <div className="text-[10px] text-[#10b981] font-semibold mt-1">{recoveryRate}% of flagged value actioned</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Funnel */}
        {transactions.length > 0 && !isProcessing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f0c22] rounded-2xl p-6 text-white border border-white/10 font-mono">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#2dd4bf]" />
              <h2 className="font-bold font-headings text-sm">Sandbox Event Funnel Analysis</h2>
              <span className="ml-auto text-xs text-[#94a3b8]">EVALUATION SESSION</span>
            </div>
            <div className="grid grid-cols-4 gap-0 relative text-center">
              {[
                { label: "Total Ingested", val: `₹${(transactions.reduce((s, t) => s + t.amount, 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${transactions.length} events`, color: "#4f46e5", w: "100%" },
                { label: "Flagged Risk", val: `₹${totalAtRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${duplicateCount} dupes`, color: "#ef4444", w: "75%" },
                { label: "Expected Value", val: `₹${expectedRecovery.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${opportunities.filter(o => o.tier === "CRITICAL").length} high priority`, color: "#2dd4bf", w: "55%" },
                { label: "Reversed Value", val: `₹${refundedAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${refundedIds.size} calls`, color: "#10b981", w: "35%" },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="text-xs text-[#94a3b8] font-semibold">{step.label}</div>
                  <div className="w-full flex justify-center">
                    <div className="relative h-10 w-full max-w-[120px] overflow-hidden rounded-lg">
                      <div className="absolute inset-0 bg-white/5 rounded-lg" />
                      <motion.div className="absolute bottom-0 left-0 right-0 rounded-lg"
                        style={{ backgroundColor: step.color, opacity: 0.85 }}
                        initial={{ height: 0 }}
                        animate={{ height: step.w }}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <div className="font-bold text-sm">{step.val}</div>
                  <div className="text-[10px] text-[#94a3b8]">{step.sub}</div>
                  {i < 3 && <ChevronRight className="w-4 h-4 text-gray-500 absolute" style={{ left: `${(i + 1) * 25}%`, top: "50%", transform: "translate(-50%, -50%)" }} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-[#0f0c22] rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-5">
                <Settings className="w-4 h-4 text-[#2dd4bf]" />
                <h2 className="font-bold text-white text-sm font-headings">Detection Configuration</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="time-window-slider" className="text-[10px] text-[#cbd5e1] font-bold uppercase tracking-wider block mb-2">
                    Lookback Delta Window: <span className="text-[#2dd4bf]">{Math.floor(timeWindow / 60)}m {timeWindow % 60}s</span>
                  </label>
                  <input id="time-window-slider" type="range" min="30" max="1200" step="30" value={timeWindow}
                    onChange={(e) => { setTimeWindow(parseInt(e.target.value)); if (transactions.length > 0) detectDuplicates(transactions); }}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2dd4bf]" />
                  <p className="text-[10px] text-[#94a3b8] mt-1.5">Identical user & amount pairs within this window are flagged as duplicate risks.</p>
                </div>

                <input type="file" id="csv-file-input" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" aria-label="Upload CSV File" />

                <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full btn-primary py-3 text-xs font-semibold tracking-wider">
                    <UploadCloud className="w-4 h-4" /> Upload CSV Ledger
                  </button>
                  {file && <p className="text-[10px] text-[#2dd4bf] font-mono text-center truncate">📎 {file.name}</p>}
                  <button onClick={loadSampleTransactions}
                    className="flex items-center justify-center gap-2 w-full btn-secondary py-3 text-xs font-semibold tracking-wider">
                    <Play className="w-4 h-4 text-[#2dd4bf]" /> Load Sample Dataset
                  </button>
                  {transactions.length > 0 && (
                    <button onClick={handleReset}
                      className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-xl font-semibold text-xs tracking-wider transition-colors">
                      <RotateCcw className="w-4 h-4" /> Reset Sandbox
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick guide */}
            <div className="bg-[#0f0c22] rounded-2xl p-5 border border-white/10 text-xs text-[#cbd5e1] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
                <HelpCircle className="w-4 h-4 text-[#2dd4bf]" /> Evaluation Instructions
              </div>
              <div className="flex items-start gap-2"><span className="font-bold text-[#2dd4bf] shrink-0">1.</span><span>Click <strong>Load Sample Dataset</strong> to run the pattern classifier against sample webhooks.</span></div>
              <div className="flex items-start gap-2"><span className="font-bold text-[#2dd4bf] shrink-0">2.</span><span>The engine classifies double-clicks, UPI intent timeouts, and gateway retries.</span></div>
              <div className="flex items-start gap-2"><span className="font-bold text-[#2dd4bf] shrink-0">3.</span><span>Switch to <strong>Recovery Queue</strong> to test automated Razorpay refund dispatches.</span></div>
              <a href="/sample_transactions.csv" download className="flex items-center gap-1.5 text-[#2dd4bf] font-bold hover:underline mt-2 pt-2 border-t border-white/10 font-mono">
                <Download className="w-3.5 h-3.5" /> Download sample_transactions.csv
              </a>
            </div>
          </div>

          {/* Output Table Panel */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {transactions.length > 0 && !isProcessing && (
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/10">
                {[
                  { key: "stream", label: "Transaction Event Stream", icon: Eye },
                  { key: "opportunities", label: "Recovery Queue", icon: Shield },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveView(key as "stream" | "opportunities")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === key ? "bg-white/10 text-white shadow-sm" : "text-[#94a3b8] hover:text-white"}`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                    {key === "opportunities" && duplicateCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{duplicateCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-[#0f0c22] rounded-2xl border border-white/10 flex flex-col min-h-[520px] overflow-hidden shadow-2xl">
              <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm font-headings">
                    {activeView === "stream" ? "Incoming Event Log" : "Prioritized Action Queue"}
                  </h3>
                  {transactions.length > 0 && !isProcessing && (
                    <span className="flex items-center gap-1 text-[#10b981] text-[10px] font-bold bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-0.5 rounded-full font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /> CLASSIFIED
                    </span>
                  )}
                </div>
                {duplicateCount > 0 && !isProcessing && (
                  <button onClick={downloadReport}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[#2dd4bf] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors font-mono">
                    <Download className="w-3 h-3" /> Export CSV Report
                  </button>
                )}
              </div>

              <div className="flex-grow overflow-y-auto relative">
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#080711]/90 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-[#2dd4bf] rounded-full animate-spin" />
                      </div>
                      <div className="text-center font-mono">
                        <p className="font-bold text-white text-sm">Evaluating Webhook Fingerprints</p>
                        <p className="text-xs text-[#94a3b8] mt-0.5">Scoring risk signals and matching user pairs…</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {transactions.length === 0 && !isProcessing && (
                  <div className="h-full flex flex-col justify-center items-center p-12 text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2dd4bf]">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white font-headings">No evaluation dataset loaded</h3>
                      <p className="text-xs text-[#cbd5e1] mt-1 max-w-xs">Load sample transactions to inspect duplicate signal matching.</p>
                    </div>
                    <button onClick={loadSampleTransactions}
                      className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 fill-current" /> Load Sample Dataset
                    </button>
                  </div>
                )}

                {activeView === "stream" && transactions.length > 0 && !isProcessing && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono" aria-label="Transaction Event Table">
                      <thead className="bg-white/5 border-b border-white/10 text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">
                        <tr>
                          <th scope="col" className="px-4 py-3">Transaction ID</th>
                          <th scope="col" className="px-4 py-3">Time</th>
                          <th scope="col" className="px-4 py-3">User</th>
                          <th scope="col" className="px-4 py-3">Amount</th>
                          <th scope="col" className="px-4 py-3">Method</th>
                          <th scope="col" className="px-4 py-3">Verdict</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {transactions.map((tx, idx) => (
                          <tr key={idx} className={`transition-colors ${tx.isDuplicate ? "bg-red-500/10 hover:bg-red-500/15" : "hover:bg-white/5"}`}>
                            <td className="px-4 py-3 text-white font-bold">{tx.transaction_id}</td>
                            <td className="px-4 py-3 text-[#94a3b8]">{new Date(tx.timestamp).toLocaleTimeString("en-IN")}</td>
                            <td className="px-4 py-3 text-[#cbd5e1]">{tx.user_id}</td>
                            <td className="px-4 py-3 font-bold text-white">₹{(tx.amount / 100).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1 text-[#cbd5e1]">{methodIcon(tx.method)}{tx.method}</span>
                            </td>
                            <td className="px-4 py-3">
                              {tx.isDuplicate ? (
                                <div className="flex items-center gap-1.5 text-red-400">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span className="font-semibold text-[10px]">{tx.rootCause}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-[#10b981]">
                                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span className="text-[10px]">Passed</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeView === "opportunities" && transactions.length > 0 && !isProcessing && (
                  <div className="p-4 space-y-3 font-mono">
                    {opportunities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                        <CheckCircle className="w-10 h-10 text-[#10b981]" />
                        <p className="font-bold text-white font-headings">No duplicate risks found</p>
                        <p className="text-xs text-[#cbd5e1]">All transactions verified clean.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2 px-1 text-[10px]">
                          <span className="text-[#94a3b8] font-bold uppercase tracking-wider">
                            {opportunities.length} Flagged Incidents
                          </span>
                          <span className="text-[#2dd4bf] font-bold">
                            {refundedIds.size}/{duplicateCount} actioned
                          </span>
                        </div>
                        {opportunities.map((opp, i) => {
                          const dupTx = transactions.find(t => t.user_id === opp.user_id && t.isDuplicate && !refundedIds.has(t.transaction_id));
                          const isRefunded = dupTx ? refundedIds.has(dupTx.transaction_id) : true;
                          const isAnimating = dupTx?.transaction_id === liveRefundAnim;
                          return (
                            <div key={i}
                              className={`rounded-xl border p-4 transition-all ${isRefunded ? "border-[#10b981]/20 bg-[#10b981]/5" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <span className="text-white font-bold text-xs">{opp.user_id}</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono"
                                      style={{ backgroundColor: `${tierColor[opp.tier]}20`, color: tierColor[opp.tier], border: `1px solid ${tierColor[opp.tier]}40` }}>
                                      {opp.tier}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#cbd5e1] mb-1">
                                    Pattern: <strong className="text-white">{opp.rootCause}</strong>
                                  </div>
                                  <div className="text-[11px] text-[#2dd4bf] mb-2">
                                    Action: {opp.action}
                                  </div>
                                  <div className="flex items-center gap-4 text-[10px]">
                                    <span className="text-[#94a3b8]">At Risk: <strong className="text-red-400">₹{(opp.amount / 100).toLocaleString("en-IN")}</strong></span>
                                    <span className="text-[#94a3b8]">Match Score: <strong className="text-[#10b981]">{(opp.probability * 100).toFixed(0)}%</strong></span>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {isRefunded ? (
                                    <span className="flex items-center gap-1 text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-full text-[10px] font-bold">
                                      <CheckCircle className="w-3 h-3" /> Reversal Complete
                                    </span>
                                  ) : isAnimating ? (
                                    <span className="flex items-center gap-1 text-[#2dd4bf] bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 px-3 py-1.5 rounded-full text-[10px] font-bold animate-pulse">
                                      <RefreshCw className="w-3 h-3 animate-spin" /> Calling API…
                                    </span>
                                  ) : (
                                    <button onClick={() => dupTx && handleRefund(dupTx)}
                                      className="btn-primary px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 rounded-full">
                                      <Zap className="w-3 h-3" /> Trigger Reversal API
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
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
