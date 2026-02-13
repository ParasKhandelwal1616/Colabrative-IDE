"use client";
import React, { useRef, useEffect, useState } from "react";
import { Terminal as TerminalIcon, Zap, Sparkles, Loader2, X } from "lucide-react"; // Added 'X' icon

interface TerminalProps {
  output: string[];
  isRunning: boolean;
  code?: string;
}

export const Terminal = ({ output, isRunning, code }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, completion, isRunning]);

  const hasError = output.some(
    (line) =>
      line.toLowerCase().includes("error") ||
      line.toLowerCase().includes("exception") ||
      line.toLowerCase().includes("failed")
  );

  const handleFixWithAI = async () => {
    if (!code) return;
    setCompletion("");
    setIsLoading(true);

    try {
      const errorMsg = output.join("\n");
      const res = await fetch("/api/fix-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorMessage: errorMsg, code }),
      });

      const data = await res.json();
      setCompletion(data.text || "AI could not fix this error.");
    } catch (err) {
      setCompletion("Failed to connect to AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-72 bg-[#0a0a0f] flex flex-col font-mono text-sm relative border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d12]/80 backdrop-blur-sm border-b border-white/[0.08] relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/30 rounded blur-sm opacity-50" />
              <TerminalIcon size={14} className="text-emerald-400 relative z-10" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Terminal
            </span>
          </div>

          {/* ✨ MAGIC AI BUTTON */}
          {hasError && !isRunning && !isLoading && !completion && (
            <button
              onClick={handleFixWithAI}
              className="group flex items-center gap-1.5 px-3 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-medium uppercase tracking-wide rounded-full border border-blue-500/20 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] animate-in fade-in slide-in-from-left-2"
            >
              <Sparkles size={10} className="group-hover:animate-pulse" />
              Fix with AI
            </button>
          )}
        </div>

        {isRunning && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            <Loader2 size={10} className="text-amber-400 animate-spin" />
            <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
              Executing
            </span>
          </div>
        )}
      </div>

      {/* OUTPUT AREA */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto text-zinc-300 space-y-1 relative z-10 custom-scrollbar scroll-smooth"
      >
        {output.length === 0 && !isRunning && !completion && (
          <div className="flex items-center gap-2 text-zinc-600 opacity-50">
            <Zap size={14} />
            <span className="text-sm italic">Ready to execute...</span>
          </div>
        )}

        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap font-mono leading-relaxed">
            <span className={`mr-2 select-none ${line.toLowerCase().includes("error") ? "text-red-500" : "text-emerald-500"}`}>➜</span>
            <span className={`${line.toLowerCase().includes("error") ? "text-red-400" : "text-zinc-300"}`}>{line}</span>
          </div>
        ))}

        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-blue-400 animate-pulse">
             <Sparkles size={14} />
             <span className="text-xs">Nexus AI is analyzing your error...</span>
          </div>
        )}

        {/* 🧠 AI RESPONSE BLOCK */}
        {completion && (
          <div className="mt-6 mb-2 p-4 rounded-lg bg-blue-950/20 border border-blue-500/20 relative group animate-in fade-in slide-in-from-bottom-2">
            {/* Title Badge */}
            <div className="absolute -top-3 left-4 bg-[#0a0a0f] px-2 py-0.5 text-[10px] text-blue-400 flex items-center gap-1 border border-blue-500/20 rounded-full shadow-sm">
               <Sparkles size={10} /> Nexus AI Solution
            </div>
            
            {/* ❌ CLOSE BUTTON */}
            <button 
              onClick={() => setCompletion("")}
              className="absolute -top-2.5 right-2 p-1 bg-[#0a0a0f] text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-red-500/20 hover:border-red-500/50 transition-all"
              title="Close AI Fix"
            >
              <X size={12} />
            </button>

            {/* Content */}
            <pre className="text-blue-100 whitespace-pre-wrap font-mono text-xs leading-relaxed pl-1 border-l-2 border-blue-500/30">
              {completion}
            </pre>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.1); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(52, 211, 153, 0.3); }
      `}</style>
    </div>
  );
};