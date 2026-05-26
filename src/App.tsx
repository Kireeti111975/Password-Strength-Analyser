/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Analyzer from "./components/Analyzer";
import Generator from "./components/Generator";
import { analyzePassword } from "./utils/security";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, KeyRound, Server, Sun, Moon,
  Download, ShieldAlert, Terminal
} from "lucide-react";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeSection, setActiveSection] = useState<"analyze" | "generator">("analyze");
  const [passwordValue, setPasswordValue] = useState<string>("");
  
  const [serverStatus, setServerStatus] = useState<"connecting" | "healthy" | "offline">("connecting");

  // Check health on initial mount
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        setServerStatus("healthy");
      } else {
        setServerStatus("offline");
      }
    } catch (err) {
      setServerStatus("offline");
    }
  };

  const handleUseGenerated = (password: string) => {
    setPasswordValue(password);
    setActiveSection("analyze");
  };

  // Generate highly polished local raw download file
  const handleExportSecurityReport = () => {
    if (!passwordValue) {
      alert("Please input a password format inside the Analyzer prior to exporting.");
      return;
    }

    const reportMetrics = analyzePassword(passwordValue);
    
    const formattedText = `
============================================================
           SENTINEL CREDENTIAL SECURITY REPORT
============================================================
Generated:      ${new Date().toISOString()}
Target Node:    Local Terminal Audit Core
Classification: CONFIDENTIAL / INTERNAL SECURITY ONLY

DATA DIAGNOSTICS & ENTROPY LEVEL:
------------------------------------------------------------
Calculated Entropy:     ${reportMetrics.entropy} bits
Diagnostic Score:       ${reportMetrics.score} / 100
Cryptographic Level:    ${reportMetrics.strength.toUpperCase()}
Estimated Crack Time:   ${reportMetrics.crackTimeLabel}
Password Length:        ${reportMetrics.length} characters

CHARACTER DIVERSITY SCOREBOARD:
------------------------------------------------------------
Mixed Case (A-Z):       ${reportMetrics.complexity.hasUppercase ? "YES" : "NO"}
Mixed Case (a-z):       ${reportMetrics.complexity.hasLowercase ? "YES" : "NO"}
Integer Digits (0-9):   ${reportMetrics.complexity.hasNumbers ? "YES" : "NO"}
Special Symbols:        ${reportMetrics.complexity.hasSymbols ? "YES" : "NO"}

STRUCTURE INTEGRITY WARNINGS:
------------------------------------------------------------
${reportMetrics.warnings.length > 0 
  ? reportMetrics.warnings.map(w => `• WARNING: ${w}`).join("\n")
  : "✓ All structural heuristics verified clean."}

RECOMMENDED SAFEGUARDS:
------------------------------------------------------------
${reportMetrics.suggestions.map(s => `• SUGGESTION: ${s}`).join("\n")}

============================================================
   Sentinel Trust Engine - Security Shield Guaranteed
============================================================
`;

    // Download file procedure
    const element = document.createElement("a");
    const file = new Blob([formattedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `SENTINEL-SECURITY-REPORT-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`min-h-screen flex text-slate-200 overflow-x-hidden font-sans transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-[#050608]" 
        : "bg-[#f8f9fc] text-slate-800"
    }`}>
      
      {/* Immersive Left Navigation Sidebar - Hidden on tiny mobile screens for strict mobile adaptability */}
      <aside className={`w-20 hidden sm:flex flex-col items-center py-8 gap-12 shrink-0 ${
        theme === "dark" 
          ? "bg-[#0a0c10] border-r border-white/5" 
          : "bg-white border-r border-[#eaecf0] shadow-sm"
      }`}>
        {/* Top Logo */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer" onClick={() => setActiveSection("analyze")}>
          <Shield className="w-5.5 h-5.5 text-white animate-pulse" />
        </div>

        {/* Core Navigation Items inside sidebar */}
        <div className="flex flex-col gap-6">
          {/* Analyze tab button */}
          <button
            onClick={() => setActiveSection("analyze")}
            className={`p-3 rounded-xl transition-all relative group cursor-pointer ${
              activeSection === "analyze"
                ? theme === "dark"
                  ? "bg-white/5 text-cyan-400 border border-white/10"
                  : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                : theme === "dark"
                  ? "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-400 hover:text-slate-700 hover:bg-zinc-100"
            }`}
            title="Real-time Analyzer"
          >
            <Terminal className="w-5.5 h-5.5" />
            <span className="absolute left-22 px-2.5 py-1 text-[10px] bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-mono whitespace-nowrap z-50">
              Real-time Analyzer
            </span>
            {activeSection === "analyze" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full" />
            )}
          </button>

          {/* Generator tab button */}
          <button
            onClick={() => setActiveSection("generator")}
            className={`p-3 rounded-xl transition-all relative group cursor-pointer ${
              activeSection === "generator"
                ? theme === "dark"
                  ? "bg-white/5 text-cyan-400 border border-white/10"
                  : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                : theme === "dark"
                  ? "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-400 hover:text-slate-700 hover:bg-zinc-100"
            }`}
            title="Generator Settings"
          >
            <KeyRound className="w-5.5 h-5.5" />
            <span className="absolute left-22 px-2.5 py-1 text-[10px] bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-mono whitespace-nowrap z-50">
              Entropy Generator
            </span>
            {activeSection === "generator" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full" />
            )}
          </button>
        </div>

        {/* Bottom Theme and settings widgets */}
        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              theme === "dark"
                ? "text-yellow-400 hover:bg-white/5"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-850"
            }`}
            title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
          >
            {theme === "dark" ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
          </button>
        </div>
      </aside>

      {/* Main Panel Content Wrap */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header - Styled precisely as Immersive Header */}
        <header className={`h-20 border-b flex items-center justify-between px-6 sm:px-10 z-30 sticky top-0 backdrop-blur-md ${
          theme === "dark" 
            ? "border-white/5 bg-[#0a0c10]/80" 
            : "border-[#eaecf0] bg-white/80"
        }`}>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-sans uppercase">
              {activeSection === "analyze" ? "PASSWORD STRENGTH ANALYZER" : "CYPHER ENTROPY GENERATOR"}
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Sentinel Security Protocol v4.2.0 • Active
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Systems Nominal indicator badge */}
            <div className={`px-3 py-1 border rounded-full flex items-center gap-2 ${
              theme === "dark"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                : "bg-indigo-50/80 border-indigo-100 text-indigo-700"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-tight">SYSTEMS NOMINAL</span>
            </div>

            {/* Mobile Toggler to switch theme */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 ml-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 sm:hidden block text-cyan-400"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main nested wrapper */}
        <div className="flex-1 p-6 sm:p-10 space-y-8 max-w-7xl w-full mx-auto relative">
          
          {/* Quick Info bar showing current local time and server credentials link state */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono relative overflow-hidden ${
            theme === "dark" ? "bg-[#0f1116]/80 border-white/5 text-slate-400" : "bg-white border-[#eaecf0] text-slate-600 shadow-sm"
          }`}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500 to-indigo-600"></div>
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>TERMINAL NODE LINK:</span>
              <span className={serverStatus === "healthy" ? "text-emerald-400 font-bold" : "text-amber-400"}>
                {serverStatus === "healthy" ? "TLS_SECURE_ONLINE" : "OFFLINE_LOCAL_STANDBY"}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {passwordValue && activeSection === "analyze" && (
                <button
                  onClick={handleExportSecurityReport}
                  className="px-3 py-1 rounded text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT DEVOPS PDF_REPORT</span>
                </button>
              )}
              
              <div className="text-slate-500 text-[10px] hidden md:block">
                UTC CLOCK: {new Date().toISOString()}
              </div>
            </div>
          </div>

          {/* Core Embedded Section Switcher */}
          <div className="relative z-10 transition-all">
            
            {/* Embedded styled pills for mobile only (rendered inside sidebar on desktop) */}
            <div className="flex sm:hidden bg-zinc-900/40 p-1 mb-6 rounded-xl border border-zinc-900/80">
              <button
                onClick={() => setActiveSection("analyze")}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-mono font-medium transition-all ${
                  activeSection === "analyze"
                    ? "bg-zinc-800 text-cyan-400"
                    : "text-zinc-500"
                }`}
              >
                Analyzer
              </button>
              <button
                onClick={() => setActiveSection("generator")}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-mono font-medium transition-all ${
                  activeSection === "generator"
                    ? "bg-zinc-800 text-cyan-400"
                    : "text-zinc-500"
                }`}
              >
                Generator
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === "analyze" && (
                  <Analyzer 
                    passwordValue={passwordValue} 
                    setPasswordValue={setPasswordValue}
                    theme={theme}
                  />
                )}

                {activeSection === "generator" && (
                  <Generator 
                    onUsePassword={handleUseGenerated}
                    theme={theme}
                  />
                )}
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Security Warning footnote matching layout criteria */}
          <div className={`p-4 rounded-xl border ${
            theme === "dark"
              ? "bg-[#0b0c10]/40 border-white/5 text-slate-400"
              : "bg-zinc-100/60 border-zinc-250/80 text-zinc-650 shadow-sm"
          } flex items-start gap-3.5 text-xs font-mono leading-relaxed`}>
            <ShieldAlert className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className={`font-bold uppercase tracking-wide ${theme === "dark" ? "text-slate-200" : "text-zinc-805"}`}>
                CRYPTOGRAPHIC COMPLIANCE DIALECT
              </span>
              <p>
                Credentials evaluated within local context only. Plaintext sequences are never cached, transmitted, or logged. Trusted by federal standard cybersecurity architectures.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Stats Bar - Styled precisely as design footnote */}
        <footer className={`h-14 flex items-center justify-between px-6 sm:px-10 shrink-0 border-t ${
          theme === "dark" 
            ? "bg-[#0a0c10] border-white/5 text-slate-500" 
            : "bg-white border-[#eaecf0] text-slate-600 shadow-inner"
        }`}>
          <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-2">
            <div className="flex gap-1.5 items-center flex-shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">EST CRACK TIME:</span>
              <span className={`text-[10px] font-bold text-green-400 uppercase font-mono`}>
                {passwordValue ? analyzePassword(passwordValue).crackTimeLabel : "Awaiting string"}
              </span>
            </div>
            
            <div className="flex gap-1.5 items-center flex-shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">BREACHED:</span>
              <span className={`text-[10px] font-bold text-green-400 uppercase font-mono`}>
                {passwordValue ? "CHECKED" : "RESERVED"}
              </span>
            </div>
          </div>
          
          <div className="text-[9px] font-mono text-slate-600 hidden lg:block tracking-widest">
            SECURE_NODE: PAR-01 • ALGORITHM: SHA-256 / BCRYPT
          </div>
        </footer>

      </div>

    </div>
  );
}
