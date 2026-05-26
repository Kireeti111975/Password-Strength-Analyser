/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sliders, Copy, Check, ShieldCheck, RefreshCw, KeyRound, ChevronRight } from "lucide-react";
import { generateStrongPassword } from "../utils/security";
import { motion, AnimatePresence } from "motion/react";

interface GeneratorProps {
  onUsePassword: (password: string) => void;
  theme: "dark" | "light";
}

export default function Generator({ onUsePassword, theme }: GeneratorProps) {
  const [length, setLength] = useState<number>(18);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Generate password initially and whenever options change
  useEffect(() => {
    handleGenerate();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const handleGenerate = () => {
    const generated = generateStrongPassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    });
    setPassword(generated);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy password to clipboard:", err);
    }
  };

  // Check the overall strength metrics for standard display output
  const calculateEstimateStrength = () => {
    if (length < 10) return { label: "Standard (Moderate)", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    if (length < 14) return { label: "High (Strong)", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    return { label: "Military (Very Strong)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const strengthMeta = calculateEstimateStrength();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border transition-all relative overflow-hidden ${
        theme === "dark" 
          ? "border-white/5 bg-[#0f1116]" 
          : "border-zinc-200 bg-white shadow-sm"
      } p-6 sm:p-8`}
    >
      {theme === "dark" && (
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-cyan-500 to-purple-600"></div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
        <div>
          <h2 className={`text-xl sm:text-2xl font-sans font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>
            Secure Entropy Generator
          </h2>
          <p className="text-zinc-400 text-xs font-mono mt-1">
            Build high-entropy cryptographic strings client-side. No network transmission.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <span className={`text-xs font-mono font-medium px-2.5 py-1.5 rounded-lg border uppercase tracking-wider ${strengthMeta.color}`}>
            {strengthMeta.label}
          </span>
        </div>
      </div>

      {/* Generated Password Box Card */}
      <div className="relative mb-8 text-center">
        <div className={`p-4 sm:p-5 rounded-xl border flex items-center justify-between gap-3 font-mono text-sm sm:text-base lg:text-lg transition-all break-all ${
          theme === "dark"
            ? "border-white/5 bg-[#16191f] text-cyan-300 shadow-inner"
            : "border-zinc-200 bg-[#f8f9fc] text-indigo-705 shadow-inner"
        }`}>
          <div className="flex-1 text-left select-all tracking-wider md:px-2 overflow-x-auto whitespace-pre no-scrollbar">
            {password || "No string parameters active"}
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleGenerate}
              className={`p-2 rounded-lg border transition-all ${
                theme === "dark"
                  ? "border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
              title="Generate fresh sequence"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              disabled={!password}
              className={`p-2.5 rounded-lg flex items-center space-x-1 border transition-all hover:scale-102 ${
                copied 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-cyan-400 hover:bg-zinc-700 hover:text-white"
                    : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800"
              }`}
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 animate-scale" /> : <Copy className="w-4 h-4" />}
              <span className="text-xs font-mono hidden md:inline">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
          </div>
        </div>

        {/* Copy confirmation toast notice */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 -bottom-6 text-[11px] font-mono text-emerald-400 flex items-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Copied secure key signature!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
        
        {/* Sliders and size knobs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-sans font-medium flex items-center space-x-2 ${theme === "dark" ? "text-zinc-200" : "text-zinc-700"}`}>
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Secret Code Length</span>
            </label>
            <span className={`text-md font-mono font-bold px-3 py-1 rounded-lg border ${
              theme === "dark" 
                ? "bg-[#16191f] border-white/5 text-cyan-400" 
                : "bg-zinc-100 border-zinc-200 text-indigo-600"
            }`}>
              {length} <span className="text-[10px] text-zinc-500">chars</span>
            </span>
          </div>

          <div className={`relative group p-4 rounded-xl border ${
            theme === "dark" ? "bg-[#16191f] border-white/5" : "bg-zinc-50 border-zinc-200"
          }`}>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-800 accent-cyan-400 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-2 px-1">
              <span>8 (Minimum)</span>
              <span>18 (Standard)</span>
              <span>32 (Advanced)</span>
              <span>64 (Extreme)</span>
            </div>
          </div>
        </div>

        {/* Binary toggles options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Include Uppercase letters */}
          <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
            includeUppercase 
              ? theme === "dark"
                ? "border-cyan-500/20 bg-cyan-950/10 text-cyan-300" 
                : "border-indigo-200 bg-indigo-50/50 text-indigo-700"
              : theme === "dark"
                ? "border-white/5 bg-[#16191f] text-zinc-550" 
                : "border-zinc-200 bg-[#f8f9fc] text-zinc-400"
          }`}>
            <div className="flex flex-col">
              <span className={`text-xs font-semibold ${includeUppercase ? "text-zinc-100" : "text-zinc-400"}`}>Capital Letters</span>
              <span className="text-[10px] text-zinc-500 font-mono">A-Z characters</span>
            </div>
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={() => setIncludeUppercase(!includeUppercase)}
              className="w-4 h-4 rounded text-cyan-500 bg-zinc-900 border-zinc-700 focus:ring-cyan-500 focus:ring-opacity-25"
            />
          </label>

          {/* Include Lowercase letters */}
          <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
            includeLowercase 
              ? theme === "dark"
                ? "border-cyan-500/20 bg-cyan-950/10 text-cyan-300"
                : "border-indigo-200 bg-indigo-50/50 text-indigo-700"
              : theme === "dark"
                ? "border-white/5 bg-[#16191f] text-zinc-550"
                : "border-zinc-200 bg-[#f8f9fc] text-zinc-400"
          }`}>
            <div className="flex flex-col">
              <span className={`text-xs font-semibold ${includeLowercase ? "text-zinc-100" : "text-zinc-400"}`}>Lowercase Letters</span>
              <span className="text-[10px] text-zinc-500 font-mono">a-z characters</span>
            </div>
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={() => setIncludeLowercase(!includeLowercase)}
              className="w-4 h-4 rounded text-cyan-500 bg-zinc-900 border-zinc-700 focus:ring-cyan-500 focus:ring-opacity-25"
            />
          </label>

          {/* Include Numbers */}
          <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
            includeNumbers 
              ? theme === "dark"
                ? "border-cyan-500/20 bg-cyan-950/10 text-cyan-300"
                : "border-indigo-200 bg-indigo-50/50 text-indigo-700"
              : theme === "dark"
                ? "border-white/5 bg-[#16191f] text-zinc-550"
                : "border-zinc-200 bg-[#f8f9fc] text-zinc-400"
          }`}>
            <div className="flex flex-col">
              <span className={`text-xs font-semibold ${includeNumbers ? "text-zinc-100" : "text-zinc-400"}`}>Numbers</span>
              <span className="text-[10px] text-zinc-500 font-mono">0-9 base integers</span>
            </div>
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={() => setIncludeNumbers(!includeNumbers)}
              className="w-4 h-4 rounded text-cyan-500 bg-zinc-900 border-zinc-700 focus:ring-cyan-500 focus:ring-opacity-25"
            />
          </label>

          {/* Include Symbols */}
          <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
            includeSymbols 
              ? theme === "dark"
                ? "border-cyan-500/20 bg-cyan-950/10 text-cyan-300"
                : "border-indigo-200 bg-indigo-50/50 text-indigo-700"
              : theme === "dark"
                ? "border-white/5 bg-[#16191f] text-zinc-550"
                : "border-zinc-200 bg-[#f8f9fc] text-zinc-400"
          }`}>
            <div className="flex flex-col">
              <span className={`text-xs font-semibold ${includeSymbols ? "text-zinc-100" : "text-zinc-400"}`}>Special Symbols</span>
              <span className="text-[10px] text-zinc-500 font-mono">#, @, $, %, etc.</span>
            </div>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={() => setIncludeSymbols(!includeSymbols)}
              className="w-4 h-4 rounded text-cyan-500 bg-zinc-900 border-zinc-700 focus:ring-cyan-500 focus:ring-opacity-25"
            />
          </label>

        </div>

      </div>

      {/* Primary Actions Button */}
      <div className="mt-8 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          onClick={handleGenerate}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-mono font-semibold transition-all hover:bg-zinc-900 text-zinc-300 hover:text-white"
        >
          Regenerate Key
        </button>

        <button
          onClick={() => onUsePassword(password)}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-black text-xs font-sans font-bold shadow-lg transition-transform hover:scale-101 active:scale-99 flex items-center justify-center space-x-2"
        >
          <span>Use in Real-Time Analyzer</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  );
}
