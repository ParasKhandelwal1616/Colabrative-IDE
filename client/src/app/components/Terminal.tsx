"use client";
import { Terminal as TerminalIcon, XCircle, Play } from "lucide-react";

interface TerminalProps {
  output: string[];
  isRunning: boolean;
}

export const Terminal = ({ output, isRunning }: TerminalProps) => {
  return (
    <div className="h-48 bg-black border-t border-zinc-800 flex flex-col font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-400">
          <TerminalIcon size={14} />
          <span>TERMINAL</span>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 p-4 overflow-y-auto text-zinc-300 space-y-1">
        {output.length === 0 && (
          <div className="text-zinc-600 italic">Ready to execute...</div>
        )}
        
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap font-mono">
            <span className="text-green-500 mr-2">➜</span>
            {line}
          </div>
        ))}

        {isRunning && (
          <div className="text-yellow-500 animate-pulse">Running...</div>
        )}
      </div>
    </div>
  );
};