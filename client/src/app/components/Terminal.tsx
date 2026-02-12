"use client";
import { Terminal as TerminalIcon, XCircle, Play, Zap } from "lucide-react";

interface TerminalProps {
  output: string[];
  isRunning: boolean;
}

export const Terminal = ({ output, isRunning }: TerminalProps) => {
  return (
    <div className="h-70 bg-[#0a0a0f] flex flex-col font-mono text-l relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d12]/80 backdrop-blur-sm border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          {/* Terminal icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/30 rounded blur-sm opacity-50" />
            <TerminalIcon
              size={14}
              className="text-emerald-400 relative z-10"
            />
          </div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Terminal
          </span>
        </div>

        {/* Status indicator */}
        {isRunning && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
              Executing
            </span>
          </div>
        )}
      </div>

      {/* Output Area */}
      <div className="flex-1 p-4 overflow-y-auto text-zinc-300 space-y-1 relative z-10 custom-scrollbar">
        {output.length === 0 && !isRunning && (
          <div className="flex items-center gap-2 text-zinc-600">
            <Zap size={14} className="text-zinc-700" />
            <span className="text-sm italic">Waiting for execution...</span>
          </div>
        )}

        {output.map((line, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap font-mono leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <span className="text-emerald-500 mr-2 select-none">➜</span>
            <span className="text-zinc-300">{line}</span>
          </div>
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 text-amber-400 animate-pulse">
            <div className="flex gap-1">
              <div
                className="w-1 h-1 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1 h-1 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1 h-1 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(52, 211, 153, 0.2);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(52, 211, 153, 0.3);
        }
      `}</style>
    </div>
  );
};
